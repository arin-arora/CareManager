import prisma from '../config/db';
import { holdService } from './holdService';

interface TimeInterval {
  start: string; // HH:MM
  end: string;   // HH:MM
}

interface WeeklySchedule {
  [day: string]: TimeInterval[];
}

const DEFAULT_SCHEDULE: WeeklySchedule = {
  monday: [{ start: '09:00', end: '17:00' }],
  tuesday: [{ start: '09:00', end: '17:00' }],
  wednesday: [{ start: '09:00', end: '17:00' }],
  thursday: [{ start: '09:00', end: '17:00' }],
  friday: [{ start: '09:00', end: '17:00' }],
  saturday: [],
  sunday: []
};

export const scheduleService = {
  /**
   * Generates available slot times for a doctor on a specific date (YYYY-MM-DD).
   * Filters out slots overlapping with doctor leaves, active appointments, and holds by other patients.
   */
  generateSlots: async (doctorId: string, dateStr: string, currentUserId?: string): Promise<Date[]> => {
    // 1. Fetch Doctor and status
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: { leaves: true }
    });

    if (!doctor || !doctor.isActive) {
      return [];
    }

    // 2. Parse date components explicitly (YYYY-MM-DD) to prevent timezone drift
    const [year, month, day] = dateStr.split('-').map(Number);
    const queryDate = new Date(Date.UTC(year, month - 1, day));
    const startOfQueryDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfQueryDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const isOnLeave = doctor.leaves.some(leave => {
      const leaveDate = new Date(leave.date);
      return (
        leaveDate.getUTCFullYear() === year &&
        leaveDate.getUTCMonth() === month - 1 &&
        leaveDate.getUTCDate() === day
      );
    });

    if (isOnLeave) {
      return [];
    }

    // 3. Determine schedule for the day
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = weekdays[queryDate.getUTCDay()];
    const workingHours = (doctor.workingHours as unknown as WeeklySchedule) || DEFAULT_SCHEDULE;
    const intervals = workingHours[dayOfWeek] || [];

    if (intervals.length === 0) {
      return [];
    }

    // 4. Retrieve existing active appointments on this day
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        dateTime: {
          gte: startOfQueryDate,
          lte: endOfQueryDate
        },
        active: true
      }
    });

    // Generate slots based on intervals and slot duration
    const slots: Date[] = [];
    const durationMin = doctor.slotDuration;
    const now = new Date();

    for (const interval of intervals) {
      const [startHour, startMin] = interval.start.split(':').map(Number);
      const [endHour, endMin] = interval.end.split(':').map(Number);

      let current = new Date(Date.UTC(year, month - 1, day, startHour, startMin));
      const end = new Date(Date.UTC(year, month - 1, day, endHour, endMin));

      while (current.getTime() + durationMin * 60000 <= end.getTime()) {
        if (current.getTime() > now.getTime()) {
          slots.push(new Date(current));
        }
        current = new Date(current.getTime() + durationMin * 60000);
      }
    }

    // 5. Filter out slots that overlap with active appointments or holds by other users
    const availableSlots: Date[] = [];

    for (const slot of slots) {
      const slotEndTime = new Date(slot.getTime() + durationMin * 60000);

      // Check appointment overlap
      const hasAppointmentOverlap = appointments.some(app => {
        const appStart = new Date(app.dateTime).getTime();
        const appEnd = new Date(app.endTime).getTime();
        const slotStart = slot.getTime();
        const slotEnd = slotEndTime.getTime();

        // Overlap occurs if start of one is before end of other and vice versa
        return slotStart < appEnd && slotEnd > appStart;
      });

      if (hasAppointmentOverlap) {
        continue;
      }

      // Check slot hold in Redis
      const holder = await holdService.checkHold(doctorId, slot.toISOString());
      if (holder && holder !== currentUserId) {
        // Slot is held by another user
        continue;
      }

      availableSlots.push(slot);
    }

    return availableSlots;
  },

  /**
   * Helper to validate if a specific slot time is valid and available for a booking.
   */
  isValidSlot: async (doctorId: string, dateTime: Date, currentUserId?: string): Promise<boolean> => {
    const dateStr = dateTime.toISOString().split('T')[0];
    const slots = await scheduleService.generateSlots(doctorId, dateStr, currentUserId);
    return slots.some(slot => slot.getTime() === dateTime.getTime());
  }
};
