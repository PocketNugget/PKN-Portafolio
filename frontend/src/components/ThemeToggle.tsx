import React from "react";
import { useTheme } from "./ThemeContext";
import { FaMoon, FaSun } from "react-icons/fa";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <motion.button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      whileHover={{ scale: 1.15 }}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: dark ? "#00fff7" : "#0f111a",
        fontSize: 24,
        marginLeft: 12,
        outline: "none",
        display: "flex",
        alignItems: "center",
      }}
    >
      {dark ? <FaSun /> : <FaMoon />}
    </motion.button>
  );
}
