import React, { useEffect, useState } from "react";
import { fetchBlogPosts } from "../api";
import { BlogPost } from "@shared/types";
import { motion } from "framer-motion";
import { FaBookOpen, FaSearch } from "react-icons/fa";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBlogPosts().then(setPosts);
  }, []);

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="blog-page">
      <h1>Blog</h1>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <FaSearch style={{ color: "#00fff7", fontSize: 20 }} />
        <input
          type="text"
          placeholder="Search blog posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: "#181c24",
            color: "#39ff14",
            border: "1.5px solid #00fff7",
            borderRadius: 6,
            padding: "0.5em 1em",
            fontSize: 16,
            width: 280,
            outline: "none",
          }}
          aria-label="Search blog posts"
        />
      </motion.div>
      <section>
        {filtered.length === 0 && (
          <div style={{ color: "#ff3860", marginTop: 24 }}>No posts found.</div>
        )}
        {filtered.map((post, i) => (
          <motion.div
            key={post.id}
            className="blog-post"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.6, type: "spring" }}
            whileHover={{
              scale: 1.025,
              boxShadow: "0 0 32px #39ff14, 0 0 16px #00fff7",
            }}
            style={{ position: "relative" }}
          >
            <FaBookOpen
              size={32}
              style={{
                position: "absolute",
                top: 18,
                right: 24,
                color: "#00fff7",
                filter: "drop-shadow(0 0 8px #00fff7)",
                zIndex: 2,
              }}
            />
            <h2>{post.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: post.html || "" }} />
            <div className="date">
              {new Date(post.created_at).toLocaleString()}
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
