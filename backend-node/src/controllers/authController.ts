import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { sendEmail, fromEmail } from '../services/emailService';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123!';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, specialisation } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ msg: 'Please enter all required fields (email, password, name)' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Set roles
    const userRole = role === 'ADMIN' ? 'ADMIN' : role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT';

    // Verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user in database
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: passwordHash,
          name,
          role: userRole,
          verificationToken,
          verificationTokenExpires,
        },
      });

      // If user is a DOCTOR, create DoctorProfile
      if (userRole === 'DOCTOR') {
        await tx.doctorProfile.create({
          data: {
            userId: newUser.id,
            specialisation: specialisation || 'General Medicine',
          },
        });
      }

      return newUser;
    });

    // Send verification email (gracefully catch errors, do not rollback)
    try {
      const verifyUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email Address',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Welcome to Healthcare Manager, ${user.name}!</h2>
            <p>Please verify your email address by clicking the link below:</p>
            <p><a href="${verifyUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a></p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `,
        text: `Welcome to Healthcare Manager! Please verify your email by opening: ${verifyUrl}`
      });
    } catch (emailErr: any) {
      console.error('Email verification sending failed on signup:', emailErr.message);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { doctorProfile: true },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        doctorProfile: user.doctorProfile,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body; // allow query or body

    if (!token) {
      return res.status(400).json({ msg: 'Token is required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Token is invalid or has expired' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    res.json({ msg: 'Email verified successfully!' });
  } catch (err: any) {
    console.error('Email verification error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ msg: 'Email is already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpires,
      },
    });

    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Email Verification</h2>
          <p>Please verify your email address by clicking the link below:</p>
          <p><a href="${verifyUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a></p>
        </div>
      `,
      text: `Please verify your email by opening: ${verifyUrl}`
    });

    res.json({ msg: 'Verification email resent successfully' });
  } catch (err: any) {
    console.error('Resend verification error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      // Don't leak user existence in production, but here we return a success msg anyway or 404 for convenience
      return res.json({ msg: 'If that email exists in our system, we have sent a reset link' });
    }

    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken,
        resetPasswordExpires,
      },
    });

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Reset Password Request',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Please click the link below to set a new password:</p>
          <p><a href="${resetUrl}" style="background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p>This link is valid for 1 hour. If you did not request a reset, ignore this email.</p>
        </div>
      `,
      text: `You requested a password reset. Reset your password here: ${resetUrl}`
    });

    res.json({ msg: 'Reset email sent successfully' });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ msg: 'Token and new password are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Token is invalid or has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.json({ msg: 'Password reset successfully' });
  } catch (err: any) {
    console.error('Reset password error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
        doctorProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err: any) {
    console.error('Get user error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
