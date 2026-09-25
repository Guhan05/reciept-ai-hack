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

# Step-by-Step Guide to Run the Application

Follow these step-by-step instructions to set up and run both the FastAPI backend and the React frontend on your machine.

---

## Prerequisites

Before starting, ensure you have the following installed on your system:

1. **Python 3.10 or higher**
   * Download: [python.org](https://www.python.org/downloads/)
   * Verify in terminal: `python --version`
2. **Node.js (v18 or higher) & npm**
   * Download: [nodejs.org](https://nodejs.org/)
   * Verify in terminal: `node -v` and `npm -v`
3. **Tesseract OCR (for Local Receipt OCR)**
   * **Windows:** Download and run the installer from [UB-Mannheim Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki).
     * Default install path: `C:\Program Files\Tesseract-OCR\tesseract.exe`
     * (Ensure this path matches `app/ocr.py` or add Tesseract to your System `PATH`).
   * **Linux:** `sudo apt install tesseract-ocr`
   * **macOS:** `brew install tesseract`

---

## Step 1: Start the Backend Server (Terminal 1)

Open a terminal window and navigate to the `backend` folder:

### 1.1 Navigate to backend directory
```bash
cd backend
```

### 1.2 Create and activate a Python virtual environment

* **Windows (PowerShell):**
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```
  *(Note: If PowerShell throws a script execution policy error, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` and try activating again).*

* **Windows (Command Prompt):**
  ```cmd
  python -m venv venv
  venv\Scripts\activate.bat
  ```

* **Linux / macOS:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

### 1.3 Install backend dependencies
```bash
pip install -r requirements.txt
```

### 1.4 Configure environment variables
Create or verify your `.env` file inside the `backend` directory (copy from `.env.example` if it doesn't already exist):

```powershell
# On Windows PowerShell
Copy-Item .env.example .env

# On Linux / macOS
cp .env.example .env
```

Open `backend/.env` and configure your keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=REDACTED_JWT_SECRET
USE_GOOGLE_VISION=false
GOOGLE_APPLICATION_CREDENTIALS=
```
> [!NOTE]
> `backend/.env` is included in `.gitignore` and `.ignore` so your actual API keys and secrets will never be committed to GitHub.

### 1.5 Launch the FastAPI server
```bash
uvicorn app.main:app --reload --port 8000
```

* **Backend API:** `http://localhost:8000`
* **Interactive API Documentation (Swagger):** `http://localhost:8000/docs`

Keep this terminal running.

---

## Step 2: Start the Frontend Application (Terminal 2)

Open a **new, separate terminal window** and navigate to the `frontend` folder:

### 2.1 Navigate to frontend directory
```bash
cd frontend
```

### 2.2 Install npm dependencies
```bash
npm install
```

### 2.3 Start the Vite development server
```bash
npm run dev
```

The frontend development server will start, typically at:
```text
http://localhost:5173
```

---

## Step 3: Application Walkthrough

1. Open your web browser and navigate to:
   ```text
   http://localhost:5173
   ```
2. **Register a User:**
   * Click on the register option or go to the login screen.
   * Enter a username and password to create an account.
3. **Log In:**
   * Enter your credentials to log in. The backend issues a secure JWT token.
4. **Dashboard & Features:**
   * **Receipt Upload:** Upload receipt images (`.png`, `.jpg`, `.jpeg`). Tesseract OCR extracts merchant name, date, and amount, encrypts the image via Fernet, and reconciles transactions.
   * **Manual Transaction Entry:** Log offline or cash expenses with category and timestamp.
   * **Financial Analytics:** View expense breakdown charts, spending categories, and timelines.
   * **Encrypted Vault:** Inspect your securely encrypted receipt assets.
   * **AI Assistant:** Ask questions about your spending (e.g., *"How much did I spend on food?"*, *"What was my biggest expense?"*, or *"Give me saving tips"*).

---

## Troubleshooting & FAQs

* **PowerShell script execution error when activating `venv`:**
  Run:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```
* **`pytesseract.TesseractNotFoundError`:**
  Make sure Tesseract OCR is installed at `C:\Program Files\Tesseract-OCR\tesseract.exe` or update the path in `backend/app/ocr.py`.
* **API calls fail from frontend (Network Error / CORS):**
  Ensure the backend is running at `http://localhost:8000` before interacting with the frontend.
* **Port 8000 or 5173 already in use:**
  * For backend: `uvicorn app.main:app --reload --port 8001` (and set `VITE_API_URL=http://localhost:8001` in `frontend/.env`).
  * For frontend: Vite will automatically suggest an alternate port (e.g. `5174`).


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

# Author & Repository

* **Author:** Guhan M (AI Systems Developer | Cybersecurity | Financial AI)
* **GitHub Profile:** [@Guhan05](https://github.com/Guhan05)
* **GitHub Repository:** [https://github.com/Guhan05/reciept-ai-hack](https://github.com/Guhan05/reciept-ai-hack)

---

# License

This project is intended for educational, research, and portfolio use.


