import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaBookOpen,
  FaSearch,
  FaCalendar,
  FaUser,
  FaTags,
  FaArrowRight,
  FaEye,
} from "react-icons/fa";
import { fetchBlogPosts } from "../api";

// Local interface for development - will use shared types in production
interface BlogPost {
  id: number;
  title: string;
  content: string;
  created_at: string;
  html: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogPosts()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  // Extract categories from posts
  const categories = ["all"];
  posts.forEach((post) => {
    if (post.content.toLowerCase().includes("cybersecurity"))
      categories.push("cybersecurity");
    if (
      post.content.toLowerCase().includes("ai") ||
      post.content.toLowerCase().includes("machine learning")
    )
      categories.push("ai-ml");
    if (post.content.toLowerCase().includes("ctf")) categories.push("ctf");
    if (post.content.toLowerCase().includes("development"))
      categories.push("development");
  });
  const uniqueCategories = Array.from(new Set(categories));

  const filtered = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "cybersecurity" &&
        post.content.toLowerCase().includes("cybersecurity")) ||
      (selectedCategory === "ai-ml" &&
        (post.content.toLowerCase().includes("ai") ||
          post.content.toLowerCase().includes("machine learning"))) ||
      (selectedCategory === "ctf" &&
        post.content.toLowerCase().includes("ctf")) ||
      (selectedCategory === "development" &&
        post.content.toLowerCase().includes("development"));
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filtered[0];
  const regularPosts = filtered.slice(1);

  const handleReadMore = (post: BlogPost) => {
    navigate(`/blog/${post.id}`);
  };

  if (loading) {
    return (
      <div className="blog-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page">
      {/* Hero Section */}
      <motion.div
        className="blog-hero"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1>Cybersecurity & AI Blog</h1>
        <p>Insights, tutorials, and research from the field</p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        className="blog-controls"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
      >
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filters">
          {uniqueCategories.map((category) => (
            <button
              key={category}
              className={`category-btn ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === "all"
                ? "All Posts"
                : category === "cybersecurity"
                ? "Cybersecurity"
                : category === "ai-ml"
                ? "AI & ML"
                : category === "ctf"
                ? "CTF"
                : category === "development"
                ? "Development"
                : category}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Featured Post */}
      {featuredPost && (
        <motion.div
          className="featured-post"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <div className="featured-badge">Featured</div>
          <div className="featured-content">
            <h2>{featuredPost.title}</h2>
            <div className="post-meta">
              <span>
                <FaCalendar />{" "}
                {new Date(featuredPost.created_at).toLocaleDateString()}
              </span>
              <span>
                <FaUser /> PocketNugget
              </span>
              <span>
                <FaEye /> Featured Article
              </span>
            </div>
            <div className="post-excerpt">
              {featuredPost.content.length > 300
                ? `${featuredPost.content.substring(0, 300)}...`
                : featuredPost.content}
            </div>
            <button
              className="read-more-btn"
              onClick={() => handleReadMore(featuredPost)}
            >
              Read Full Article <FaArrowRight />
            </button>
          </div>
        </motion.div>
      )}

      {/* Regular Posts Grid */}
      <motion.div
        className="posts-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.7 }}
      >
        <h3>Latest Articles</h3>

        {filtered.length === 0 ? (
          <div className="no-posts">
            <FaBookOpen size={48} />
            <h4>No posts found</h4>
            <p>Try adjusting your search or category filters</p>
          </div>
        ) : (
          <div className="posts-container">
            {regularPosts.map((post, i) => (
              <motion.article
                key={post.id}
                className="post-card"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.6 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 8px 32px rgba(0, 255, 247, 0.2)",
                }}
              >
                <div className="post-header">
                  <h4>{post.title}</h4>
                  <div className="post-meta">
                    <span>
                      <FaCalendar />{" "}
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <span>
                      <FaUser /> PocketNugget
                    </span>
                  </div>
                </div>

                <div
                  className="post-excerpt"
                  dangerouslySetInnerHTML={{
                    __html:
                      (post.html || "").replace(/<[^>]+>/g, "").slice(0, 200) +
                      ((post.html || "").replace(/<[^>]+>/g, "").length > 200
                        ? "..."
                        : ""),
                  }}
                />

                <div className="post-tags">
                  {post.content.toLowerCase().includes("cybersecurity") && (
                    <span className="tag cybersecurity">Cybersecurity</span>
                  )}
                  {post.content.toLowerCase().includes("ai") && (
                    <span className="tag ai">AI</span>
                  )}
                  {post.content.toLowerCase().includes("ctf") && (
                    <span className="tag ctf">CTF</span>
                  )}
                  {post.content.toLowerCase().includes("development") && (
                    <span className="tag development">Development</span>
                  )}
                </div>

                <button
                  className="read-more-btn small"
                  onClick={() => handleReadMore(post)}
                >
                  Read More <FaArrowRight />
                </button>
              </motion.article>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
