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
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserShield,
  FaBook,
  FaFolderOpen,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaChartLine,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "blog" | "portfolio" | "analytics"
  >("blog");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const [statsRes, postsRes, portfolioRes, analyticsRes] =
          await Promise.all([
            fetch("http://localhost:8000/api/dashboard", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetchBlogPosts(),
            fetchPortfolio(),
            fetch("http://localhost:8000/api/analytics", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        setPosts(await postsRes);
        setPortfolio(await portfolioRes);

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setAnalytics(analyticsData);
        }
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDeletePost = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this blog post?"))
      return;

    const token = localStorage.getItem("jwt") || "";
    try {
      await deleteBlogPost(id, token);
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete blog post");
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this portfolio item?"))
      return;

    const token = localStorage.getItem("jwt") || "";
    try {
      await deletePortfolioItem(id, token);
      setPortfolio(portfolio.filter((i) => i.id !== id));
    } catch (err) {
      alert("Failed to delete portfolio item");
    }
  };

  const refresh = () => {
    fetchBlogPosts().then(setPosts);
    fetchPortfolio().then(setPortfolio);
    setEditingPost(null);
    setEditingItem(null);
    setShowBlogForm(false);
    setShowPortfolioForm(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    window.location.href = "/admin/login";
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="loading-spinner"
          />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-container">
          <FaExclamationTriangle size={48} color="#ff3860" />
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => (window.location.href = "/admin/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-page">
        <div className="error-container">
          <p>No dashboard data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="dashboard-header"
      >
        <div className="header-left">
          <div className="user-info">
            <FaUserShield size={32} className="user-icon" />
            <div>
              <h1>Welcome back, {stats.user.username}!</h1>
              <p className="subtitle">
                Manage your content and monitor analytics
              </p>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="stats-cards">
            <div className="stat-card">
              <FaBook size={24} />
              <div>
                <span className="stat-number">{stats.stats.blogPosts}</span>
                <span className="stat-label">Blog Posts</span>
              </div>
            </div>
            <div className="stat-card">
              <FaFolderOpen size={24} />
              <div>
                <span className="stat-number">
                  {stats.stats.portfolioItems}
                </span>
                <span className="stat-label">Portfolio Items</span>
              </div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="dashboard-tabs"
      >
        <button
          className={`tab-btn ${activeTab === "blog" ? "active" : ""}`}
          onClick={() => setActiveTab("blog")}
        >
          <FaBook size={16} />
          Blog Posts
        </button>
        <button
          className={`tab-btn ${activeTab === "portfolio" ? "active" : ""}`}
          onClick={() => setActiveTab("portfolio")}
        >
          <FaFolderOpen size={16} />
          Portfolio
        </button>
        <button
          className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          <FaChartLine size={16} />
          Analytics
        </button>
      </motion.div>

      {/* Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="dashboard-content"
      >
        <AnimatePresence mode="wait">
          {activeTab === "blog" && (
            <motion.div
              key="blog"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="tab-content"
            >
              <div className="content-header">
                <h2>Blog Posts Management</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="primary-btn"
                  onClick={() => {
                    setEditingPost(null);
                    setShowBlogForm(true);
                  }}
                >
                  <FaPlus size={16} />
                  New Post
                </motion.button>
              </div>

              {showBlogForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="form-overlay"
                >
                  <div className="form-container">
                    <div className="form-header">
                      <h3>{editingPost ? "Edit Post" : "Create New Post"}</h3>
                      <button
                        className="close-btn"
                        onClick={() => {
                          setShowBlogForm(false);
                          setEditingPost(null);
                        }}
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                    <BlogAdminForm
                      post={editingPost || undefined}
                      onSuccess={() => {
                        refresh();
                        setShowBlogForm(false);
                        setEditingPost(null);
                      }}
                    />
                  </div>
                </motion.div>
              )}

              <div className="content-grid">
                {posts.length === 0 ? (
                  <div className="empty-state">
                    <FaBook size={48} />
                    <h3>No blog posts yet</h3>
                    <p>Create your first blog post to get started!</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5 }}
                      className="content-card"
                    >
                      <div className="card-header">
                        <h3>{post.title}</h3>
                        <div className="card-actions">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="action-btn edit"
                            onClick={() => {
                              setEditingPost(post);
                              setShowBlogForm(true);
                            }}
                          >
                            <FaEdit size={14} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="action-btn delete"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <FaTrash size={14} />
                          </motion.button>
                        </div>
                      </div>
                      <div className="card-content">
                        <p>{post.content.substring(0, 150)}...</p>
                      </div>
                      <div className="card-footer">
                        <span className="date">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "portfolio" && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="tab-content"
            >
              <div className="content-header">
                <h2>Portfolio Management</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="primary-btn"
                  onClick={() => {
                    setEditingItem(null);
                    setShowPortfolioForm(true);
                  }}
                >
                  <FaPlus size={16} />
                  New Item
                </motion.button>
              </div>

              {showPortfolioForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="form-overlay"
                >
                  <div className="form-container">
                    <div className="form-header">
                      <h3>{editingItem ? "Edit Item" : "Create New Item"}</h3>
                      <button
                        className="close-btn"
                        onClick={() => {
                          setShowPortfolioForm(false);
                          setEditingItem(null);
                        }}
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                    <PortfolioAdminForm
                      item={editingItem || undefined}
                      onSuccess={() => {
                        refresh();
                        setShowPortfolioForm(false);
                        setEditingItem(null);
                      }}
                    />
                  </div>
                </motion.div>
              )}

              <div className="content-grid">
                {portfolio.length === 0 ? (
                  <div className="empty-state">
                    <FaFolderOpen size={48} />
                    <h3>No portfolio items yet</h3>
                    <p>Add your first portfolio item to showcase your work!</p>
                  </div>
                ) : (
                  portfolio.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5 }}
                      className="content-card"
                    >
                      <div className="card-header">
                        <h3>{item.title}</h3>
                        <div className="card-actions">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="action-btn edit"
                            onClick={() => {
                              setEditingItem(item);
                              setShowPortfolioForm(true);
                            }}
                          >
                            <FaEdit size={14} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="action-btn delete"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <FaTrash size={14} />
                          </motion.button>
                        </div>
                      </div>
                      <div className="card-content">
                        <p>{item.description}</p>
                      </div>
                      <div className="card-footer">
                        <span className="date">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="tab-content"
            >
              <div className="content-header">
                <h2>Site Analytics</h2>
              </div>

              <div className="analytics-container">
                {analytics ? (
                  <>
                    <div className="analytics-summary">
                      <div className="summary-card">
                        <FaChartLine size={32} />
                        <div>
                          <span className="summary-number">
                            {analytics.total}
                          </span>
                          <span className="summary-label">Total Visits</span>
                        </div>
                      </div>
                    </div>

                    <div className="analytics-details">
                      <h3>Recent Visits</h3>
                      <div className="visits-list">
                        {analytics.last10.map((visit, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="visit-card"
                          >
                            <div className="visit-info">
                              <div className="visit-ip">{visit.ip}</div>
                              <div className="visit-time">
                                {new Date(visit.timestamp).toLocaleString()}
                              </div>
                            </div>
                            <div className="visit-user-agent">
                              {visit.user_agent}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <FaChartLine size={48} />
                    <h3>No analytics data available</h3>
                    <p>
                      Analytics will appear here once visitors start coming to
                      your site.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
