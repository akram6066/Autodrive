# AutoDrive 🚗

**AutoDrive** is a real-time e-commerce platform built to sell and manage car tires, batteries, and rims. It supports both M-PESA mobile payments and cash on delivery, offering full admin control over inventory, categories, transactions, and reporting.

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB + Mongoose
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Authentication**: NextAuth.js
- **Payments**: M-PESA Daraja API (STK Push)
- **Deployment**: Vercel
- **Realtime & Reporting**: Admin dashboard with filtering by daily, weekly, monthly, yearly

---

## 🚀 Features

- 🛒 Product sales with cart and checkout
- 📱 M-PESA and cash on delivery payment support
- 👤 Admin-only staff registration
- 📦 Product and category image upload
- 📈 Real-time sales tracking and analytics
- 🔐 JWT-based API authentication
- 📍 Address suggestions using OpenCage Geocoder
- 🔔 Toast feedback and loading states for UX
- 🧮 Automatic inventory updates on order

---

## 📁 Project Structure
autodrive/
├── app/                   # Next.js App Router pages
│   ├── api/               # Backend API routes
│   ├── checkout/          # Checkout pages and logic
│   ├── dashboard/         # Admin dashboard pages
│   ├── layout.tsx         # Global layout file
│   └── page.tsx           # Home page
├── components/            # Reusable UI components (Buttons, Inputs, etc.)
├── lib/                   # Utility functions (e.g., auth, DB connect)
├── models/                # Mongoose schema models
├── public/                # Static assets (images, icons, etc.)
├── store/                 # Zustand state management
├── styles/ or globals.css # Global Tailwind and CSS styles
├── .env.local             # Environment variables (ignored by Git)
├── .gitignore             # Files to ignore in Git
├── next.config.js         # Next.js configuration
├── package.json           # Project metadata and dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation


🧑‍💻 Author
Abdirizak Mahamud Hassan 
Real-time full-stack developer with expertise in e-commerce and mobile integrations.

📄 License
This project is licensed under the MIT License.