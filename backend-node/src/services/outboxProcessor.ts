import prisma from '../config/db';
import { sendEmail } from './emailService';

let isProcessing = false;
let intervalId: NodeJS.Timeout | null = null;

export const outboxProcessor = {
  start: () => {
    if (intervalId) return;
    intervalId = setInterval(async () => {
      await outboxProcessor.process();
    }, 10000); // Check every 10 seconds
    console.log('✓ Outbox Background Processor started.');
  },

  stop: () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      console.log('✓ Outbox Background Processor stopped.');
    }
  },

  process: async () => {
    if (isProcessing) return;
    isProcessing = true;

    try {
      // Find pending notifications or failed ones that are due for retry
      const notifications = await prisma.outboxNotification.findMany({
        where: {
          OR: [
            { status: 'PENDING' },
            {
              status: 'FAILED',
              attempts: { lt: 5 },
              OR: [
                { nextRetryTime: null },
                { nextRetryTime: { lte: new Date() } }
              ]
            }
          ]
        },
        take: 10,
        orderBy: { createdAt: 'asc' }
      });

      for (const notification of notifications) {
        // Mark as processing
        await prisma.outboxNotification.update({
          where: { id: notification.id },
          data: { status: 'PROCESSING' }
        });

        try {
          await outboxProcessor.execute(notification);

          // Success
          await prisma.outboxNotification.update({
            where: { id: notification.id },
            data: {
              status: 'SENT',
              attempts: notification.attempts + 1,
              errorMessage: null
            }
          });
        } catch (err: any) {
          console.error(`Outbox execution failed for notification ${notification.id}:`, err.message);

          const nextAttempts = notification.attempts + 1;
          const retryDelayMin = Math.pow(2, nextAttempts); // Exponential backoff: 2m, 4m, 8m, 16m, etc.
          const nextRetryTime = new Date(Date.now() + retryDelayMin * 60000);

          await prisma.outboxNotification.update({
            where: { id: notification.id },
            data: {
              status: 'FAILED',
              attempts: nextAttempts,
              errorMessage: err.message,
              nextRetryTime
            }
          });
        }
      }
    } catch (err: any) {
      console.error('Error processing outbox notifications:', err.message);
    } finally {
      isProcessing = false;
    }
  },

  execute: async (notification: any) => {
    const payload = notification.payload as any;

    if (notification.type === 'EMAIL') {
      const app = await prisma.appointment.findUnique({
        where: { id: payload.appointmentId },
        include: {
          patient: true,
          doctor: { include: { user: true } }
        }
      });

      if (!app) {
        throw new Error(`Appointment ${payload.appointmentId} not found. Cannot send email.`);
      }

      const patientEmail = app.patient.email;
      const doctorEmail = app.doctor.user.email;
      const dateTimeStr = new Date(app.dateTime).toLocaleString();

      if (notification.action === 'SEND_BOOKING_EMAIL') {
        // Email to patient
        await sendEmail({
          to: patientEmail,
          subject: 'Appointment Booked Successfully',
          html: `<p>Dear ${app.patient.name},</p><p>Your appointment with Dr. ${app.doctor.user.name} (${app.doctor.specialisation}) has been successfully booked for <strong>${dateTimeStr}</strong>.</p><p>Symptoms shared: ${app.symptoms}</p>`,
          text: `Dear ${app.patient.name}, your appointment with Dr. ${app.doctor.user.name} has been booked for ${dateTimeStr}.`
        });

        // Email to doctor
        await sendEmail({
          to: doctorEmail,
          subject: 'New Appointment Scheduled',
          html: `<p>Dr. ${app.doctor.user.name},</p><p>A new appointment has been scheduled with patient ${app.patient.name} on <strong>${dateTimeStr}</strong>.</p><p>Patient symptoms: ${app.symptoms}</p>`,
          text: `Dr. ${app.doctor.user.name}, you have a new appointment with patient ${app.patient.name} on ${dateTimeStr}.`
        });
      } else if (notification.action === 'SEND_RESCHEDULE_EMAIL') {
        const oldApp = await prisma.appointment.findUnique({
          where: { id: payload.oldAppointmentId },
          include: { doctor: { include: { user: true } } }
        });
        const oldDateTimeStr = oldApp ? new Date(oldApp.dateTime).toLocaleString() : 'previously scheduled time';

        await sendEmail({
          to: patientEmail,
          subject: 'Appointment Rescheduled',
          html: `<p>Dear ${app.patient.name},</p><p>Your appointment with Dr. ${app.doctor.user.name} has been rescheduled.</p><p><strong>Old Time:</strong> ${oldDateTimeStr}<br/><strong>New Time:</strong> ${dateTimeStr}</p>`,
          text: `Dear ${app.patient.name}, your appointment with Dr. ${app.doctor.user.name} has been rescheduled to ${dateTimeStr}.`
        });
      } else if (notification.action === 'SEND_CANCELLATION_EMAIL') {
        await sendEmail({
          to: patientEmail,
          subject: 'Appointment Cancelled',
          html: `<p>Dear ${app.patient.name},</p><p>Your appointment with Dr. ${app.doctor.user.name} on <strong>${dateTimeStr}</strong> has been cancelled.</p>`,
          text: `Dear ${app.patient.name}, your appointment with Dr. ${app.doctor.user.name} on ${dateTimeStr} has been cancelled.`
        });
      }
    } else if (notification.type === 'CALENDAR') {
      // Mock Google Calendar actions for Phase 2
      console.log(`[MOCK CALENDAR ACTION - OUTBOX]: Executed ${notification.action} for appointment ${payload.appointmentId}`);
      // In Phase 3, this will call the googleCalendarService to create/update/delete events
    } else {
      throw new Error(`Unknown notification type: ${notification.type}`);
    }
  }
};
