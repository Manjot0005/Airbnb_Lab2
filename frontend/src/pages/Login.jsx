import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      const userData = res.data.user;

      // ✅ Store token
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }

      // ✅ Update parent state
      if (onLogin) {
        onLogin(userData);
      }

      // ✅ Check if profile is already filled
      try {
        const profile = await api.get("/api/profile");
        const isProfileComplete =
          profile.data.name && profile.data.city && profile.data.country;

        if (!isProfileComplete) {
          navigate("/profile");
        } else {
          navigate(userData.role === "owner" ? "/owner/dashboard" : "/traveler/dashboard");
        }
      } catch (profileErr) {
        // If profile check fails, still redirect to dashboard
        navigate(userData.role === "owner" ? "/owner/dashboard" : "/traveler/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3>Login</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          className="form-control mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="form-control mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn btn-primary w-100">Login</button>
      </form>
    </div>
  );
}