import prisma from '../src/config/db';
import { appointmentService, ConflictError, ValidationError } from '../src/services/appointmentService';
import { holdService } from '../src/services/holdService';
import bcrypt from 'bcryptjs';

// Setup Mock Date: 2026-08-24 is a Monday
const testMonday = '2026-08-24'; 
const slot1 = new Date(`${testMonday}T10:00:00.000Z`); // Monday 10:00 AM UTC
const slot2 = new Date(`${testMonday}T10:30:00.000Z`); // Monday 10:30 AM UTC
const slot3 = new Date(`${testMonday}T11:00:00.000Z`); // Monday 11:00 AM UTC
const slotInvalidTime = new Date(`${testMonday}T10:15:00.000Z`); // Invalid slot
const slotOutsideHours = new Date(`${testMonday}T08:00:00.000Z`); // Outside 09:00-17:00

let patientAId: string;
let patientBId: string;
let adminId: string;
let doctorId: string; // DoctorProfile.id
let doctorUserId: string;

async function setupTestData() {
  console.log('--- Cleaning Database ---');
  await prisma.outboxNotification.deleteMany({});
  await prisma.medicationReminder.deleteMany({});
  await prisma.consultation.deleteMany({});
  await prisma.preVisitSummary.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.doctorLeave.deleteMany({});
  await prisma.doctorProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('--- Seeding Test Users ---');
  const passwordHash = await bcrypt.hash('password123', 10);

  // Create Patient A
  const patientA = await prisma.user.create({
    data: {
      email: 'patienta@test.com',
      password: passwordHash,
      name: 'Patient A',
      role: 'PATIENT',
      isVerified: true
    }
  });
  patientAId = patientA.id;

  // Create Patient B
  const patientB = await prisma.user.create({
    data: {
      email: 'patientb@test.com',
      password: passwordHash,
      name: 'Patient B',
      role: 'PATIENT',
      isVerified: true
    }
  });
  patientBId = patientB.id;

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password: passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      isVerified: true
    }
  });
  adminId = admin.id;

  // Create Doctor
  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor@test.com',
      password: passwordHash,
      name: 'Dr. Smith',
      role: 'DOCTOR',
      isVerified: true
    }
  });
  doctorUserId = doctorUser.id;

  // Create Doctor Profile (Monday only schedule 09:00 - 17:00)
  const doctorProfile = await prisma.doctorProfile.create({
    data: {
      userId: doctorUser.id,
      specialisation: 'Cardiology',
      workingHours: {
        monday: [{ start: '09:00', end: '17:00' }]
      } as any,
      slotDuration: 30
    }
  });
  doctorId = doctorProfile.id;

  console.log('Seeding Complete.');
}

async function runTests() {
  try {
    await setupTestData();

    // ------------------------------------------------------------
    // Test 1: Book available slot -> succeeds.
    // ------------------------------------------------------------
    console.log('\n[TEST 1] Book available slot (Patient A -> Slot 1)...');
    const app1 = await appointmentService.bookAppointment(patientAId, doctorId, slot1, 'Fever and cold');
    console.log(`✓ Test 1 Passed: Appointment created with ID ${app1.id}`);

    // ------------------------------------------------------------
    // Test 2: Book already-booked slot -> 409 conflict.
    // ------------------------------------------------------------
    console.log('\n[TEST 2] Book already-booked slot (Patient B -> Slot 1)...');
    try {
      await appointmentService.bookAppointment(patientBId, doctorId, slot1, 'Headache');
      console.error('✗ Test 2 Failed: Booking did not throw ConflictError');
    } catch (err: any) {
      if (err instanceof ConflictError || err instanceof ValidationError) {
        console.log(`✓ Test 2 Passed: Correctly failed with status ${err.status} - "${err.message}"`);
      } else {
        console.error('✗ Test 2 Failed with unexpected error:', err);
      }
    }

    // ------------------------------------------------------------
    // Test 3: Two simultaneous booking attempts -> exactly ONE succeeds.
    // ------------------------------------------------------------
    console.log('\n[TEST 3] Simultaneous booking attempts (10 requests -> Slot 3)...');
    const bookingPromises = Array.from({ length: 10 }).map((_, i) => {
      const pId = i % 2 === 0 ? patientAId : patientBId;
      return appointmentService.bookAppointment(pId, doctorId, slot3, `Symptom logger request ${i}`);
    });

    const results = await Promise.allSettled(bookingPromises);
    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    console.log(`Fulfilled Count: ${fulfilled.length}`);
    console.log(`Rejected Count: ${rejected.length}`);

    if (fulfilled.length === 1 && rejected.length === 9) {
      console.log('✓ Test 3 Passed: Exactly 1 request succeeded and 9 failed.');
      // Confirm there is exactly 1 active appointment in the DB
      const activeApps = await prisma.appointment.findMany({
        where: { doctorId, dateTime: slot3, active: true }
      });
      if (activeApps.length === 1) {
        console.log(`✓ Test 3 Database check passed: Exactly 1 active appointment exists.`);
      } else {
        console.error(`✗ Test 3 Database check failed: ${activeApps.length} active appointments found.`);
      }
    } else {
      console.error('✗ Test 3 Failed: Unintended number of successes/failures.');
    }

    // ------------------------------------------------------------
    // Test 4: Book during doctor leave -> rejected.
    // ------------------------------------------------------------
    console.log('\n[TEST 4] Book during doctor leave...');
    // Create leave on next Monday (2026-08-31)
    const leaveDate = new Date('2026-08-31T00:00:00.000Z');
    await prisma.doctorLeave.create({
      data: {
        doctorId,
        date: leaveDate,
        reason: 'Conference'
      }
    });

    try {
      const leaveSlot = new Date('2026-08-31T10:00:00.000Z');
      await appointmentService.bookAppointment(patientAId, doctorId, leaveSlot, 'Routine checkup');
      console.error('✗ Test 4 Failed: Succeeded booking during doctor leave');
    } catch (err: any) {
      if (err instanceof ValidationError) {
        console.log(`✓ Test 4 Passed: Correctly rejected leave slot with "${err.message}"`);
      } else {
        console.error('✗ Test 4 Failed with unexpected error:', err);
      }
    }

    // ------------------------------------------------------------
    // Test 5: Book outside working hours -> rejected.
    // ------------------------------------------------------------
    console.log('\n[TEST 5] Book outside working hours...');
    try {
      await appointmentService.bookAppointment(patientAId, doctorId, slotOutsideHours, 'Early morning checkup');
      console.error('✗ Test 5 Failed: Succeeded booking outside hours');
    } catch (err: any) {
      if (err instanceof ValidationError) {
        console.log(`✓ Test 5 Passed: Correctly rejected slot outside working hours with "${err.message}"`);
      } else {
        console.error('✗ Test 5 Failed with unexpected error:', err);
      }
    }

    // ------------------------------------------------------------
    // Test 6: Book invalid slot -> rejected.
    // ------------------------------------------------------------
    console.log('\n[TEST 6] Book invalid slot...');
    try {
      await appointmentService.bookAppointment(patientAId, doctorId, slotInvalidTime, 'Testing invalid minutes');
      console.error('✗ Test 6 Failed: Succeeded booking invalid minutes');
    } catch (err: any) {
      if (err instanceof ValidationError) {
        console.log(`✓ Test 6 Passed: Correctly rejected invalid slot timing with "${err.message}"`);
      } else {
        console.error('✗ Test 6 Failed with unexpected error:', err);
      }
    }

    // ------------------------------------------------------------
    // Test 7: Cancel appointment -> slot becomes available again.
    // ------------------------------------------------------------
    console.log('\n[TEST 7] Cancel appointment -> slot becomes available again...');
    const app2 = await appointmentService.bookAppointment(patientAId, doctorId, slot2, 'Cough');
    await appointmentService.cancelAppointment(app2.id, patientAId, 'PATIENT');
    console.log('Cancelled Slot 2. Booking Slot 2 again with Patient B...');
    const app2Rebooked = await appointmentService.bookAppointment(patientBId, doctorId, slot2, 'Dry throat');
    console.log(`✓ Test 7 Passed: Successfully rebooked Slot 2. ID: ${app2Rebooked.id}`);

    // ------------------------------------------------------------
    // Test 8: Expired slot hold -> slot becomes available again.
    // ------------------------------------------------------------
    console.log('\n[TEST 8] Expired slot hold...');
    const holdSlotTime = new Date(`${testMonday}T13:00:00.000Z`);
    // Hold slot for 500ms
    const held = await holdService.holdSlot(doctorId, holdSlotTime.toISOString(), patientAId, 500);
    console.log(`Hold created: ${held}. Waiting 800ms for expiration...`);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Try booking now with Patient B
    const appHoldExpired = await appointmentService.bookAppointment(patientBId, doctorId, holdSlotTime, 'Symptom test');
    console.log(`✓ Test 8 Passed: Booked expired slot successfully. ID: ${appHoldExpired.id}`);

    // ------------------------------------------------------------
    // Test 9: Active slot hold by Patient A -> Patient B cannot book/hold.
    // ------------------------------------------------------------
    console.log('\n[TEST 9] Active slot hold by Patient A -> Patient B cannot book/hold...');
    const activeHoldSlot = new Date(`${testMonday}T14:00:00.000Z`);
    await holdService.holdSlot(doctorId, activeHoldSlot.toISOString(), patientAId, 10000); // 10s hold

    // B attempts to hold
    const bHold = await holdService.holdSlot(doctorId, activeHoldSlot.toISOString(), patientBId, 5000);
    console.log(`Patient B hold attempt result: ${bHold} (expected: false)`);

    // B attempts to book
    try {
      await appointmentService.bookAppointment(patientBId, doctorId, activeHoldSlot, 'Chest pain');
      console.error('✗ Test 9 Failed: Patient B booked Patient A held slot');
    } catch (err: any) {
      if (err instanceof ValidationError) {
        console.log(`✓ Test 9 Passed: Patient B booking rejected with "${err.message}"`);
      } else {
        console.error('✗ Test 9 Failed with unexpected error:', err);
      }
    }
    // Cleanup hold
    await holdService.releaseSlot(doctorId, activeHoldSlot.toISOString(), patientAId);

    // ------------------------------------------------------------
    // Test 10: Unauthorized user attempts operation -> rejected.
    // ------------------------------------------------------------
    console.log('\n[TEST 10] Unauthorized cancellation...');
    // Book slot 2 again since it is cancelled
    const finalApp = await prisma.appointment.findFirst({
      where: { doctorId, dateTime: slot2, active: true }
    });
    if (finalApp) {
      try {
        // Patient A attempts to cancel Patient B's appointment
        await appointmentService.cancelAppointment(finalApp.id, patientAId, 'PATIENT');
        console.error('✗ Test 10 Failed: Patient A cancelled Patient B appointment');
      } catch (err: any) {
        console.log(`✓ Test 10 Passed: Correctly failed cancellation with message "${err.message}"`);
      }
    }

    // ------------------------------------------------------------
    // Test 11: Rescheduling Rollback Test
    // ------------------------------------------------------------
    console.log('\n[TEST 11] Rescheduling Rollback (Booked App A -> Attempt Reschedule to Occupied Slot)...');
    // We have app1 (Patient A, Slot 1) and app2Rebooked (Patient B, Slot 2)
    // Patient A tries to reschedule app1 to Slot 2 (which is occupied by Patient B)
    try {
      await appointmentService.rescheduleAppointment(app1.id, slot2, patientAId, 'PATIENT');
      console.error('✗ Test 11 Failed: Succeeded in rescheduling to occupied slot!');
    } catch (err: any) {
      console.log(`✓ Test 11 Passed: Correctly blocked rescheduling. Error: "${err.message}"`);
      // Verify app1 is STILL active in DB
      const app1Verify = await prisma.appointment.findUnique({
        where: { id: app1.id }
      });
      if (app1Verify && app1Verify.status === 'BOOKED' && app1Verify.active === true) {
        console.log('✓ Test 11 Verification Passed: Original appointment remains BOOKED and active.');
      } else {
        console.error('✗ Test 11 Verification Failed: Original appointment was modified or deleted.');
      }
    }

  } catch (err: any) {
    console.error('FATAL Test runner failed:', err);
  } finally {
    await prisma.$disconnect();
    // Close redis client connection
    const { default: redis } = require('../src/config/redis');
    if (redis) redis.disconnect();
    console.log('\n--- Finished Test Suite ---');
  }
}

runTests();
