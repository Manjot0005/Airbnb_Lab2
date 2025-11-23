// frontend/src/pages/owner/OwnerBookings.jsx - ENHANCED VERSION
import React, { useEffect, useState } from "react";
import api from "../../lib/api";

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/owner/bookings");
      setBookings(res.data.bookings || []);
      setError("");
    } catch (err) {
      console.error("Failed to load bookings:", err);
      setError("Failed to load booking requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId) => {
    if (!window.confirm("Accept this booking request? This will block the dates.")) return;

    try {
      await api.put(`/owner/bookings/${bookingId}/accept`);
      setSuccess("Booking accepted! Dates are now blocked.");
      await fetchBookings();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to accept booking:", err);
      setError(err.response?.data?.error || "Failed to accept booking");
    }
  };

  const handleReject = async (bookingId) => {
    if (!window.confirm("Reject this booking request?")) return;

    try {
      await api.put(`/owner/bookings/${bookingId}/reject`);
      setSuccess("Booking rejected.");
      await fetchBookings();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to reject booking:", err);
      setError(err.response?.data?.error || "Failed to reject booking");
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking? This will release the blocked dates.")) return;

    try {
      await api.put(`/owner/bookings/${bookingId}/cancel`);
      setSuccess("Booking cancelled. Dates are now available.");
      await fetchBookings();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      setError(err.response?.data?.error || "Failed to cancel booking");
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

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

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end - start;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading booking requests...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">
          <i className="bi bi-calendar-check me-2"></i>
          Booking Requests
        </h3>
        <button className="btn btn-outline-primary btn-sm" onClick={fetchBookings}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}

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
            Accepted ({bookings.filter(b => b.status === "accepted").length})
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
          No {filter !== "all" ? filter : ""} booking requests found.
        </div>
      ) : (
        <div className="row g-3">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="col-12">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="row align-items-center">
                    {/* Property Image */}
                    <div className="col-md-2">
                      <img
                        src={booking.listing?.images?.[0] || "https://via.placeholder.com/200x150?text=No+Image"}
                        alt={booking.listing?.title}
                        className="img-fluid rounded"
                        style={{ width: "100%", height: 120, objectFit: "cover" }}
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-2">
                        <h5 className="mb-0 me-2">{booking.listing?.title}</h5>
                        <span className={`badge ${getStatusBadge(booking.status)}`}>
                          <i className={`${getStatusIcon(booking.status)} me-1`}></i>
                          {booking.status.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-muted small mb-2">
                        <i className="bi bi-geo-alt-fill me-1"></i>
                        {booking.listing?.city}, {booking.listing?.country || 'USA'}
                      </p>

                      <div className="row g-2 small">
                        <div className="col-md-6">
                          <p className="mb-1">
                            <i className="bi bi-person-fill me-1 text-primary"></i>
                            <strong>Guest:</strong> {booking.traveler?.name || booking.traveler?.email}
                          </p>
                          {booking.traveler?.phone && (
                            <p className="mb-1">
                              <i className="bi bi-telephone-fill me-1 text-primary"></i>
                              <strong>Phone:</strong> {booking.traveler.phone}
                            </p>
                          )}
                          <p className="mb-1">
                            <i className="bi bi-people-fill me-1 text-primary"></i>
                            <strong>Guests:</strong> {booking.guests}
                          </p>
                        </div>

                        <div className="col-md-6">
                          <p className="mb-1">
                            <i className="bi bi-calendar-event me-1 text-primary"></i>
                            <strong>Check-in:</strong> {formatDate(booking.checkIn)}
                          </p>
                          <p className="mb-1">
                            <i className="bi bi-calendar-x me-1 text-primary"></i>
                            <strong>Check-out:</strong> {formatDate(booking.checkOut)}
                          </p>
                          <p className="mb-1">
                            <i className="bi bi-moon-stars-fill me-1 text-primary"></i>
                            <strong>Nights:</strong> {calculateNights(booking.checkIn, booking.checkOut)}
                          </p>
                        </div>
                      </div>

                      {booking.message && (
                        <div className="mt-2 p-2 bg-light rounded">
                          <p className="mb-0 small">
                            <i className="bi bi-chat-left-text me-1"></i>
                            <strong>Message:</strong> <em>{booking.message}</em>
                          </p>
                        </div>
                      )}

                      <p className="text-muted small mb-0 mt-2">
                        <i className="bi bi-clock me-1"></i>
                        Requested: {formatDate(booking.createdAt)}
                      </p>
                    </div>

                    {/* Price & Actions */}
                    <div className="col-md-4">
                      <div className="text-center mb-3">
                        <div className="display-6 text-success fw-bold">
                          ${booking.totalPrice}
                        </div>
                        <small className="text-muted">
                          (${booking.listing?.pricePerNight}/night)
                        </small>
                      </div>

                      {booking.status === "pending" && (
                        <div className="d-grid gap-2">
                          <button 
                            className="btn btn-success"
                            onClick={() => handleAccept(booking.id)}
                          >
                            <i className="bi bi-check-circle me-2"></i>
                            Accept Booking
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleReject(booking.id)}
                          >
                            <i className="bi bi-x-circle me-2"></i>
                            Reject
                          </button>
                        </div>
                      )}

                      {booking.status === "accepted" && (
                        <div className="d-grid">
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleCancel(booking.id)}
                          >
                            <i className="bi bi-trash me-2"></i>
                            Cancel Booking
                          </button>
                        </div>
                      )}

                      {(booking.status === "rejected" || booking.status === "cancelled") && (
                        <div className="text-center text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          No actions available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics Footer */}
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
                <small className="text-muted">Accepted</small>
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