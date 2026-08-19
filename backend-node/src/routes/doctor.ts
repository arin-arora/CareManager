import { Router } from 'express';
import {
  searchDoctors,
  getDoctorDetails,
  getDoctorSlots,
  completeConsultation
} from '../controllers/doctorController';
import { auth, authorize } from '../middleware/auth';

const router = Router();

// Apply auth to all endpoints
router.use(auth as any);

// @route   GET api/doctors
// @desc    Search and filter active doctors
router.get('/', searchDoctors);

// @route   GET api/doctors/:id
// @desc    Get detailed doctor profile
router.get('/:id', getDoctorDetails);

// @route   GET api/doctors/:id/slots
// @desc    Get available slots on date
router.get('/:id/slots', getDoctorSlots as any);

// @route   POST api/doctors/appointments/:id/consultation
// @desc    Doctor completes consultation notes + prescription
router.post('/appointments/:id/consultation', authorize(['DOCTOR']) as any, completeConsultation as any);

export default router;
