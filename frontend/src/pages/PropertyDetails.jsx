// frontend/src/pages/PropertyDetails.jsx - COMPLETELY FIXED
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

  useEffect(() => {
    fetchProperty();
    checkIfFavorite();
  }, [id]);

  const fetchProperty = async () => {
    try {
      console.log('🔍 Fetching property:', id);
      const res = await api.get(`/listings/${id}`); // FIXED: Removed /api/
      console.log('✅ Property loaded:', res.data);
      setProperty(res.data.listing);
      setLoading(false);
    } catch (err) {
      console.error("❌ Failed to load property", err);
      alert("Property not found");
      navigate("/traveler/dashboard");
    }
  };

  const checkIfFavorite = async () => {
    try {
      const res = await api.get("/favorites"); // FIXED: Removed /api/
      const favorites = res.data.favorites || [];
      setIsFavorite(favorites.some((f) => f.listingId === parseInt(id)));
    } catch (err) {
      console.error("Failed to check favorites", err);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`); // FIXED: Removed /api/
        setIsFavorite(false);
        alert("💔 Removed from favorites");
      } else {
        await api.post("/favorites", { listingId: parseInt(id) }); // FIXED: Removed /api/
        setIsFavorite(true);
        alert("❤️ Added to favorites!");
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
      alert(err.response?.data?.error || "Failed to update favorites");
    }
  };

  const handleBooking = async () => {
    if (!bookingData.checkIn || !bookingData.checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }

    if (new Date(bookingData.checkIn) >= new Date(bookingData.checkOut)) {
      alert("Check-out date must be after check-in date");
      return;
    }

    try {
      console.log('📝 Submitting booking:', {
        listingId: property.id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
      });

      await api.post("/bookings", {  // FIXED: Removed /api/
        listingId: property.id,
        checkIn: bookingData.checkIn,      // FIXED: Changed from checkInDate
        checkOut: bookingData.checkOut,    // FIXED: Changed from checkOutDate
        guests: bookingData.guests,
      });
      
      alert("✅ Booking request sent successfully!");
      setShowBookingModal(false);
      navigate("/traveler/dashboard");
    } catch (err) {
      console.error("❌ Booking failed", err);
      console.error("Error details:", err.response?.data);
      alert(err.response?.data?.error || "Failed to send booking request");
    }
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const start = new Date(bookingData.checkIn);
    const end = new Date(bookingData.checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const calculateTotal = () => {
    return calculateNights() * (property?.pricePerNight || 0);
  };

  const openGallery = (index) => {
    setCurrentIndex(index);
    setShowGallery(true);
  };

  const closeGallery = () => setShowGallery(false);
  const nextImage = () =>
    setCurrentIndex((prev) => (prev + 1) % property.images.length);
  const prevImage = () =>
    setCurrentIndex(
      (prev) => (prev - 1 + property.images.length) % property.images.length
    );

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">
          <h3>Property not found</h3>
          <button 
            className="btn btn-outline-danger mt-3"
            onClick={() => navigate("/traveler/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Back Button */}
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate("/traveler/dashboard")}
      >
        ← Back to Search
      </button>

      {/* Property Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{property.title}</h2>
        <button
          className="btn btn-outline-danger"
          onClick={toggleFavorite}
          style={{ fontSize: "24px" }}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Image Gallery */}
      <div className="row g-2 mb-4">
        {property.images && property.images.length > 0 ? (
          <>
            <div className="col-md-8">
              <img
                src={property.images[0]}
                alt={property.title}
                className="img-fluid rounded"
                style={{ width: "100%", height: 400, objectFit: "cover", cursor: "pointer" }}
                onClick={() => openGallery(0)}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/800x400?text=Image+Not+Available";
                }}
              />
            </div>
            <div className="col-md-4">
              <div className="row g-2">
                {property.images.slice(1, 5).map((img, idx) => (
                  <div className="col-6" key={idx}>
                    <img
                      src={img}
                      alt={`${property.title} ${idx + 2}`}
                      className="img-fluid rounded"
                      style={{ width: "100%", height: 195, objectFit: "cover", cursor: "pointer" }}
                      onClick={() => openGallery(idx + 1)}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x300?text=Image+Error";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="col-12">
            <img
              src="https://via.placeholder.com/800x400?text=No+Images"
              alt="No images"
              className="img-fluid rounded"
            />
          </div>
        )}
      </div>

      <div className="row">
        {/* Left Column - Property Info */}
        <div className="col-md-8">
          <div className="card p-4 mb-3">
            <h4>Property Details</h4>
            <hr />
            <div className="row">
              <div className="col-md-6">
                <p>
                  <strong>📍 Location:</strong> {property.city}
                </p>
                <p>
                  <strong>👥 Max Guests:</strong> {property.maxGuests}
                </p>
              </div>
              <div className="col-md-6">
                <p>
                  <strong>💰 Price:</strong> ${property.pricePerNight}/night
                </p>
                <p>
                  <strong>🛏️ Bedrooms:</strong> {property.bedrooms || "N/A"}
                </p>
              </div>
            </div>

            {property.description && (
              <>
                <h5 className="mt-3">Description</h5>
                <p>{property.description}</p>
              </>
            )}

            {property.amenities && property.amenities.length > 0 && (
              <>
                <h5 className="mt-3">Amenities</h5>
                <div className="d-flex flex-wrap gap-2">
                  {property.amenities.map((amenity, idx) => (
                    <span key={idx} className="badge bg-secondary">
                      {amenity}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Host Info */}
          <div className="card p-4">
            <h5>Hosted by {property.owner?.name || property.owner?.email || 'Host'}</h5>
            {property.owner?.about && <p>{property.owner.about}</p>}
            {property.owner?.email && (
              <p className="text-muted mb-0">
                📧 {property.owner.email}
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Booking Card */}
        <div className="col-md-4">
          <div className="card p-4 sticky-top" style={{ top: "20px" }}>
            <h4 className="text-center mb-3">
              ${property.pricePerNight}
              <small className="text-muted">/night</small>
            </h4>

            <div className="mb-3">
              <label className="form-label">Check-In</label>
              <input
                type="date"
                className="form-control"
                value={bookingData.checkIn}
                onChange={(e) =>
                  setBookingData({ ...bookingData, checkIn: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Check-Out</label>
              <input
                type="date"
                className="form-control"
                value={bookingData.checkOut}
                onChange={(e) =>
                  setBookingData({ ...bookingData, checkOut: e.target.value })
                }
                min={bookingData.checkIn || new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Guests</label>
              <input
                type="number"
                className="form-control"
                min="1"
                max={property.maxGuests}
                value={bookingData.guests}
                onChange={(e) =>
                  setBookingData({ ...bookingData, guests: parseInt(e.target.value) })
                }
              />
              <small className="text-muted">Maximum {property.maxGuests} guests</small>
            </div>

            {calculateNights() > 0 && (
              <div className="mb-3 p-3 bg-light rounded">
                <div className="d-flex justify-content-between mb-2">
                  <span>
                    ${property.pricePerNight} × {calculateNights()} nights
                  </span>
                  <span>${calculateTotal()}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Total</strong>
                  <strong className="text-danger">${calculateTotal()}</strong>
                </div>
              </div>
            )}

            <button
              className="btn btn-danger w-100"
              onClick={() => setShowBookingModal(true)}
              disabled={!bookingData.checkIn || !bookingData.checkOut}
            >
              Request to Book
            </button>

            <small className="text-muted text-center d-block mt-2">
              You won't be charged yet
            </small>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Your Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>{property.title}</h5>
          <p className="text-muted">📍 {property.city}</p>
          <hr />
          <div className="mb-2">
            <strong>Check-In:</strong> {bookingData.checkIn}
          </div>
          <div className="mb-2">
            <strong>Check-Out:</strong> {bookingData.checkOut}
          </div>
          <div className="mb-2">
            <strong>Guests:</strong> {bookingData.guests}
          </div>
          <div className="mb-2">
            <strong>Nights:</strong> {calculateNights()}
          </div>
          <hr />
          <h4 className="text-danger">
            <strong>Total:</strong> ${calculateTotal()}
          </h4>
          <div className="alert alert-info mt-3">
            <small>
              💡 Your booking request will be sent to the host. You'll be notified once they
              respond. No payment required at this time.
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleBooking}>
            Confirm Booking Request
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Image Gallery Modal */}
      <Modal show={showGallery} onHide={closeGallery} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Image Gallery ({currentIndex + 1} / {property.images?.length || 0})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {property.images && property.images.length > 0 && (
            <img
              src={property.images[currentIndex]}
              alt="Gallery"
              style={{ maxWidth: "100%", maxHeight: "500px", objectFit: "contain" }}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Available";
              }}
            />
          )}
          <div className="mt-3 d-flex justify-content-center gap-3">
            <Button
              variant="secondary"
              onClick={prevImage}
              disabled={!property.images || property.images.length <= 1}
            >
              ⟸ Prev
            </Button>
            <Button
              variant="secondary"
              onClick={nextImage}
              disabled={!property.images || property.images.length <= 1}
            >
              Next ⟹
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}