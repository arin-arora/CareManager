-- AlterTable
ALTER TABLE "DoctorProfile" ADD COLUMN IF NOT EXISTS "designation" TEXT DEFAULT 'Consultant';
