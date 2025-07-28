import React from "react";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import "../App.css";

const links = [
  {
    icon: <FaEnvelope />,
    label: "Email",
    href: "mailto:goben.ca.pkn@hotmail.com",
    color: "#00fff7",
    bg: "#1a1a2e",
  },
  {
    icon: <FaGithub />,
    label: "GitHub: PocketNugget",
    href: "https://github.com/PocketNugget",
    color: "#fff",
    bg: "#23272f",
  },
  {
    icon: <FaLinkedin />,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/goben-diego/",
    color: "#00aaff",
    bg: "#1b262c",
  },
  {
    icon: <FaXTwitter />,
    label: "X (Twitter)",
    href: "https://twitter.com/cyberpkn",
    color: "#fff",
    bg: "#000000",
  },
  {
    icon: <FaInstagram />,
    label: "Instagram",
    href: "https://www.instagram.com/pocket_nugget/",
    color: "#ff39a6",
    bg: "#2d132c",
  },
  {
    icon: <FaYoutube />,
    label: "YouTube",
    href: "https://www.youtube.com/@Nuggz_TV",
    color: "#ff0000",
    bg: "#1a1a1a",
  },
];

export default function LinksPage() {
  return (
    <div className="links-page-modern">
      {/* Matrix Background Animation */}
      <div className="matrix-background">
        <div className="matrix-rain"></div>
      </div>

      {/* Header with Nugg Icon */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="links-header-container"
      >
        <div className="nugg-header">
          <img
            src="/Nugg.png"
            alt="PocketNugget"
            className="nugg-header-icon"
          />
          <h2 className="nugg-header-text">Goben | PocketNugget</h2>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="links-header"
        >
          <span role="img" aria-label="links">
            🔗
          </span>{" "}
          My Links
        </motion.h1>
      </motion.div>
      <motion.section
        className="links-grid"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.08 },
          },
        }}
      >
        {links.map((link, i) => (
          <motion.a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="link-card"
            style={{ background: link.bg, color: link.color }}
            whileHover={{
              scale: 1.07,
              boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)",
              y: -4,
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
          >
            <span className="link-icon" style={{ fontSize: 36 }}>
              {link.icon}
            </span>
            <span className="link-label">{link.label}</span>
          </motion.a>
        ))}
      </motion.section>
    </div>
  );
}
