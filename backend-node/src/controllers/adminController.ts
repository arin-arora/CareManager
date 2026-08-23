import { Request, Response } from 'express';
import prisma from '../config/db';
import bcrypt from 'bcryptjs';

export const createDoctor = async (req: Request, res: Response) => {
  try {
    const { email, password, name, specialisation, designation, workingHours, slotDuration } = req.body;

    if (!email || !password || !name || !specialisation) {
      return res.status(400).json({ msg: 'Please provide all required fields (email, password, name, specialisation).' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create User (DOCTOR) + DoctorProfile
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: passwordHash,
          name,
          role: 'DOCTOR',
          isVerified: true // Admins create verified doctors
        }
      });

      const profile = await tx.doctorProfile.create({
        data: {
          userId: user.id,
          specialisation,
          designation: designation || 'Consultant',
          workingHours: workingHours || null,
          slotDuration: slotDuration ? parseInt(slotDuration) : 30
        }
      });

      return { user, profile };
    });

    res.status(201).json({
      msg: 'Doctor created successfully',
      doctor: {
        id: result.profile.id,
        userId: result.user.id,
        name: result.user.name,
        email: result.user.email,
        specialisation: result.profile.specialisation,
        designation: result.profile.designation,
        workingHours: result.profile.workingHours,
        slotDuration: result.profile.slotDuration,
        isActive: result.profile.isActive
      }
    });
  } catch (err: any) {
    console.error('Create doctor error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // doctorId
    const { name, specialisation, designation, workingHours, slotDuration, isActive } = req.body;

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!doctor) {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Update User name if provided
      if (name) {
        await tx.user.update({
          where: { id: doctor.userId },
          data: { name }
        });
      }

      // Update DoctorProfile details
      const profile = await tx.doctorProfile.update({
        where: { id },
        data: {
          specialisation: specialisation !== undefined ? specialisation : doctor.specialisation,
          designation: designation !== undefined ? designation : doctor.designation,
          workingHours: workingHours !== undefined ? workingHours : doctor.workingHours,
          slotDuration: slotDuration !== undefined ? parseInt(slotDuration) : doctor.slotDuration,
          isActive: isActive !== undefined ? isActive : doctor.isActive
        }
      });

      return profile;
    });

    res.json({ msg: 'Doctor updated successfully', doctor: updated });
  } catch (err: any) {
    console.error('Update doctor error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const listDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
    res.json(doctors);
  } catch (err: any) {
    console.error('List doctors error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const addLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // doctorId
    const { date, reason } = req.body; // date YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ msg: 'Leave date is required' });
    }

    const doctor = await prisma.doctorProfile.findUnique({ where: { id } });
    if (!doctor) {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    const leaveDate = new Date(date);
    const startOfLeaveDate = new Date(leaveDate.getFullYear(), leaveDate.getMonth(), leaveDate.getDate());
    const endOfLeaveDate = new Date(leaveDate.getFullYear(), leaveDate.getMonth(), leaveDate.getDate(), 23, 59, 59, 999);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the DoctorLeave entry
      const leave = await tx.doctorLeave.create({
        data: {
          doctorId: id,
          date: startOfLeaveDate,
          reason: reason || ''
        }
      });

      // 2. Find future appointments affected by this leave
      const affectedAppointments = await tx.appointment.findMany({
        where: {
          doctorId: id,
          dateTime: {
            gte: startOfLeaveDate,
            lte: endOfLeaveDate
          },
          status: 'BOOKED',
          active: true
        }
      });

      // 3. Cancel affected appointments and queue notifications
      for (const app of affectedAppointments) {
        await tx.appointment.update({
          where: { id: app.id },
          data: {
            status: 'CANCELLED',
            active: null
          }
        });

        // Queue notifications
        await tx.outboxNotification.create({
          data: {
            type: 'EMAIL',
            action: 'SEND_CANCELLATION_EMAIL',
            payload: { appointmentId: app.id } as any
          }
        });

        await tx.outboxNotification.create({
          data: {
            type: 'CALENDAR',
            action: 'CANCEL_EVENT',
            payload: { googleCalendarEventId: app.googleCalendarEventId || '' } as any
          }
        });
      }

      return { leave, affectedCount: affectedAppointments.length };
    });

    res.status(201).json({
      msg: 'Leave added successfully',
      leave: result.leave,
      cancelledAppointmentsCount: result.affectedCount
    });
  } catch (err: any) {
    console.error('Add leave error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const removeLeave = async (req: Request, res: Response) => {
  try {
    const { id, date } = req.params; // doctorId, date YYYY-MM-DD

    const leaveDate = new Date(date);
    const startOfLeaveDate = new Date(leaveDate.getFullYear(), leaveDate.getMonth(), leaveDate.getDate());

    const leave = await prisma.doctorLeave.findFirst({
      where: {
        doctorId: id,
        date: startOfLeaveDate
      }
    });

    if (!leave) {
      return res.status(404).json({ msg: 'Leave entry not found for this date.' });
    }

    await prisma.doctorLeave.delete({
      where: { id: leave.id }
    });

    res.json({ msg: 'Leave removed successfully' });
  } catch (err: any) {
    console.error('Remove leave error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
