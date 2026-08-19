import { Request, Response } from 'express';
import prisma from '../config/db';
import { scheduleService } from '../services/scheduleService';
import { AuthenticatedRequest } from '../middleware/auth';
import { reminderService } from '../services/reminderService';
import { clinicalService } from '../services/clinicalService';

export const searchDoctors = async (req: Request, res: Response) => {
  try {
    const { specialisation } = req.query;

    const whereClause: any = {
      isActive: true
    };

    if (specialisation) {
      whereClause.specialisation = {
        contains: String(specialisation),
        mode: 'insensitive'
      };
    }

    const doctors = await prisma.doctorProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json(doctors);
  } catch (err: any) {
    console.error('Search doctors error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getDoctorDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!doctor || !doctor.isActive) {
      return res.status(404).json({ msg: 'Doctor not found or inactive.' });
    }

    res.json(doctor);
  } catch (err: any) {
    console.error('Get doctor details error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getDoctorSlots = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params; // doctorId
    const { date } = req.query; // YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ msg: 'Query parameter date (YYYY-MM-DD) is required.' });
    }

    const slots = await scheduleService.generateSlots(id, String(date), req.user?.id);
    res.json({ slots });
  } catch (err: any) {
    console.error('Get doctor slots error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const completeConsultation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params; // appointmentId
    const { notes, prescription, followUpInfo } = req.body;

    if (!notes) {
      return res.status(400).json({ msg: 'Consultation notes are required.' });
    }

    const app = await prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true }
    });

    if (!app) {
      return res.status(404).json({ msg: 'Appointment not found.' });
    }

    // Verify role and ownership: Only assigned doctor can complete consultation
    if (req.user?.role !== 'DOCTOR' || app.doctor.userId !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized. Only the assigned doctor can complete this consultation.' });
    }

    if (app.status !== 'BOOKED') {
      return res.status(400).json({ msg: 'Only active booked appointments can be completed.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update appointment status to COMPLETED
      const updatedApp = await tx.appointment.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          active: null
        }
      });

      // 2. Create Consultation record
      const consultation = await tx.consultation.create({
        data: {
          appointmentId: id,
          notes,
          followUpInfo: followUpInfo || null
        }
      });

      // 3. Create Structured Prescription if provided
      let savedItems: any[] = [];
      if (Array.isArray(prescription) && prescription.length > 0) {
        const createdPrescription = await tx.prescription.create({
          data: {
            consultationId: consultation.id
          }
        });

        for (const item of prescription) {
          const createdItem = await tx.prescriptionItem.create({
            data: {
              prescriptionId: createdPrescription.id,
              medicineName: String(item.medicineName || 'Medication'),
              dosage: String(item.dosage || 'As prescribed'),
              frequency: String(item.frequency || 'Once daily'),
              duration: String(item.duration || '5 days'),
              instructions: item.instructions || null
            }
          });
          savedItems.push(createdItem);
        }
      } else if (typeof prescription === 'string' && prescription.trim() !== '') {
        // Fallback for legacy plain text prescription
        const createdPrescription = await tx.prescription.create({
          data: {
            consultationId: consultation.id
          }
        });

        const createdItem = await tx.prescriptionItem.create({
          data: {
            prescriptionId: createdPrescription.id,
            medicineName: prescription.trim(),
            dosage: 'As prescribed',
            frequency: 'Once daily',
            duration: '5 days',
            instructions: null
          }
        });
        savedItems.push(createdItem);
      }

      // 4. Create Outbox Notification (Standard notification)
      await tx.outboxNotification.create({
        data: {
          type: 'EMAIL',
          action: 'SEND_CONSULTATION_SUMMARY',
          payload: { appointmentId: id } as any
        }
      });

      return { updatedApp, consultation, savedItems };
    });

    // Schedule Medication Reminders using reminderService (asynchronous database additions)
    if (result.savedItems.length > 0) {
      reminderService.createRemindersForPrescription(app.patientId, result.savedItems).catch((err) => {
        console.error('[CONSULTATION] Failed to create medication reminders:', err.message);
      });
    }

    // Trigger AI post-visit summary generation
    clinicalService.generatePostVisitSummary(
      result.consultation.id,
      notes,
      result.savedItems,
      followUpInfo || ''
    ).catch((err) => {
      console.error('[CONSULTATION] Failed to generate AI post-visit summary:', err.message);
    });

    // Fetch complete consultation object with relations to return
    const completedConsultationDetails = await prisma.consultation.findUnique({
      where: { id: result.consultation.id },
      include: {
        prescription: {
          include: {
            items: true
          }
        },
        postVisitSummary: true
      }
    });

    res.json({
      msg: 'Consultation completed successfully.',
      appointment: result.updatedApp,
      consultation: completedConsultationDetails
    });
  } catch (err: any) {
    console.error('Complete consultation error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
