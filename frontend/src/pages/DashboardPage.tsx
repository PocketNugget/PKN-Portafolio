import React, { useEffect, useState } from "react";
import {
  fetchBlogPosts,
  deleteBlogPost,
  fetchPortfolio,
  deletePortfolioItem,
} from "../api";
import { BlogPost, PortfolioItem } from "@shared/types";
import BlogAdminForm from "./BlogAdminForm";
import PortfolioAdminForm from "./PortfolioAdminForm";
import { motion } from "framer-motion";
import { FaUserShield, FaBook, FaFolderOpen } from "react-icons/fa";

interface DashboardStats {
  user: { id: number; username: string };
  stats: { blogPosts: number; portfolioItems: number };
  message: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [analytics, setAnalytics] = useState<{
    total: number;
    last10: { ip: string; user_agent: string; timestamp: string }[];
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setError("Not authenticated");
      return;
    }
    fetch("http://localhost:8000/api/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(setStats)
      .catch(() => setError("Failed to load dashboard"));
    fetchBlogPosts().then(setPosts);
    fetchPortfolio().then(setPortfolio);
    fetch("http://localhost:8000/api/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(setAnalytics)
      .catch(() => setAnalytics(null));
  }, []);

  const handleDeletePost = async (id: number) => {
    const token = localStorage.getItem("jwt") || "";
    await deleteBlogPost(id, token);
    setPosts(posts.filter((p) => p.id !== id));
  };

  const handleDeleteItem = async (id: number) => {
    const token = localStorage.getItem("jwt") || "";
    await deletePortfolioItem(id, token);
    setPortfolio(portfolio.filter((i) => i.id !== id));
  };

  const refresh = () => {
    fetchBlogPosts().then(setPosts);
    fetchPortfolio().then(setPortfolio);
    setEditingPost(null);
    setEditingItem(null);
    setShowBlogForm(false);
    setShowPortfolioForm(false);
  };

  if (error) return <div className="dashboard-page">{error}</div>;
  if (!stats) return <div className="dashboard-page">Loading...</div>;

  return (
    <div className="dashboard-page">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{ display: "flex", alignItems: "center", gap: 16 }}
      >
        <FaUserShield
          size={36}
          style={{ color: "#00fff7", filter: "drop-shadow(0 0 8px #00fff7)" }}
        />
        <h1>Dashboard</h1>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        style={{ marginBottom: 24 }}
      >
        <div>Welcome, {stats.user.username}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FaBook size={22} style={{ color: "#39ff14" }} /> Blog Posts:{" "}
          {stats.stats.blogPosts}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FaFolderOpen size={22} style={{ color: "#00fff7" }} /> Portfolio
          Items: {stats.stats.portfolioItems}
        </div>
        <div>{stats.message}</div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
      >
        <h2>Manage Blog Posts</h2>
        <motion.button
          whileHover={{ scale: 1.08 }}
          onClick={() => {
            setEditingPost(null);
            setShowBlogForm(true);
          }}
        >
          New Post
        </motion.button>
        {showBlogForm && (
          <BlogAdminForm post={editingPost || undefined} onSuccess={refresh} />
        )}
        <ul>
          {posts.map((post) => (
            <motion.li
              key={post.id}
              whileHover={{ scale: 1.04, color: "#00fff7" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <strong>{post.title}</strong>
              <motion.button
                whileHover={{
                  scale: 1.1,
                  background: "#00fff7",
                  color: "#0f111a",
                }}
                onClick={() => {
                  setEditingPost(post);
                  setShowBlogForm(true);
                }}
              >
                Edit
              </motion.button>
              <motion.button
                whileHover={{
                  scale: 1.1,
                  background: "#ff3860",
                  color: "#fff",
                }}
                onClick={() => handleDeletePost(post.id)}
              >
                Delete
              </motion.button>
            </motion.li>
          ))}
        </ul>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.7 }}
      >
        <h2>Manage Portfolio</h2>
        <motion.button
          whileHover={{ scale: 1.08 }}
          onClick={() => {
            setEditingItem(null);
            setShowPortfolioForm(true);
          }}
        >
          New Item
        </motion.button>
        {showPortfolioForm && (
          <PortfolioAdminForm
            item={editingItem || undefined}
            onSuccess={refresh}
          />
        )}
        <ul>
          {portfolio.map((item) => (
            <motion.li
              key={item.id}
              whileHover={{ scale: 1.04, color: "#39ff14" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <strong>{item.title}</strong>
              <motion.button
                whileHover={{
                  scale: 1.1,
                  background: "#39ff14",
                  color: "#0f111a",
                }}
                onClick={() => {
                  setEditingItem(item);
                  setShowPortfolioForm(true);
                }}
              >
                Edit
              </motion.button>
              <motion.button
                whileHover={{
                  scale: 1.1,
                  background: "#ff3860",
                  color: "#fff",
                }}
                onClick={() => handleDeleteItem(item.id)}
              >
                Delete
              </motion.button>
            </motion.li>
          ))}
        </ul>
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        style={{
          marginTop: 32,
          background: "#181c24",
          borderRadius: 12,
          boxShadow: "0 0 12px #00fff760",
          padding: "1.5em 2em",
          maxWidth: 700,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <h2
          style={{
            color: "#00fff7",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          Site Analytics
        </h2>
        {analytics ? (
          <>
            <div
              style={{ color: "#39ff14", fontWeight: 600, marginBottom: 12 }}
            >
              Total Visits: {analytics.total}
            </div>
            <div style={{ color: "#00fff7", marginBottom: 8 }}>
              Last 10 Visits:
            </div>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {analytics.last10.map((v, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  style={{
                    background: "#232b39",
                    borderRadius: 7,
                    marginBottom: 8,
                    padding: "0.7em 1em",
                    color: "#eafff7",
                    fontSize: "1em",
                    boxShadow: "0 0 4px #00fff760",
                  }}
                >
                  <div>
                    <b>IP:</b> {v.ip}
                  </div>
                  <div>
                    <b>User Agent:</b>{" "}
                    <span style={{ fontSize: "0.95em", color: "#00fff7" }}>
                      {v.user_agent}
                    </span>
                  </div>
                  <div>
                    <b>Time:</b> {new Date(v.timestamp).toLocaleString()}
                  </div>
                </motion.li>
              ))}
            </ul>
          </>
        ) : (
          <div style={{ color: "#ff3860" }}>No analytics data available.</div>
        )}
      </motion.section>
    </div>
  );
}
