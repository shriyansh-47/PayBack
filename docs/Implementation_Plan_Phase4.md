# Phase 4 Frontend Scaffolding Implementation Plan

Awesome job on completing the backend API! Now we move to Phase 4: Frontend Scaffolding. This phase is all about setting up a clean, scalable React architecture using our chosen minimalist tech stack.

## User Review Required
> [!WARNING]
> We will create a new directory called `frontend` inside your existing `PayBack` folder to isolate the React code from the Node.js backend. This means your project will become a "monorepo" structure. 

## Open Questions
> [!NOTE]
> Are you comfortable using `axios` for handling the API requests to your backend, or do you strictly prefer using the native `fetch` API? (Axios makes handling cookies and JSON a bit cleaner, but both work perfectly).

## Proposed Changes

### 1. Vite & React Initialization
- Initialize a new React application using Vite inside a `frontend` folder.
- Install necessary base dependencies: `react-router-dom`, `axios` (if approved), `lucide-react`.

### 2. Tailwind CSS & shadcn/ui Setup
- Initialize Tailwind CSS inside the `frontend` directory.
- Configure `tailwind.config.js` and `index.css`.
- Initialize `shadcn/ui` to prepare for adding unstyled, accessible components (like Modals and Buttons).

### 3. Application Structure
- Scaffold standard React directories inside `frontend/src`:
  - `/pages`: For route-level components (Dashboard, Login, Register, GroupView).
  - `/components`: For reusable UI components (Sidebar, ExpenseCard).
  - `/api`: For axios/fetch service files communicating with `http://localhost:4000/api/v1`.
  - `/lib`: For utility functions (like `utils.js` used by shadcn).

### 4. Routing Foundation
- Set up `react-router-dom` with placeholder routes for `/login`, `/register`, and a protected route for `/dashboard`.

## Verification Plan

### Manual Verification
- We will start the Vite development server (`npm run dev` inside the `frontend` folder).
- You will open `http://localhost:5173` in your browser to verify that the Tailwind CSS and React Router are correctly loading the basic layout.
