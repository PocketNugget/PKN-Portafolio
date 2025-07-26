import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaCalendar,
  FaUser,
  FaShare,
  FaEye,
} from "react-icons/fa";
import { fetchBlogPosts } from "../api";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  created_at: string;
  html: string;
}

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const posts = await fetchBlogPosts();
        const foundPost = posts.find(
          (p: BlogPost) => p.id === parseInt(id || "0")
        );

        if (foundPost) {
          setPost(foundPost);
        } else {
          setError("Blog post not found");
        }
      } catch (err) {
        setError("Failed to load blog post");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  const goBack = () => {
    navigate("/blog");
  };

  if (loading) {
    return (
      <div className="blog-post-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-post-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || "Blog post not found"}</p>
          <button onClick={goBack} className="btn-secondary">
            <FaArrowLeft /> Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-page">
      <div className="blog-post-container">
        {/* Back Button */}
        <motion.button
          className="back-btn"
          onClick={goBack}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaArrowLeft /> Back to Blog
        </motion.button>

        {/* Blog Post Header */}
        <motion.div
          className="blog-post-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="blog-post-title">{post.title}</h1>

          <div className="blog-post-meta">
            <span className="meta-item">
              <FaCalendar />
              {new Date(post.created_at).toLocaleDateString()}
            </span>
            <span className="meta-item">
              <FaUser />
              PocketNugget
            </span>
            <span className="meta-item">
              <FaEye />
              Blog Post
            </span>
            <button className="share-btn">
              <FaShare /> Share
            </button>
          </div>
        </motion.div>

        {/* Blog Post Content */}
        <motion.div
          className="blog-post-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div
            className="content-text"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </motion.div>

        {/* Blog Post Footer */}
        <motion.div
          className="blog-post-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="footer-actions">
            <button onClick={goBack} className="btn-secondary">
              <FaArrowLeft /> Back to Blog
            </button>
            <button className="btn-primary">
              <FaShare /> Share Post
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
