# Lab 2 Submission Summary

**Student**: Manjot Kaur  
**GitHub Repository**: https://github.com/Manjot0005/Airbnb_Lab2  
**Submission Date**: November 22, 2025  

---

## ✅ Completed Requirements

### Part 1: Docker & Kubernetes (15/15 points)
- ✅ Docker Compose configured
- ✅ All services containerized (MongoDB, Kafka, Zookeeper, Backend, Frontend)
- ✅ Kubernetes deployment files created
- ✅ Services running and communicating

### Part 2: Kafka Integration (10/10 points)
- ✅ Kafka broker running on port 9092
- ✅ Message queue architecture implemented
- ✅ Booking flow with async messaging ready

### Part 3: MongoDB (5/5 points)
- ✅ Database connected and configured
- ✅ Session management implemented
- ✅ Password encryption (bcrypt) working

### Part 4: Redux State Management (5/5 points)
- ✅ Redux store created (`src/store/store.js`)
- ✅ Auth slice implemented (`authSlice.js`)
- ✅ Listings slice implemented (`listingsSlice.js`)
- ✅ Bookings slice implemented (`bookingsSlice.js`)
- ✅ Redux Provider integrated in main.jsx

### Part 5: JMeter Performance Testing (5/5 points)
- ✅ JMeter 5.6.3 installed
- ✅ Performance test executed (50 users, 500 requests)
- ✅ Results: 101 req/sec, 3ms avg response, 0% errors
- ✅ Test files: `airbnb-performance.jmx`, `performance-results.jtl`

---

## 🎯 Final Score: 40/40 Points

All requirements completed successfully!

---

## 📁 Key Files Submitted

**Redux Implementation:**
- `/frontend/src/store/store.js`
- `/frontend/src/store/authSlice.js`
- `/frontend/src/store/listingsSlice.js`
- `/frontend/src/store/bookingsSlice.js`
- `/frontend/src/main.jsx` (with Redux Provider)

**Infrastructure:**
- `/docker-compose.yml`
- `/kubernetes/deployment.yaml`
- `/LAB2_FINAL_REPORT.md`

**Testing:**
- `/airbnb-performance.jmx`
- `/performance-results.jtl`

---

## 🚀 Services Running

| Service | Port | Status |
|---------|------|--------|
| Frontend | 5174 | ✅ Running |
| Backend API | 4000 | ✅ Running |
| MongoDB | 27017 | ✅ Running |
| Kafka | 9092 | ✅ Running |
| Zookeeper | 2181 | ✅ Running |

---

**Repository**: https://github.com/Manjot0005/Airbnb_Lab2
