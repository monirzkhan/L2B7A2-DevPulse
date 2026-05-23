# DevPulse Backend API

A scalable backend system for issue tracking and developer collaboration built with **Node.js, TypeScript, Express.js, and PostgreSQL** using raw SQL queries for full control, performance, and transparency.

---

## 🚀 Live URL

https://dev-pulse-six-xi.vercel.app/


---

## 📌 Project Overview

DevPulse Backend is a RESTful API service designed for managing a developer issue tracking system.

It supports:

- User authentication & authorization (JWT-based)
- Role-based access control (maintainer, contributor)
- Issue reporting and management system
- Secure password handling using bcrypt
- High-performance PostgreSQL integration using raw SQL only

This project avoids ORMs and query builders to maintain full control over database operations.

---

## ⚙️ Tech Stack

| Technology | Purpose |
|------------|--------|
| Node.js (LTS 24+) | Runtime environment |
| TypeScript | Type-safe backend development |
| Express.js | REST API framework |
| PostgreSQL | Relational database |
| pg (node-postgres) | Native database driver |
| bcrypt | Password hashing (salt rounds 8–12) |
| jsonwebtoken | JWT authentication |
| dotenv | Environment variable management |

---

## ✨ Features

### 🔐 Authentication System
- User registration & login
- JWT token generation & verification
- Password hashing with bcrypt
- Role-based access control (RBAC)

### 🐞 Issue Tracking System
- Create issues (bug / feature_request)-(role protected)
- View all issues
- Update issue status/details (role protected)
- Delete issues (role protected)

### 🗄️ Database Layer
- Raw SQL queries using `pool.query()`
- No ORM or query builders allowed
- Optimized PostgreSQL schema
- Connection pooling for performance

### 🧱 Architecture
- Modular Express structure
- Middleware-based authentication
- Clean separation of controllers, routes, utilities
- Scalable folder structure

---

## 🛠️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/monirzkhan/L2B7A2-DevPulse.git

```
---


### 📡 API Endpoints
## 🔐 Auth Routes
Method	Endpoint	        Description
POST	/api/auth/signup	Register user
POST	/api/auth/login	    Login user

---


### 🐞 Issue Routes
Method	    Endpoint	        Description
POST	    /api/issues	        Create issue
GET         /api/issues	        Get all issues
GET	        /api/issues/:id	    Get issue by ID
PATCH	    /api/issues/:id	    Update issue
DELETE	    /api/issues/:id	    Delete issue

---
### 🔐 Authentication Flow
User registers or logs in
Server validates credentials
JWT token is generated
Token sent to client
Token is required in Authorization header for protected routes

Example:

```bash
Authorization: Bearer <token>
```
---
📁 Project Structure
src/
│
├── config/
├── db/
├── middleware/
├── modules/
│   ├── auth/
│   ├── user/
│   ├── issue/
│
│
├── utils/
├── app.ts
└── server.ts


---
### 👨‍💻 Author
**Md Moniruzzman**
*DevPulse Backend Team*
*Built with Node.js + TypeScript + PostgreSQL*