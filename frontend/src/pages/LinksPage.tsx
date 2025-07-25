import React from "react";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaPhone,
  FaGithub,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

const links = [
  {
    icon: <FaEnvelope />,
    label: "Email",
    href: "mailto:goben.ca.pkn@hotmail.com",
    color: "#00fff7",
  },
  {
    icon: <FaPhone />,
    label: "Phone",
    href: "tel:+522227155667",
    color: "#39ff14",
  },
  {
    icon: <FaGithub />,
    label: "GitHub: goben-diego",
    href: "https://github.com/goben-diego",
    color: "#fff",
  },
  {
    icon: <FaGithub />,
    label: "GitHub: PocketNugget",
    href: "https://github.com/PocketNugget",
    color: "#fff",
  },
  {
    icon: <FaInstagram />,
    label: "Instagram",
    href: "https://www.instagram.com/",
    color: "#ff39a6",
  },
  {
    icon: <FaLinkedin />,
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    color: "#00aaff",
  },
];

export default function LinksPage() {
  return (
    <div className="links-page">
      <h1>Links</h1>
      <section>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {links.map((link, i) => (
            <motion.li
              key={link.label}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ scale: 1.08, color: link.color }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontSize: "1.2rem",
                marginBottom: 18,
                color: link.color,
                transition: "color 0.2s",
              }}
            >
              <span style={{ fontSize: 24 }}>{link.icon}</span>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: link.color }}
              >
                {link.label}
              </a>
            </motion.li>
          ))}
        </ul>
      </section>
    </div>
  );
}
