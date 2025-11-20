import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useNavigate } from "react-router-dom";

export default function TravelerProfile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "USA",
    gender: "",
    languages: "",
    about: "",
    profilePicture: null,
    profilePicturePreview: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const COUNTRIES = [
    "USA"
  ];

  const US_STATES = [
     "CA", "LA", "NJ", "NY", "WA"
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/profile");
      if (res.data.profile) {
        const profile = res.data.profile;
        setForm({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          city: profile.city || "",
          state: profile.state || "",
          country: profile.country || "USA",
          gender: profile.gender || "",
          languages: profile.languages || "",
          about: profile.about || "",
          profilePicture: null,
          profilePicturePreview: profile.profilePicture || null
        });
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setForm({
        ...form,
        profilePicture: file,
        profilePicturePreview: URL.createObjectURL(file)
      });
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("city", form.city);
    formData.append("state", form.state);
    formData.append("country", form.country);
    formData.append("gender", form.gender);
    formData.append("languages", form.languages);
    formData.append("about", form.about);
    
    if (form.profilePicture) {
      formData.append("profilePicture", form.profilePicture);
    }

    try {
      await api.put("/api/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setSuccess("Profile updated successfully!");
      setTimeout(() => navigate("/traveler/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 800 }}>
      <div className="row">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                Traveler Profile
              </h4>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError("")}></button>
                </div>
              )}
              
              {success && (
                <div className="alert alert-success alert-dismissible fade show">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {success}
                  <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Profile Picture */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    {form.profilePicturePreview ? (
                      <img
                        src={form.profilePicturePreview}
                        alt="Profile"
                        className="rounded-circle border border-3 border-primary"
                        style={{ width: 150, height: 150, objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="rounded-circle border border-3 border-secondary d-inline-flex align-items-center justify-content-center bg-light"
                        style={{ width: 150, height: 150 }}
                      >
                        <i className="bi bi-person-fill" style={{ fontSize: "4rem", color: "#ccc" }}></i>
                      </div>
                    )}
                  </div>
                  <label className="btn btn-outline-primary btn-sm">
                    <i className="bi bi-upload me-2"></i>
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="text-muted small mt-2">Max 5MB (JPG, PNG)</p>
                </div>

                {/* Basic Info */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="bi bi-person me-1"></i>Full Name *
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="bi bi-envelope me-1"></i>Email *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="bi bi-telephone me-1"></i>Phone Number
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="bi bi-gender-ambiguous me-1"></i>Gender
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="bi bi-geo-alt me-1"></i>City
                    </label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="San Francisco"
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">
                      <i className="bi bi-map me-1"></i>State (US Only)
                    </label>
                    <select
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className="form-select"
                      disabled={form.country !== "USA"}
                    >
                      <option value="">State</option>
                      {US_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">
                      <i className="bi bi-flag me-1"></i>Country *
                    </label>
                    <select
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      {COUNTRIES.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">
                      <i className="bi bi-translate me-1"></i>Languages
                    </label>
                    <input
                      name="languages"
                      value={form.languages}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="English, Spanish, French"
                    />
                    <small className="text-muted">Comma-separated</small>
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">
                      <i className="bi bi-chat-left-text me-1"></i>About Me
                    </label>
                    <textarea
                      name="about"
                      value={form.about}
                      onChange={handleChange}
                      className="form-control"
                      rows="4"
                      placeholder="Tell us about yourself, your interests, travel preferences..."
                    />
                  </div>
                </div>

                <div className="mt-4 d-flex gap-2">
                  <button type="submit" className="btn btn-primary flex-grow-1">
                    <i className="bi bi-save me-2"></i>
                    Save Profile
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/traveler/dashboard")}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}