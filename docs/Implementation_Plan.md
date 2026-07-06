# Phase 1-3 Backend Implementation Plan

We will pick up from where your existing code in `src/` left off. You have already completed a solid foundation for the `User` model, `Group` model, and basic authentication routes. 

This plan focuses on finalizing the Database Models (Phase 1), finishing the User Search API (Phase 2), and scaffolding the Core Algorithmic API (Phase 3) as defined in our updated PRD.

## User Review Required
> [!WARNING]
> We are adding new fields (`currency`, `category`, `isDeleted`, `avatar`, `coverImage`) to the database models based on our recent PRD updates. If you have any existing test data in your database, it may not conform to the new schema. 

## Technical Decisions
> [!NOTE]
> Based on your feedback, we will extract the mathematical logic for the Debt Simplification algorithm into a separate helper function in `src/utils/` to keep the controllers skinny.

## Proposed Changes

### Phase 1: Database Models
Update existing models and create the missing ones based on the PRD schema.

#### [MODIFY] [user.models.js](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/src/models/user.models.js)
- Add `defaultCurrency: { type: String, default: 'INR' }`.
- Ensure `avatar` and `coverImage` fields exist (String, Cloudinary URLs).

#### [MODIFY] [group.models.js](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/src/models/group.models.js)
- Update the `balances` sub-schema to include `currency: { type: String, required: true }`.

#### [MODIFY] [expense.models.js](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/src/models/expense.models.js)
- Define the full schema: `description`, `totalAmount`, `currency`, `category` (enum), `paidBy`, `groupId`, `splitStrategy`, `isDeleted`, and the `splits` array.

#### [NEW] [notification.models.js](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/src/models/notification.models.js)
- Create schema: `userId`, `message`, `isRead`, `createdAt`.

---

### Phase 2: User API Completion
Finish the remaining endpoints for the User management system, including the photo upload integration.

#### [MODIFY] [user.controller.js](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/src/controllers/user.controller.js)
- Implement `searchUsers` controller: Uses a regex query to find users by `username`. This API will be optimized to respond quickly so the frontend can hit it repeatedly with debouncing for a dropdown effect.
- Implement `updateUserImages`: Uploads local files (received via Multer) to Cloudinary, deletes the local files, and updates the User's `avatar` and/or `coverImage` fields.

#### [MODIFY] [user.routes.js](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/src/routes/user.routes.js)
- Add `router.route('/search').get(verifyJwt, searchUsers)`.
- Add `router.route('/images').patch(verifyJwt, upload.fields([{name: "avatar", maxCount: 1}, {name: "coverImage", maxCount: 1}]), updateUserImages)`.

---

### Phase 3: Core Algorithmic API Scaffolding
Create the controllers and routes for Groups and Expenses.

#### [NEW] [group.controller.js](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/src/controllers/group.controller.js)
- Implement `createGroup`, `getGroupDashboard`, `getGroupActivity`.
- Implement `simplifyDebts` (Invoking the graph algorithm utility).

#### [NEW] [group.routes.js](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/src/routes/group.routes.js)
- Scaffold standard REST routes for groups.

#### [NEW] [expense.controller.js](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/src/controllers/expense.controller.js)
- Implement `createExpense` (with atomic `$inc` updates to Group balances).
- Implement `deleteExpense` (soft delete logic).
- Implement `settleUp`.

#### [NEW] [expense.routes.js](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/src/routes/expense.routes.js)
- Scaffold routes for expenses.

#### [MODIFY] [app.js](file:///c:/Users/shriy/OneDrive/Desktop/PayBack/src/app.js)
- Import and mount the new `group.routes.js` and `expense.routes.js`.

## Verification Plan

### Automated Tests
- No automated testing framework (Jest/Mocha) is currently set up in the workspace. We will rely on manual API verification.

### Manual Verification
- We will test the new API endpoints using Postman to ensure mathematical accuracy and correct file uploads.
