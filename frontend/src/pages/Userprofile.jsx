// frontend/src/pages/UserProfile.jsx - COMPLETE PROFILE MANAGEMENT
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    country: "",
    bio: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/profile");
      setProfile(res.data.user);
      setForm({
        name: res.data.user.name || "",
        phone: res.data.user.phone || "",
        city: res.data.user.city || "",
        country: res.data.user.country || "",
        bio: res.data.user.bio || "",
      });
      setImagePreview(res.data.user.profileImage);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Failed to load profile");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      e.target.value = "";
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    if (!validTypes.includes(file.type)) {
      alert("Only image files allowed");
      e.target.value = "";
      return;
    }

    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("city", form.city);
      formData.append("country", form.country);
      formData.append("bio", form.bio);
      
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const res = await api.put("/api/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile(res.data.user);
      setEditing(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err.response?.data?.error || "Failed to update profile");
    }
  };

  const handleRemoveImage = async () => {
    if (!confirm("Remove profile image?")) return;

    try {
      await api.delete("/api/profile/image");
      setImagePreview(null);
      setProfileImage(null);
      setSuccess("Profile image removed");
      await fetchProfile();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to remove image");
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <h3 className="mb-4">My Profile</h3>

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

      <div className="card">
        <div className="card-body">
          {!editing ? (
            // View Mode
            <div>
              <div className="text-center mb-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: 150, height: 150, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center"
                    style={{ width: 150, height: 150 }}
                  >
                    <span style={{ fontSize: 60 }}>👤</span>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <strong>Email:</strong> {profile.email}
              </div>
              <div className="mb-3">
                <strong>Role:</strong>{" "}
                <span className="badge bg-primary">{profile.role.toUpperCase()}</span>
              </div>
              <div className="mb-3">
                <strong>Name:</strong> {profile.name || <em className="text-muted">Not set</em>}
              </div>
              <div className="mb-3">
                <strong>Phone:</strong> {profile.phone || <em className="text-muted">Not set</em>}
              </div>
              <div className="mb-3">
                <strong>Location:</strong>{" "}
                {profile.city && profile.country
                  ? `${profile.city}, ${profile.country}`
                  : <em className="text-muted">Not set</em>}
              </div>
              <div className="mb-3">
                <strong>Bio:</strong>{" "}
                {profile.bio ? (
                  <p className="mt-2">{profile.bio}</p>
                ) : (
                  <em className="text-muted">No bio</em>
                )}
              </div>

              <button className="btn btn-primary w-100" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit}>
              <div className="text-center mb-4">
                {imagePreview ? (
                  <div className="position-relative d-inline-block">
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="rounded-circle"
                      style={{ width: 150, height: 150, objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute"
                      style={{ top: 0, right: 0 }}
                      onClick={handleRemoveImage}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    className="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center"
                    style={{ width: 150, height: 150 }}
                  >
                    <span style={{ fontSize: 60 }}>👤</span>
                  </div>
                )}
                <div className="mt-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-control"
                    style={{ maxWidth: 300, margin: "0 auto" }}
                  />
                  <small className="text-muted">Max 2MB (JPEG, PNG, GIF, WEBP, AVIF)</small>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={profile.email}
                  disabled
                />
                <small className="text-muted">Email cannot be changed</small>
              </div>

              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  name="name"
                  className="form-control"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  className="form-control"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">City</label>
                  <input
                    name="city"
                    className="form-control"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="San Francisco"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Country</label>
                  <input
                    name="country"
                    className="form-control"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="USA"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Bio</label>
                <textarea
                  name="bio"
                  rows="4"
                  className="form-control"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary flex-grow-1">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditing(false);
                    fetchProfile();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}