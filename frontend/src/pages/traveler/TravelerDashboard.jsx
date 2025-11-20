// frontend/src/pages/traveler/TravelerDashboard.jsx - COMPLETELY FIXED
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function TravelerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("search");
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search filters
  const [filters, setFilters] = useState({
    city: "",
    checkIn: "",
    checkOut: "",
    guests: 1
  });

  // Fetch all properties on mount (no filters)
  useEffect(() => {
    fetchAllProperties();
  }, []);

  // Fetch properties when tab changes
  useEffect(() => {
    if (activeTab === "search") {
      fetchAllProperties();
    } else if (activeTab === "favorites") {
      fetchFavorites();
    } else if (activeTab === "history") {
      fetchBookingHistory();
    }
  }, [activeTab]);

  const fetchAllProperties = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("🔍 Fetching ALL properties...");
      
      const res = await api.get("/listings");
      console.log("✅ Response:", res.data);
      
      setProperties(res.data.listings || []);
      
      if (res.data.listings?.length === 0) {
        setError("No properties available yet. Check back soon!");
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError(err.response?.data?.error || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      
      console.log("🔍 Searching with filters:", filters);
      
      // Build query params
      const params = new URLSearchParams();
      if (filters.city) params.append("city", filters.city);
      if (filters.checkIn) params.append("checkIn", filters.checkIn);
      if (filters.checkOut) params.append("checkOut", filters.checkOut);
      if (filters.guests) params.append("guests", filters.guests);

      const res = await api.get(`/listings?${params.toString()}`);
      console.log("✅ Search results:", res.data);
      
      setProperties(res.data.listings || []);
      
      if (res.data.listings?.length === 0) {
        setError("No properties match your search criteria. Try different filters.");
      }
    } catch (err) {
      console.error("❌ Search error:", err);
      setError(err.response?.data?.error || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      city: "",
      checkIn: "",
      checkOut: "",
      guests: 1
    });
    fetchAllProperties();
  };

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get("/favorites");
      console.log("❤️ Favorites:", res.data);
      setFavorites(res.data.favorites || []);
    } catch (err) {
      console.error("❌ Fetch favorites error:", err);
      setError("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings");
      console.log("📋 Bookings:", res.data);
      setBookingHistory(res.data.bookings || []);
    } catch (err) {
      console.error("❌ Fetch history error:", err);
      setError("Failed to load booking history");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (propertyId) => {
    try {
      const isFavorite = favorites.some(fav => fav.listingId === propertyId);
      
      if (isFavorite) {
        await api.delete(`/favorites/${propertyId}`);
        setFavorites(favorites.filter(fav => fav.listingId !== propertyId));
      } else {
        await api.post("/favorites", { listingId: propertyId });
        fetchFavorites();
      }
    } catch (err) {
      console.error("❌ Toggle favorite error:", err);
      alert(err.response?.data?.error || "Failed to update favorites");
    }
  };

  const isFavorite = (propertyId) => {
    return favorites.some(fav => fav.listingId === propertyId);
  };

  const viewProperty = (propertyId) => {
    if (!propertyId) {
      alert("Property information not available");
      return;
    }
    console.log("🔍 Navigating to property:", propertyId);
    navigate(`/property/${propertyId}`);
  };

  // Render Search Tab
  const renderSearch = () => (
    <div>
      <h3 className="mb-4">🏠 Find Your Perfect Stay</h3>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">City/Location</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter city"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">Guests</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={filters.guests}
                onChange={(e) => setFilters({ ...filters, guests: e.target.value })}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Check-In</label>
              <input
                type="date"
                className="form-control"
                value={filters.checkIn}
                onChange={(e) => setFilters({ ...filters, checkIn: e.target.value })}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Check-Out</label>
              <input
                type="date"
                className="form-control"
                value={filters.checkOut}
                onChange={(e) => setFilters({ ...filters, checkOut: e.target.value })}
              />
            </div>

            <div className="col-md-1 d-flex align-items-end gap-2">
              <button type="submit" className="btn btn-danger w-100">
                🔍 Search
              </button>
            </div>
          </div>
        </div>
      </form>

      {filters.city || filters.checkIn ? (
        <button className="btn btn-outline-secondary mb-3" onClick={clearFilters}>
          Clear Filters
        </button>
      ) : null}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Searching properties...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="alert alert-warning">
          {error}
        </div>
      )}

      {/* Properties Grid */}
      {!loading && properties.length > 0 && (
        <>
          <h5 className="mb-3">
            {filters.city || filters.checkIn ? "Search Results" : "All Properties"} ({properties.length})
          </h5>
          <div className="row g-4">
            {properties.map((property) => (
              <div key={property.id} className="col-md-4">
                <div className="card h-100 shadow-sm position-relative">
                  {/* Favorite Button */}
                  <button
                    className="btn btn-sm position-absolute top-0 end-0 m-2 shadow"
                    style={{
                      backgroundColor: "white",
                      border: "none",
                      fontSize: "24px",
                      zIndex: 10
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(property.id);
                    }}
                  >
                    {isFavorite(property.id) ? "❤️" : "🤍"}
                  </button>

                  {/* Property Image */}
                  <img
                    src={property.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image"}
                    className="card-img-top"
                    alt={property.title}
                    style={{ 
                      height: 200, 
                      objectFit: "cover",
                      cursor: "pointer"
                    }}
                    onClick={() => viewProperty(property.id)}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x300?text=Image+Error";
                    }}
                  />

                  {/* Image Count Badge */}
                  {property.images?.length > 1 && (
                    <span className="position-absolute bottom-0 end-0 badge bg-dark m-2" style={{ bottom: "calc(100% - 200px)" }}>
                      📷 {property.images.length}
                    </span>
                  )}

                  <div className="card-body">
                    <h5 className="card-title">{property.title}</h5>
                    <p className="card-text text-muted mb-2">
                      📍 {property.city}
                    </p>
                    <p className="card-text">
                      <strong className="text-danger">${property.pricePerNight}</strong>/night
                      <br />
                      <small className="text-muted">👥 Up to {property.maxGuests} guests</small>
                    </p>
                    {property.description && (
                      <p className="card-text small text-muted">
                        {property.description.length > 80
                          ? property.description.substring(0, 80) + "..."
                          : property.description}
                      </p>
                    )}
                  </div>

                  <div className="card-footer bg-white">
                    <button
                      className="btn btn-danger w-100"
                      onClick={() => viewProperty(property.id)}
                    >
                      View Details & Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && properties.length === 0 && !error && (
        <div className="alert alert-info text-center">
          <h5>No properties found</h5>
          <p className="mb-0">Try adjusting your search filters or check back later</p>
        </div>
      )}
    </div>
  );

  // Render Favorites Tab
  const renderFavorites = () => (
    <div>
      <h3 className="mb-4">❤️ Favorites ({favorites.length})</h3>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-danger"></div>
        </div>
      )}

      {!loading && favorites.length === 0 && (
        <div className="alert alert-info text-center">
          <h5>No favorites yet</h5>
          <p className="mb-0">Start adding properties to your favorites!</p>
        </div>
      )}

      {!loading && favorites.length > 0 && (
        <div className="row g-4">
          {favorites.map((fav) => (
            <div key={fav.id} className="col-md-4">
              <div className="card h-100 shadow-sm">
                <img
                  src={fav.listing?.images?.[0] || "https://via.placeholder.com/400x300"}
                  className="card-img-top"
                  alt={fav.listing?.title}
                  style={{ height: 200, objectFit: "cover", cursor: "pointer" }}
                  onClick={() => viewProperty(fav.listingId)}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x300?text=Image+Error";
                  }}
                />
                <div className="card-body">
                  <h5 className="card-title">{fav.listing?.title}</h5>
                  <p className="text-muted">📍 {fav.listing?.city}</p>
                  <p>
                    <strong className="text-danger">${fav.listing?.pricePerNight}</strong>/night
                  </p>
                </div>
                <div className="card-footer bg-white">
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-danger flex-grow-1"
                      onClick={() => viewProperty(fav.listingId)}
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => toggleFavorite(fav.listingId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render Booking History Tab
  const renderHistory = () => (
    <div>
      <h3 className="mb-4">📅 Booking History ({bookingHistory.length})</h3>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-danger"></div>
        </div>
      )}

      {!loading && bookingHistory.length === 0 && (
        <div className="alert alert-info text-center">
          <h5>No bookings yet</h5>
          <p className="mb-0">Start exploring properties and make your first booking!</p>
        </div>
      )}

      {!loading && bookingHistory.length > 0 && (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Property</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Guests</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookingHistory.map((booking) => {
                // Get property ID - try different possible locations
                const propertyId = booking.listingId || booking.listing?.id;
                const propertyTitle = booking.listing?.title || "N/A";
                const propertyCity = booking.listing?.city || "N/A";
                
                return (
                  <tr key={booking.id}>
                    <td>
                      <div>
                        <strong>{propertyTitle}</strong>
                        <br />
                        <small className="text-muted">📍 {propertyCity}</small>
                      </div>
                    </td>
                    <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                    <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                    <td>{booking.guests}</td>
                    <td>${parseFloat(booking.totalPrice).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${
                        booking.status === "pending" ? "bg-warning" :
                        booking.status === "accepted" ? "bg-success" : "bg-danger"
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      {propertyId ? (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => viewProperty(propertyId)}
                        >
                          View Property
                        </button>
                      ) : (
                        <span className="text-muted small">No property data</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mt-4">
      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "search" ? "active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            🔍 Search Properties ({properties.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "favorites" ? "active" : ""}`}
            onClick={() => setActiveTab("favorites")}
          >
            ❤️ Favorites ({favorites.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            📅 Booking History ({bookingHistory.length})
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === "search" && renderSearch()}
      {activeTab === "favorites" && renderFavorites()}
      {activeTab === "history" && renderHistory()}
    </div>
  );
}