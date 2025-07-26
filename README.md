# PKN-Portafolio - Cybersecurity & AI Portfolio

A modern, professional portfolio website for cybersecurity professionals and AI researchers, built with React, TypeScript, and Deno.

## 🚀 Features

- **Modern Design**: Dark theme with cyberpunk aesthetics
- **Responsive Layout**: Works perfectly on all devices
- **Blog System**: Full-featured blog with categories and search
- **Admin Panel**: Content management system
- **Portfolio Showcase**: Professional project display
- **Contact Form**: Integrated contact system
- **Analytics**: Visitor tracking and statistics

## 🏗️ Project Structure

```
PKN-Portafolio/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── App.tsx         # Main app component
│   │   ├── App.css         # Global styles
│   │   └── api.ts          # API integration
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── Dockerfile          # Frontend container
├── backend/                # Deno backend API
│   ├── app.ts             # Server entry point
│   ├── routes.ts          # API routes
│   ├── controllers.ts     # Request handlers
│   ├── db.ts             # Database operations
│   ├── data.db           # SQLite database
│   └── Dockerfile        # Backend container
├── shared/               # Shared TypeScript types
│   └── types.ts         # Common interfaces
├── docker/              # Docker configuration
│   └── docker-compose.yml
└── README.md           # This file
```

## 🛠️ Technology Stack

### Frontend

- **React 18** with TypeScript
- **React Router** for navigation
- **Framer Motion** for animations
- **React Icons** for icons
- **CSS3** with custom properties

### Backend

- **Deno** runtime
- **Oak** web framework
- **SQLite** database
- **JWT** authentication

### Infrastructure

- **Docker** containerization
- **Docker Compose** for orchestration
- **Nginx** for frontend serving

## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd PKN-Portafolio
   ```

2. **Start all services:**

   ```bash
   cd docker
   docker-compose up --build -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:3000/admin/login

### Option 2: Local Development

1. **Install Deno:**

   ```bash
   # macOS
   brew install deno

   # Or download from https://deno.land/
   ```

2. **Start the backend:**

   ```bash
   cd backend
   deno run --allow-net --allow-read --allow-write --allow-env --unstable-fs app.ts
   ```

3. **Start the frontend:**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm start
   ```

## 📝 Content Management

### Admin Panel Access

1. **Navigate to:** http://localhost:3000/admin/login
2. **Set up admin credentials:**
   ```bash
   cd backend
   deno run --allow-read --allow-write set_admin_password.ts
   ```

### Creating Blog Posts

1. **Login to admin panel**
2. **Click "New Post"**
3. **Fill in the form:**
   - **Title**: Your post title
   - **Content**: Write in Markdown format
4. **Preview your post**
5. **Save the post**

### Markdown Support

The blog supports full Markdown including:

````markdown
# Headers

**Bold text**
_Italic text_
`code snippets`

```python
# Code blocks
print("Hello World")
```
````

[Links](https://example.com)
![Images](image-url)

- Lists
- Tables
- And more...

````

### Auto-Categorization

Posts are automatically categorized based on content:
- **Cybersecurity**: Contains "cybersecurity"
- **AI & ML**: Contains "ai" or "machine learning"
- **CTF**: Contains "ctf"
- **Development**: Contains "development"

## 🎨 Customization

### Styling

- **Global styles**: `frontend/src/App.css`
- **CSS Variables**: Defined in `:root` selector
- **Color scheme**: Easily customizable accent colors

### Content

- **Portfolio items**: Manage through admin panel
- **Blog posts**: Create and edit via admin interface
- **Static content**: Edit directly in `MainPage.tsx`

## 🔧 Development

### Adding New Features

1. **Frontend components**: Add to `frontend/src/components/`
2. **Pages**: Add to `frontend/src/pages/`
3. **API endpoints**: Add to `backend/routes.ts`
4. **Database operations**: Add to `backend/controllers.ts`

### Database Schema

```sql
-- Blog posts
CREATE TABLE blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  html TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio items
CREATE TABLE portfolio_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
````

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `docker-compose.yml`
2. **Build errors**: Use `--legacy-peer-deps` for npm install
3. **Database issues**: Check `backend/data.db` permissions
4. **CORS errors**: Verify frontend origin in backend CORS config

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
```

## 📊 Analytics

The admin panel includes:

- **Visitor tracking**
- **Page views**
- **User agent information**
- **IP addresses** (for security analysis)

## 🔒 Security

- **JWT authentication** for admin access
- **CORS protection** on API endpoints
- **Input validation** on all forms
- **SQL injection protection** via parameterized queries

## 📱 Responsive Design

The portfolio is fully responsive and optimized for:

- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (< 768px)

## 🎯 Performance

- **Optimized images** and assets
- **Code splitting** for faster loading
- **Caching** strategies
- **Minified production builds**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions:

- **Email**: goben.ca.pkn@hotmail.com
- **GitHub**: Create an issue in the repository

---

**Built with ❤️ by PocketNugget**
