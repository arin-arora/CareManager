import { Router } from 'express';
import {
  createDoctor,
  updateDoctor,
  listDoctors,
  addLeave,
  removeLeave
} from '../controllers/adminController';
import { auth, authorize } from '../middleware/auth';

const router = Router();

// Apply admin guard to all routes below
router.use(auth as any);
router.use(authorize(['ADMIN']) as any);

// @route   POST api/admin/doctors
// @desc    Create a new doctor
router.post('/doctors', createDoctor);

// @route   PUT api/admin/doctors/:id
// @desc    Update doctor profile / schedule
router.put('/doctors/:id', updateDoctor);

// @route   GET api/admin/doctors
// @desc    Get all doctor profiles
router.get('/doctors', listDoctors);

// @route   POST api/admin/doctors/:id/leave
// @desc    Record leave for a doctor (cancels future conflicts)
router.post('/doctors/:id/leave', addLeave);

// @route   DELETE api/admin/doctors/:id/leave/:date
// @desc    Cancel registered future leave
router.delete('/doctors/:id/leave/:date', removeLeave);

export default router;
