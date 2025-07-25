import React, { useEffect, useRef } from "react";

// SVG paths or use react-icons for tech logos
const icons = [
  {
    name: "JavaScript",
    svg: (
      <svg viewBox="0 0 32 32" width="48" height="48" fill="#f7df1e">
        <rect width="32" height="32" rx="6" />
        <text x="7" y="25" fontSize="18" fontFamily="monospace" fill="#222">
          JS
        </text>
      </svg>
    ),
  },
  {
    name: "Docker",
    svg: (
      <svg viewBox="0 0 32 32" width="48" height="48" fill="#2496ed">
        <rect width="32" height="32" rx="6" />
        <text x="4" y="25" fontSize="18" fontFamily="monospace" fill="#fff">
          🐳
        </text>
      </svg>
    ),
  },
  {
    name: "Ubuntu",
    svg: (
      <svg viewBox="0 0 32 32" width="48" height="48" fill="#e95420">
        <rect width="32" height="32" rx="6" />
        <text x="4" y="25" fontSize="18" fontFamily="monospace" fill="#fff">
          🐧
        </text>
      </svg>
    ),
  },
  {
    name: "Python",
    svg: (
      <svg viewBox="0 0 32 32" width="48" height="48" fill="#3776ab">
        <rect width="32" height="32" rx="6" />
        <text x="4" y="25" fontSize="18" fontFamily="monospace" fill="#ffd43b">
          Py
        </text>
      </svg>
    ),
  },
  {
    name: "Linux",
    svg: (
      <svg viewBox="0 0 32 32" width="48" height="48" fill="#333">
        <rect width="32" height="32" rx="6" />
        <text x="4" y="25" fontSize="18" fontFamily="monospace" fill="#fff">
          🐧
        </text>
      </svg>
    ),
  },
  {
    name: "React",
    svg: (
      <svg viewBox="0 0 32 32" width="48" height="48" fill="#61dafb">
        <rect width="32" height="32" rx="6" />
        <text x="4" y="25" fontSize="18" fontFamily="monospace" fill="#222">
          ⚛️
        </text>
      </svg>
    ),
  },
  {
    name: "Deno",
    svg: (
      <svg viewBox="0 0 32 32" width="48" height="48" fill="#222">
        <rect width="32" height="32" rx="6" />
        <text x="4" y="25" fontSize="18" fontFamily="monospace" fill="#fff">
          🦕
        </text>
      </svg>
    ),
  },
  {
    name: "GitHub",
    svg: (
      <svg viewBox="0 0 32 32" width="48" height="48" fill="#222">
        <rect width="32" height="32" rx="6" />
        <text x="4" y="25" fontSize="18" fontFamily="monospace" fill="#fff">
          🐙
        </text>
      </svg>
    ),
  },
];

const ICON_COUNT = 10;
const ICON_SIZE = 48;

function randomBetween(a: number, b: number) {
  return Math.random() * (b - a) + a;
}

const TechIconsBackground: React.FC = () => {
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let frame = 0;
    let running = true;
    const speeds = Array(ICON_COUNT)
      .fill(0)
      .map(() => randomBetween(0.08, 0.18));
    const angles = Array(ICON_COUNT)
      .fill(0)
      .map(() => randomBetween(0, 2 * Math.PI));
    const radii = Array(ICON_COUNT)
      .fill(0)
      .map(() => randomBetween(80, 180));
    const centers = Array(ICON_COUNT)
      .fill(0)
      .map(() => [randomBetween(0.1, 0.9), randomBetween(0.1, 0.9)]);

    function animate() {
      if (!running) return;
      frame++;
      iconRefs.current.forEach((el, i) => {
        if (!el) return;
        const angle = angles[i] + speeds[i] * frame * 0.01;
        const r = radii[i];
        const [cx, cy] = centers[i];
        const x = window.innerWidth * cx + Math.cos(angle) * r;
        const y = window.innerHeight * cy + Math.sin(angle) * r;
        el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      });
      requestAnimationFrame(animate);
    }
    animate();
    return () => {
      running = false;
    };
  }, []);

  return (
    <div
      className="tech-icons-bg"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      {Array(ICON_COUNT)
        .fill(0)
        .map((_, i) => {
          const icon = icons[i % icons.length];
          return (
            <div
              key={i}
              ref={(el) => (iconRefs.current[i] = el)}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: ICON_SIZE,
                height: ICON_SIZE,
                opacity: 0.13,
                filter: "blur(1.5px)",
                transition: "opacity 0.3s",
                pointerEvents: "none",
              }}
              aria-hidden="true"
            >
              {icon.svg}
            </div>
          );
        })}
    </div>
  );
};

export default TechIconsBackground;
