# Coolgards Full-Stack Application

## Overview
This repository contains a full-stack e-commerce-style web application, separated into an Express.js/MongoDB back end and a Next.js front end. It implements user authentication, product/order management, file uploads, and payment integration.

## Features
- User authentication with JWT and hashed passwords (bcrypt), including password reset flow
- Product, order, shipment, post, and message data models (Mongoose/MongoDB)
- File upload handling (Multer, FilePond)
- Transactional email (Nodemailer + Handlebars templates)
- Payment integration (PayPal, Braintree)
- Admin-gated routes via custom middleware

## Tech Stack
- **Back end:** Node.js, Express, MongoDB/Mongoose, JWT, bcrypt, Multer, Nodemailer
- **Front end:** Next.js 13, React 18, Material UI, Tailwind CSS, Axios

## Screenshots
Not included in this repository — to be added.

## Installation

### Back end
```bash
cd Back-End/Coolgards-ExpressJS
npm install
```
Create a `.env.dev` file (not committed) with the required environment variables (MongoDB connection string, JWT secret, mail transport credentials, etc. — see `src/envConfigs.js` and `src/db/Mongoose.js` for the variables read at runtime).

### Front end
```bash
cd Front-End/Coolgards-NextJS
npm install
```

## Running the Project

### Back end
```bash
npm start
```

### Front end
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

## Project Structure
```
.
├── Back-End/Coolgards-ExpressJS/
│   └── src/
│       ├── db/          # MongoDB connection
│       ├── mail/        # Email transport
│       ├── middleware/  # Auth, admin, CORS middleware
│       ├── models/      # Mongoose schemas (User, Product, Order, Shipment, Post, Message, File)
│       ├── routers/     # Express route handlers
│       └── seeders/     # Database seed scripts
└── Front-End/Coolgards-NextJS/
    ├── pages/
    ├── components/
    └── utils/
```

## Limitations
- No `.env` file or example environment configuration is included in this repository; required environment variables must be reconstructed from the source (`envConfigs.js`, `Mongoose.js`, mail transporter, and payment integration files).
- No automated tests are included for either the back end or front end.
- This project was built as an applied full-stack exercise; it has not been reviewed for production security hardening.

## Future Improvements
- Add a `.env.example` file documenting required environment variables
- Add automated tests (API and component-level)
- Add CI configuration

## Author
Sina Mohammadi
