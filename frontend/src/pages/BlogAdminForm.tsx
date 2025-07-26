import React, { useState } from "react";
import { createBlogPost, updateBlogPost } from "../api";
import { BlogPost } from "@shared/types";
import { marked } from "marked";
import { useEffect } from "react";
import { FaSave, FaEye, FaTimes } from "react-icons/fa";

interface BlogAdminFormProps {
  post?: BlogPost;
  onSuccess?: () => void;
}

export default function BlogAdminForm({ post, onSuccess }: BlogAdminFormProps) {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [htmlPreview, setHtmlPreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [tags, setTags] = useState(post?.tags || "");

  useEffect(() => {
    const parseResult = marked.parse(content);
    if (parseResult instanceof Promise) {
      parseResult.then(setHtmlPreview);
    } else {
      setHtmlPreview(parseResult);
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("jwt") || "";
    try {
      if (post) {
        await updateBlogPost(post.id, { title, content, tags }, token);
      } else {
        await createBlogPost({ title, content, tags }, token);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="blog-admin-form">
      <div className="form-body">
        <div className="form-section">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            placeholder="Enter blog post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <div className="form-section">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            id="tags"
            type="text"
            placeholder="e.g. Cybersecurity, AI Research, CTF"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-section">
          <div className="section-header">
            <label htmlFor="content">Content (Markdown)</label>
            <button
              type="button"
              className="preview-toggle"
              onClick={() => setShowPreview(!showPreview)}
            >
              <FaEye size={14} />
              {showPreview ? " Hide Preview" : " Show Preview"}
            </button>
          </div>
          <textarea
            id="content"
            placeholder="Write your blog post content in Markdown..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            required
            className="form-textarea"
          />
        </div>

        {showPreview && (
          <div className="form-section">
            <label>Preview</label>
            <div className="markdown-preview">
              <div
                className="preview-content"
                dangerouslySetInnerHTML={{ __html: htmlPreview }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <FaTimes size={14} />
            {error}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            <FaSave size={14} />
            {loading ? "Saving..." : post ? "Update Post" : "Create Post"}
          </button>
        </div>
      </div>
    </form>
  );
}
