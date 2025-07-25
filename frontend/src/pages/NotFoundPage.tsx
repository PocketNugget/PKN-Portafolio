import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

export default function NotFoundPage() {
  return (
    <div
      className="notfound-page"
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7 }}
        style={{ marginBottom: 24 }}
      >
        <FaExclamationTriangle
          size={64}
          style={{ color: "#ff3860", filter: "drop-shadow(0 0 12px #ff3860)" }}
        />
      </motion.div>
      <h1 style={{ color: "#00fff7", textShadow: "0 0 8px #00fff7" }}>
        404 - Not Found
      </h1>
      <p style={{ color: "#eafff7", marginBottom: 24 }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        style={{
          color: "#39ff14",
          fontWeight: 600,
          fontSize: 18,
          textDecoration: "underline",
        }}
      >
        Go Home
      </Link>
    </div>
  );
}
