// frontend/src/pages/Homepage.jsx - FIXED VERSION
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function HomePage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    try {
      setLoading(true);
      setError("");
      
      console.log("🔍 Fetching listings from /listings...");
      
      // FIXED: Use /listings not /api/listings
      const res = await api.get("/listings");
      
      console.log("✅ API Response:", res.data);
      
      const fetchedListings = res.data.listings || [];
      setListings(fetchedListings);
      
      console.log(`✅ Loaded ${fetchedListings.length} listings`);
      
      if (fetchedListings.length === 0) {
        setError("No properties available yet. Check back soon!");
      }
    } catch (err) {
      console.error("❌ Failed to load listings:", err);
      console.error("Error details:", err.response?.data);
      setError(err.response?.data?.error || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }

  const viewProperty = (id) => {
    navigate(`/property/${id}`);
  };

  return (
    <div className="container mt-4">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">🏠 Explore Amazing Places</h1>
        <p className="lead text-muted">
          Find your perfect home away from home
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading properties...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="alert alert-warning text-center">
          <h5>⚠️ {error}</h5>
          <button 
            className="btn btn-outline-danger mt-2"
            onClick={fetchListings}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && listings.length === 0 && (
        <div className="alert alert-info text-center">
          <h5>No properties available yet</h5>
          <p className="mb-0">Be the first to list your property!</p>
        </div>
      )}

      {/* Listings Grid */}
      {!loading && listings.length > 0 && (
        <div className="row g-4">
          {listings.map((listing) => (
            <div key={listing.id} className="col-md-4">
              <div 
                className="card h-100 shadow-sm" 
                style={{ cursor: "pointer" }}
                onClick={() => viewProperty(listing.id)}
              >
                {/* Property Image */}
                <div style={{ height: 250, overflow: "hidden" }}>
                  <img
                    src={
                      listing.images?.[0] || 
                      "https://via.placeholder.com/400x300?text=No+Image"
                    }
                    className="card-img-top"
                    alt={listing.title}
                    style={{ 
                      height: "100%", 
                      width: "100%",
                      objectFit: "cover"
                    }}
                    onError={(e) => {
                      console.error("❌ Image failed to load:", listing.images?.[0]);
                      e.target.src = "https://via.placeholder.com/400x300?text=Image+Error";
                    }}
                  />
                </div>

                {/* Image Count Badge */}
                {listing.images?.length > 1 && (
                  <span className="position-absolute top-0 end-0 badge bg-dark m-2">
                    📷 {listing.images.length}
                  </span>
                )}

                <div className="card-body">
                  <h5 className="card-title">{listing.title}</h5>
                  
                  <p className="card-text text-muted mb-2">
                    📍 {listing.city}
                  </p>

                  <p className="card-text">
                    <strong className="text-danger fs-5">
                      ${listing.pricePerNight}
                    </strong>
                    <span className="text-muted">/night</span>
                  </p>

                  <p className="card-text">
                    <small className="text-muted">
                      👥 Up to {listing.maxGuests} guests
                    </small>
                  </p>

                  {listing.description && (
                    <p className="card-text small text-muted">
                      {listing.description.length > 100
                        ? listing.description.substring(0, 100) + "..."
                        : listing.description}
                    </p>
                  )}
                </div>

                <div className="card-footer bg-white border-0">
                  <button 
                    className="btn btn-danger w-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewProperty(listing.id);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Property Count */}
      {!loading && listings.length > 0 && (
        <div className="text-center mt-4 text-muted">
          <small>Showing {listings.length} {listings.length === 1 ? 'property' : 'properties'}</small>
        </div>
      )}
    </div>
  );
}