# 🏠 Airbnb Prototype with AI Agent

Full-stack Airbnb clone application with AI-powered chat assistant for enhanced user experience.

## 📖 Introduction

This project is a comprehensive Airbnb clone that replicates core functionalities of the popular accommodation booking platform. It features role-based access for property owners and travelers, complete booking management, reviews system, and an intelligent AI agent to assist users with their queries and bookings.

## 🎯 Project Goal

To build a production-ready, full-stack accommodation booking platform that demonstrates:
- Modern web development practices
- Secure authentication and authorization
- Database design and management
- RESTful API architecture
- AI integration for enhanced user experience
- Responsive and intuitive user interface

## 🌟 Key Features

### For Property Owners
- Create and manage property listings
- View and manage booking requests
- Track property performance
- Update availability and pricing
- Respond to reviews

### For Travelers
- Browse available properties
- Search and filter listings
- Book accommodations
- Manage bookings
- Write and read reviews
- Get AI-powered travel assistance

### AI Agent
- Answer property-related questions
- Provide booking recommendations
- Assist with travel planning
- Handle customer queries 24/7

## 🏗️ Architecture

<img width="200" height="600" alt="image" src="https://github.com/user-attachments/assets/b24b3b47-bd0f-4541-8c68-57e976020b1b" />



## 📁 Project Structure

```
airbnb-clone/
├── backend/                          # Node.js Backend Server
│   ├── server.js                     # Main server file
│   ├── db/
│   │   ├── connection.js             # MySQL connection
│   │   └── schema.sql                # Database schema
│   ├── middleware/
│   │   └── auth.js                   # Authentication middleware
│   ├── routes/
│   │   ├── auth.js                   # Auth routes (login, register)
│   │   ├── listings.js               # Property listing routes
│   │   ├── bookings.js               # Booking management routes
│   │   ├── reviews.js                # Review routes
│   │   └── profile.js                # User profile routes
│   ├── package.json
│   └── .env                          # Environment variables
│
├── frontend/                         # React Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Navigation bar
│   │   │   └── AIAgentChat.jsx       # AI chat component
│   │   ├── pages/
│   │   │   ├── Homepage.jsx          # Landing page
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── Signup.jsx            # Registration page
│   │   │   ├── PropertyDetails.jsx   # Property details page
│   │   │   ├── OwnerDashboard.jsx    # Owner dashboard
│   │   │   ├── TravelerDashboard.jsx # Traveler dashboard
│   │   │   ├── MyBookings.jsx        # Traveler bookings
│   │   │   ├── OwnerBookings.jsx     # Owner bookings
│   │   │   ├── TravelerProfile.jsx   # Traveler profile
│   │   │   └── OwnerProfile.jsx      # Owner profile
│   │   ├── App.jsx                   # Main app component
│   │   ├── App.css                   # Global styles
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Base styles
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── .env                          # Frontend environment variables
│
├── ai_agent/                         # AI Agent Service
│   ├── agent.js                      # Main AI agent logic
│   ├── prompts.js                    # AI prompt templates
│   ├── openai_config.js              # OpenAI configuration
│   ├── app.py                        # FastAPI server
│   └── requirements.txt              # Python dependencies
│
└── README.md
```

## 🛠️ Technology Stack

### Frontend (Port 5173)
- **React** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling

### Backend (Port 4000)
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **Express-session** - Session management
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Database (Port 3607)
- **MySQL** - Primary database
- 4 main tables: Users, Listings, Bookings, Reviews

### AI Agent (Port 8000)
- **FastAPI** - Python web framework
- **OpenAI API** - ChatGPT integration
- **Taviiy API** - Additional AI capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- Python 3.8+
- OpenAI API Key


### 1. Database Setup
```bash
# Login to MySQL
 sql -U MySQL

# Create database
CREATE DATABASE airbnb_clone;

# Run schema
\c airbnb_clone
\i backend/db/schema.sql
```

### 2. Backend Setup (Port 4000)
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=mysql
DB_PASSWORD=your_password
DB_NAME=airbnb_clone
SESSION_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=http://localhost:5173
```

Start backend:
```bash
npm run dev
```

Backend running at: `http://localhost:4000`

### 3. Frontend Setup (Port 5173)
```bash
cd frontend
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:4000
```

Start frontend:
```bash
npm start
```

Frontend running at: `http://localhost:5173`

### 4. AI Agent Setup (Port 8000)
```bash
cd ai_agent
pip install -r requirements.txt
```

Configure environment variables:
```env
OPENAI_API_KEY=your_openai_api_key
BACKEND_URL=http://localhost:4000
```

Start AI agent:
```bash
python main.py
```

AI Agent running at: `http://localhost:8000`

### 5. Database (Port 5432)
MySQL runs on default port: `5432`

## 🌐 Application URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:5173 | 5173 |
| Backend API | http://localhost:4000 | 4000 |
| AI Agent | http://localhost:8000 | 8000 |
| MySQL | localhost | 5432 |

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/logout` - User logout

### Listings
- `GET /listings` - Get all listings
- `GET /listings/:id` - Get single listing
- `POST /listings` - Create listing (Owner only)
- `PUT /listings/:id` - Update listing (Owner only)
- `DELETE /listings/:id` - Delete listing (Owner only)
- `GET /owner/listings` - Get owner's listings

### Bookings
- `POST /bookings` - Create booking (Traveler only)
- `GET /traveler/bookings` - Get traveler's bookings
- `GET /bookings/:id` - Get single booking
- `PUT /bookings/:id/cancel` - Cancel booking
- `GET /owner/bookings` - Get bookings for owner's properties

### Reviews
- `POST /reviews` - Create review (Traveler only)
- `GET /listings/:id/reviews` - Get listing reviews

### Profile
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile

### AI Agent
- `POST /ai/chat` - Chat with AI agent
- `GET /ai/recommendations` - Get AI recommendations

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(20) CHECK(role IN ('owner', 'traveler')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Listings Table
```sql
CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  price_per_night DECIMAL(10,2),
  max_guests INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER,
  total_price DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Reviews Table
```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Security Features

- **Password Hashing** - Bcrypt with salt rounds
- **Session Management** - Secure session cookies
- **HttpOnly Cookies** - XSS protection
- **CORS** - Configured for specific origins
- **Role-Based Access Control** - Owner/Traveler permissions
- **SQL Injection Prevention** - Parameterized queries
- **Input Validation** - Server-side validation

## 🎨 Frontend Pages

1. **Homepage** - Browse all available properties
2. **Property Details** - View detailed property information
3. **Login/Signup** - User authentication
4. **Owner Dashboard** - Manage listings and bookings
5. **Traveler Dashboard** - View bookings and favorites
6. **Profile Pages** - Manage user information
7. **AI Chat** - Interact with AI assistant

## 🤖 AI Agent Capabilities

- Property search assistance
- Booking recommendations
- Travel planning help
- Question answering
- Customer support
- Price comparisons
- Location suggestions

## 📊 Final Output

The application provides:
- ✅ Fully functional booking platform
- ✅ Secure user authentication
- ✅ Real-time property availability
- ✅ AI-powered assistance
- ✅ Responsive design
- ✅ Role-based dashboards
- ✅ Review and rating system
- ✅ Booking management
- ✅ Profile management



## 📝 Environment Variables

### Backend (.env)
```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=airbnb_clone
SESSION_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=http://localhost:5173
AI_AGENT_URL=http://localhost:8000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:4000
REACT_APP_AI_AGENT_URL=http://localhost:8000
```

### AI Agent (.env)
```env
OPENAI_API_KEY=your_openai_api_key
BACKEND_URL=http://localhost:4000
PORT=8000
```


## 👤 Author

Prathyusha Pingili

##  Acknowledgments

- OpenAI for AI capabilities
- Node.js and Express for backend
- React for frontend
- PostgreSQL for database
- FastAPI for AI agent service


