import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";

export default function NavBar() {
  const location = useLocation();
  const isAdmin = Boolean(localStorage.getItem("jwt"));

  return (
    <nav className="navbar">
      <Link to="/" className={location.pathname === "/" ? "active" : ""}>
        Home
      </Link>
      <Link
        to="/links"
        className={location.pathname === "/links" ? "active" : ""}
      >
        Links
      </Link>
      <Link
        to="/blog"
        className={location.pathname === "/blog" ? "active" : ""}
      >
        Blog
      </Link>
      {isAdmin ? (
        <Link
          to="/admin/dashboard"
          className={location.pathname === "/admin/dashboard" ? "active" : ""}
        >
          Dashboard
        </Link>
      ) : (
        <Link
          to="/admin/login"
          className={location.pathname === "/admin/login" ? "active" : ""}
        >
          Admin Login
        </Link>
      )}
    </nav>
  );
}
