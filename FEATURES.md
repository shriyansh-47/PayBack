# PayBack: Features & Architecture Overview

PayBack is a full-stack, highly scalable expense management application designed to take the friction out of splitting bills and tracking shared group expenses. Engineered with a focus on mathematical precision and algorithmically optimized debt settlement, PayBack acts as a seamless financial ledger for peer-to-peer transactions.

---

## 🚀 Core Features

### 1. Advanced Debt Simplification Engine
- **Graph-Theory Optimization:** Utilizes a minimum cash flow algorithm to evaluate cross-group debts and simplify them. If User A owes User B $10, and User B owes User C $10, PayBack automatically restructures the ledger so User A owes User C $10, eliminating redundant transactions.
- **Multi-Currency Support:** The debt simplification engine isolates and optimizes balances on a per-currency basis, ensuring accurate international trip calculations.

### 2. Comprehensive Expense Splitting
- **Dynamic Split Strategies:** 
  - **Equal:** Automatically divides the total bill evenly among selected participants.
  - **Exact:** Allows users to manually input precise dollar amounts for each participant.
  - **Percentage:** Allows users to assign exact percentage weights to participants.
- **Global Expense Creation:** Expenses can be tied to specific, long-standing Groups (e.g., "Apartment 4B") or created as direct peer-to-peer transactions on the fly.
- **Secure Ledger Deletion:** Authorization protocols ensure that only the original creator of an expense can delete or modify it.

### 3. Group & Member Management
- **Custom Groups:** Users can create persistent groups with custom names, descriptions, and dynamic member lists.
- **Live User Search:** Leveraging a debounced REST API, users can search the platform's global registry by username to add friends to groups or individual expenses seamlessly.
- **Real-Time Dashboards:** Each group features a dedicated dashboard highlighting total group spending, individual balances, and an activity feed of recent expenses.

### 4. Robust User Authentication & Profiles
- **Secure Registration:** Utilizes bcrypt for password hashing and JSON Web Tokens (JWT) for secure, stateless session management via HTTP-only cookies.
- **Cloud Media Storage:** Full integration with Cloudinary allows users to upload and manage custom Avatars and Cover Images, personalizing the UI across the application.
- **Account Management:** Users can update their credentials, profile details, and passwords through a secure settings portal.

### 5. Highly Normalized Transaction Ledger
- **Atomic Operations:** The MongoDB schema is designed as a strict ledger. Balance updates utilize atomic operators (e.g., `$inc`) to prevent race conditions during high-volume, concurrent expense logging.
- **Immutable Accuracy:** Financial totals are calculated via the database engine rather than in-memory, ensuring absolute precision and data integrity.

---

## 🛠️ Technology Stack

### Frontend (Client-Side)
- **React.js (Vite):** Fast, modern UI rendering.
- **Tailwind CSS & shadcn/ui:** For a clean, minimalist, and highly responsive user interface without bloated CSS bundles.
- **Recharts:** To render dynamic analytics and spending charts on the user dashboard.
- **Axios:** For robust API communication and interceptor-based token management.
- **React Router:** For seamless, single-page application (SPA) navigation.

### Backend (Server-Side)
- **Node.js & Express.js:** Scalable runtime and web framework adhering to the "Fat Model, Skinny Controller" architectural pattern.
- **MongoDB & Mongoose:** NoSQL database modeling with a highly normalized schema for Users, Groups, and Expenses.
- **Cloudinary & Multer:** Multipart form-data handling and cloud blob storage for user media.
- **JSON Web Tokens (JWT):** For secure, dual-token (Access + Refresh) authentication architecture.

### Deployment & Architecture
- **CORS Configuration:** Strictly defined origins to prevent cross-site request forgery.
- **RESTful API Design:** Predictable, resource-oriented endpoint structures (`/api/v1/group`, `/api/v1/expense`).
- **Custom Error Handling:** Centralized API error mapping to guarantee consistent JSON responses for frontend consumption.
