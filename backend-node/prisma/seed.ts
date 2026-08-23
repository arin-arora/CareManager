import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const defaultWorkingHours = {
  monday: [{ start: '09:00', end: '17:00' }],
  tuesday: [{ start: '09:00', end: '17:00' }],
  wednesday: [{ start: '09:00', end: '17:00' }],
  thursday: [{ start: '09:00', end: '17:00' }],
  friday: [{ start: '09:00', end: '17:00' }]
};

const doctorsData = [
  {
    name: 'Dr. Arin Arora',
    email: 'arin.arora@caremanager.com',
    specialisation: 'Cardiology',
    designation: 'Senior Consultant',
    slotDuration: 30
  },
  {
    name: 'Dr. Ananya Garg',
    email: 'ananya.garg@caremanager.com',
    specialisation: 'Dermatology',
    designation: 'Consultant',
    slotDuration: 30
  },
  {
    name: 'Dr. Kalash Suneja',
    email: 'kalash.suneja@caremanager.com',
    specialisation: 'Neurology',
    designation: 'Senior Consultant',
    slotDuration: 30
  },
  {
    name: 'Dr. Tanya Chauhan',
    email: 'tanya.chauhan@caremanager.com',
    specialisation: 'Pediatrics',
    designation: 'Consultant',
    slotDuration: 30
  },
  {
    name: 'Dr. Ananya Sharma',
    email: 'ananya.sharma@caremanager.com',
    specialisation: 'Gynecology',
    designation: 'Senior Consultant',
    slotDuration: 30
  },
  {
    name: 'Dr. Prisha',
    email: 'prisha@caremanager.com',
    specialisation: 'General Medicine',
    designation: 'Consultant',
    slotDuration: 30
  },
  {
    name: 'Dr. Rohan Malhotra',
    email: 'rohan.malhotra@caremanager.com',
    specialisation: 'Orthopedics',
    designation: 'Senior Consultant',
    slotDuration: 30
  },
  {
    name: 'Dr. Aditya Verma',
    email: 'aditya.verma@caremanager.com',
    specialisation: 'Gastroenterology',
    designation: 'Consultant',
    slotDuration: 30
  },
  {
    name: 'Dr. Kunal Mehta',
    email: 'kunal.mehta@caremanager.com',
    specialisation: 'Pulmonology',
    designation: 'Specialist',
    slotDuration: 30
  },
  {
    name: 'Dr. Yash Agarwal',
    email: 'yash.agarwal@caremanager.com',
    specialisation: 'Endocrinology',
    designation: 'Consultant',
    slotDuration: 30
  },
  {
    name: 'Dr. Devansh Kapoor',
    email: 'devansh.kapoor@caremanager.com',
    specialisation: 'Cardiology',
    designation: 'Senior Consultant',
    slotDuration: 30
  },
  {
    name: 'Dr. Aryan Bansal',
    email: 'aryan.bansal@caremanager.com',
    specialisation: 'General Medicine',
    designation: 'Specialist',
    slotDuration: 30
  }
];

async function main() {
  console.log('🌱 Starting CareManager database seed with Indian Doctor roster...');

  const validDoctorEmails = doctorsData.map(d => d.email);

  // Clean up all legacy / non-Indian doctor accounts
  await prisma.user.deleteMany({
    where: {
      role: 'DOCTOR',
      email: { notIn: validDoctorEmails }
    }
  });

  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@caremanager.com' },
    update: {
      name: 'System Admin',
      role: 'ADMIN',
      isVerified: true
    },
    create: {
      email: 'admin@caremanager.com',
      password: defaultPasswordHash,
      name: 'System Admin',
      role: 'ADMIN',
      isVerified: true
    }
  });
  console.log(`✓ Admin user: ${adminUser.email}`);

  // 2. Seed Default Patient User
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@caremanager.com' },
    update: {
      name: 'John Doe',
      role: 'PATIENT',
      isVerified: true
    },
    create: {
      email: 'patient@caremanager.com',
      password: defaultPasswordHash,
      name: 'John Doe',
      role: 'PATIENT',
      isVerified: true
    }
  });
  console.log(`✓ Patient user: ${patientUser.email}`);

  // 3. Seed Doctors
  for (const doc of doctorsData) {
    const user = await prisma.user.upsert({
      where: { email: doc.email },
      update: {
        name: doc.name,
        role: 'DOCTOR',
        isVerified: true
      },
      create: {
        email: doc.email,
        password: defaultPasswordHash,
        name: doc.name,
        role: 'DOCTOR',
        isVerified: true
      }
    });

    await prisma.doctorProfile.upsert({
      where: { userId: user.id },
      update: {
        specialisation: doc.specialisation,
        designation: doc.designation,
        slotDuration: doc.slotDuration,
        workingHours: defaultWorkingHours,
        isActive: true
      },
      create: {
        userId: user.id,
        specialisation: doc.specialisation,
        designation: doc.designation,
        slotDuration: doc.slotDuration,
        workingHours: defaultWorkingHours,
        isActive: true
      }
    });

    console.log(`✓ Doctor: ${doc.name} (${doc.designation} - ${doc.specialisation})`);
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
