import React, { useEffect, useState } from "react";
import { fetchPortfolio } from "../api";
import { PortfolioItem } from "@shared/types";
import { motion } from "framer-motion";
import {
  FaUserSecret,
  FaRobot,
  FaBriefcase,
  FaGraduationCap,
  FaTools,
  FaLanguage,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaGlobe,
  FaChevronRight,
  FaCircle,
  FaPaperPlane,
  FaGlobeAmericas,
} from "react-icons/fa";

const bio = `A proactive and results-driven Cybersecurity Professional and Software Engineer specializing in Security Operations (SOC), Artificial Intelligence (AI) research, and secure application development. Proven leader with hands-on experience in guiding cybersecurity teams in competitive events, managing financial budgets, and engineering full-stack solutions. Adept at leveraging SIEM tools, containerization technologies like Docker, and multiple programming languages to enhance security posture and drive technical innovation.`;

const experience = [
  {
    title: "Junior SOC Analyst | TBSEK",
    date: "April 2025 - Present",
    location: "Puebla, Mexico",
    details: [
      "Leverage industry-standard SIEM tools to proactively monitor, detect, and analyze security threats in real-time.",
      "Collaborate with cross-functional teams to strengthen security protocols and streamline incident response procedures.",
    ],
  },
  {
    title: "Software Engineer Intern | T-Systems",
    date: "April 2024 - July 2024",
    location: "Puebla, Mexico",
    details: [
      "Engineered a full-stack course-tracking platform using Angular and MySQL, serving as a key developer in the project.",
      "Achieved a 40% improvement in internal learning outcomes by designing and implementing a dynamic, user-friendly interface.",
    ],
  },
  {
    title: "Infrastructure Engineer | iOS Lab Development Team",
    date: "August 2024 - Present",
    location: "Puebla, Mexico",
    details: [
      "Deploy and manage containerized server applications using Docker on Raspberry Pi infrastructure.",
      "Automate system processes, including user log management and the generation of technical reports with LaTeX.",
    ],
  },
];

const leadership = [
  {
    title: "President | ACM Student Chapter, UDLAP",
    date: "August 2024 - Present",
    location: "Puebla, Mexico",
    details: [
      "Spearhead financial management, safeguarding assets and meticulously maintaining records of all income and expenditure transactions.",
    ],
  },
  {
    title: "President | Hackztecs Cybersecurity Organization",
    date: "January 2024 - Present",
    location: "Puebla, Mexico",
    details: [
      "Lead and mentor a competitive cybersecurity team, providing hands-on instruction and guidance through 8+ national and international Capture the Flag (CTF) events.",
    ],
  },
  {
    title: "Treasurer | Computer Systems Engineering Interim Board",
    date: "August 2024 - Present",
    location: "Puebla, Mexico",
    details: [
      "Manage and protect financial resources and fixed assets for the department, ensuring detailed records of all transactions.",
    ],
  },
];

const education = [
  {
    degree:
      "Bachelor of Science in Computer Systems Engineering (Expected May 2026)",
    school: "Universidad de las Americas Puebla (UDLAP)",
    location: "Puebla, Mexico",
    details: [
      "Relevant Coursework: Object-Oriented Programming, Operating Systems, Databases, Artificial Intelligence, Machine Learning, Data Structures, Computer Architecture, Networks & Telecommunications.",
    ],
  },
  {
    degree: "Microservices with Node.js and React (January 2025)",
    school: "Udemy",
    details: ["Covered JavaScript, Node.js, React, Docker, and Kubernetes."],
  },
  {
    degree: "Prototype Design (July 2021)",
    school: "UPAEP",
    details: [
      "Covered Concurrent Engineering, Agile Frameworks, Engineering Analysis, and CAD.",
    ],
  },
];

const skills = [
  {
    label: "Python, C, Java, Bash, JavaScript, LaTeX",
    icon: <FaTools />,
    level: "Proficient",
  },
  { label: "PHP, PostgreSQL", icon: <FaTools />, level: "Familiar" },
  {
    label:
      "Docker, VS Code, Linux (Ubuntu, Fedora, Kali-Linux), Metasploit, Burp Suite",
    icon: <FaTools />,
    level: "Proficient",
  },
  { label: "Darktrace Platform", icon: <FaTools />, level: "Familiar" },
];

const languages = [
  { label: "Spanish", level: "Native" },
  { label: "English (C1+)", level: "Professional Proficiency" },
  { label: "French (A2)", level: "Limited Working Proficiency" },
];

const socials = [
  {
    icon: <FaEnvelope />,
    label: "Email",
    href: "mailto:goben.ca.pkn@hotmail.com",
    color: "#00fff7",
  },
  {
    icon: <FaPhone />,
    label: "Phone",
    href: "tel:+522227155667",
    color: "#39ff14",
  },
  {
    icon: <FaGithub />,
    label: "GitHub: goben-diego",
    href: "https://github.com/goben-diego",
    color: "#fff",
  },
  {
    icon: <FaGithub />,
    label: "GitHub: PocketNugget",
    href: "https://github.com/PocketNugget",
    color: "#fff",
  },
  {
    icon: <FaInstagram />,
    label: "Instagram",
    href: "https://www.instagram.com/",
    color: "#ff39a6",
  },
  {
    icon: <FaLinkedin />,
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    color: "#00aaff",
  },
];

const projects = [
  {
    title: "Published AI Research: Performance Analysis of Generative Models",
    date: "October 2024",
    location: "Springer",
    description: `Co-authored the peer-reviewed publication: "Easy for Us, Complex for AI: Assessing the Coherence of Generated Realistic Images". Analyzed and benchmarked metrics to evaluate the realism of images generated by advanced AI models, including GANs, Transformers, and Diffusion Models.`,
    link: "https://link.springer.com/your-publication-link",
  },
  {
    title: "Global Capture the Flag (CTF) Competition: Offensive Security",
    date: "March 2025",
    location: "Hack the Box",
    description: `Achieved Top 3.5% worldwide placement in the Hack the Box Cyber Apocalypse CTF. Directed and mentored team members in advanced offensive security disciplines, including cryptography, web exploitation, and digital forensics.`,
    link: "https://www.hackthebox.com/ctf-results",
  },
  {
    title: "iOS Application Development: WayZT App",
    date: "Feb - Mar 2024",
    location: "Puebla, Mexico",
    description: `Spearheaded the development of a 1st place award-winning iOS application in a competitive Swift UI Hackathon. Implemented a machine learning model for waste classification and integrated MapView for geolocation of recycling centers.`,
    link: "https://github.com/PocketNugget/WayZT",
  },
  {
    title: "Hacking & Exploit Development: CTF-Writeups Repository",
    date: "Jan 2025",
    location: "GitHub",
    description: `Developed and curated a public repository of solutions for cybersecurity challenges. Authored detailed writeups on topics including Cross-Site Scripting (XSS), Android application analysis, and binary exploitation.`,
    link: "https://github.com/PocketNugget/CTF-Writeups",
  },
];

const translations = {
  en: {
    about: "About Me",
    contact: "Contact Me",
    portfolio: "Portfolio & Projects",
    send: "Send",
    name: "Name",
    email: "Email",
    message: "Message",
    searchBlog: "Search blog posts...",
    notFound: "No posts found.",
  },
  es: {
    about: "Sobre Mí",
    contact: "Contáctame",
    portfolio: "Portafolio y Proyectos",
    send: "Enviar",
    name: "Nombre",
    email: "Correo electrónico",
    message: "Mensaje",
    searchBlog: "Buscar entradas del blog...",
    notFound: "No se encontraron publicaciones.",
  },
};

export default function MainPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [contact, setContact] = useState({ name: "", email: "", message: "" });
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSent, setContactSent] = useState(false);
  const [lang, setLang] = useState<"en" | "es">(
    () => (localStorage.getItem("lang") as "en" | "es") || "en"
  );
  const t = translations[lang];

  useEffect(() => {
    fetchPortfolio().then(setPortfolio);
  }, []);

  function handleContactChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setContact({ ...contact, [e.target.name]: e.target.value });
    setContactError(null);
  }

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.name || !contact.email || !contact.message) {
      setContactError("Please fill in all fields.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact.email)) {
      setContactError("Please enter a valid email address.");
      return;
    }
    setContactError(null);
    setContactSent(true);
    const subject = encodeURIComponent(
      `Portfolio Contact from ${contact.name}`
    );
    const body = encodeURIComponent(
      `Name: ${contact.name}\nEmail: ${contact.email}\n\n${contact.message}`
    );
    window.open(
      `mailto:goben.ca.pkn@hotmail.com?subject=${subject}&body=${body}`
    );
    setTimeout(() => setContactSent(false), 4000);
    setContact({ name: "", email: "", message: "" });
  }

  function toggleLang() {
    setLang((l) => {
      const next = l === "en" ? "es" : "en";
      localStorage.setItem("lang", next);
      return next;
    });
  }

  return (
    <div
      className="main-page"
      style={{ position: "relative", overflow: "hidden" }}
      aria-label="PocketNugget Portfolio Main Page"
    >
      <button
        onClick={toggleLang}
        aria-label={lang === "en" ? "Cambiar a español" : "Switch to English"}
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          zIndex: 10,
          background: "none",
          border: "none",
          color: "#00fff7",
          fontSize: 22,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <FaGlobeAmericas /> {lang === "en" ? "ES" : "EN"}
      </button>
      {/* Animated SVG cyberpunk background */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
        viewBox="0 0 1440 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cyberpunk" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00fff7" />
            <stop offset="100%" stopColor="#39ff14" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0,160L80,170.7C160,181,320,203,480,197.3C640,192,800,160,960,133.3C1120,107,1280,85,1360,74.7L1440,64V320H1360C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320H0Z"
          fill="url(#cyberpunk)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          style={{ opacity: 0.18 }}
        />
      </svg>
      {/* Animated hero section */}
      <motion.section
        className="hero"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          zIndex: 1,
          marginTop: 32,
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        <FaUserSecret
          size={64}
          style={{ color: "#00fff7", filter: "drop-shadow(0 0 8px #00fff7)" }}
        />
        <FaRobot
          size={48}
          style={{
            color: "#39ff14",
            marginLeft: 16,
            filter: "drop-shadow(0 0 8px #39ff14)",
          }}
        />
        <h1 style={{ fontSize: "2.8rem", margin: "0.5em 0" }}>PocketNugget</h1>
        <div
          style={{
            fontSize: "1.3rem",
            color: "#00fff7",
            textShadow: "0 0 8px #00fff7",
          }}
        >
          Cybersecurity Professional & AI Researcher
        </div>
      </motion.section>
      <svg
        width="100%"
        height="32"
        viewBox="0 0 1440 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ zIndex: 1 }}
      >
        <path
          d="M0,16L80,10.7C160,5,320,-5,480,0C640,5,800,27,960,26.7C1120,27,1280,5,1360,-5.3L1440,-16V32H1360C1280,32,1120,32,960,32C800,32,640,32,480,32C320,32,160,32,80,32H0Z"
          fill="#181c24"
        />
      </svg>
      {/* About/Professional Info Section */}
      <motion.section
        className="about"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        style={{
          zIndex: 1,
          width: "100%",
          maxWidth: 900,
          margin: "0 auto",
          marginBottom: 32,
        }}
        aria-label="About and Professional Info"
      >
        <h2
          id="about-heading"
          style={{ display: "flex", alignItems: "center", gap: 12 }}
        >
          <FaUserSecret aria-hidden="true" /> {t.about}
        </h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ fontSize: "1.1rem", color: "#fff", marginBottom: 24 }}
        >
          {bio}
        </motion.p>
        {/* Socials/Contact */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 18,
            marginBottom: 24,
          }}
        >
          {socials.map((s, i) => (
            <motion.a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{
                scale: 1.15,
                color: s.color,
                textShadow: `0 0 8px ${s.color}`,
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: s.color,
                fontSize: 18,
                textDecoration: "none",
                fontWeight: 500,
                transition: "color 0.2s",
                borderRadius: 6,
                padding: "0.3em 0.7em",
                background: "rgba(24,28,36,0.7)",
              }}
            >
              {s.icon} {s.label}
            </motion.a>
          ))}
        </div>
        <div
          className="about-cards"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 32,
            justifyContent: "space-between",
          }}
        >
          {/* Experience Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            style={{ flex: 1, minWidth: 260 }}
          >
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FaBriefcase /> Experience
            </h3>
            <ul
              style={{
                paddingLeft: 0,
                listStyle: "none",
                position: "relative",
              }}
            >
              {experience.map((exp, i) => (
                <motion.li
                  key={exp.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  style={{
                    marginBottom: 18,
                    background: "#181c24",
                    borderRadius: 8,
                    padding: 12,
                    boxShadow: "0 0 8px #00fff760",
                    position: "relative",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <FaCircle
                    size={12}
                    style={{
                      color: "#00fff7",
                      marginTop: 6,
                      flexShrink: 0,
                      filter: "drop-shadow(0 0 4px #00fff7)",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        color: "#39ff14",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {exp.title}{" "}
                      <FaChevronRight size={14} style={{ color: "#00fff7" }} />
                    </div>
                    <div style={{ fontSize: "0.95em", color: "#00fff7" }}>
                      {exp.date} | {exp.location}
                    </div>
                    <ul
                      style={{
                        margin: "0.5em 0 0 1em",
                        color: "#fff",
                        fontSize: "1em",
                      }}
                    >
                      {exp.details.map((d, j) => (
                        <li key={j}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          {/* Leadership Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            style={{ flex: 1, minWidth: 260 }}
          >
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FaUserSecret /> Leadership
            </h3>
            <ul
              style={{
                paddingLeft: 0,
                listStyle: "none",
                position: "relative",
              }}
            >
              {leadership.map((lead, i) => (
                <motion.li
                  key={lead.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  style={{
                    marginBottom: 18,
                    background: "#181c24",
                    borderRadius: 8,
                    padding: 12,
                    boxShadow: "0 0 8px #39ff1460",
                    position: "relative",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <FaCircle
                    size={12}
                    style={{
                      color: "#39ff14",
                      marginTop: 6,
                      flexShrink: 0,
                      filter: "drop-shadow(0 0 4px #39ff14)",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        color: "#39ff14",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {lead.title}{" "}
                      <FaChevronRight size={14} style={{ color: "#00fff7" }} />
                    </div>
                    <div style={{ fontSize: "0.95em", color: "#00fff7" }}>
                      {lead.date} | {lead.location}
                    </div>
                    <ul
                      style={{
                        margin: "0.5em 0 0 1em",
                        color: "#fff",
                        fontSize: "1em",
                      }}
                    >
                      {lead.details.map((d, j) => (
                        <li key={j}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
        {/* Education & Skills Timeline */}
        <div
          className="about-cards"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 32,
            marginTop: 32,
            justifyContent: "space-between",
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            style={{ flex: 1, minWidth: 260 }}
          >
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FaGraduationCap /> Education
            </h3>
            <ul
              style={{
                paddingLeft: 0,
                listStyle: "none",
                position: "relative",
              }}
            >
              {education.map((edu, i) => (
                <motion.li
                  key={edu.degree}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  style={{
                    marginBottom: 18,
                    background: "#181c24",
                    borderRadius: 8,
                    padding: 12,
                    boxShadow: "0 0 8px #00fff760",
                    position: "relative",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <FaCircle
                    size={12}
                    style={{
                      color: "#00fff7",
                      marginTop: 6,
                      flexShrink: 0,
                      filter: "drop-shadow(0 0 4px #00fff7)",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        color: "#39ff14",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {edu.degree}{" "}
                      <FaChevronRight size={14} style={{ color: "#00fff7" }} />
                    </div>
                    <div style={{ fontSize: "0.95em", color: "#00fff7" }}>
                      {edu.school}
                      {edu.location ? ` | ${edu.location}` : ""}
                    </div>
                    <ul
                      style={{
                        margin: "0.5em 0 0 1em",
                        color: "#fff",
                        fontSize: "1em",
                      }}
                    >
                      {edu.details.map((d, j) => (
                        <li key={j}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            style={{ flex: 1, minWidth: 260 }}
          >
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FaTools /> Skills
            </h3>
            <ul
              style={{
                paddingLeft: 0,
                listStyle: "none",
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {skills.map((skill, i) => (
                <motion.li
                  key={skill.label + i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.08 }}
                  style={{
                    marginBottom: 12,
                    background: "#181c24",
                    borderRadius: 8,
                    padding: 10,
                    boxShadow: "0 0 6px #00fff760",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                  whileHover={{
                    scale: 1.08,
                    background: "#232b39",
                    color: "#39ff14",
                  }}
                >
                  <span>{skill.icon}</span> <span>{skill.label}</span>{" "}
                  <span
                    style={{
                      color: "#00fff7",
                      marginLeft: "auto",
                      fontSize: "0.95em",
                    }}
                  >
                    {skill.level}
                  </span>
                </motion.li>
              ))}
            </ul>
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 24,
              }}
            >
              <FaLanguage /> Languages
            </h3>
            <ul
              style={{
                paddingLeft: 0,
                listStyle: "none",
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {languages.map((lang, i) => (
                <motion.li
                  key={lang.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.08 }}
                  style={{
                    marginBottom: 10,
                    background: "#181c24",
                    borderRadius: 8,
                    padding: 8,
                    boxShadow: "0 0 4px #00fff760",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                  whileHover={{
                    scale: 1.08,
                    background: "#232b39",
                    color: "#00fff7",
                  }}
                >
                  <span>{lang.label}</span>{" "}
                  <span
                    style={{
                      color: "#00fff7",
                      marginLeft: "auto",
                      fontSize: "0.95em",
                    }}
                  >
                    {lang.level}
                  </span>
                </motion.li>
              ))}
            </ul>
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 24,
              }}
            >
              <FaMapMarkerAlt /> Location
            </h3>
            <motion.a
              href="https://goo.gl/maps/6Qw6Qw6Qw6Qw6Qw6A"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{
                scale: 1.08,
                color: "#00fff7",
                textShadow: "0 0 8px #00fff7",
              }}
              style={{
                color: "#00fff7",
                fontSize: "1.1em",
                marginBottom: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Puebla, Mexico <FaGlobe />
            </motion.a>
          </motion.div>
        </div>
      </motion.section>
      <motion.section
        className="contact-form-section"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        style={{
          zIndex: 1,
          width: "100%",
          maxWidth: 600,
          margin: "2.5em auto 0 auto",
          background: "#181c24",
          borderRadius: 14,
          boxShadow: "0 0 16px #00fff760",
          padding: "2em 2em 2.5em 2em",
        }}
        aria-label="Contact Form"
      >
        <h2
          id="contact-heading"
          style={{ display: "flex", alignItems: "center", gap: 12 }}
        >
          <FaPaperPlane aria-hidden="true" /> {t.contact}
        </h2>
        <form
          onSubmit={handleContactSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
          aria-labelledby="contact-heading"
        >
          <label
            htmlFor="contact-name"
            style={{ color: "#00fff7", fontWeight: 500 }}
          >
            {t.name}
          </label>
          <input
            id="contact-name"
            type="text"
            name="name"
            placeholder={t.name}
            value={contact.name}
            onChange={handleContactChange}
            required
            aria-required="true"
            aria-label="Your Name"
          />
          <label
            htmlFor="contact-email"
            style={{ color: "#00fff7", fontWeight: 500 }}
          >
            {t.email}
          </label>
          <input
            id="contact-email"
            type="email"
            name="email"
            placeholder={t.email}
            value={contact.email}
            onChange={handleContactChange}
            required
            aria-required="true"
            aria-label="Your Email"
          />
          <label
            htmlFor="contact-message"
            style={{ color: "#00fff7", fontWeight: 500 }}
          >
            {t.message}
          </label>
          <textarea
            id="contact-message"
            name="message"
            placeholder={t.message}
            value={contact.message}
            onChange={handleContactChange}
            rows={5}
            required
            aria-required="true"
            aria-label="Your Message"
          />
          <motion.button
            type="submit"
            whileHover={{
              scale: 1.08,
              background: "#00fff7",
              color: "#0f111a",
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontWeight: 600,
              fontSize: 18,
              justifyContent: "center",
            }}
            disabled={contactSent}
            aria-label={t.send}
          >
            <FaPaperPlane aria-hidden="true" /> {t.send}
          </motion.button>
          {contactError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: "#ff3860", marginTop: 8 }}
              role="alert"
            >
              {contactError}
            </motion.div>
          )}
          {contactSent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: "#39ff14", marginTop: 8 }}
              role="status"
            >
              Message window opened! If your email client did not open, please
              email me directly.
            </motion.div>
          )}
        </form>
      </motion.section>
      {/* Portfolio/Projects Section */}
      <section
        className="portfolio"
        style={{ zIndex: 1 }}
        aria-labelledby="projects-heading"
      >
        <h2 id="projects-heading">{t.portfolio}</h2>
        {projects.slice(0, 3).map((item, i) => (
          <motion.div
            key={item.title}
            className="portfolio-item"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.7 }}
            whileHover={{
              scale: 1.03,
              boxShadow: "0 0 32px #39ff14, 0 0 16px #00fff7",
            }}
            style={{ position: "relative" }}
          >
            <h3>{item.title}</h3>
            <div
              style={{ color: "#00fff7", fontSize: "1.05em", marginBottom: 4 }}
            >
              {item.date} | {item.location}
            </div>
            <p>{item.description}</p>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#39ff14", fontWeight: 600 }}
              >
                View Project
              </a>
            )}
          </motion.div>
        ))}
        {projects.length > 3 && (
          <div style={{ color: "#00fff7", marginTop: 12 }}>
            See more in the full portfolio or GitHub.
          </div>
        )}
      </section>
    </div>
  );
}
