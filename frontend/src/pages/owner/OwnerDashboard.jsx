// frontend/src/pages/owner/OwnerDashboard.jsx - COMPLETE VERSION
import React, { useEffect, useState } from "react";
import api from "../../lib/api";

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState("overview"); // overview, properties, bookings
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalBookings: 0,
    pendingRequests: 0,
    totalRevenue: 0,
    acceptedBookings: 0
  });
  
  const [form, setForm] = useState({
    title: "",
    city: "",
    pricePerNight: "",
    maxGuests: 1,
    description: "",
    imageFiles: [],
    imagePreviews: [],
  });
  
  const [editingId, setEditingId] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [activeImages, setActiveImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragging, setDragging] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    try {
      const [listingsRes, bookingsRes] = await Promise.all([
        api.get("/owner/listings"),
        api.get("/owner/bookings")
      ]);
      
      const fetchedListings = listingsRes.data.listings || [];
      const fetchedBookings = bookingsRes.data.bookings || [];
      
      setListings(fetchedListings);
      setBookings(fetchedBookings);
      
      // Calculate stats
      const pending = fetchedBookings.filter(b => b.status === "PENDING").length;
      const accepted = fetchedBookings.filter(b => b.status === "ACCEPTED").length;
      const revenue = fetchedBookings
        .filter(b => b.status === "ACCEPTED")
        .reduce((sum, b) => sum + (parseFloat(b.totalPrice) || 0), 0);
      
      setStats({
        totalProperties: fetchedListings.length,
        totalBookings: fetchedBookings.length,
        pendingRequests: pending,
        acceptedBookings: accepted,
        totalRevenue: revenue
      });
      
      setError("");
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err.response?.data?.error || "Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateFiles = (files) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return [];

    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = fileArray.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert(`❌ Some files are too large! Maximum size is 5MB per image.`);
      return null;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    const invalidFiles = fileArray.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert(`❌ Invalid file types! Only JPEG, PNG, GIF, WEBP, and AVIF allowed.`);
      return null;
    }

    return fileArray;
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const validFiles = validateFiles(files);
    if (validFiles === null) {
      e.target.value = "";
      return;
    }

    const combinedFiles = [...form.imageFiles, ...validFiles];
    
    if (combinedFiles.length > 5) {
      alert(`❌ Maximum 5 images allowed! You have ${form.imageFiles.length} already.`);
      e.target.value = "";
      return;
    }

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    
    setForm({
      ...form,
      imageFiles: combinedFiles,
      imagePreviews: [...form.imagePreviews, ...newPreviews]
    });

    e.target.value = "";
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const validFiles = validateFiles(files);
    if (validFiles === null) return;

    const combinedFiles = [...form.imageFiles, ...validFiles];
    
    if (combinedFiles.length > 5) {
      alert(`❌ Maximum 5 images allowed!`);
      return;
    }

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    
    setForm({
      ...form,
      imageFiles: combinedFiles,
      imagePreviews: [...form.imagePreviews, ...newPreviews]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    setSuccess("");

    if (!form.title || !form.city || !form.pricePerNight || !form.maxGuests) {
      setError("All required fields must be filled!");
      setUploading(false);
      return;
    }

    if (form.imageFiles.length === 0 && !editingId) {
      setError("Please upload at least one image!");
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("city", form.city);
    formData.append("pricePerNight", form.pricePerNight);
    formData.append("maxGuests", form.maxGuests);
    if (form.description) {
      formData.append("description", form.description);
    }
    
    form.imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      let res;
      if (editingId) {
        res = await api.put(`/owner/listings/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("✅ Listing updated successfully!");
      } else {
        res = await api.post("/owner/listings", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("✅ Listing posted successfully!");
      }
      
      resetForm();
      await fetchData();
      setTimeout(() => setSuccess(""), 3000);

    } catch (err) {
      console.error("Failed:", err);
      setError(err.response?.data?.error || "Failed to submit listing");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      city: "",
      pricePerNight: "",
      maxGuests: 1,
      description: "",
      imageFiles: [],
      imagePreviews: [],
    });
    setEditingId(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    
    try {
      await api.delete(`/owner/listings/${id}`);
      await fetchData();
      setSuccess("✅ Listing deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete listing");
    }
  };

  const handleEdit = (listing) => {
    setEditingId(listing.id);
    setForm({
      title: listing.title,
      city: listing.city,
      pricePerNight: listing.pricePerNight,
      maxGuests: listing.maxGuests,
      description: listing.description || "",
      imageFiles: [],
      imagePreviews: listing.images || [],
    });
    setActiveTab("properties");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removePreview = (index) => {
    const newFiles = form.imageFiles.filter((_, i) => i !== index);
    const newPreviews = form.imagePreviews.filter((_, i) => i !== index);
    setForm({
      ...form,
      imageFiles: newFiles,
      imagePreviews: newPreviews
    });
  };

  const openGallery = (images) => {
    if (!images || images.length === 0) return;
    setActiveImages(images);
    setCurrentIndex(0);
    setShowGallery(true);
  };

  const closeGallery = () => {
    setShowGallery(false);
    setActiveImages([]);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % activeImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length);
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      await api.patch(`/owner/bookings/${bookingId}`, { status: action });
      await fetchData();
      setSuccess(`✅ Booking ${action.toLowerCase()} successfully!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action} booking`);
    }
  };

  // Render Overview Tab
  const renderOverview = () => (
    <div>
      <h3 className="mb-4">📊 Dashboard Overview</h3>
      
      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card text-center border-primary shadow-sm">
            <div className="card-body">
              <h2 className="text-primary mb-2">{stats.totalProperties}</h2>
              <p className="text-muted mb-0">Total Properties</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card text-center border-warning shadow-sm">
            <div className="card-body">
              <h2 className="text-warning mb-2">{stats.pendingRequests}</h2>
              <p className="text-muted mb-0">Pending Requests</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card text-center border-success shadow-sm">
            <div className="card-body">
              <h2 className="text-success mb-2">{stats.acceptedBookings}</h2>
              <p className="text-muted mb-0">Accepted Bookings</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card text-center border-info shadow-sm">
            <div className="card-body">
              <h2 className="text-info mb-2">${stats.totalRevenue.toFixed(2)}</h2>
              <p className="text-muted mb-0">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <h4 className="mb-3">📋 Recent Booking Requests</h4>
      {bookings.filter(b => b.status === "PENDING").length === 0 ? (
        <div className="alert alert-info">No pending booking requests</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Property</th>
                <th>Guest</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Guests</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.filter(b => b.status === "PENDING").slice(0, 5).map(booking => (
                <tr key={booking.id}>
                  <td>{booking.propertyTitle || "N/A"}</td>
                  <td>{booking.guestName || "Guest"}</td>
                  <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                  <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                  <td>{booking.guests}</td>
                  <td>${booking.totalPrice}</td>
                  <td><span className="badge bg-warning">PENDING</span></td>
                  <td>
                    <button 
                      className="btn btn-sm btn-success me-2"
                      onClick={() => handleBookingAction(booking.id, "ACCEPTED")}
                    >
                      ✓ Accept
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleBookingAction(booking.id, "CANCELLED")}
                    >
                      ✗ Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Property Performance */}
      <h4 className="mb-3 mt-5">🏠 Property Performance</h4>
      <div className="row g-3">
        {listings.map(listing => {
          const listingBookings = bookings.filter(b => b.propertyId === listing.id);
          const accepted = listingBookings.filter(b => b.status === "ACCEPTED").length;
          const revenue = listingBookings
            .filter(b => b.status === "ACCEPTED")
            .reduce((sum, b) => sum + parseFloat(b.totalPrice || 0), 0);
          
          return (
            <div key={listing.id} className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">{listing.title}</h6>
                  <div className="d-flex justify-content-between text-muted small">
                    <span>📍 {listing.city}</span>
                    <span>💰 ${listing.pricePerNight}/night</span>
                  </div>
                  <div className="mt-3">
                    <div className="d-flex justify-content-between">
                      <span>Bookings: {accepted}</span>
                      <span className="text-success">Revenue: ${revenue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Properties Tab
  const renderProperties = () => (
    <div>
      <h3 className="mb-4">{editingId ? "✏️ Edit Property" : "➕ Post a New Property"}</h3>
      
      <div className="card mb-5">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Property Title *</label>
              <input 
                name="title" 
                type="text"
                placeholder="e.g., Luxury Beach Villa" 
                className="form-control" 
                value={form.title} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="mb-3">
              <label className="form-label">City *</label>
              <input 
                name="city" 
                type="text"
                placeholder="e.g., Miami" 
                className="form-control" 
                value={form.city} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Price per Night ($) *</label>
                <input 
                  name="pricePerNight" 
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="150" 
                  className="form-control" 
                  value={form.pricePerNight} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Max Guests *</label>
                <input 
                  name="maxGuests" 
                  type="number" 
                  min="1" 
                  max="20"
                  placeholder="4" 
                  className="form-control" 
                  value={form.maxGuests} 
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea 
                name="description" 
                rows="3"
                placeholder="Describe your property..." 
                className="form-control" 
                value={form.description} 
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Property Photos * ({form.imagePreviews.length}/5 images selected)
              </label>
              
              {form.imagePreviews.length < 5 && (
                <div
                  className={`border rounded p-4 text-center ${dragging ? 'border-primary bg-light' : 'border-secondary'}`}
                  style={{
                    borderStyle: 'dashed',
                    borderWidth: '2px',
                    cursor: 'pointer'
                  }}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <div className="py-3">
                    <div style={{ fontSize: '48px' }}>📁</div>
                    <h5 className="mt-3">Drag & Drop Images Here</h5>
                    <p className="text-muted mb-2">or click to browse</p>
                    <small className="text-muted">
                      Upload up to 5 images (JPEG, PNG, GIF, WEBP - max 5MB each)
                    </small>
                  </div>
                </div>
              )}

              <input 
                id="fileInput"
                type="file" 
                accept="image/*" 
                multiple 
                className="d-none" 
                onChange={handleFileChange}
              />
            </div>

            {form.imagePreviews.length > 0 && (
              <div className="mb-3">
                <div className="d-flex flex-wrap gap-2">
                  {form.imagePreviews.map((src, idx) => (
                    <div key={idx} className="position-relative">
                      <img 
                        src={src} 
                        alt={`Preview ${idx + 1}`} 
                        style={{ 
                          width: 120, 
                          height: 120, 
                          objectFit: "cover", 
                          borderRadius: 8
                        }} 
                      />
                      <button
                        type="button"
                        className="position-absolute top-0 end-0 btn btn-sm btn-danger m-1"
                        onClick={() => removePreview(idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="d-flex gap-2">
              <button 
                type="submit" 
                className="btn btn-danger flex-grow-1" 
                disabled={uploading}
              >
                {uploading ? "Uploading..." : editingId ? "Update Listing" : "Post Listing"}
              </button>
              
              {editingId && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Listings Grid */}
      <h4 className="mb-3">Your Listings ({listings.length})</h4>
      
      {listings.length === 0 ? (
        <div className="alert alert-info">No listings yet</div>
      ) : (
        <div className="row g-4">
          {listings.map((listing) => (
            <div className="col-md-4" key={listing.id}>
              <div className="card h-100">
                <img
                  src={listing.images?.[0] || "https://via.placeholder.com/400x300"}
                  className="card-img-top"
                  alt={listing.title}
                  style={{ height: 200, objectFit: "cover", cursor: "pointer" }}
                  onClick={() => listing.images?.length > 0 && openGallery(listing.images)}
                />
                
                <div className="card-body">
                  <h5 className="card-title">{listing.title}</h5>
                  <p className="card-text text-muted">📍 {listing.city}</p>
                  <p className="card-text">
                    💰 ${listing.pricePerNight}/night<br/>
                    👥 Max {listing.maxGuests} guests
                  </p>
                </div>
                
                <div className="card-footer">
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm btn-primary flex-grow-1" 
                      onClick={() => handleEdit(listing)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger flex-grow-1" 
                      onClick={() => handleDelete(listing.id)}
                    >
                      Delete
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

  // Render Bookings Tab
  const renderBookings = () => (
    <div>
      <h3 className="mb-4">📅 All Bookings</h3>
      
      {bookings.length === 0 ? (
        <div className="alert alert-info">No bookings yet</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Property</th>
                <th>Guest</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Guests</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.propertyTitle || "N/A"}</td>
                  <td>{booking.guestName || "Guest"}</td>
                  <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                  <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                  <td>{booking.guests}</td>
                  <td>${booking.totalPrice}</td>
                  <td>
                    <span className={`badge ${
                      booking.status === "PENDING" ? "bg-warning" :
                      booking.status === "ACCEPTED" ? "bg-success" : "bg-danger"
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    {booking.status === "PENDING" && (
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-success"
                          onClick={() => handleBookingAction(booking.id, "ACCEPTED")}
                        >
                          Accept
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleBookingAction(booking.id, "CANCELLED")}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {booking.status === "ACCEPTED" && (
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleBookingAction(booking.id, "CANCELLED")}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mt-4">
      {/* Success/Error Messages */}
      {success && (
        <div className="alert alert-success alert-dismissible">
          {success}
          <button className="btn-close" onClick={() => setSuccess("")}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible">
          {error}
          <button className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}

      {/* Tabs Navigation */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Overview
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === "properties" ? "active" : ""}`}
            onClick={() => setActiveTab("properties")}
          >
            🏠 Properties
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            📅 Bookings
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === "overview" && renderOverview()}
      {activeTab === "properties" && renderProperties()}
      {activeTab === "bookings" && renderBookings()}

      {/* Image Gallery Modal */}
      {showGallery && (
        <div 
          className="modal show d-block" 
          onClick={closeGallery}
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
        >
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5>Image {currentIndex + 1} of {activeImages.length}</h5>
                <button className="btn-close" onClick={closeGallery}></button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={activeImages[currentIndex]}
                  alt="Property"
                  style={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
                />
              </div>
              <div className="modal-footer justify-content-between">
                <button className="btn btn-secondary" onClick={prevImage}>Previous</button>
                <button className="btn btn-secondary" onClick={nextImage}>Next</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}