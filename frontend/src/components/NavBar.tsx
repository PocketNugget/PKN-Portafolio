import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";

export default function NavBar() {
  const location = useLocation();
  const isAdmin = Boolean(localStorage.getItem("jwt"));
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const isHomePage = location.pathname === "/";

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">
              <i className="fas fa-shield-alt"></i>
            </span>
            <span className="brand-text">PocketNugget</span>
          </Link>
        </div>

        <div className={`nav-menu ${isMobileMenuOpen ? "active" : ""}`}>
          {isHomePage ? (
            <>
              <button
                className="nav-link"
                onClick={() => scrollToSection("about")}
              >
                About
              </button>
              <button
                className="nav-link"
                onClick={() => scrollToSection("skills")}
              >
                Skills
              </button>
              <button
                className="nav-link"
                onClick={() => scrollToSection("projects")}
              >
                Projects
              </button>
              <button
                className="nav-link"
                onClick={() => scrollToSection("certifications")}
              >
                Certifications
              </button>
              <button
                className="nav-link"
                onClick={() => scrollToSection("blog")}
              >
                Blog
              </button>
              <button
                className="nav-link"
                onClick={() => scrollToSection("contact")}
              >
                Contact
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">
                Home
              </Link>
              <Link to="/links" className="nav-link">
                Links
              </Link>
              <Link to="/blog" className="nav-link">
                Blog
              </Link>
            </>
          )}

          {isAdmin && (
            <Link to="/dashboard" className="nav-link admin-link">
              Dashboard
            </Link>
          )}
        </div>

        <div
          className={`mobile-menu-toggle ${isMobileMenuOpen ? "active" : ""}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}
