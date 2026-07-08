# PayBack - Modern Expense Splitter & Tracker

PayBack is a full-stack, modern finance and expense-sharing application. It simplifies the process of tracking shared expenses, splitting bills among friends, and settling up balances seamlessly.

With a sleek, dark-mode first UI built on modern web standards, PayBack feels premium, responsive, and incredibly fast.

## 🚀 Features

- **Military-Grade Security**: Fully encrypted password hashing and stateless JWT-based session architecture to guarantee absolute data privacy.
- **Real-Time Financial Dashboard**: Get an instantaneous, aggregated overview of your fiscal health, including net debts, total outstanding balances, and granular activity logging.
- **Dynamic Group Ecosystems**: Spin up shared expense groups, instantly onboard friends via a high-performance live search, and meticulously organize expenditures by category.
- **Algorithmic Expense Splitting**: Distribute massive bills with mathematical precision using flexible strategies:
  - **Egalitarian**: Split perfectly down the middle among all participants.
  - **Pinpoint Accuracy**: Allocate exact monetary amounts down to the penny.
  - **Custom Ratios**: Divvy up expenses via percentage-based allocations.
- **Cloud-Backed Media Management**: Enterprise-grade profile avatar hosting powered by robust Cloudinary integration.
- **Deep Analytics & History**: Keep a permanent, tamper-proof record of every financial transaction you and your friends make.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Styling**: Tailwind CSS, `shadcn/ui` components
- **Routing**: React Router DOM v7
- **Forms & Validation**: React Hook Form, Zod
- **Typography**: `@fontsource/roboto-mono`, `@fontsource/plus-jakarta-sans`
- **Icons**: Lucide React

### Backend
- **Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ORM)
- **Authentication**: JWT (JSON Web Tokens), `bcrypt`
- **File Uploads**: `multer`, `cloudinary`
- **Middlewares**: `cors`, `cookie-parser`

---

## 📂 Project Structure

```text
PayBack/
├── .env                  # Backend environment variables
├── package.json          # Backend dependencies and scripts
├── src/                  # Backend Source Code
│   ├── index.js          # Entry point for the Express server
│   ├── app.js            # Express app configuration & middlewares
│   ├── constants.js      # Global constants (DB name, etc)
│   ├── controllers/      # Route handlers (auth, group, expense logic)
│   ├── db/               # Database connection logic
│   ├── middlewares/      # Auth & file-handling middlewares (multer)
│   ├── models/           # Mongoose schemas (User, Group, Expense, etc.)
│   ├── routes/           # API route definitions
│   └── utils/            # Utility functions (Cloudinary upload, API responses)
│
└── frontend/             # React Frontend (Vite)
    ├── .env              # Frontend environment variables
    ├── index.html        # Vite HTML entry point (Theme script injected here)
    ├── package.json      # Frontend dependencies
    ├── tailwind.config.js# Tailwind CSS configuration
    └── src/
        ├── App.jsx       # Main routing file
        ├── main.jsx      # React DOM rendering
        ├── index.css     # Global CSS and Tailwind variables
        ├── api/          # Axios instances and API services (auth, expense, group)
        ├── components/   # Reusable UI components (Layout, ThemeToggle, Modals)
        │   └── ui/       # shadcn/ui generic components (Buttons, Inputs, Dialogs)
        ├── hooks/        # Custom React hooks (useToast)
        ├── lib/          # Utilities (cn for Tailwind merge)
        └── pages/        # Full-page views (Dashboard, Login, Expenses, GroupView)
```

## ⚙️ Local Development Setup

Follow these steps to run PayBack locally on your machine.

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (Local instance or MongoDB Atlas cluster)
- Cloudinary Account (for image uploads)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd PayBack
```

### 2. Set up the Backend
Install the backend dependencies:
```bash
npm install
```

Create a `.env` file in the root directory and add the following variables:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5174
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

Start the backend development server:
```bash
npm run dev
```
*(The backend will run on `http://localhost:3000`)*

### 3. Set up the Frontend
Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` directory:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

Start the Vite development server:
```bash
npm run dev
```
*(The frontend will be accessible at `http://localhost:5174`)*

---

## 🏗️ Build & Production

To build the frontend for production deployment:

```bash
cd frontend
npm run build
```
This will generate an optimized, minified production build in the `frontend/dist` directory.

To start the backend in production mode:
```bash
npm start
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is licensed under the ISC License.

---

## 👤 Author
**Shriyansh Yadav**
