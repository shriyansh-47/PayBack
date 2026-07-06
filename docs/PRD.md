# Product Requirements Document & System Blueprint
## PayBack: Unified Expense Tracker & Debt Settlement System

### 1. System Synthesis & Executive Summary
- **App Name & Core Objective:** Splitter Engine. A unified personal expense tracker and group debt settlement engine. Its core objective is to provide a mathematically rigorous ledger for splitting shared expenses without the bloat of third-party payment gateways. The frontend will focus on a strictly minimalist, highly functional, and fast user experience.
- **Target Audience & Problem Solved:** Designed for quick deployment and demonstrating backend algorithmic competency paired with a clean, utilitarian web interface. It eliminates the friction of manual debt calculation by utilizing an append-only transaction model, algorithmic debt simplification, and dynamic state management.

### 2. Tech Stack & Architectural Decisions
- **Frontend Core:** React (initialized via Vite) with standard `useState`/`useEffect` context management.
- **Frontend UI & Styling (Minimalist Aesthetic):** 
  - **Tailwind CSS:** For clean, utility-first styling focused on whitespace and typography.
  - **shadcn/ui:** For accessible, minimal, and highly functional base components (Buttons, Modals, Forms) without heavy design opinions.
  - **Lucide React:** For straightforward, lightweight iconography.
  - **Recharts:** For simple, readable data visualization (spending categories).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB with Mongoose ODM.
- **Infrastructure & Deployment:** 
  - Frontend: Vercel or Netlify.
  - Backend: Render or Railway.
- **Architectural Rigor:**
  - **Pattern:** Decoupled Client-Server architecture following the "Fat Model, Skinny Controller" design pattern. Security logic (bcrypt) resides entirely within Mongoose pre-save hooks.
  - **Data Strategy:** Total debts/credits are computed dynamically via standard MongoDB `.find()` queries and pure JavaScript `.reduce()` operations in the Express controllers to guarantee mathematical accuracy.
  - **Concurrency:** Group ledger updates leverage atomic MongoDB operators (`$inc`) to prevent dirty writes during simultaneous expense logging.

### 3. Comprehensive Feature Matrix & User Workflows
- **User Authentication (JWT):**
  - *Workflow:* User registers -> Frontend validation -> Backend generates bcrypt hash & JWT -> UI redirects to the Main Dashboard.
- **Dashboard & Navigation Layout:**
  - *Workflow:* Clean, persistent Sidebar (or simple top Navbar) containing links to: Dashboard, Friends, Groups, Notifications, and Account Settings.
- **Prioritized User Search:**
  - *Workflow:* User types name in a global Search Bar -> Debounced API call with Regex -> Backend fetches matches -> UI renders a simple dropdown list.
- **Expense Creation (Group & Personal, Multi-Currency):**
  - *Workflow:* User clicks 'Add Expense' -> A clean Modal appears -> User enters amount, currency, category, and split strategy -> Backend validates and saves -> UI optimistically updates balances.
- **Expense Deletion (Soft Deletes):**
  - *Workflow:* User clicks 'Delete' on an expense -> Confirmation Modal appears -> Backend flags `Expense` as `isDeleted: true` and restores balances.
- **Debt Settlement:**
  - *Workflow:* User clicks "Settle Up" -> Modal opens with pre-filled debt amount -> User confirms -> Backend creates Settlement Expense -> Simple toast notification appears.
- **Debt Simplification Algorithm:**
  - *Workflow:* Triggered automatically when balances change -> Backend runs a Min-Cash-Flow graph algorithm to eliminate transitive debts -> Updates `balances` array.
- **Audit Logs / Activity Feed:**
  - *Workflow:* User views group details -> Renders a clean, chronological text-based list showing added, deleted, or settled expenses.
- **Categorization & Analytics:**
  - *Workflow:* Dashboard fetches user's expenses -> Renders simple, readable charts (via Recharts) breaking down spending by category.
- **In-App Notifications:**
  - *Workflow:* Group created/Expense added -> Backend saves `Notification` -> Notification Bell icon updates -> User clicks bell -> Dropdown renders unread alerts.
- **Account Settings:**
  - *Workflow:* User navigates to Settings -> Can update Profile details (Name, default currency) and manage password via standard form layouts.

### 4. Database Schema & Data Integrity
**1. User Model**
- `_id`: ObjectId 
- `name`: String 
- `email`: String 
- `passwordHash`: String 
- `defaultCurrency`: String (Default: 'USD')
- `friends`: Array of ObjectIds

**2. Group Model (The Real-Time Ledger)**
- `_id`: ObjectId
- `name`: String (Required)
- `description`: String (Default: '')
- `members`: Array of ObjectIds
- `balances`: Array of Objects
  - `fromUser`: ObjectId
  - `toUser`: ObjectId
  - `currency`: String
  - `amount`: Number

**3. Expense Model (Unified Tracker)**
- `_id`: ObjectId
- `description`: String 
- `totalAmount`: Number 
- `currency`: String 
- `category`: String (Enum: ['FOOD', 'TRAVEL', 'UTILITIES', 'ENTERTAINMENT', 'OTHER'], Default: 'OTHER')
- `paidBy`: ObjectId 
- `groupId`: ObjectId (Default: null)
- `splitStrategy`: String (Enum: ['EQUAL', 'PERCENTAGE', 'EXACT', 'PERSONAL', 'SETTLEMENT'])
- `isDeleted`: Boolean (Default: false)
- `splits`: Array of Objects
  - `userId`: ObjectId 
  - `amount`: Number 
- `timestamps`: createdAt, updatedAt

**4. Notification Model**
- `_id`: ObjectId
- `userId`: ObjectId (Recipient)
- `message`: String 
- `isRead`: Boolean (Default: false)
- `createdAt`: Date

### 5. API Interface & Data Contracts
**Base URL:** `/api/v1`

**Auth & Users:**
- `POST /users/register` | `POST /users/login`
- `GET /users/search?query=xyz` 
- `PUT /users/settings` | Payload: `{ name, defaultCurrency }`

**Groups & Balances:**
- `GET /groups/dashboard` | `POST /groups`
- `GET /groups/:id/activity` | `POST /groups/:id/simplify`

**Expenses:**
- `POST /expenses` | `DELETE /expenses/:id` | `POST /expenses/settle`

**Notifications:**
- `GET /notifications` | `PUT /notifications/:id/read`

### 6. Edge Cases, Security & Error Handling
- **Float Precision Errors:** Backend ensures `Sum(splits.amount) === totalAmount`.
- **Concurrency & Race Conditions:** Handled via MongoDB atomic operations (`$inc`).
- **Preventing Negative Balances:** Backend strictly validates settlement amounts.
- **Security (JWT & Hashing):** Passwords hashed with `bcrypt`.
- **UX Error Standard:** Backend throws standard HTTP status codes. Frontend catches non-200 responses and displays them via standard toast notifications.

### 7. Phased Autonomous Implementation Plan

**Phase 1: Backend Foundation & Database Models**
- *Objective:* Initialize Node/Express server, connect to MongoDB, implement models (`User`, `Group`, `Expense`, `Notification`).

**Phase 2: Authentication & User Management API**
- *Objective:* Implement auth controllers, regex user search, and profile settings endpoint.

**Phase 3: Core Algorithmic API (Groups, Expenses & Notifications)**
- *Objective:* Build Group, Expense, and Notification controllers. Implement atomic `$inc` updates and Min-Cash-Flow debt simplification algorithm.

**Phase 4: Frontend Scaffolding (Minimalist Setup)**
- *Objective:* Initialize React (Vite). Configure Tailwind CSS and add `shadcn/ui` base components for clean, unstyled functionality. Set up React Router with a simple Application Layout.

**Phase 5: Frontend Core Features & UI Integration**
- *Objective:* 
  - Build the Dashboard with Recharts analytics and clear summary cards.
  - Implement functional Modals for complex forms like "Add Expense".
  - Build the Group details view with a straightforward Activity Feed.
  - Implement the Notification bell and Toast notifications.
  - Build the Account Settings pages.
