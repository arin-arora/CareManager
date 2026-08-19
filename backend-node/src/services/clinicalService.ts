import { Prisma } from '@prisma/client';
import prisma from '../config/db';
import { aiService } from './aiService';

export const clinicalService = {
  /**
   * Triggers generation of the pre-visit AI summary.
   * If generation fails, it persists status=FAILED without breaking the main workflow.
   */
  generatePreVisitSummary: async (appointmentId: string, symptoms: string) => {
    // 1. Ensure pre-visit summary record is initialized with PENDING status
    let summary = await prisma.preVisitSummary.upsert({
      where: { appointmentId },
      create: {
        appointmentId,
        status: 'PENDING'
      },
      update: {
        status: 'PENDING',
        urgency: null,
        chiefComplaint: null,
        suggestedQuestions: Prisma.DbNull,
        errorMessage: null
      }
    });

    try {
      const aiResult = await aiService.generatePreVisitSummary(symptoms);
      
      // Update with success values
      summary = await prisma.preVisitSummary.update({
        where: { appointmentId },
        data: {
          urgency: aiResult.urgency,
          chiefComplaint: aiResult.chiefComplaint,
          suggestedQuestions: aiResult.suggestedQuestions,
          status: 'SUCCESS'
        }
      });
    } catch (err: any) {
      console.error(`[CLINICAL SERVICE] AI pre-visit generation failed for appointment ${appointmentId}:`, err.message);
      summary = await prisma.preVisitSummary.update({
        where: { appointmentId },
        data: {
          status: 'FAILED',
          errorMessage: err.message
        }
      });
    }

    return summary;
  },

  /**
   * Triggers generation of the post-visit AI summary.
   * If generation fails, it persists status=FAILED without breaking the main workflow.
   */
  generatePostVisitSummary: async (consultationId: string, notes: string, prescription: any, followUpInfo: string) => {
    // 1. Ensure post-visit summary record is initialized with PENDING status
    let summary = await prisma.postVisitSummary.upsert({
      where: { consultationId },
      create: {
        consultationId,
        status: 'PENDING'
      },
      update: {
        status: 'PENDING',
        patientFriendlySummary: null,
        medicationSchedule: Prisma.DbNull,
        followUpSteps: null,
        errorMessage: null
      }
    });

    try {
      const aiResult = await aiService.generatePostVisitSummary(notes, prescription, followUpInfo);
      
      // Update with success values
      summary = await prisma.postVisitSummary.update({
        where: { consultationId },
        data: {
          patientFriendlySummary: aiResult.patientFriendlySummary,
          medicationSchedule: aiResult.medicationSchedule as any,
          followUpSteps: aiResult.followUpSteps,
          status: 'SUCCESS'
        }
      });
    } catch (err: any) {
      console.error(`[CLINICAL SERVICE] AI post-visit generation failed for consultation ${consultationId}:`, err.message);
      summary = await prisma.postVisitSummary.update({
        where: { consultationId },
        data: {
          status: 'FAILED',
          errorMessage: err.message
        }
      });
    }

    return summary;
  }
};
