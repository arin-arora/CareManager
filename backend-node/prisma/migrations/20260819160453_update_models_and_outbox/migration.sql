/*
  Warnings:

  - You are about to drop the column `workingHoursEnd` on the `DoctorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `workingHoursStart` on the `DoctorProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DoctorProfile" DROP COLUMN "workingHoursEnd",
DROP COLUMN "workingHoursStart",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "workingHours" JSONB;

-- AlterTable
ALTER TABLE "OutboxNotification" ADD COLUMN     "nextRetryTime" TIMESTAMP(3);
