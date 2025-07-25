import React, { useState } from "react";
import { createBlogPost, updateBlogPost } from "../api";
import { BlogPost } from "@shared/types";
import { marked } from "marked";

interface BlogAdminFormProps {
  post?: BlogPost;
  onSuccess?: () => void;
}

export default function BlogAdminForm({ post, onSuccess }: BlogAdminFormProps) {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("jwt") || "";
    try {
      if (post) {
        await updateBlogPost(post.id, { title, content }, token);
      } else {
        await createBlogPost({ title, content }, token);
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
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Markdown Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        required
      />
      <button type="submit" disabled={loading}>
        {post ? "Update" : "Create"} Post
      </button>
      {error && <div style={{ color: "#ff3860" }}>{error}</div>}
      <div style={{ marginTop: 24 }}>
        <h4>Markdown Preview</h4>
        <div
          style={{ background: "#181c24", padding: 16, borderRadius: 8 }}
          dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
        />
      </div>
    </form>
  );
}
