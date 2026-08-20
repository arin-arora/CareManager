import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CareManager Development Seed...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@caremanager.health' },
    update: { password: passwordHash, isVerified: true },
    create: {
      email: 'admin@caremanager.health',
      name: 'System Admin',
      password: passwordHash,
      role: 'ADMIN',
      isVerified: true
    }
  });
  console.log(`✓ Admin User created: ${admin.email}`);

  // 2. Seed Doctor User & Profile
  const doctorUser = await prisma.user.upsert({
    where: { email: 'sarah.jenkins@caremanager.health' },
    update: { password: passwordHash, isVerified: true },
    create: {
      email: 'sarah.jenkins@caremanager.health',
      name: 'Dr. Sarah Jenkins',
      password: passwordHash,
      role: 'DOCTOR',
      isVerified: true
    }
  });

  const weeklySchedule = {
    monday: [{ start: '09:00', end: '17:00' }],
    tuesday: [{ start: '09:00', end: '17:00' }],
    wednesday: [{ start: '09:00', end: '17:00' }],
    thursday: [{ start: '09:00', end: '17:00' }],
    friday: [{ start: '09:00', end: '17:00' }],
    saturday: [],
    sunday: []
  };

  const doctorProfile = await prisma.doctorProfile.upsert({
    where: { userId: doctorUser.id },
    update: {
      specialisation: 'Cardiology',
      workingHours: weeklySchedule as any,
      slotDuration: 30,
      isActive: true
    },
    create: {
      userId: doctorUser.id,
      specialisation: 'Cardiology',
      workingHours: weeklySchedule as any,
      slotDuration: 30,
      isActive: true
    }
  });
  console.log(`✓ Doctor Profile created: ${doctorUser.name} (${doctorProfile.specialisation})`);

  // 3. Seed Patient User
  const patient = await prisma.user.upsert({
    where: { email: 'patient@caremanager.health' },
    update: { password: passwordHash, isVerified: true },
    create: {
      email: 'patient@caremanager.health',
      name: 'John Doe',
      password: passwordHash,
      role: 'PATIENT',
      isVerified: true
    }
  });
  console.log(`✓ Patient User created: ${patient.email}`);

  // 4. Create Sample Completed Appointment
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 2);
  pastDate.setUTCHours(10, 0, 0, 0);

  const endDate = new Date(pastDate.getTime() + 30 * 60000);

  const existingApp = await prisma.appointment.findFirst({
    where: { patientId: patient.id, doctorId: doctorProfile.id }
  });

  if (!existingApp) {
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctorProfile.id,
        dateTime: pastDate,
        endTime: endDate,
        status: 'COMPLETED',
        symptoms: 'Mild chest discomfort and fatigue following physical activity.'
      }
    });

    await prisma.preVisitSummary.create({
      data: {
        appointmentId: appointment.id,
        urgency: 'MEDIUM',
        chiefComplaint: 'Chest discomfort following exertion.',
        suggestedQuestions: [
          'How long do episodes of chest tightness last?',
          'Do symptoms improve with rest?',
          'Is there any family history of cardiac issues?'
        ],
        status: 'SUCCESS'
      }
    });

    const consultation = await prisma.consultation.create({
      data: {
        appointmentId: appointment.id,
        notes: 'Patient evaluated for exertion-related fatigue. Vital signs stable. ECG normal. Prescribed preventive cardiology regimen.',
        followUpInfo: 'Return in 4 weeks for routine follow-up ECG and lipid panel.'
      }
    });

    const prescription = await prisma.prescription.create({
      data: {
        consultationId: consultation.id
      }
    });

    await prisma.prescriptionItem.createMany({
      data: [
        {
          prescriptionId: prescription.id,
          medicineName: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take in the morning with water.'
        },
        {
          prescriptionId: prescription.id,
          medicineName: 'Aspirin',
          dosage: '81mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take with food.'
        }
      ]
    });

    await prisma.postVisitSummary.create({
      data: {
        consultationId: consultation.id,
        patientFriendlySummary: 'Your cardiac checkup was reassuring. Continue taking prescribed daily medications with food and attend follow-up in 4 weeks.',
        medicationSchedule: [
          { medicineName: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', timing: 'Morning' },
          { medicineName: 'Aspirin', dosage: '81mg', frequency: 'Once daily', timing: 'Morning, with food' }
        ] as any,
        followUpSteps: 'Schedule follow-up ECG in 4 weeks.',
        status: 'SUCCESS'
      }
    });

    console.log('✓ Sample Consultation & Structured Prescription created');
  }

  console.log('\n🎉 CareManager Development Seed Complete!');
  console.log('------------------------------------------------');
  console.log('Demo Login Credentials (All passwords: Password123!):');
  console.log('  Admin:   admin@caremanager.health');
  console.log('  Doctor:  sarah.jenkins@caremanager.health');
  console.log('  Patient: patient@caremanager.health');
  console.log('------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
