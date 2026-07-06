# Phase 5 Frontend Core Features Implementation Plan

This is the final phase of the Splitter Engine project. Now that Phase 4 has laid down the React routing, Tailwind, and folder architecture, we will build out the core user interface and connect it to the Node.js API using Axios.

In keeping with our AI rules, the design will remain strictly **minimalist and utilitarian**, leveraging `shadcn/ui` for clean lines and high accessibility.

## User Review Required
> [!WARNING]
> We will need to set up Axios to include `withCredentials: true` globally so that the JWT cookies sent by the backend are properly stored and sent with every request.

## Open Questions
> [!NOTE]
> For the Recharts Donut Chart on the Dashboard, do you want to calculate the totals per category directly in React, or should we create a small Aggregation endpoint on the backend to return the pre-calculated totals? (Calculating in React is easier for a V1, but the backend is more robust for large datasets).

## Proposed Changes

### 1. API Service Layer Integration
Set up the communication bridge to `http://localhost:4000/api/v1`.

#### [NEW] [frontend/src/api/axios.js](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/frontend/src/api/axios.js)
- Configure an Axios instance with the base URL and `withCredentials: true`.

#### [NEW] [frontend/src/api/services.js](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/frontend/src/api/services.js)
- Define standard async functions for hitting your backend endpoints: `login()`, `register()`, `fetchGroups()`, `createExpense()`, `settleUp()`, etc.

---

### 2. Shared Layout & Global Components
Build the utilitarian wrapper around the application.

#### [NEW] [frontend/src/components/Layout.jsx](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/frontend/src/components/Layout.jsx)
- A minimalist Sidebar (desktop) / Navbar (mobile) containing links to Dashboard, Groups, and Settings.

#### [NEW] [frontend/src/components/NotificationBell.jsx](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/frontend/src/components/NotificationBell.jsx)
- A simple Lucide `Bell` icon that fetches from `/api/v1/notifications` on mount and displays a red indicator if unread notifications exist.

#### [NEW] [frontend/src/components/Toaster.jsx](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/frontend/src/components/Toaster.jsx)
- Configure the standard `shadcn/ui` toast provider to handle API success/error messages cleanly.

---

### 3. Core Pages Implementation
Wire up the views using Tailwind CSS for clean spacing.

#### [MODIFY] [frontend/src/pages/Login.jsx](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/frontend/src/pages/Login.jsx) & [Register.jsx](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/frontend/src/pages/Register.jsx)
- Build basic forms using simple HTML inputs and Tailwind borders. Submitting calls the auth API.

#### [MODIFY] [frontend/src/pages/Dashboard.jsx](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/frontend/src/pages/Dashboard.jsx)
- Fetch the user's dashboard data.
- Integrate **Recharts** to render a straightforward Donut Chart showing spending per category.
- Render total balances (Owed vs Credit).

#### [MODIFY] [frontend/src/pages/GroupView.jsx](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/frontend/src/pages/GroupView.jsx)
- Fetch group details and the Activity/Expense timeline.
- Build the **"Add Expense" Modal**: A functional form allowing users to select categories, enter amounts, and pick split strategies (EQUAL, EXACT).
- Build the **"Settle Up" Modal**: A simpler form specifically hitting the `/settle` endpoint.

#### [NEW] [frontend/src/pages/Settings.jsx](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/frontend/src/pages/Settings.jsx)
- A clean form allowing the user to update their `defaultCurrency` and name.

## Verification Plan

### Manual Verification
- Start both the Node backend (`npm run dev`) and Vite frontend (`npm run dev`).
- Register a test user via the React UI.
- Verify that logging in successfully redirects to the Dashboard and the JWT cookie is set in the browser's Application tab.
- Test the full "Add Expense" flow and visually confirm the Group balances update correctly on the UI.
