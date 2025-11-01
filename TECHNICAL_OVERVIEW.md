# Technical Overview

**Generated:** November 1, 2025
**Status:** Approved

## 1. Executive Summary

This document provides a technical overview of the MeLorAly project. The application is a Server-Side Rendered (SSR) web app built with a **Node.js, Express.js, and EJS** stack. The backend is powered by **Supabase**.

This technology stack has been approved and will serve as the foundation for the prototype and future development.

## 2. Technology Stack

The following technologies have been approved for the MeLorAly project:

| Component | Technology | Status |
| :--- | :--- | :--- |
| **Framework** | Express.js 5 | <font color="green">**Approved**</font> |
| **UI Library** | EJS (Embedded JavaScript templates) | <font color="green">**Approved**</font> |
| **Styling** | Bootstrap 5 | <font color="green">**Approved**</font> |
| **State Management** | Express Sessions | <font color="green">**Approved**</font> |
| **Backend Service** | Supabase | <font color="green">**Approved**</font> |
| **Server Environment**| Node.js | <font color="green">**Approved**</font> |

## 3. Project Structure

The project follows a classic Express.js MVC (Model-View-Controller) pattern:

```
/MeLorAly/app
├── database/         # Database schemas and migrations
├── middleware/       # Custom Express middleware (e.g., auth)
├── public/           # Static assets (CSS, images, client-side JS)
├── routes/           # Route definitions for all app modules
├── views/            # EJS templates for all pages
├── .env.production.example # Environment variable template
├── server.js         # Main application entry point
└── package.json      # Project dependencies and scripts
```

## 4. Feature Implementation Status

The following modules have been scaffolded within the Express.js structure:

*   **Authentication (`/routes/auth.js`)**
*   **Onboarding (`/routes/onboarding.js`)**
*   **Dashboard (`/routes/dashboard.js`)**
*   **Family Management (`/routes/family.js`)**
*   **Messaging (`/routes/messages.js`)**
*   **Education (`/routes/education.js`)**
*   **Profile Management (`/routes/profile.js`)**
*   **Support (`/routes/support.js`)**

The immediate next step is to implement the backend logic for these modules, connecting them to the Supabase service.
