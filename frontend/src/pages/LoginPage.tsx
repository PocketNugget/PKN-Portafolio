import React, { useState } from "react";
import { login } from "../api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock } from "react-icons/fa";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await login(username, password);
    if (res.token) {
      navigate("/admin/dashboard");
    } else {
      setError(res.error || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{ display: "flex", alignItems: "center", gap: 16 }}
      >
        <FaLock
          size={36}
          style={{ color: "#00fff7", filter: "drop-shadow(0 0 8px #00fff7)" }}
        />
        <h1>Admin Login</h1>
      </motion.div>
      <motion.form
        onSubmit={handleSubmit}
        className="login-form"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        style={{
          maxWidth: 400,
          margin: "2em auto",
          background: "#181c24",
          borderRadius: 10,
          boxShadow: "0 0 12px #00fff760, 0 0 2px #39ff1460",
          padding: "2em",
        }}
      >
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <motion.button type="submit" whileHover={{ scale: 1.08 }}>
          Login
        </motion.button>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: "#ff3860", marginTop: 12 }}
          >
            {error}
          </motion.div>
        )}
      </motion.form>
    </div>
  );
}
