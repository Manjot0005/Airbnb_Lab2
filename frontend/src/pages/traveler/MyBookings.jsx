// frontend/src/pages/traveler/MyBookings.jsx - COMPLETE FIXED VERSION
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings/my");
      console.log("Bookings response:", res.data); // Debug
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error("Failed to load bookings", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-warning text-dark",
      accepted: "bg-success",
      rejected: "bg-danger",
      cancelled: "bg-secondary"
    };
    return badges[status] || "bg-secondary";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: "bi-clock-history",
      accepted: "bi-check-circle-fill",
      rejected: "bi-x-circle-fill",
      cancelled: "bi-dash-circle-fill"
    };
    return icons[status] || "bi-circle";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end - start;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleViewProperty = (booking) => {
    // Get listing ID from different possible locations
    const listingId = booking.listingId || booking.listing_id || booking.Listing?.id || booking.listing?.id;
    
    console.log("Booking data:", booking); // Debug
    console.log("Listing ID:", listingId); // Debug
    
    if (listingId) {
      navigate(`/property/${listingId}`);
    } else {
      alert("Property information not available");
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">
          <i className="bi bi-calendar3 me-2"></i>
          My Bookings
        </h3>
        <button className="btn btn-outline-primary btn-sm" onClick={fetchBookings}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <ul className="nav nav-pills mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            <i className="bi bi-list-ul me-1"></i>
            All ({bookings.length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            <i className="bi bi-clock-history me-1"></i>
            Pending ({bookings.filter(b => b.status === "pending").length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === "accepted" ? "active" : ""}`}
            onClick={() => setFilter("accepted")}
          >
            <i className="bi bi-check-circle me-1"></i>
            Confirmed ({bookings.filter(b => b.status === "accepted").length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === "rejected" ? "active" : ""}`}
            onClick={() => setFilter("rejected")}
          >
            <i className="bi bi-x-circle me-1"></i>
            Rejected ({bookings.filter(b => b.status === "rejected").length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === "cancelled" ? "active" : ""}`}
            onClick={() => setFilter("cancelled")}
          >
            <i className="bi bi-dash-circle me-1"></i>
            Cancelled ({bookings.filter(b => b.status === "cancelled").length})
          </button>
        </li>
      </ul>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No {filter !== "all" ? filter : ""} bookings found.
        </div>
      ) : (
        <div className="row g-4">
          {filteredBookings.map((booking) => {
            // Handle different possible property data structures
            const listing = booking.Listing || booking.listing || {};
            const propertyTitle = listing.title || "Property";
            const propertyCity = listing.city || "N/A";
            const propertyCountry = listing.country || "USA";
            const propertyImage = listing.images?.[0] || (typeof listing.images === 'string' ? JSON.parse(listing.images)[0] : null) || "https://via.placeholder.com/400x300?text=No+Image";
            const pricePerNight = listing.pricePerNight || 0;
            
            return (
              <div key={booking.id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm">
                  {/* Property Image */}
                  <div className="position-relative">
                    <img
                      src={propertyImage}
                      alt={propertyTitle}
                      className="card-img-top"
                      style={{ height: 200, objectFit: "cover", cursor: "pointer" }}
                      onClick={() => handleViewProperty(booking)}
                    />
                    <span className={`position-absolute top-0 end-0 badge ${getStatusBadge(booking.status)} m-2`}>
                      <i className={`${getStatusIcon(booking.status)} me-1`}></i>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="card-body">
                    <h5 className="card-title mb-2">{propertyTitle}</h5>
                    <p className="text-muted small mb-3">
                      <i className="bi bi-geo-alt-fill me-1"></i>
                      {propertyCity}, {propertyCountry}
                    </p>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">
                          <i className="bi bi-calendar-event me-1 text-primary"></i>
                          <strong>Check-in:</strong>
                        </span>
                        <span className="small">{formatDate(booking.checkIn)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">
                          <i className="bi bi-calendar-x me-1 text-primary"></i>
                          <strong>Check-out:</strong>
                        </span>
                        <span className="small">{formatDate(booking.checkOut)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">
                          <i className="bi bi-moon-stars-fill me-1 text-primary"></i>
                          <strong>Nights:</strong>
                        </span>
                        <span className="small">{calculateNights(booking.checkIn, booking.checkOut)}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="small">
                          <i className="bi bi-people-fill me-1 text-primary"></i>
                          <strong>Guests:</strong>
                        </span>
                        <span className="small">{booking.guests}</span>
                      </div>
                    </div>

                    {booking.message && (
                      <div className="alert alert-light small mb-3">
                        <i className="bi bi-chat-left-text me-1"></i>
                        <strong>Note:</strong> {booking.message}
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-muted small">Total Price:</span>
                      <span className="h5 mb-0 text-success">${booking.totalPrice}</span>
                    </div>

                    <button 
                      className="btn btn-outline-primary w-100"
                      onClick={() => handleViewProperty(booking)}
                    >
                      <i className="bi bi-house-door me-2"></i>
                      View Property
                    </button>
                  </div>

                  {/* Card Footer */}
                  <div className="card-footer bg-light small text-muted">
                    <i className="bi bi-clock me-1"></i>
                    Booked on: {formatDate(booking.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Statistics Summary */}
      {bookings.length > 0 && (
        <div className="card mt-4 bg-light">
          <div className="card-body">
            <div className="row text-center">
              <div className="col-md-3">
                <h4 className="text-warning">{bookings.filter(b => b.status === "pending").length}</h4>
                <small className="text-muted">Pending</small>
              </div>
              <div className="col-md-3">
                <h4 className="text-success">{bookings.filter(b => b.status === "accepted").length}</h4>
                <small className="text-muted">Confirmed</small>
              </div>
              <div className="col-md-3">
                <h4 className="text-danger">{bookings.filter(b => b.status === "rejected").length}</h4>
                <small className="text-muted">Rejected</small>
              </div>
              <div className="col-md-3">
                <h4 className="text-secondary">{bookings.filter(b => b.status === "cancelled").length}</h4>
                <small className="text-muted">Cancelled</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}