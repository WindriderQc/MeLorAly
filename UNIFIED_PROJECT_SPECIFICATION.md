# Unified Project Specification: MeLorAly

**Version:** 1.2 (Approved Stack)
**Date:** November 1, 2025
**Status:** In Development

## 1. Vision & Mission

### Mission Statement
To support families in the education and well-being of their children by offering practical resources and tools adapted to each stage of family life, from early childhood to adolescence.

### Core Values
- **Family-Centered:** Designed for multi-generational family collaboration.
- **Educational:** Focused on children's academic and personal development.
- **Accessible:** Intuitive and playful interface.

## 2. Target Users

- **Primary:** Parents
- **Secondary:** Grandparents
- **Subjects:** Children (profiles managed by adults)

## 3. Approved Technology Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | Express.js 5 |
| **UI Library** | EJS (Embedded JavaScript templates) |
| **Styling** | Bootstrap 5 & Custom CSS |
| **Backend Service** | Supabase (PostgreSQL, Auth, Storage) |
| **Server Environment** | Node.js |

## 4. Core Modules & Features

### 4.1. Authentication & Account Management
- [ ] Social login (Google, Apple, Facebook)
- [x] Email/password registration (scaffolded)
- [ ] Password reset functionality
- [ ] Account verification

### 4.2. Onboarding Flow (5 Steps)
- [x] **Step 1: Welcome:** Introduction to app features.
- [x] **Step 2: Children:** Add children's profiles.
- [x] **Step 3: Adults:** Invite other family members.
- [x] **Step 4: Family Space:** Set up the family profile.
- [x] **Step 5: Ready:** Confirmation and link to the dashboard.

### 4.3. Family Management
- [ ] Family Profiles (multiple children, adults, grandparents)
- [ ] Email and link-based invitations
- [ ] Member addition and role management

### 4.4. Dashboard System
- **Parental Dashboard:** Overview of children's activities, notifications, and resources.
- **Grandparent Dashboard:** View-only access to grandchildren's progress and family updates.

### 4.5. Educational Support
- **Pre-School (Ages 0-5):** Playful activities and developmental tracking.
- **School (Ages 6-12):** Homework help and subject resources.
- **Parental Guidance:** Expert articles and advice.

### 4.6. Communication
- [ ] Private family messaging
- [ ] Notification center for alerts and reminders

### 4.7. Settings & Personalization
- [ ] App settings (notifications, theme)
- [ ] User profile management

### 4.8. Support & Information
- [ ] FAQ and "About Us" pages
- [ ] Contact/Support form

## 5. UI Specifications

### Design System
- **Primary Color:** `#c98d1d` (Golden/Warm Orange)
- **Typography:** Epilogue, Noto Sans
- **Icons:** Google Material Symbols
- **Layout:** Responsive, mobile-first design

## 6. Project Status & Next Steps

### Current Status
- The project is partially developed using the approved Express.js and EJS stack.
- The 5-step onboarding flow is visually complete but requires backend integration.
- Routes for all major features have been created.

### Next Steps
1.  **Backend Integration:** Connect the existing frontend views to Supabase to handle data persistence for users, children, and families.
2.  **Full Feature Implementation:** Build out the remaining core modules (Dashboard, Messaging, etc.) based on the approved technology stack.
3.  **Testing:** Develop and implement a testing strategy for the application.
4.  **Deployment:** Prepare the application for deployment to a staging environment.

This document is the single source of truth for the MeLorAly project.
