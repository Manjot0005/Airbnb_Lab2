// frontend/src/pages/owner/BookingRequests.jsx - COMPLETE
import React, { useEffect, useState } from "react";
import api from "../../lib/api";

export default function BookingRequests() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all"); // all, pending, accepted, rejected, cancelled
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
    if (!confirm("Accept this booking request? This will block the dates.")) return;

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
    if (!confirm("Reject this booking request?")) return;

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
    if (!confirm("Cancel this booking? This will release the blocked dates.")) return;

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
      pending: "bg-warning",
      accepted: "bg-success",
      rejected: "bg-danger",
      cancelled: "bg-secondary"
    };
    return badges[status] || "bg-secondary";
  };

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end - start;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Booking Requests</h3>

      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          {success}
          <button className="btn-close" onClick={() => setSuccess("")}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}

      {/* Filter Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({bookings.length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending ({bookings.filter(b => b.status === "pending").length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === "accepted" ? "active" : ""}`}
            onClick={() => setFilter("accepted")}
          >
            Accepted ({bookings.filter(b => b.status === "accepted").length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === "rejected" ? "active" : ""}`}
            onClick={() => setFilter("rejected")}
          >
            Rejected ({bookings.filter(b => b.status === "rejected").length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === "cancelled" ? "active" : ""}`}
            onClick={() => setFilter("cancelled")}
          >
            Cancelled ({bookings.filter(b => b.status === "cancelled").length})
          </button>
        </li>
      </ul>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="alert alert-info">
          No {filter !== "all" ? filter : ""} booking requests found.
        </div>
      ) : (
        <div className="row g-3">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    {/* Property Image */}
                    <div className="col-md-2">
                      <img
                        src={booking.listing?.images?.[0] || "https://via.placeholder.com/200"}
                        alt={booking.listing?.title}
                        className="img-fluid rounded"
                        style={{ width: "100%", height: 120, objectFit: "cover" }}
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="col-md-6">
                      <h5 className="mb-2">
                        {booking.listing?.title}
                        <span className={`badge ${getStatusBadge(booking.status)} ms-2`}>
                          {booking.status.toUpperCase()}
                        </span>
                      </h5>
                      <p className="text-muted small mb-2">
                        📍 {booking.listing?.city}
                      </p>
                      <p className="mb-1">
                        <strong>Guest:</strong> {booking.traveler?.name || booking.traveler?.email}
                      </p>
                      {booking.traveler?.phone && (
                        <p className="mb-1">
                          <strong>Phone:</strong> {booking.traveler.phone}
                        </p>
                      )}
                      <p className="mb-1">
                        <strong>Dates:</strong> {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                      </p>
                      <p className="mb-1">
                        <strong>Nights:</strong> {calculateNights(booking.checkIn, booking.checkOut)}
                      </p>
                      <p className="mb-1">
                        <strong>Guests:</strong> {booking.guests}
                      </p>
                      {booking.message && (
                        <p className="mb-1">
                          <strong>Message:</strong> <em>{booking.message}</em>
                        </p>
                      )}
                    </div>

                    {/* Price & Actions */}
                    <div className="col-md-4 text-end">
                      <h4 className="text-success mb-3">${booking.totalPrice}</h4>
                      <p className="text-muted small mb-3">
                        Requested on: {new Date(booking.createdAt).toLocaleDateString()}
                      </p>

                      {booking.status === "pending" && (
                        <div className="d-flex flex-column gap-2">
                          <button 
                            className="btn btn-success"
                            onClick={() => handleAccept(booking.id)}
                          >
                            ✓ Accept Booking
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleReject(booking.id)}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}

                      {booking.status === "accepted" && (
                        <button 
                          className="btn btn-outline-danger w-100"
                          onClick={() => handleCancel(booking.id)}
                        >
                          Cancel Booking
                        </button>
                      )}

                      {(booking.status === "rejected" || booking.status === "cancelled") && (
                        <p className="text-muted">No actions available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}