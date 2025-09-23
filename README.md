# Tutor LMS MVP (Local Storage Edition)

A self-contained Learning Management System inspired by Tutor LMS. This minimal viable product focuses on course management, differentiated user dashboards, quizzes with auto-grading, certificate design, course bundles, and rich communication tools. The experience is powered entirely by React 18, Tailwind CSS, and browser local storage—no backend services required.

## Highlights

- **Course Builder** – Compose modular courses with multi-instructor support, prerequisites, drip scheduling, password-protected access, and JSON import/export.
- **Course Library** – Preview courses, manage enrollments, track progress, and host two-way communication between learners and instructors.
- **Bundles & Pathways** – Curate themed collections to guide learners through strategic learning journeys.
- **Quizzes & Reports** – Build multi-format assessments, deliver them to learners, and review auto-graded analytics instantly.
- **Certificate Studio** – Design branded completion certificates with customizable messaging, colors, and signatures.
- **Communication Hub** – Centralize announcements, direct messages, and event planning per course.
- **Local Storage Persistence** – All changes persist in the browser via `localStorage`, making onboarding instant.

## Project Structure

```
index.html                # Entry point with React, Tailwind, and Babel CDNs
src/
  App.jsx                 # Root application with navigation and view switching
  main.jsx                # Bootstraps React with the LMS provider
  context/LMSContext.jsx  # Global state, reducer, and persistence helpers
  data/initialData.js     # Seed data for users, courses, bundles, quizzes, etc.
  components/             # Feature-focused UI modules (courses, quizzes, certificates, comms)
  utils/id.js             # Simple ID helper for deterministic client IDs
```

## Getting Started

1. **Clone or download** this repository.
2. **Open `index.html`** in your preferred browser (Chrome, Edge, Firefox, or Safari). No build tooling is required.
3. The app loads sample data automatically. All edits you make (courses, quizzes, certificates, communications) are saved to browser `localStorage`.
4. To reset the workspace, clear the `tutor-lms-mvp-state` key from browser storage or use a private/incognito window.

## Feature Walkthrough

- **Switch user personas** from the header dropdown to experience instructor vs. student workflows.
- **Design a course** under the Course Builder: add modules, drip schedules, prerequisites, and export/import JSON snapshots.
- **Manage enrollments** in the Course Library: enroll students, adjust their progress, and embed preview videos.
- **Create bundles** in Bundle Studio to package multiple courses with a shared narrative.
- **Author quizzes** in the Quiz Manager: configure availability, question banks, and deliver assessments with automatic grading.
- **Issue certificates** via Certificate Studio and preview them in real time.
- **Broadcast announcements** or start conversations inside the Communication Hub.

## Browser Support

The project relies on modern browser features such as ES modules, `crypto.randomUUID` alternatives, and Flexbox/Grid. Use a recent desktop browser for the best experience.

## Notes

- Network access is only required to load React, ReactDOM, Babel, and Tailwind CSS from trusted CDNs.
- Since state is stored locally, exporting courses or backing up local storage is recommended before clearing browser data.

Enjoy exploring the Tutor LMS-inspired MVP! 🚀
