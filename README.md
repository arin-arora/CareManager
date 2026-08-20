# CareManager — Healthcare Appointment & Follow-up Manager

**CareManager** is a production-ready, full-stack clinical appointment and follow-up management platform. It is engineered with robust concurrency protection, real-time slot holding, automated AI triage, structured post-visit summaries, digital prescription management, and reliable background notification delivery via the transactional outbox pattern.

---

## 📌 Problem Statement

Traditional healthcare booking systems face three major technical operational hurdles:

1. **Race Conditions & Double Booking**: High demand for specialist doctor slots often leads to concurrent booking attempts where two patients submit for the same slot simultaneously.
2. **Clinical Overhead & Unstructured Triage**: Doctors lose valuable consultation time synthesizing patient symptoms prior to appointments, and patients frequently receive vague, handwritten follow-up instructions.
3. **Unreliable Communication**: Standard transactional email triggers tied directly to HTTP request loops can fail due to network drops, leading to lost notifications or partial database writes.

**CareManager** resolves these challenges by combining a high-performance **Redis-backed distributed slot lock**, **PostgreSQL transactional double-booking prevention**, an **automated AI clinical summary engine**, and an **asynchronous transactional outbox processor**.

---

## ✨ Key Features

- 🏥 **Specialist & Doctor Directory**: Real-time listing of active medical professionals with custom working hours and slot durations.
- ⏱️ **5-Minute Redis Slot Hold**: Prevents other patients from selecting a slot while a patient fills out symptoms and confirms booking.
- 🔒 **Atomic Concurrency Protection**: High-throughput PostgreSQL unique constraint locks guarantee zero double-bookings under concurrent load.
- 🤖 **AI Clinical Pre-Visit Triage**: Generates symptom-based urgency ratings (`LOW`, `MEDIUM`, `HIGH`), chief complaints, and suggested doctor questions.
- 📝 **Doctor Clinical Workspace**: SOAP notes editor, diagnosis recording, and follow-up scheduling.
- 💊 **Structured Prescription Engine**: Digital prescription builder with automatic parsing into structured medication schedules.
- 📋 **Patient Post-Visit Summaries**: AI-driven, patient-friendly summaries breaking down complex medical guidance into clear action steps.
- ⏰ **Medication Reminders**: Automated tracking and status management for active patient prescriptions.
- 📬 **Transactional Outbox Pattern**: Asynchronous background processor for reliable email notification delivery and calendar event syncing.
- 🔐 **Secure Role-Based Auth**: Full JWT authentication supporting `PATIENT`, `DOCTOR`, and `ADMIN` roles with email verification and password reset flows.

---

## 👥 User Roles

### 1. Patient
- Search doctors by specialization.
- Select date & time slots with live 5-minute hold reservation.
- Submit symptom logs for pre-visit triage.
- View upcoming and completed appointments with AI pre-visit and post-visit summaries.
- Track active medication schedules and reminders.

### 2. Doctor
- View daily consultation schedule with patient symptom histories.
- Access pre-visit AI triage reports before entering the consultation room.
- Complete SOAP notes, record clinical diagnoses, set follow-up dates.
- Prescribe structured medications (drug name, dosage, frequency, duration, instructions).
- Manage schedule availability and submit leave requests.

### 3. Admin
- System operations console monitoring user registrations, total appointments, and active doctors.
- Create and onboard new doctor profiles.
- Manage global system health and inspect background outbox job logs.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | Fast SPA rendering with modern component architecture |
| **Styling** | Vanilla CSS + Tailwind | Clean clinical SaaS aesthetic (Clinical Blue primary, light surfaces) |
| **Icons & UI** | Lucide React | Lightweight SVG iconography |
| **Backend Runtime** | Node.js + Express + TypeScript | Type-safe RESTful API services |
| **Database ORM** | Prisma ORM | Relational schema management, type-safe queries, and migrations |
| **Primary Database** | PostgreSQL | Acid-compliant relational database for user data, slots, and consultations |
| **Cache & Locks** | Redis | In-memory distributed lock store for temporary 5-minute slot holds |
| **AI Triage Engine** | Groq / Gemini API / Mock Fallback | LLM clinical summary generator with fallback resilience |
| **Background Processing**| Transactional Outbox Worker | Polling worker for reliable email notification delivery |
| **Testing** | Jest + `ts-node` | Concurrency and clinical workflow test automation |

---

## 🏗️ Architecture Overview

### Frontend Architecture
- Built with React + Vite as a single-page application (SPA).
- **Navigation Shell**: Clean sidebar-based navigation layout for authenticated users (`MainLayout.jsx`).
- **State Management**: Custom `useApp` hook managing auth tokens, patient history, medication tracking, and global modal states.
- **API Client**: Axios-based `apiService` configured with dynamic `VITE_API_URL` endpoints.

### Backend Architecture
- Express + TypeScript REST API modularized into routes, controllers, middleware, and domain services.
- **Database Access**: Prisma Client configured for PostgreSQL transactions (`prisma.$transaction`).
- **Distributed Hold Engine**: Redis-backed `holdService` utilizing atomic `SET ... PX ... NX` keys (`hold:doctor:{id}:slot:{time}`).
- **Outbox Worker**: Polling worker executing every 10 seconds to deliver pending notifications.

---

## 🔒 Concurrency Protection & Slot Hold Mechanism

CareManager implements a two-tier concurrency safety strategy:

1. **Tier 1: Temporary Redis Slot Hold (`holdService.ts`)**
   - When a patient selects a slot, Redis executes `SET hold:doctor:{id}:slot:{iso} {userId} PX 300000 NX`.
   - Returns `OK` if held successfully for 5 minutes (300,000 ms).
   - Prevents other users from selecting the slot during checkout.
   - If Redis is unavailable, the system gracefully falls back to Tier 2 without blocking user flow.

2. **Tier 2: Atomic PostgreSQL Transaction (`appointmentService.ts`)**
   - When confirming booking, Prisma runs an atomic `$transaction`.
   - The `Appointment` table enforces a composite unique constraint: `@@unique([doctorId, dateTime, active])`.
   - If 10 requests hit the server simultaneously for the exact same slot, PostgreSQL grants creation to exactly **1** transaction and rejects the remaining 9 with code `P2002` (Unique Constraint Violation).
   - Rejections are caught and surfaced as `409 Conflict: This slot has already been booked by another patient.`

---

## 🤖 AI Clinical Workflow

1. **Pre-Visit Triage**:
   - Patient submits symptoms during appointment booking.
   - Asynchronous trigger sends prompt to LLM (`aiService.generatePreVisitSummary`).
   - LLM responds with JSON containing `urgency` (`LOW`, `MEDIUM`, `HIGH`), `chiefComplaint`, and `suggestedQuestions`.
   - Result is saved in `PreVisitSummary` table (`status: SUCCESS`). If LLM fails or times out, booking still succeeds and summary status is marked `FAILED` without breaking patient workflow.

2. **Post-Visit Summary & Structured Prescriptions**:
   - Doctor completes consultation with clinical notes and prescription items.
   - Clinical service invokes LLM to generate `patientFriendlySummary` and a structured `medicationSchedule`.
   - Result is stored in `PostVisitSummary` for patient reference.

---

## 📬 Outbox Notification Architecture

To guarantee reliability under network failures:
- Booking, rescheduling, and cancellation actions insert event records directly into `OutboxNotification` table inside the **same database transaction** as the appointment state change.
- A background worker (`outboxProcessor.ts`) polls pending items every 10 seconds.
- Uses exponential backoff and retry counters (up to 5 attempts) to send transactional emails via Nodemailer/Resend.

---

## 🔑 Environment Variables Required

### Backend Environment Variables (`backend-node/.env`)
```env
PORT=5051
DATABASE_URL="postgresql://user:password@localhost:5432/caremanager?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="supersecretjwtkey123!"
LLM_PROVIDER="GROQ"
GROQ_API_KEY="your_groq_api_key"
GEMINI_API_KEY="your_gemini_api_key"
STRICT_AI_MODE=false
FRONTEND_URL="http://localhost:3002"
```

### Frontend Environment Variables (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5051
```

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- Redis (v6+)

### 1. Database Setup
```bash
cd backend-node
npx prisma migrate dev --name init
npx prisma generate
```

### 2. Running the Backend Server
```bash
cd backend-node
npm run dev
# Backend starts on http://localhost:5051
```

### 3. Running the Frontend Server
```bash
cd frontend
npm run dev
# Frontend starts on http://localhost:3002
```

---

## 🧪 Running Tests

### Concurrency Test Suite (11/11 Passed)
Verifies Redis holds, simultaneous booking attempts, doctor leave validation, expired holds, and rescheduling rollback:
```bash
cd backend-node
npx ts-node tests/concurrency.test.ts
```

### Clinical Workflow Test Suite (26/26 Passed)
Verifies pre-visit triage, doctor consultation completion, prescription generation, authorization checks, and LLM fallback handling:
```bash
cd backend-node
npx ts-node tests/workflow.test.ts
```
