import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("traveler");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const passwordIsValid = (pwd) => {
    return /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/.test(pwd);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!passwordIsValid(password)) {
      return setError("Password must be at least 8 characters and include a number and a special character.");
    }
    if (password !== confirm) return setError("Passwords do not match");

    try {
      await api.post("/auth/signup", { email, password, role });
      alert("Signup successful. Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3>Sign Up</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSignup}>
        <input type="email" className="form-control mb-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" className="form-control mb-2" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="password" className="form-control mb-2" placeholder="Confirm Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        <small className="text-muted">Min 8 chars, 1 number, 1 special char</small>
        <select className="form-control my-3" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="traveler">Traveler</option>
          <option value="owner">Owner</option>
        </select>
        <button className="btn btn-primary w-100">Create Account</button>
      </form>
    </div>
  );
}