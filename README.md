# 🥜 NutsNTreat – Full Stack E-Commerce

A complete e-commerce website for premium dry fruits and mixes with:
- **Frontend**: Multi-page HTML/CSS/JS website with real product images
- **Backend**: Node.js + Express REST API
- **Database**: MongoDB (via Atlas)
- **Auth**: JWT login/register with admin panel
- **Email**: Order & subscription confirmations (Nodemailer + Gmail)
- **SMS**: Order confirmations via Twilio
- **Admin Panel**: Full CRUD for products, orders, subscriptions, users, messages

---

## 📁 Project Structure

```
nutsNtreat/
├── backend/
│   ├── server.js              # Main Express server
│   ├── .env.example           # Environment variables template
│   ├── package.json
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Subscription.js
│   │   └── Contact.js
│   ├── routes/
│   │   ├── auth.js            # Login, register, profile
│   │   ├── products.js        # Product CRUD
│   │   ├── orders.js          # Order placement + status
│   │   ├── subscriptions.js   # Monthly plans
│   │   ├── contacts.js        # Contact form
│   │   └── admin.js           # Dashboard stats
│   ├── middleware/
│   │   └── auth.js            # JWT + admin guard
│   └── utils/
│       ├── email.js           # Nodemailer email templates
│       ├── sms.js             # Twilio SMS
│       └── seedAdmin.js       # Seeds admin + 20 products on first run
│
└── frontend/
    ├── css/
    │   └── style.css          # Shared styles
    ├── js/
    │   └── app.js             # API helper, Auth, Cart, Toast
    └── pages/
        ├── index.html         # Home page
        ├── shop.html          # Product listing
        ├── cart.html          # Cart + checkout
        ├── subscriptions.html # Monthly plans
        ├── about.html         # About page
        ├── contact.html       # Contact form
        ├── login.html         # Login + Register
        ├── profile.html       # User profile + orders
        └── admin.html         # Admin panel
```

---

## 🚀 Setup Guide

### 1. Prerequisites
- Node.js v18+ → https://nodejs.org
- MongoDB Atlas (free) → https://mongodb.com/atlas
- Gmail account (for emails)
- Twilio account (free trial for SMS) → https://twilio.com

---

### 2. MongoDB Atlas Setup
1. Go to https://mongodb.com/atlas → Create free account
2. Create a free cluster (M0)
3. Under **Database Access** → Add a DB user (username + password)
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow all)
5. Under **Clusters** → Connect → Drivers → Copy the connection string
6. Replace `<username>` and `<password>` in the string

---

### 3. Gmail App Password (for emails)
1. Go to your Google Account → Security
2. Enable **2-Step Verification** if not done
3. Search "App passwords" → Create one for "Mail"
4. Copy the 16-character password (use as `EMAIL_PASS`)

---

### 4. Twilio (for SMS)
1. Sign up at https://twilio.com (free trial gives you ~$15 credit)
2. Get your **Account SID**, **Auth Token**, and a **Twilio phone number**
3. Verify your own mobile number in the trial account

---

### 5. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your values in .env

npm install
npm start
# or for development:
npm run dev
```

On first run, the server will:
- Connect to MongoDB
- Create an admin user (email/password from .env)
- Seed 20 products

---

### 6. Frontend Setup

No build step needed! Just open the HTML files in a browser.

**For local development**, use VS Code Live Server:
1. Install "Live Server" extension in VS Code
2. Right-click `frontend/pages/index.html` → Open with Live Server
3. All pages will be served at `http://localhost:5500`

Or use any static server:
```bash
cd frontend
npx serve pages
```

---

## 🔑 Default Admin Login

```
Email:    admin@nutsNtreat.in
Password: Admin@NNT2024
```

Change these in your `.env` file!

---

## 📧 Email Features

| Trigger | Email Sent |
|---------|-----------|
| Register | Welcome email |
| Place Order | Order confirmation with itemized bill |
| Order Shipped | Shipping notification |
| Order Delivered | Delivery confirmation |
| Order Cancelled | Cancellation notice |
| Subscribe | Subscription confirmation |

---

## 📱 SMS Features

| Trigger | SMS Sent |
|---------|---------|
| Place Order | Order confirmation with Order ID & total |
| Order Shipped | Shipping notification |
| Order Delivered | Delivery confirmation |
| Subscribe | Subscription welcome |

---

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` – Create account
- `POST /api/auth/login` – Login (returns JWT)
- `GET  /api/auth/me` – Get current user (auth required)

### Products
- `GET  /api/products` – List all products
- `GET  /api/products/:id` – Single product
- `POST /api/products` – Add product (admin only)
- `PUT  /api/products/:id` – Update product (admin only)
- `DELETE /api/products/:id` – Soft delete (admin only)

### Orders
- `POST /api/orders` – Place order (triggers email + SMS)
- `GET  /api/orders` – All orders (admin only)
- `GET  /api/orders/my` – User's own orders
- `PUT  /api/orders/:id/status` – Update status (admin only)

### Subscriptions
- `POST /api/subscriptions` – Subscribe (triggers email + SMS)
- `GET  /api/subscriptions` – All subscriptions (admin only)
- `PUT  /api/subscriptions/:id` – Update status (admin only)

### Admin
- `GET  /api/admin/stats` – Dashboard stats + charts data
- `GET  /api/admin/users` – All customers
- `PUT  /api/admin/users/:id/toggle` – Enable/disable user

### Contact
- `POST /api/contacts` – Submit message
- `GET  /api/contacts` – All messages (admin only)
- `PUT  /api/contacts/:id` – Update status (admin only)

---

## 🛡️ Security Features
- Passwords hashed with bcrypt (12 rounds)
- JWT authentication (7-day expiry)
- Rate limiting (100 req/15 min per IP)
- Helmet.js security headers
- CORS configured for frontend URL
- Admin-only route guards

---

## 🚢 Deployment (Optional)

### Backend → Railway / Render / Heroku
1. Push your backend folder to GitHub
2. Connect to Railway/Render
3. Set all `.env` variables in the dashboard
4. Deploy!

### Frontend → Netlify / Vercel / GitHub Pages
1. Update `API` in `frontend/js/app.js` to your deployed backend URL
2. Deploy the `frontend/pages/` folder

---

## 📞 Support
Chennai, Tamil Nadu | hello@nutsNtreat.in | +91 98765 43210
