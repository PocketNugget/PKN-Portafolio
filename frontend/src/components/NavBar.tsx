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

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".nav-menu") &&
        !target.closest(".mobile-menu-toggle")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    setIsMobileMenuOpen(false);
  };

  const isHomePage = location.pathname === "/";

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
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
            <Link to="/admin/dashboard" className="nav-link admin-link">
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
