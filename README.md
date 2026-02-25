🏆 7th Place — CodeCraft’25 National Level Hackathon  
🔐 Secure AI-Powered Financial Intelligence Platform

# ReceiptAI — Secure AI-Powered Receipt Intelligence Platform

ReceiptAI is a full-stack AI-powered financial receipt management system that allows users to securely upload receipts, automatically extract transaction data using OCR, reconcile receipts with bank transactions, encrypt sensitive information, and gain financial insights through an AI assistant.

The system is designed with strong security, intelligent automation, and modern web architecture.

---

# Key Features

## Secure Authentication System

* JWT-based authentication
* Secure password hashing using bcrypt
* Protected API routes
* Session management using token authorization

Backend implementation ensures secure token generation and validation.

---

## Secure Encrypted Receipt Vault

All sensitive receipt data is encrypted using Fernet symmetric encryption before storage.

Encrypted components include:

* Receipt image
* OCR extracted text
* Extracted receipt fields

Encryption utilities ensure data confidentiality and protection.

---

## OCR-Powered Receipt Processing

ReceiptAI extracts structured information from receipt images using Tesseract OCR.

Extracted fields:

* Merchant name
* Total amount
* Transaction date
* Raw receipt text

Supports optional integration with Google Vision API for higher accuracy.

---

## Intelligent Transaction Reconciliation Engine

The system automatically matches uploaded receipts with existing bank transactions using:

* Fuzzy merchant name matching
* Amount similarity validation
* Date proximity comparison

If no match is found, the system automatically creates a new transaction entry.

This enables automated bookkeeping and financial tracking.

---

## AI Financial Assistant

Users can ask natural language questions such as:

* How much did I spend on food?
* What was my biggest expense?
* Give me saving tips

The AI assistant analyzes user transaction data and generates intelligent financial insights.

---

## Manual Transaction Entry

Users can manually add transactions when receipts are unavailable.

Supports:

* Merchant name
* Amount
* Category
* Automatic timestamping

---

## Financial Dashboard and Visualization

Frontend provides:

* Transaction history list
* Expense charts
* Timeline visualization
* Financial summaries
* Secure receipt vault

---

## Additional Features

* Gamification and engagement system
* EMI planning tools
* Charity tracking module
* Animated modern UI
* Dark/light theme support

---

# Technology Stack

## Backend

* FastAPI
* Python
* JWT Authentication
* Fernet Encryption
* Tesseract OCR
* fuzzywuzzy matching

## Frontend

* React.js
* Context API
* Modern component architecture
* Interactive dashboards and charts

## Security

* bcrypt password hashing
* JWT authentication
* Encrypted receipt storage

---

# System Architecture

```
User
 │
 ▼
React Frontend
 │
 ▼
FastAPI Backend
 │
 ├── Authentication Module
 ├── OCR Processing Module
 ├── Encryption Module
 ├── Transaction Engine
 ├── AI Insight Engine
 │
 ▼
Encrypted Receipt Storage
```

---

# Project Structure

```
ReceiptAI/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── auth.py
│   │   ├── crypto_utils.py
│   │   ├── ocr.py
│   │   ├── fusion.py
│   │   ├── ai_helpers.py
│   │   └── mock_mcp.py
│
├── frontend/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── ReceiptUpload.jsx
│   │   ├── TransactionsList.jsx
│   │   ├── Charts.jsx
│   │   ├── Chat.jsx
│   │   ├── Vault.jsx
│   │   ├── FinancialSummary.jsx
│   │   └── more components...
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   └── Dashboard.jsx
│   │
│   └── index.js
│
└── README.md
```

---

# Installation Guide

## Backend Setup

### 1. Create virtual environment

```
python -m venv venv
```

Activate:

Windows:

```
venv\Scripts\activate
```

Linux/Mac:

```
source venv/bin/activate
```

---

### 2. Install dependencies

```
pip install fastapi uvicorn python-dotenv pytesseract pillow cryptography passlib[bcrypt] fuzzywuzzy python-jose
```

---

### 3. Install Tesseract OCR

Download and install:

https://github.com/tesseract-ocr/tesseract

Update path in:

```
app/ocr.py
```

---

### 4. Configure environment variables

Create `.env`

```
JWT_SECRET=your_secret_key
ENCRYPTION_KEY=your_encryption_key
USE_GOOGLE_VISION=false
```

---

### 5. Run backend

```
uvicorn app.main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

Docs available at:

```
http://localhost:8000/docs
```

---

# Frontend Setup

```
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# System Workflow

1. User registers and logs in
2. JWT token issued
3. User uploads receipt
4. OCR extracts data
5. Data encrypted and stored
6. Matching engine reconciles transaction
7. Dashboard updates
8. User interacts with AI assistant

---

# Security Architecture

* Encrypted receipt storage
* JWT authentication
* Password hashing
* Secure API endpoints

---

# Use Cases

* Personal finance management
* Expense tracking automation
* Secure receipt storage
* Financial analytics
* AI-powered financial assistant

---

# Future Enhancements

* Database integration (PostgreSQL)
* Cloud deployment (AWS / Azure)
* Real LLM integration
* Mobile application
* Multi-user scalability

---

# Author

Guhan M
AI Systems Developer | Cybersecurity | Financial AI

---

# License

This project is intended for educational, research, and portfolio use.

