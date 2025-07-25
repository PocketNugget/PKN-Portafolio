import React from "react";
import "../App.css";

export default function MainPage() {
  return (
    <main className="main-content">
      {/* Hero Section */}
      <section className="section hero-section">
        <h1 className="hero-title">PocketNugget</h1>
        <h2 className="hero-subtitle">CyberSec Portfolio & Developer</h2>
        <p className="hero-summary">
          Welcome! I’m a passionate developer and security enthusiast. Explore
          my work, skills, and experience below.
        </p>
        <div className="hero-socials">
          {/* Add your social/contact icons here */}
        </div>
      </section>

      {/* About Section */}
      <section className="section about-section">
        <h2>About</h2>
        <p>
          I’m a developer with a love for cybersecurity, open source, and
          automation. I enjoy building robust, secure, and scalable solutions.
        </p>
      </section>

      {/* Skills Section */}
      <section className="section skills-section">
        <h2>Skills</h2>
        <ul className="skills-list">
          <li>JavaScript / TypeScript</li>
          <li>React</li>
          <li>Deno</li>
          <li>Node.js</li>
          <li>Docker</li>
          <li>Linux (Ubuntu)</li>
          <li>Python</li>
          <li>Security Tools</li>
        </ul>
      </section>

      {/* Projects Section */}
      <section className="section projects-section">
        <h2>Projects</h2>
        <p>Check out my latest work on GitHub and other platforms.</p>
        {/* Add project links or summaries here */}
      </section>

      {/* Experience Section */}
      <section className="section experience-section">
        <h2>Experience</h2>
        <ul>
          <li>Freelance Developer & Security Consultant</li>
          <li>Open Source Contributor</li>
          {/* Add more experience as needed */}
        </ul>
      </section>

      {/* Education Section */}
      <section className="section education-section">
        <h2>Education</h2>
        <ul>
          <li>Self-taught, continuous learner</li>
          {/* Add more education as needed */}
        </ul>
      </section>

      {/* Contact Section */}
      <section className="section contact-section">
        <h2>Contact</h2>
        <p>
          Feel free to reach out via email or social media for collaboration,
          consulting, or just to connect!
        </p>
      </section>

      {/* Blog Section */}
      <section className="section blog-section">
        <h2>Blog</h2>
        <p>Read my latest posts on security, development, and tech trends.</p>
        {/* Add blog post previews or links here */}
      </section>

      {/* Footer */}
      <footer className="footer-section">
        <p>
          &copy; {new Date().getFullYear()} PocketNugget. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
