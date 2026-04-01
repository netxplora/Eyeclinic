# Satome Eye Clinic - Project Documentation

## Table of Contents
1. [Introduction](#1-introduction)
2. [Technology Stack](#2-technology-stack)
3. [Mode of Use (User Guide)](#3-mode-of-use-user-guide)
4. [Admin Functions & Control](#4-admin-functions--control)
5. [System Architecture & API](#5-system-architecture--api)
6. [Email Integration & Edge Functions](#6-email-integration--edge-functions)
7. [Configuration & Environment Variables](#7-configuration--environment-variables)
8. [Deployment Guide](#8-deployment-guide)

---

## 1. Introduction
Satome Eye Clinic is a comprehensive web application designed to manage patient appointments, provide an online storefront for eyewear/products, and power an informative blog section. It acts as both a patient-facing portal and a full-featured administrative control panel for clinic staff.

**Core Offerings:**
- Patient Appointment Scheduling & Waitlist System
- Admin Dashboard for Booking Management
- Built-in Content Management System (CMS) for Blocks
- E-Commerce Storefront for Eye Care Products
- Automated Email Notifications & Reminders (via Resend)

---

## 2. Technology Stack
The project is built using modern, highly scalable web technologies:

- **Frontend Framework:** React 18, Vite (TypeScript)
- **UI Components & Styling:** Tailwind CSS, shadcn/ui components, Radix UI primitives, Lucide Icons.
- **Routing:** React Router v6
- **State Management & Form Handling:** React Hook Form, Zod (validation), TanStack React Query
- **Backend as a Service (BaaS):** Supabase (PostgreSQL Database, Authentication, Edge Functions, Storage)
- **Email Service:** Resend API (via Supabase Edge Functions)
- **Rich Text Editing:** Tiptap Editor (used in Blog CMS)

---

## 3. Mode of Use (User Guide)

The application is divided into two primary experiences: the **Public Facing Site** (Patients) and the **Admin Portal** (Staff/Doctors).

### Patient Experience
- **Home / About / Services Pages:** Patients can view clinic information, read about available services, and learn about the doctors.
- **Booking an Appointment:** 
  - Patients use the `/book` page to select a service type, choose a date from a visual calendar, and select an available time slot.
  - If a preferred date has no available slots, the patient can opt to join the **Waitlist**.
  - Upon submission, the patient receives an email confirming their request or waitlist status.
- **Shop / E-Commerce:** Patients can view and browse eye care products (glasses, lenses, drops).
- **Blog:** Patients can read articles, news, and eye health tips published by the clinic.

---

## 4. Admin Functions & Control

Staff and administrators access the secure backend via the `/admin` route. A user must have the `role` of `admin` or `staff` in the database to access this area.

### Admin Dashboard Modules
1. **Analytics Dashboard:** Provides a high-level overview of daily bookings, revenue, and website statistics.
2. **Booking Management (`/admin/bookings` & `/admin/waitlists`):**
   - View all upcoming and past appointments.
   - **Confirm** or **Cancel** pending appointments (Triggering automated emails).
   - **Reschedule** patients to a new time or date.
   - Promote Waitlist entries to full appointments when slots open up.
3. **Patient Database (`/admin/patients`):**
   - View a directory of all registered patients, their contact info, and booking history.
4. **Blog Management (CMS):**
   - Full CRUD (Create, Read, Update, Delete) capability for blog posts using a rich text editor. Allows adding images and formatting content.
5. **Staff Management & Doctors:**
   - Manage clinic staff profiles, assign roles, and dictate which doctors show up on the public services page.
6. **Services Configuration:**
   - Add/edit new eye care services, update descriptions, duration, and pricing.
7. **Settings:**
   - Modify overarching clinic configurations (e.g., operating hours, contact info, branding specifics).

---

## 5. System Architecture & API

The application does not use a traditional REST Node.js server. Instead, it relies on a **serverless architecture** heavily leveraging Supabase Postgres features:
- **Direct Database Queries:** The frontend queries the `supabase` client directly utilizing Row Level Security (RLS) policies to protect data.
- **Authentication:** Supabase Auth handles login, registration, and session persistence via secure HTTP-only cookies/local storage. Role checks (`isStaff`) are performed on route render.
- **File Storage:** Supabase Storage buckets are used to host images for Blogs, Doctors, Products, and Site Assets.

### Key Database Tables
- `profiles`: Extends Supabase auth users, holds names, roles (`admin`, `staff`, `patient`), and contact info.
- `bookings`: Core table tracking all appointments. Columns include `patient_name`, `service_type`, `appointment_date`, `status` (`pending`, `confirmed`, `cancelled`), and `is_waitlist`.
- `blogs`: Stores article content, title, slug, and image URLs.
- `services`: Master list of configurable clinic services.

---

## 6. Email Integration & Edge Functions

The system handles transactional emails automatically via **Supabase Edge Functions** (Deno) integrating with the **Resend API**.

### Edge Functions:
1. **`send-booking-notification`** 
   - **Trigger:** When a patient submits the booking form on the frontend.
   - **Action:** Sends a "New Booking Alert" to the admin (`adminEmail`) and a "Request Received" confirmation email to the patient.
   
2. **`send-booking-update`**
   - **Trigger:** When an Admin changes a booking status to `confirmed` or `cancelled` from the Admin Panel.
   - **Action:** Sends an email telling the patient their appointment has been officially confirmed (along with clinic prep instructions) or cancelled.

3. **`send-appointment-reminders`**
   - **Trigger:** A cron job/scheduler set to run daily.
   - **Action:** Scans the `bookings` table for `confirmed` appointments matching tomorrow's date. Sends a 24-hour reminder email to the patient and flips `reminder_sent` to `true` in the database to prevent duplicate emails.

*Note: The system is configured to send emails securely without exposing API keys to the client browser.*

---

## 7. Configuration & Environment Variables

To run the application locally or in production, the following environment variables are strictly required:

### Frontend Variables (`.env.local` or `.env.production`)
- `VITE_SUPABASE_URL` = Your Supabase project URL (e.g., `https://[PROJECT-REF].supabase.co`)
- `VITE_SUPABASE_ANON_KEY` = The public anon key for database interactions.

### Backend Edge Function Variables (Stored in Supabase Secrets)
These must be set securely on the Supabase dashboard via `npx supabase secrets set <NAME>=<VALUE>`:
- `RESEND_API_KEY` = Your Resend API key capable of sending emails.
- `SUPABASE_URL` = Your Supabase project URL (Used by reminder script).
- `SUPABASE_SERVICE_ROLE_KEY` = Needed for background scripts like the appointment reminder to bypass RLS policies.

---

## 8. Deployment Guide

### Deploying the Frontend (Vite/React)
The frontend builds into statically hostable files. It is ideally suited for deployment on Vercel, Netlify, or Cloudflare Pages.
1. Run `npm run build` locally or set the build command to `npm run build` on your hosting provider.
2. Set the Output Directory to `dist`.
3. Provide the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as production environment variables to your host.

### Deploying the Backend (Supabase Edge Functions)
When modifying the email templates or Deno backend code, you must deploy the edge functions via the Supabase CLI. 

Instead of traditional CLI deployment which can face permission errors, we recommend using a direct MCP deployment or API push when updating specific edge functions like so:

```bash
# Push directly to project
npx supabase functions deploy send-booking-update --project-ref [YOUR_PROJECT_ID] --use-api --no-verify-jwt
```
*(Ensure all function definitions in the `deno.json` allow standard network requests).*

---
**End of Documentation**
