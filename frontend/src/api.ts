const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api";

// Blog
export async function fetchBlogPosts() {
  const res = await fetch(`${API_BASE}/blog`);
  return res.json();
}

export async function fetchBlogPost(id: number) {
  const res = await fetch(`${API_BASE}/blog/${id}`);
  return res.json();
}

export async function createBlogPost(
  data: { title: string; content: string },
  token: string
) {
  const res = await fetch(`${API_BASE}/blog`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateBlogPost(
  id: number,
  data: { title: string; content: string },
  token: string
) {
  const res = await fetch(`${API_BASE}/blog/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteBlogPost(id: number, token: string) {
  const res = await fetch(`${API_BASE}/blog/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

// Portfolio
export async function fetchPortfolio() {
  const res = await fetch(`${API_BASE}/portfolio`);
  return res.json();
}

export async function fetchPortfolioItem(id: number) {
  const res = await fetch(`${API_BASE}/portfolio/${id}`);
  return res.json();
}

export async function createPortfolioItem(
  data: { title: string; description: string; link?: string; image?: string },
  token: string
) {
  const res = await fetch(`${API_BASE}/portfolio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updatePortfolioItem(
  id: number,
  data: { title: string; description: string; link?: string; image?: string },
  token: string
) {
  const res = await fetch(`${API_BASE}/portfolio/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deletePortfolioItem(id: number, token: string) {
  const res = await fetch(`${API_BASE}/portfolio/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

// Auth
export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem("jwt", data.token);
  }
  return data;
}
