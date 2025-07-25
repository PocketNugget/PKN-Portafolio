import React, { useState } from "react";
import { createPortfolioItem, updatePortfolioItem } from "../api";
import { PortfolioItem } from "@shared/types";
import { marked } from "marked";

interface PortfolioAdminFormProps {
  item?: PortfolioItem;
  onSuccess?: () => void;
}

export default function PortfolioAdminForm({
  item,
  onSuccess,
}: PortfolioAdminFormProps) {
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [link, setLink] = useState(item?.link || "");
  const [image, setImage] = useState(item?.image || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("jwt") || "";
    try {
      if (item) {
        await updatePortfolioItem(
          item.id,
          { title, description, link, image },
          token
        );
      } else {
        await createPortfolioItem({ title, description, link, image }, token);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="portfolio-admin-form">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Description (Markdown supported)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={5}
        required
      />
      <input
        type="url"
        placeholder="Project Link (optional)"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
      <input
        type="text"
        placeholder="Image URL (optional)"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />
      <label style={{ color: "#00fff7", fontWeight: 500, marginTop: 8 }}>
        Upload Image
      </label>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image && (
        <img
          src={image}
          alt="Preview"
          style={{
            maxWidth: 180,
            margin: "1em 0",
            borderRadius: 8,
            boxShadow: "0 0 8px #00fff760",
          }}
        />
      )}
      <button type="submit" disabled={loading}>
        {item ? "Update" : "Create"} Item
      </button>
      {error && <div style={{ color: "#ff3860" }}>{error}</div>}
      <div style={{ marginTop: 24 }}>
        <h4>Description Preview</h4>
        <div
          style={{ background: "#181c24", padding: 16, borderRadius: 8 }}
          dangerouslySetInnerHTML={{ __html: marked.parse(description) }}
        />
      </div>
    </form>
  );
}
