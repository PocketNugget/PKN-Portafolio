# PKN-Portafolio 🛡️

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Powered by Deno](https://img.shields.io/badge/Powered%20by-Deno-000000?style=for-the-badge&logo=deno)](https://deno.com)
[![Database: SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Containerized with Docker](https://img.shields.io/badge/Containerized-Docker-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Markdown Supported](https://img.shields.io/badge/Markdown-Supported-000000?style=for-the-badge&logo=markdown)](https://daringfireball.net/projects/markdown/)
[![Security First](https://img.shields.io/badge/Security-First-4CAF50?style=for-the-badge&logo=security)](#)

> A modern, full-stack portfolio and blog platform for cybersecurity, AI, and tech professionals. Built with React, Deno, and SQLite. Easily manage your projects, blog, and showcase your expertise.

---

## What is PKN-Portafolio?

**PKN-Portafolio** is a professional portfolio and blog web app designed for cybersecurity specialists, AI researchers, and developers. It features a beautiful dark UI, a full-featured Markdown blog, project/portfolio management, and a secure admin dashboard—all containerized for easy deployment.

---

## Key Features

- **Modern UI:** Cyberpunk-inspired, responsive design
- **Markdown Blog:** Write posts in Markdown, with live preview and full HTML rendering
- **Manual Blog Tags:** Add and filter posts by custom tags (e.g. `Cybersecurity, AI Research, CTF`)
- **Portfolio Projects:** Showcase your best work with images, links, and descriptions
- **Admin Dashboard:** Secure login, create/edit/delete posts and projects
- **JWT Auth:** Secure authentication for admin actions
- **Analytics:** Track visitors, page views, and more
- **Dockerized:** One-command setup for local or production
- **No Contact Form:** No unwanted email collection or newsletter popups

---

## Screenshots

_(Add your screenshots here!)_

1. **Main Page:** Blog, portfolio, and animated hero section
2. **Blog Post:** Full Markdown rendering, tags, and sharing
3. **Admin Dashboard:** Manage posts and projects securely
4. **Links Page:** Modern, card-based social/contact links

---

## Prerequisites

- **Docker** (recommended) or Node.js + Deno for manual setup
- **npm** (for frontend dev)
- **Deno** (for backend dev)

---

## Quickstart ⚡️

### 1. Clone the repository

```bash
git clone <repository-url>
cd PKN-Portafolio
```

### 2. Set up environment variables

```bash
# Copy the environment template
cp env.example .env

# Edit .env with your secure values
# IMPORTANT: Change the default admin password immediately!
```

### 3. Start with Docker (Recommended)

```bash
cd docker
docker-compose up --build -d
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:3000/admin/login

### 3. Local Development (Advanced)

**Backend:**

```bash
cd backend
deno run --allow-net --allow-read --allow-write --allow-env --unstable-fs app.ts
```

**Frontend:**

```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

---

## Admin Setup & Content Management

### Admin Login

- Go to: `http://localhost:3000/admin/login`
- Default admin user is created automatically on first run
- **⚠️ IMPORTANT**: Change the default admin password immediately after first login
- To manage users, see `backend/USER_MANAGEMENT_TEMPLATE.md`

### Creating Blog Posts

1. **Login to the admin panel**
2. **Click "New Post"**
3. **Fill in the form:**
   - **Title**
   - **Content** (Markdown supported)
   - **Tags** (comma-separated, e.g. `Cybersecurity, AI Research, CTF`)
4. **Preview** your post
5. **Save**

### Blog Tags

- Add any tags you want (comma-separated) when creating or editing a post
- Tags appear as clickable filters on the main page and blog page
- Each post displays its tags as stylish inline pills

### Portfolio Projects

- Add/edit projects from the admin dashboard
- Include title, description, links, images, and more

---

## Customization

- **Styling:** Edit `frontend/src/App.css` for global styles and color scheme
- **Content:** All content is managed via the admin dashboard
- **Static Sections:** Edit `MainPage.tsx` for hero/about text

---

## Security & Best Practices

- **JWT authentication** for admin actions
- **CORS protection** on API endpoints
- **Input validation** on all forms
- **SQL injection protection** via parameterized queries
- **Environment variables** for sensitive configuration
- **.gitignore** is set up to protect secrets, database files, and build artifacts

### 🔒 Critical Security Steps

1. **Change Default Passwords**: Immediately change the default admin password after setup
2. **Environment Variables**: Use `.env` file for sensitive configuration (see `env.example`)
3. **User Management**: Copy `backend/USER_MANAGEMENT_TEMPLATE.md` to `backend/USER_MANAGEMENT.md` for local use
4. **Production Deployment**: Use HTTPS, proper firewall rules, and regular security audits

---

## Troubleshooting

- **Port conflicts:** Change ports in `docker/docker-compose.yml`
- **Build errors:** Use `--legacy-peer-deps` for npm install
- **Database issues:** Check `backend/data.db` permissions
- **CORS errors:** Verify frontend origin in backend CORS config
- **Logs:**
  ```bash
  docker-compose logs
  docker-compose logs frontend
  docker-compose logs backend
  ```

---

## License

MIT License

---

## Contact & Support

- **Email:** goben.ca.pkn@hotmail.com
- **GitHub Issues:** Please open an issue for bugs or feature requests

---

**Built with ❤️ by PocketNugget — © 2025**
