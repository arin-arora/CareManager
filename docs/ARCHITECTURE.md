# CareManager — System Architecture Specification

This document details the architectural layout, component interactions, data flow, concurrency patterns, and AI pipeline of the **CareManager** platform.

---

## 1. High-Level System Architecture

CareManager uses a decoupled multi-tier architecture separating the client-side SPA, backend API service, distributed cache/lock store, relational database, background task processor, and external AI provider services.

```mermaid
flowchart TD
    subgraph Client ["Client Layer"]
        UI["React 18 + Vite SPA<br/>(Port 3002)"]
    end

    subgraph Backend ["API & Services Layer"]
        API["Express + TypeScript Server<br/>(Port 5051)"]
        HoldSvc["Hold Service<br/>(Redis Client)"]
        ApptSvc["Appointment Service"]
        ClinSvc["Clinical AI Service"]
        OutboxProc["Outbox Background Processor<br/>(10s Poll Loop)"]
    end

    subgraph Storage ["Data Layer"]
        PG[("PostgreSQL Database<br/>(Prisma ORM)")]
        Redis[("Redis In-Memory Store<br/>(5-min Slot Holds)")]
    end

    subgraph AI ["AI & External Services"]
        LLM["Groq / Gemini / Mock API<br/>(JSON Triage Summary)"]
        Email["Email / Nodemailer Service"]
    end

    UI -->|REST / JSON| API
    API --> HoldSvc
    API --> ApptSvc
    API --> ClinSvc
    
    HoldSvc -->|Atomic SET PX NX| Redis
    ApptSvc -->|Prisma Transaction| PG
    ClinSvc -->|Prompt & Parse JSON| LLM
    
    OutboxProc -->|Poll PENDING Events| PG
    OutboxProc -->|Dispatch Emails| Email
```

---

## 2. Component Responsibilities

### A. Frontend Layer (`frontend/`)
- **React 18 + Vite Single Page Application**: Serves user interface components across 11 primary views.
- **MainLayout & App Shell**: Implements a unified clinical sidebar for authenticated patients, doctors, and admins.
- **State Management (`useApp.js`)**: Manages session auth tokens, user roles, medication lists, symptom history, and modal states.
- **API Integration (`services/api.js`)**: Encapsulates Axios HTTP calls configured via `VITE_API_URL`.

### B. Backend API Server (`backend-node/src/server.ts`)
- **Express + TypeScript Router**: Entry point handling CORS, JSON body parsing, and routing for `/api/auth`, `/api/doctors`, `/api/appointments`, `/api/symptoms`, and `/api/health`.
- **Authentication Middleware (`middleware/auth.ts`)**: Verifies JWT bearer tokens, attaches decoded user object (`req.user`) to request context, and enforces role-based access (`PATIENT`, `DOCTOR`, `ADMIN`).

### C. Database & ORM Layer (`backend-node/prisma/`)
- **PostgreSQL Database**: Relational datastore containing 10 core tables: `User`, `DoctorProfile`, `DoctorLeave`, `SlotHold`, `Appointment`, `PreVisitSummary`, `Consultation`, `Prescription`, `PrescriptionItem`, `PostVisitSummary`, `MedicationReminder`, and `OutboxNotification`.
- **Prisma ORM (`config/db.ts`)**: Generates type-safe database access client, executes schema migrations, and handles interactive transactions (`prisma.$transaction`).

### D. Redis Slot Hold Layer (`services/holdService.ts`)
- **Redis Client (`config/redis.ts`)**: In-memory Redis instance executing distributed lock operations.
- **Atomic Operations**:
  - `holdSlot()`: Executes `SET hold:doctor:{id}:slot:{iso} {userId} PX 300000 NX` (5-minute TTL lock).
  - `releaseSlot()`: Executes atomic Lua script checking owner match before deletion.
  - **Graceful Fallback**: If Redis service is unreachable, `holdService` logs a warning and returns `true`, permitting database-level transaction validation to act as the fallback safety barrier.

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    participant API as Express API
    participant Redis as Redis Cache
    participant DB as PostgreSQL DB

    Patient->>API: POST /api/appointments/hold (doctorId, slotTime)
    API->>Redis: SET hold:doctor:ID:slot:TIME userId PX 300000 NX
    alt Redis Key Acquired
        Redis-->>API: OK
        API-->>Patient: 200 Slot Held (5 minutes)
    else Redis Key Exists
        Redis-->>API: null
        API-->>Patient: 400 Slot unavailable
    end

    Patient->>API: POST /api/appointments (doctorId, slotTime, symptoms)
    API->>DB: Prisma Transaction (Create Appointment)
    alt Slot Available
        DB-->>API: Appointment Created
        API->>Redis: DEL hold:doctor:ID:slot:TIME
        API-->>Patient: 201 Appointment Booked
    else Unique Constraint Violation (P2002)
        DB-->>API: Error P2002 (Conflict)
        API-->>Patient: 409 Slot already booked by another user
    end
```

### E. Clinical AI Engine (`services/aiService.ts` & `clinicalService.ts`)
- **LLM Interface**: Integrates with Groq (`llama-3.3-70b-versatile`), Google Gemini (`gemini-1.5-flash`), or Mock provider fallback.
- **Pre-Visit Triage**: Prompt engineering forces strict JSON schema validation containing `urgency`, `chiefComplaint`, and `suggestedQuestions`.
- **Post-Visit Summaries**: Converts physician SOAP notes and prescription items into patient-accessible medical guides and structured dosage timing models.
- **Resilience Strategy**: AI generation executes asynchronously post-booking. If the external LLM times out or returns malformed JSON, `PreVisitSummary` is saved with `status: FAILED` and `errorMessage`, leaving the patient's appointment valid and booked.

```mermaid
sequenceDiagram
    autonumber
    participant ApptSvc as Appointment Service
    participant ClinSvc as Clinical Service
    participant LLM as Groq / Gemini API
    participant DB as PostgreSQL DB

    ApptSvc->>DB: Save Appointment (status: BOOKED)
    ApptSvc->>ClinSvc: generatePreVisitSummary(appointmentId, symptoms) [Async]
    ClinSvc->>LLM: Send Structured Prompt with JSON Schema
    alt LLM Success
        LLM-->>ClinSvc: Return Valid JSON
        ClinSvc->>DB: Save PreVisitSummary (status: SUCCESS)
    else LLM Timeout / Malformed Response
        LLM-->>ClinSvc: Error / Invalid Output
        ClinSvc->>DB: Save PreVisitSummary (status: FAILED, errorMessage)
    end
```

### F. Asynchronous Outbox Worker (`services/outboxProcessor.ts`)
- **Transactional Outbox Pattern**: Database updates write event payloads directly to `OutboxNotification` table inside the primary Prisma transaction.
- **Polling Processor**: Runs every 10 seconds checking for `PENDING` or retry-eligible `FAILED` notifications.
- **Delivery**: Dispatches transactional emails via Nodemailer or Resend service and updates event state to `SENT` or `FAILED`.

```mermaid
flowchart LR
    subgraph Transaction ["Atomic Database Transaction"]
        A[Create Appointment] --> B[Insert Email Event in Outbox]
        A --> C[Insert Calendar Event in Outbox]
    end

    subgraph Worker ["Background Outbox Worker (10s Loop)"]
        B & C .-> D[Poll PENDING Notifications]
        D --> E{Execute Action}
        E -->|Success| F[Mark SENT]
        E -->|Failure| G[Increment Attempts & Schedule Retry]
    end
```
