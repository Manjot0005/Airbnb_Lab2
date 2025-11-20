import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import AIAgentChat from "./components/AIAgentChat";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import Userprofile from "./pages/Userprofile";
import PropertyDetails from "./pages/PropertyDetails";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerBookings from "./pages/owner/OwnerBookings";
import TravelerDashboard from "./pages/traveler/TravelerDashboard";
import MyBookings from "./pages/traveler/MyBookings";
import TravelerProfile from "./pages/traveler/TravelerProfile";
import OwnerProfile from "./pages/owner/OwnerProfile";
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  // Load user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse user data", err);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/profile" element={<Userprofile />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/bookings" element={<OwnerBookings />} />
            <Route path="/traveler/dashboard" element={<TravelerDashboard />} />
            <Route path="/traveler/bookings" element={<MyBookings />} />
            <Route path="/traveler/profile" element={<TravelerProfile />} />
            <Route path="/owner/profile" element={<OwnerProfile />} />
          </Routes>
        </div>
        <AIAgentChat />
      </div>
    </Router>
  );
}

export default App;