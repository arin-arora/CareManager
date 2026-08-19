import { Router } from 'express';
import {
  holdSlot,
  bookAppointment,
  rescheduleAppointment,
  cancelAppointment,
  listPatientAppointments,
  listDoctorAppointments,
  getAppointmentDetails,
  listAllAppointments,
  retryPreVisitSummary,
  retryPostVisitSummary
} from '../controllers/appointmentController';
import { auth, authorize } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes below
router.use(auth as any);

// @route   POST api/appointments/hold
// @desc    Temporarily reserve a doctor slot
router.post('/hold', holdSlot as any);

// @route   POST api/appointments
// @desc    Finalize booking an appointment
router.post('/', bookAppointment as any);

// @route   POST api/appointments/:id/reschedule
// @desc    Reschedule a booked appointment to another slot
router.post('/:id/reschedule', rescheduleAppointment as any);

// @route   POST api/appointments/:id/cancel
// @desc    Cancel an appointment
router.post('/:id/cancel', cancelAppointment as any);

// @route   GET api/appointments/patient
// @desc    List appointments for logged-in patient
router.get('/patient', listPatientAppointments as any);

// @route   GET api/appointments/doctor
// @desc    List appointments for logged-in doctor
router.get('/doctor', listDoctorAppointments as any);

// @route   GET api/appointments/admin
// @desc    List all appointments (admin only)
router.get('/admin', authorize(['ADMIN']) as any, listAllAppointments as any);

// @route   POST api/appointments/:id/pre-visit-summary/retry
// @desc    Retry pre-visit AI summary generation
router.post('/:id/pre-visit-summary/retry', retryPreVisitSummary as any);

// @route   POST api/appointments/:id/post-visit-summary/retry
// @desc    Retry post-visit AI summary generation
router.post('/:id/post-visit-summary/retry', retryPostVisitSummary as any);

// @route   GET api/appointments/:id
// @desc    Get detailed view of a specific appointment
router.get('/:id', getAppointmentDetails as any);

export default router;
