import prisma from '../config/db';

export const reminderService = {
  /**
   * Parses a prescription item's frequency and duration to schedule all reminders.
   */
  createRemindersForPrescription: async (patientId: string, items: any[]) => {
    for (const item of items) {
      const frequency = String(item.frequency || '').toLowerCase();
      const duration = String(item.duration || '').toLowerCase();

      // 1. Parse frequency to get interval in hours
      let intervalHours = 24; // default Once daily
      if (frequency.includes('once daily') || frequency.includes('1 time') || frequency.includes('1/day')) {
        intervalHours = 24;
      } else if (frequency.includes('twice daily') || frequency.includes('2 times') || frequency.includes('2/day')) {
        intervalHours = 12;
      } else if (frequency.includes('three times') || frequency.includes('3 times') || frequency.includes('3/day')) {
        intervalHours = 8;
      } else if (frequency.includes('four times') || frequency.includes('4 times') || frequency.includes('4/day')) {
        intervalHours = 6;
      } else {
        // Look for "every X hours"
        const hoursMatch = frequency.match(/every\s*(\d+)\s*hour/);
        if (hoursMatch) {
          intervalHours = parseInt(hoursMatch[1], 10);
        }
      }

      // 2. Parse duration to get total number of days
      let days = 5; // default 5 days
      const dayMatch = duration.match(/(\d+)\s*day/);
      const weekMatch = duration.match(/(\d+)\s*week/);
      const monthMatch = duration.match(/(\d+)\s*month/);

      if (dayMatch) {
        days = parseInt(dayMatch[1], 10);
      } else if (weekMatch) {
        days = parseInt(weekMatch[1], 10) * 7;
      } else if (monthMatch) {
        days = parseInt(monthMatch[1], 10) * 30;
      }

      // Calculate total reminders to schedule
      const totalHours = days * 24;
      const totalReminders = Math.floor(totalHours / intervalHours);

      const now = new Date();
      for (let i = 0; i < totalReminders; i++) {
        // Schedule each reminder spaced by the interval hours
        const reminderTime = new Date(now.getTime() + (i + 1) * intervalHours * 60 * 60 * 1000);
        await prisma.medicationReminder.create({
          data: {
            patientId,
            medicineName: item.medicineName,
            dosage: item.dosage,
            frequency: item.frequency,
            nextReminderTime: reminderTime,
            status: 'ACTIVE'
          }
        });
      }
    }
  },

  /**
   * Starts a background worker that checks and triggers active reminders.
   */
  startWorker: () => {
    console.log('✓ Starting Medication Reminder background worker...');
    
    // Check every 30 seconds
    setInterval(async () => {
      try {
        const now = new Date();
        const pendingReminders = await prisma.medicationReminder.findMany({
          where: {
            status: 'ACTIVE',
            nextReminderTime: {
              lte: now
            }
          },
          include: {
            patient: true
          }
        });

        for (const reminder of pendingReminders) {
          console.log(`[REMINDER WORKER] Triggering reminder for patient ${reminder.patient.name} (${reminder.patient.email}): Take ${reminder.medicineName} (${reminder.dosage}) - Frequency: ${reminder.frequency}`);
          
          // Mark as SENT
          await prisma.medicationReminder.update({
            where: { id: reminder.id },
            data: {
              status: 'SENT'
            }
          });
        }
      } catch (err: any) {
        console.error('Error in Medication Reminder background worker:', err.message);
      }
    }, 30000);
  }
};
