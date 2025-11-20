import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";

function Navbar({ user, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      if (onLogout) {
        onLogout();
      }
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <header className="bg-white shadow-sm p-3 sticky-top">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Logo Section */}
        <div>
          <Link to="/" className="text-decoration-none">
            <img
              src="/Airbnb_Logo.svg"
              alt="Airbnb Logo"
              height="40"
              className="d-block"
            />
          </Link>
          <div className="small text-muted ms-1">Search your next stay</div>
        </div>

        {/* User Section */}
        {user ? (
          <div className="d-flex align-items-center gap-3">
            {/* Dashboard Button */}
            <Link 
              to={user.role === 'owner' ? '/owner/dashboard' : '/traveler/dashboard'}
              className="btn btn-sm btn-outline-primary"
            >
              <i className="bi bi-speedometer2 me-1"></i>
              Dashboard
            </Link>
            
            {/* User Dropdown */}
            <div className="position-relative" ref={dropdownRef}>
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <i className="bi bi-list"></i>
                <i className="bi bi-person-circle"></i>
              </button>

              {isDropdownOpen && (
                <ul className="dropdown-menu dropdown-menu-end show position-absolute" style={{ right: 0, top: '100%', zIndex: 1050 }}>
                  <li><h6 className="dropdown-header">{user.name || user.email}</h6></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link 
                      to="/profile" 
                      className="dropdown-item" 
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <i className="bi bi-person me-2"></i>Profile
                    </Link>
                  </li>
                  
                  {/* Owner Menu Items */}
                  {user.role === 'owner' && (
                    <>
                      <li>
                        <Link 
                          to="/owner/dashboard" 
                          className="dropdown-item"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <i className="bi bi-house-door me-2"></i>My Listings
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/owner/bookings" 
                          className="dropdown-item"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <i className="bi bi-calendar-check me-2"></i>Booking Requests
                        </Link>
                      </li>
                    </>
                  )}
                  
                  {/* Traveler Menu Items */}
                  {user.role === 'traveler' && (
                    <>
                      <li>
                        <Link 
                          to="/traveler/dashboard" 
                          className="dropdown-item"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <i className="bi bi-search me-2"></i>Search Properties
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/traveler/bookings" 
                          className="dropdown-item"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <i className="bi bi-calendar3 me-2"></i>My Bookings
                        </Link>
                      </li>
                    </>
                  )}
                  
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item text-danger" 
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        ) : (
          /* Guest Dropdown Menu */
          <div className="position-relative" ref={dropdownRef}>
            <button
              className="btn btn-light border rounded-circle"
              style={{ width: "48px", height: "48px", fontSize: "20px", lineHeight: "1" }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              ☰
            </button>

            {isDropdownOpen && (
              <ul className="dropdown-menu dropdown-menu-end show position-absolute" style={{ right: 0, top: '100%', zIndex: 1050 }}>
                <li>
                  <Link 
                    to="/login" 
                    className="dropdown-item" 
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>Login
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/signup" 
                    className="dropdown-item" 
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <i className="bi bi-person-plus me-2"></i>Sign Up
                  </Link>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;