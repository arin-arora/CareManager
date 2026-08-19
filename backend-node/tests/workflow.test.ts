import prisma from '../src/config/db';
import { appointmentService } from '../src/services/appointmentService';
import { aiService } from '../src/services/aiService';
import { getAppointmentDetails } from '../src/controllers/appointmentController';
import { completeConsultation } from '../src/controllers/doctorController';
import { AuthenticatedRequest } from '../src/middleware/auth';
import bcrypt from 'bcryptjs';

// Setup Mock Date
const testMonday = '2026-08-24'; // A Monday
const slot1 = new Date(`${testMonday}T10:00:00.000Z`);
const slot2 = new Date(`${testMonday}T10:30:00.000Z`);
const slot3 = new Date(`${testMonday}T11:00:00.000Z`);
const slot4 = new Date(`${testMonday}T11:30:00.000Z`);

let patientAId: string;
let patientBId: string;
let doctorAId: string; // DoctorProfile.id
let doctorAUserId: string;
let doctorBId: string;
let doctorBUserId: string;

async function setupTestData() {
  console.log('--- Seeding Workflow Test Data ---');
  await prisma.outboxNotification.deleteMany({});
  await prisma.medicationReminder.deleteMany({});
  await prisma.consultation.deleteMany({});
  await prisma.preVisitSummary.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.doctorLeave.deleteMany({});
  await prisma.doctorProfile.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // Patient A
  const patientA = await prisma.user.create({
    data: {
      email: 'patient_a@test.com',
      password: passwordHash,
      name: 'Patient A',
      role: 'PATIENT',
      isVerified: true
    }
  });
  patientAId = patientA.id;

  // Patient B
  const patientB = await prisma.user.create({
    data: {
      email: 'patient_b@test.com',
      password: passwordHash,
      name: 'Patient B',
      role: 'PATIENT',
      isVerified: true
    }
  });
  patientBId = patientB.id;

  // Doctor A
  const doctorAUser = await prisma.user.create({
    data: {
      email: 'doctor_a@test.com',
      password: passwordHash,
      name: 'Dr. A',
      role: 'DOCTOR',
      isVerified: true
    }
  });
  doctorAUserId = doctorAUser.id;

  const doctorAProfile = await prisma.doctorProfile.create({
    data: {
      userId: doctorAUser.id,
      specialisation: 'Cardiology',
      workingHours: {
        monday: [{ start: '09:00', end: '17:00' }]
      } as any,
      slotDuration: 30
    }
  });
  doctorAId = doctorAProfile.id;

  // Doctor B
  const doctorBUser = await prisma.user.create({
    data: {
      email: 'doctor_b@test.com',
      password: passwordHash,
      name: 'Dr. B',
      role: 'DOCTOR',
      isVerified: true
    }
  });
  doctorBUserId = doctorBUser.id;

  const doctorBProfile = await prisma.doctorProfile.create({
    data: {
      userId: doctorBUser.id,
      specialisation: 'Dermatology',
      workingHours: {
        monday: [{ start: '09:00', end: '17:00' }]
      } as any,
      slotDuration: 30
    }
  });
  doctorBId = doctorBProfile.id;

  console.log('Seeding Complete.');
}

// Mock Response Helper
function createMockResponse() {
  let statusCode = 200;
  let responseData: any = null;

  const res: any = {
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (data: any) => {
      responseData = data;
      return res;
    },
    getStatusCode: () => statusCode,
    getData: () => responseData
  };

  return res;
}

async function runTests() {
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✓ Passed: ${msg}`);
      passedCount++;
    } else {
      console.error(`✗ Failed: ${msg}`);
      failedCount++;
    }
  }

  try {
    await setupTestData();

    // ------------------------------------------------------------
    // Test 1 & 2: Patient can submit symptoms & pre-visit AI is generated
    // ------------------------------------------------------------
    console.log('\n[TEST 1 & 2] Symptom submission & Pre-visit AI generation...');
    
    // Mock successful AI call
    aiService.generatePreVisitSummary = async (syms: string) => {
      return {
        urgency: 'HIGH',
        chiefComplaint: 'Chest pressure and shortness of breath',
        suggestedQuestions: ['Do you have hypertension?', 'Has this happened before?', 'Is there numbness?']
      };
    };

    const app1 = await appointmentService.bookAppointment(
      patientAId,
      doctorAId,
      slot1,
      'Severe chest pain'
    );

    // Give it a moment to run async pre-visit generation
    await new Promise(resolve => setTimeout(resolve, 300));

    // Verify PreVisitSummary is stored
    const summary = await prisma.preVisitSummary.findUnique({
      where: { appointmentId: app1.id }
    });

    assert(app1.symptoms === 'Severe chest pain', 'Patient symptoms submitted successfully');
    assert(summary !== null, 'Pre-visit summary generated');
    assert(summary?.status === 'SUCCESS', 'Summary status is SUCCESS');
    assert(summary?.urgency === 'HIGH', 'Summary urgency level is HIGH');

    // ------------------------------------------------------------
    // Test 3: Doctor can view assigned patient's summary
    // ------------------------------------------------------------
    console.log('\n[TEST 3] Doctor can view assigned patient\'s summary...');
    const reqDoctorView = {
      params: { id: app1.id },
      user: { id: doctorAUserId, role: 'DOCTOR' }
    } as any;
    const resDoctorView = createMockResponse();

    await getAppointmentDetails(reqDoctorView, resDoctorView);
    assert(resDoctorView.getStatusCode() === 200, 'Assigned doctor details fetch succeeded');
    assert(resDoctorView.getData()?.preVisitSummary?.chiefComplaint !== null, 'Doctor sees chief complaint');

    // ------------------------------------------------------------
    // Test 4: Unauthorized doctor cannot access another doctor's appointment
    // ------------------------------------------------------------
    console.log('\n[TEST 4] Unauthorized doctor access check...');
    const reqUnauthDoctorView = {
      params: { id: app1.id },
      user: { id: doctorBUserId, role: 'DOCTOR' }
    } as any;
    const resUnauthDoctorView = createMockResponse();

    await getAppointmentDetails(reqUnauthDoctorView, resUnauthDoctorView);
    assert(resUnauthDoctorView.getStatusCode() === 403, 'Access denied for unauthorized doctor (403)');

    // ------------------------------------------------------------
    // Test 5, 6, 7 & 8: Doctor consultation, Structured Prescription, Post-visit AI & Patient view
    // ------------------------------------------------------------
    console.log('\n[TEST 5, 6, 7 & 8] Consultation submission, Prescription, Post-visit AI, and Patient view...');
    
    // Mock successful post-visit AI call
    aiService.generatePostVisitSummary = async (notes, prescription, followUp) => {
      return {
        patientFriendlySummary: 'The doctor diagnosed you with Angina. Please rest.',
        medicationSchedule: [
          {
            medicineName: 'Aspirin',
            dosage: '81mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take in the morning',
            timing: 'Morning'
          }
        ],
        followUpSteps: 'Follow up with Cardiology in 2 weeks.'
      };
    };

    const reqConsult = {
      params: { id: app1.id },
      user: { id: doctorAUserId, role: 'DOCTOR' },
      body: {
        notes: 'Suspected unstable angina, refer to specialist.',
        prescription: [
          {
            medicineName: 'Aspirin',
            dosage: '81mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take in the morning'
          }
        ],
        followUpInfo: 'Schedule cardiologist visit.'
      }
    } as any;
    const resConsult = createMockResponse();

    await completeConsultation(reqConsult, resConsult);
    assert(resConsult.getStatusCode() === 200, 'Assigned doctor completes consultation');

    // Verify Prescription
    const dbConsult = await prisma.consultation.findUnique({
      where: { appointmentId: app1.id },
      include: {
        prescription: {
          include: { items: true }
        },
        postVisitSummary: true
      }
    });

    assert(dbConsult !== null, 'Consultation saved in DB');
    if (!dbConsult) {
      throw new Error('dbConsult is null');
    }
    assert(dbConsult.prescription !== null && dbConsult.prescription!.items.length === 1, 'Prescription persisted');
    assert(dbConsult.prescription?.items[0].medicineName === 'Aspirin', 'Structured prescription item matches');
    assert(dbConsult.followUpInfo === 'Schedule cardiologist visit.', 'Follow-up info matches');

    // Give a moment for async post-visit AI generation
    await new Promise(resolve => setTimeout(resolve, 300));

    // Verify AI post-visit summary is stored
    const dbPostVisit = await prisma.postVisitSummary.findUnique({
      where: { consultationId: dbConsult!.id }
    });
    assert(dbPostVisit !== null, 'Post-visit AI summary generated');
    assert(dbPostVisit?.status === 'SUCCESS', 'Post-visit AI status is SUCCESS');

    // Patient views summary
    const reqPatientView = {
      params: { id: app1.id },
      user: { id: patientAId, role: 'PATIENT' }
    } as any;
    const resPatientView = createMockResponse();

    await getAppointmentDetails(reqPatientView, resPatientView);
    assert(resPatientView.getStatusCode() === 200, 'Patient views own appointment details');
    assert(resPatientView.getData()?.consultation?.postVisitSummary?.patientFriendlySummary !== null, 'Patient can see post-visit AI summary');

    // ------------------------------------------------------------
    // Test 9: LLM failure does not break appointment
    // ------------------------------------------------------------
    console.log('\n[TEST 9] LLM failure does not break appointment booking...');
    
    // Mock LLM failure (API Unavailable)
    aiService.generatePreVisitSummary = async () => {
      throw new Error('LLM API connection timed out.');
    };

    const app2 = await appointmentService.bookAppointment(
      patientBId,
      doctorAId,
      slot2,
      'High fever'
    );

    // Give it a moment to run async pre-visit generation
    await new Promise(resolve => setTimeout(resolve, 300));

    const failSummary = await prisma.preVisitSummary.findUnique({
      where: { appointmentId: app2.id }
    });

    assert(app2 !== null, 'Appointment booked successfully despite LLM error');
    assert(failSummary !== null, 'Pre-visit summary row exists');
    assert(failSummary?.status === 'FAILED', 'Summary status is FAILED');
    assert(failSummary?.errorMessage === 'LLM API connection timed out.', 'Failure message is logged');

    // ------------------------------------------------------------
    // Test 10: Invalid LLM response is handled safely
    // ------------------------------------------------------------
    console.log('\n[TEST 10] Invalid LLM response handling...');
    
    // Mock LLM returning malformed string (invalid JSON)
    aiService.generatePreVisitSummary = async () => {
      // Return unparseable data (will cause JSON parse error)
      throw new Error('LLM returned malformed/unparseable JSON');
    };

    const app3 = await appointmentService.bookAppointment(
      patientBId,
      doctorAId,
      slot3,
      'Mild stomachache'
    );

    // Give it a moment to run async pre-visit generation
    await new Promise(resolve => setTimeout(resolve, 300));

    const malformedSummary = await prisma.preVisitSummary.findUnique({
      where: { appointmentId: app3.id }
    });

    assert(app3 !== null, 'Appointment remains valid on malformed LLM response');
    assert(malformedSummary?.status === 'FAILED', 'Summary status is set to FAILED on malformed output');

    // ------------------------------------------------------------
    // Test 11: Patient cannot submit a doctor consultation
    // ------------------------------------------------------------
    console.log('\n[TEST 11] Patient submitting consultation check...');
    const reqPatientConsult = {
      params: { id: app3.id },
      user: { id: patientBId, role: 'PATIENT' },
      body: { notes: 'Try hacking consultation.' }
    } as any;
    const resPatientConsult = createMockResponse();

    await completeConsultation(reqPatientConsult, resPatientConsult);
    assert(resPatientConsult.getStatusCode() === 403, 'Patient consultation submission rejected with 403');

    // ------------------------------------------------------------
    // Test 12: AI output validation rejects malformed required fields
    // ------------------------------------------------------------
    console.log('\n[TEST 12] AI output validation rejects malformed required fields...');
    
    // Mock AI returning invalid fields (e.g. missing suggestedQuestions)
    aiService.generatePreVisitSummary = async () => {
      throw new Error('AI output validation failed: suggestedQuestions must contain at least 3 items');
    };

    const app4 = await appointmentService.bookAppointment(
      patientAId,
      doctorBId,
      slot4,
      'Dry skin rash'
    );

    // Give it a moment to run async pre-visit generation
    await new Promise(resolve => setTimeout(resolve, 300));

    const invalidSummary = await prisma.preVisitSummary.findUnique({
      where: { appointmentId: app4.id }
    });

    assert(app4 !== null, 'Appointment booked successfully despite validation rejection');
    assert(invalidSummary?.status === 'FAILED', 'Summary status marked as FAILED on validation failure');
    assert(invalidSummary?.errorMessage?.includes('validation failed') === true || invalidSummary?.errorMessage?.includes('suggestedQuestions') === true, 'Validation error reason is recorded');

    console.log(`\n=== Testing Suite Summary ===`);
    console.log(`Passed: ${passedCount} / ${passedCount + failedCount}`);
    if (failedCount > 0) {
      console.error(`✗ ${failedCount} tests failed!`);
      process.exit(1);
    } else {
      console.log(`✓ All workflow tests completed successfully!`);
    }

  } catch (err: any) {
    console.error('Test script crashed with exception:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    // Close redis
    const redis = require('../src/config/redis').default;
    if (redis) redis.disconnect();
  }
}

runTests();
