import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { appointmentService } from '../services/appointmentService';
import { holdService } from '../services/holdService';
import { clinicalService } from '../services/clinicalService';
import prisma from '../config/db';

export const holdSlot = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { doctorId, slotTime } = req.body;
    const userId = req.user?.id;

    if (!doctorId || !slotTime || !userId) {
      return res.status(400).json({ msg: 'Doctor ID and Slot Time are required.' });
    }

    // Attempt to hold the slot for 5 minutes (300,000 ms)
    const success = await holdService.holdSlot(doctorId, slotTime, userId);

    if (!success) {
      return res.status(409).json({ msg: 'Slot is already temporarily held by another patient.' });
    }

    res.json({ msg: 'Slot held successfully for 5 minutes.', doctorId, slotTime });
  } catch (err: any) {
    console.error('Hold slot error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const bookAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { doctorId, slotTime, symptoms } = req.body;
    const patientId = req.user?.id;

    if (!doctorId || !slotTime || !symptoms || !patientId) {
      return res.status(400).json({ msg: 'Please provide doctorId, slotTime, and symptoms.' });
    }

    const appointment = await appointmentService.bookAppointment(
      patientId,
      doctorId,
      new Date(slotTime),
      symptoms
    );

    // Asynchronously trigger AI pre-visit summary generation
    clinicalService.generatePreVisitSummary(appointment.id, symptoms).catch((err) => {
      console.error('[BOOKING] Failed to generate AI pre-visit summary:', err.message);
    });

    res.status(201).json({ msg: 'Appointment booked successfully!', appointment });
  } catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ msg: err.message });
    }
    console.error('Book appointment error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const rescheduleAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newSlotTime } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!newSlotTime || !userId || !userRole) {
      return res.status(400).json({ msg: 'New slot time is required.' });
    }

    const newApp = await appointmentService.rescheduleAppointment(
      id,
      new Date(newSlotTime),
      userId,
      userRole
    );

    res.json({ msg: 'Appointment rescheduled successfully!', appointment: newApp });
  } catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ msg: err.message });
    }
    console.error('Reschedule appointment error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const cancelAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(400).json({ msg: 'Authentication error.' });
    }

    const cancelledApp = await appointmentService.cancelAppointment(
      id,
      userId,
      userRole
    );

    res.json({ msg: 'Appointment cancelled successfully.', appointment: cancelledApp });
  } catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ msg: err.message });
    }
    console.error('Cancel appointment error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const listPatientAppointments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const patientId = req.user?.id;
    if (!patientId) {
      return res.status(400).json({ msg: 'User ID missing.' });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        preVisitSummary: true,
        consultation: {
          include: {
            prescription: {
              include: {
                items: true
              }
            },
            postVisitSummary: true
          }
        }
      },
      orderBy: { dateTime: 'desc' }
    });

    res.json(appointments);
  } catch (err: any) {
    console.error('List patient appointments error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const listDoctorAppointments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ msg: 'User ID missing.' });
    }

    const profile = await prisma.doctorProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ msg: 'Doctor profile not found.' });
    }

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: profile.id },
      include: {
        patient: {
          select: {
            name: true,
            email: true
          }
        },
        preVisitSummary: true,
        consultation: {
          include: {
            prescription: {
              include: {
                items: true
              }
            },
            postVisitSummary: true
          }
        }
      },
      orderBy: { dateTime: 'desc' }
    });

    res.json(appointments);
  } catch (err: any) {
    console.error('List doctor appointments error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getAppointmentDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        doctor: { include: { user: { select: { id: true, name: true, email: true } } } },
        preVisitSummary: true,
        consultation: {
          include: {
            prescription: {
              include: {
                items: true
              }
            },
            postVisitSummary: true
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found.' });
    }

    // Auth check
    const isPatient = appointment.patientId === userId && role === 'PATIENT';
    const isDoctor = appointment.doctor.userId === userId && role === 'DOCTOR';
    const isAdmin = role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ msg: 'Access denied.' });
    }

    res.json(appointment);
  } catch (err: any) {
    console.error('Get appointment details error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const listAllAppointments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { include: { user: { select: { name: true } } } }
      },
      orderBy: { dateTime: 'desc' }
    });
    res.json(appointments);
  } catch (err: any) {
    console.error('List all appointments error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * Endpoint to manually retry generating a pre-visit summary if it previously failed.
 */
export const retryPreVisitSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    const app = await prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true }
    });

    if (!app) {
      return res.status(404).json({ msg: 'Appointment not found.' });
    }

    const isPatient = app.patientId === userId && role === 'PATIENT';
    const isDoctor = app.doctor.userId === userId && role === 'DOCTOR';
    const isAdmin = role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ msg: 'Access denied.' });
    }

    const summary = await clinicalService.generatePreVisitSummary(app.id, app.symptoms);
    res.json({ msg: 'Pre-visit summary regenerated successfully.', summary });
  } catch (err: any) {
    console.error('Retry pre-visit summary error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * Endpoint to manually retry generating a post-visit summary if it previously failed.
 */
export const retryPostVisitSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params; // appointment ID
    const userId = req.user?.id;
    const role = req.user?.role;

    const app = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: true,
        consultation: {
          include: {
            prescription: {
              include: {
                items: true
              }
            }
          }
        }
      }
    });

    if (!app) {
      return res.status(404).json({ msg: 'Appointment not found.' });
    }

    if (!app.consultation) {
      return res.status(400).json({ msg: 'Consultation has not been completed yet.' });
    }

    const isPatient = app.patientId === userId && role === 'PATIENT';
    const isDoctor = app.doctor.userId === userId && role === 'DOCTOR';
    const isAdmin = role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ msg: 'Access denied.' });
    }

    const summary = await clinicalService.generatePostVisitSummary(
      app.consultation.id,
      app.consultation.notes,
      app.consultation.prescription?.items || [],
      app.consultation.followUpInfo || ''
    );

    res.json({ msg: 'Post-visit summary regenerated successfully.', summary });
  } catch (err: any) {
    console.error('Retry post-visit summary error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
