import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import NavBar from "./components/NavBar";
import MainPage from "./pages/MainPage";
import LinksPage from "./pages/LinksPage";
import BlogPage from "./pages/BlogPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import { ThemeProvider } from "./components/ThemeContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = Boolean(localStorage.getItem("jwt"));
  return isAuth ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

function App() {
  React.useEffect(() => {
    // Matrix rain animation
    const canvas = document.getElementById(
      "matrix-bg"
    ) as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    const fontSize = 18;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);
    const chars =
      "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    function draw() {
      if (!ctx) return;
      ctx.fillStyle = "rgba(26,27,38,0.08)";
      ctx.fillRect(0, 0, width, height);
      ctx.font = fontSize + "px Fira Mono, monospace";
      ctx.fillStyle = "#9ece6a";
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    let animationId: number;
    function animate() {
      draw();
      animationId = requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener("resize", () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });
    return () => cancelAnimationFrame(animationId);
  }, []);
  return (
    <ThemeProvider>
      <Router>
        <canvas id="matrix-bg"></canvas>
        <NavBar />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
