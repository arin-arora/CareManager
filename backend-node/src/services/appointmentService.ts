import prisma from '../config/db';
import { scheduleService } from './scheduleService';
import { holdService } from './holdService';
import { clinicalService } from './clinicalService';

export class ConflictError extends Error {
  status = 409;
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class ValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  status = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  status = 403;
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export const appointmentService = {
  /**
   * Books a new appointment.
   * Atomic PostgreSQL transaction handles DB creation + Outbox entries,
   * while Redis holds are cleared.
   */
  bookAppointment: async (patientId: string, doctorId: string, dateTime: Date, symptoms: string) => {
    // 1. Validate doctor exists and is active
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId }
    });

    if (!doctor || !doctor.isActive) {
      throw new ValidationError('Doctor does not exist or is inactive.');
    }

    // 2. Validate slot availability (working hours, leaves, other appointments/holds)
    const isValid = await scheduleService.isValidSlot(doctorId, dateTime, patientId);
    if (!isValid) {
      throw new ValidationError('Requested slot is not available or is invalid.');
    }

    // Calculate end time
    const endTime = new Date(dateTime.getTime() + doctor.slotDuration * 60000);

    // Check if patient already has an active appointment at this exact time
    const existingPatientApp = await prisma.appointment.findFirst({
      where: {
        patientId,
        dateTime,
        active: true
      }
    });

    if (existingPatientApp) {
      throw new ConflictError('You already have another active appointment scheduled at this exact time slot.');
    }

    try {
      // 3. Save Appointment + Outbox records in a transaction
      const appointment = await prisma.$transaction(async (tx) => {
        const app = await tx.appointment.create({
          data: {
            patientId,
            doctorId,
            dateTime,
            endTime,
            status: 'BOOKED',
            active: true,
            symptoms
          }
        });

        // Queue Outbox notifications
        await tx.outboxNotification.create({
          data: {
            type: 'EMAIL',
            action: 'SEND_BOOKING_EMAIL',
            payload: { appointmentId: app.id } as any
          }
        });

        await tx.outboxNotification.create({
          data: {
            type: 'CALENDAR',
            action: 'CREATE_EVENT',
            payload: { appointmentId: app.id } as any
          }
        });

        return app;
      });

      // 4. Release Redis slot hold (async, don't block success)
      holdService.releaseSlot(doctorId, dateTime.toISOString(), patientId).catch((err) => {
        console.error('Error releasing slot hold post-booking:', err.message);
      });

      // 5. Generate AI pre-visit summary (async, don't block booking)
      clinicalService.generatePreVisitSummary(appointment.id, symptoms).catch((err) => {
        console.error('Error generating pre-visit summary asynchronously:', err.message);
      });

      return appointment;
    } catch (err: any) {
      // Catch PostgreSQL unique constraint violation (code P2002 for doctorId_dateTime_active_key)
      if (err.code === 'P2002') {
        throw new ConflictError('This slot has already been booked by another patient.');
      }
      throw err;
    }
  },

  /**
   * Reschedules an appointment.
   * Atomic PostgreSQL transaction marks the old appointment as CANCELLED,
   * inserts the new appointment, and queues outbox notifications.
   */
  rescheduleAppointment: async (appointmentId: string, newDateTime: Date, userId: string, userRole: string) => {
    // 1. Fetch old appointment
    const oldApp = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!oldApp) {
      throw new NotFoundError('Appointment not found.');
    }

    // 2. Verify permission (patient, doctor of appointment, or admin)
    const isPatientOwner = oldApp.patientId === userId && userRole === 'PATIENT';
    const isDoctorOwner = oldApp.doctorId === userId && userRole === 'DOCTOR';
    const isAdmin = userRole === 'ADMIN';

    if (!isPatientOwner && !isDoctorOwner && !isAdmin) {
      throw new UnauthorizedError('Unauthorized to reschedule this appointment.');
    }

    if (oldApp.status !== 'BOOKED') {
      throw new ValidationError('Only booked appointments can be rescheduled.');
    }

    // 3. Fetch Doctor Profile
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: oldApp.doctorId }
    });

    if (!doctor || !doctor.isActive) {
      throw new ValidationError('Doctor is currently inactive or not found.');
    }

    // 4. Validate new slot
    const isValid = await scheduleService.isValidSlot(oldApp.doctorId, newDateTime, oldApp.patientId);
    if (!isValid) {
      throw new ValidationError('New requested slot is not available or is invalid.');
    }

    const endTime = new Date(newDateTime.getTime() + doctor.slotDuration * 60000);

    try {
      // 5. Run single transaction
      const newApp = await prisma.$transaction(async (tx) => {
        // Create new appointment (this will fail with P2002 if concurrently booked)
        const app = await tx.appointment.create({
          data: {
            patientId: oldApp.patientId,
            doctorId: oldApp.doctorId,
            dateTime: newDateTime,
            endTime,
            status: 'BOOKED',
            active: true,
            symptoms: oldApp.symptoms
          }
        });

        // Cancel old appointment
        await tx.appointment.update({
          where: { id: appointmentId },
          data: {
            status: 'CANCELLED',
            active: null
          }
        });

        // Queue reschedule notifications in outbox
        await tx.outboxNotification.create({
          data: {
            type: 'EMAIL',
            action: 'SEND_RESCHEDULE_EMAIL',
            payload: { appointmentId: app.id, oldAppointmentId: oldApp.id } as any
          }
        });

        await tx.outboxNotification.create({
          data: {
            type: 'CALENDAR',
            action: 'UPDATE_EVENT',
            payload: { appointmentId: app.id, oldCalendarEventId: oldApp.googleCalendarEventId || '' } as any
          }
        });

        return app;
      });

      return newApp;
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ConflictError('The selected slot has already been booked by another patient.');
      }
      throw err;
    }
  },

  /**
   * Cancels an appointment.
   */
  cancelAppointment: async (appointmentId: string, userId: string, userRole: string) => {
    // 1. Fetch appointment
    const app = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!app) {
      throw new NotFoundError('Appointment not found.');
    }

    // 2. Verify permission
    const isPatientOwner = app.patientId === userId && userRole === 'PATIENT';
    const isDoctorOwner = app.doctorId === userId && userRole === 'DOCTOR';
    const isAdmin = userRole === 'ADMIN';

    if (!isPatientOwner && !isDoctorOwner && !isAdmin) {
      throw new UnauthorizedError('Unauthorized to cancel this appointment.');
    }

    if (app.status !== 'BOOKED') {
      throw new ValidationError('Only booked appointments can be cancelled.');
    }

    // 3. Cancel and queue notifications in transaction
    const cancelledApp = await prisma.$transaction(async (tx) => {
      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'CANCELLED',
          active: null
        }
      });

      await tx.outboxNotification.create({
        data: {
          type: 'EMAIL',
          action: 'SEND_CANCELLATION_EMAIL',
          payload: { appointmentId } as any
        }
      });

      await tx.outboxNotification.create({
        data: {
          type: 'CALENDAR',
          action: 'CANCEL_EVENT',
          payload: { googleCalendarEventId: app.googleCalendarEventId || '' } as any
        }
      });

      return updated;
    });

    return cancelledApp;
  }
};
