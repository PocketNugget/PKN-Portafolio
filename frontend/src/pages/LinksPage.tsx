import React from "react";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaPhone,
  FaGithub,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
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
    icon: <FaPhone />,
    label: "Phone",
    href: "tel:+522227155667",
    color: "#39ff14",
    bg: "#16213e",
  },
  {
    icon: <FaGithub />,
    label: "GitHub: goben-diego",
    href: "https://github.com/goben-diego",
    color: "#fff",
    bg: "#23272f",
  },
  {
    icon: <FaGithub />,
    label: "GitHub: PocketNugget",
    href: "https://github.com/PocketNugget",
    color: "#fff",
    bg: "#23272f",
  },
  {
    icon: <FaInstagram />,
    label: "Instagram",
    href: "https://www.instagram.com/",
    color: "#ff39a6",
    bg: "#2d132c",
  },
  {
    icon: <FaLinkedin />,
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    color: "#00aaff",
    bg: "#1b262c",
  },
];

export default function LinksPage() {
  return (
    <div className="links-page-modern">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="links-header"
      >
        <span role="img" aria-label="links">
          🔗
        </span>{" "}
        My Links
      </motion.h1>
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
