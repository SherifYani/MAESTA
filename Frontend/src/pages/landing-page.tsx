"use client";

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/landing-page.css";

/**
 * Job listing data type.
 */
type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
};

/**
 * User testimonial data type.
 */
type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  content: string;
};

/**
 * Platform feature data type.
 */
type Feature = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

/**
 * Pricing plan data type.
 */
type PricingPlan = {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

/**
 * Button component props interface.
 */
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  onClick?: () => void;
}

/**
 * Reusable button component with multiple style variants.
 * @param {ButtonProps} props - Button component props.
 * @returns {JSX.Element} Styled button element.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", className = "", onClick }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className={`landing__cta-btn landing__cta-btn--${variant} ${className}`.trim()}>
      {children}
    </button>
  )
);

Button.displayName = "Button";

/**
 * Main landing page component with hero, features, pricing, and testimonials sections.
 * @returns {React.ReactElement} The rendered landing page.
 */
export default function LandingPage(): React.ReactElement {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Updates scroll position state on window scroll.
     */
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const jobs: Job[] = [
    {
      id: "senior-react-developer",
      title: "Senior React Developer",
      company: "TechFlow Inc",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$140K - $180K",
    },
    {
      id: "ux-ui-designer",
      title: "UX/UI Designer",
      company: "Creative Studios",
      location: "Remote",
      type: "Full-time",
      salary: "$100K - $130K",
    },
    {
      id: "product-manager",
      title: "Product Manager",
      company: "StartupHub",
      location: "New York, NY",
      type: "Full-time",
      salary: "$120K - $160K",
    },
    {
      id: "devops-engineer",
      title: "DevOps Engineer",
      company: "CloudTech Solutions",
      location: "Austin, TX",
      type: "Contract",
      salary: "$130K - $170K",
    },
  ];

  const testimonials: Testimonial[] = [
    {
      id: "alex-chen",
      name: "Alex Chen",
      role: "Found job in 2 weeks",
      company: "Senior Developer at Google",
      avatar: "👨‍💼",
      content:
        "maesta made my job search incredibly easy. I found my dream role without any hassle!",
    },
    {
      id: "sarah-martinez",
      name: "Sarah Martinez",
      role: "Career switcher",
      company: "UX Designer at Adobe",
      avatar: "👩‍💼",
      content:
        "The platform is intuitive and the job matches are spot on. Highly recommend!",
    },
  ];

  const features: Feature[] = [
    {
      id: "smart-matching",
      icon: "🎯",
      title: "Smart Matching",
      description:
        "AI-powered algorithm finds jobs that match your skills and goals perfectly",
    },
    {
      id: "quick-apply",
      icon: "⚡",
      title: "Quick Apply",
      description:
        "Apply to jobs with one click using your profile information",
    },
    {
      id: "salary-insights",
      icon: "📊",
      title: "Salary Insights",
      description: "See real salary data and compensation packages upfront",
    },
  ];

  const pricingPlans: PricingPlan[] = [
    {
      id: "free",
      name: "Job Seeker Free",
      price: "Free",
      description: "Perfect for exploring opportunities",
      features: ["Unlimited job search", "5 applications/day", "Resume upload"],
      cta: "Get Started",
    },
    {
      id: "premium",
      name: "Premium",
      price: "$9.99",
      description: "For serious job hunters",
      features: [
        "Unlimited applications",
        "Advanced job alerts",
        "Salary negotiation guide",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
  ];

  /**
   * Smoothly scrolls to an element by its ID.
   * @param {string} id - The target element ID.
   */
  const scrollToId = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="landing" data-scroll-y={Math.round(scrollY)}>
      <a className="landing__skip-link" href="#main-content">
        Skip to content
      </a>

      <div
        className="landing__parallax"
        aria-hidden
        style={{
          ...({
            ["--scrollY" as string]: `${scrollY * 0.03}px`,
          } as React.CSSProperties),
        }}>
        <div className="landing__orb landing__orb--1" aria-hidden />
        <div className="landing__orb landing__orb--2" aria-hidden />
        <div className="landing__orb landing__orb--3" aria-hidden />
        <div className="landing__grid-bg" aria-hidden />
        <div className="landing__nebula" aria-hidden />

        <div className="landing__stars" aria-hidden>
          <div
            className="landing__shooting-star landing__shooting-star--1"
            aria-hidden
          />
          <div
            className="landing__shooting-star landing__shooting-star--2"
            aria-hidden
          />
          <div
            className="landing__shooting-star landing__shooting-star--3"
            aria-hidden
          />
        </div>
      </div>

      <nav className="landing__nav" role="navigation" aria-label="Main">
        <div className="landing__nav-container">
          <div
            className="landing__logo"
            role="button"
            tabIndex={0}
            onClick={() => navigate("/")}
            onKeyDown={(e) => e.key === "Enter" && navigate("/")}
            aria-label="Go to homepage">
            <span className="landing__logo-text">MAESTA</span>
          </div>

          <button
            className="landing__mobile-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((s) => !s)}
            aria-label="Toggle menu">
            <span />
            <span />
            <span />
          </button>

          <div
            id="primary-navigation"
            className={`landing__nav-links ${
              menuOpen ? "landing__nav-links--open" : ""
            }`}
            role="menu">
            <a role="menuitem" href="#jobs" onClick={() => scrollToId("jobs")}>
              Jobs
            </a>
            <a
              role="menuitem"
              href="#features"
              onClick={() => scrollToId("features")}>
              Features
            </a>
            <a
              role="menuitem"
              href="#pricing"
              onClick={() => scrollToId("pricing")}>
              Pricing
            </a>
            <a
              role="menuitem"
              href="#testimonials"
              onClick={() => scrollToId("testimonials")}>
              Reviews
            </a>
          </div>

          <div className="landing__nav-actions">
            <Link
              to="/login"
              className="landing__nav-login"
              aria-label="Login to your account">
              Login
            </Link>
            <Button variant="primary" onClick={() => navigate("/register")}>
              Register
            </Button>
          </div>
        </div>
      </nav>

      <main id="main-content">
        <section className="landing__hero" aria-labelledby="hero-heading">
          <div className="landing__hero-content">
            <p className="landing__badge">Your next opportunity awaits</p>
            <h1 id="hero-heading" className="landing__hero-title">
              Find Your Dream Job
            </h1>
            <p className="landing__hero-subtitle">
              Discover opportunities at top tech companies. Smart matching,
              quick apply, and real salaries. Your next great career move is
              just a few clicks away.
            </p>

            <div className="landing__hero-btns">
              <Button variant="primary" onClick={() => scrollToId("jobs")}>
                Start Searching
              </Button>
              <Button
                variant="secondary"
                onClick={() => scrollToId("features")}>
                Learn More
              </Button>
            </div>

            <ul className="landing__hero-stats" aria-hidden>
              <li>
                <span className="landing__stat-value">50K+</span>
                <span className="landing__stat-label">Active Jobs</span>
              </li>
              <li>
                <span className="landing__stat-value">1000+</span>
                <span className="landing__stat-label">Companies</span>
              </li>
              <li>
                <span className="landing__stat-value">95%</span>
                <span className="landing__stat-label">Success Rate</span>
              </li>
            </ul>
          </div>
        </section>

        <section
          id="jobs"
          className="landing__jobs"
          aria-labelledby="jobs-heading">
          <h2 id="jobs-heading" className="landing__section-title">
            Featured Opportunities
          </h2>
          <div className="landing__jobs-grid">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="landing__job-card"
                aria-labelledby={`${job.id}-title`}>
                <header className="landing__job-header">
                  <h3 id={`${job.id}-title`}>{job.title}</h3>
                  <span className="landing__job-type">{job.type}</span>
                </header>
                <p className="landing__job-company">{job.company}</p>
                <p className="landing__job-location">📍 {job.location}</p>
                {job.salary && (
                  <p className="landing__job-salary">{job.salary}</p>
                )}
                <div className="landing__job-actions">
                  <Button
                    variant="secondary"
                    onClick={() => alert(`Open: ${job.title}`)}>
                    View Details
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="features"
          className="landing__features"
          aria-labelledby="features-heading">
          <h2 id="features-heading" className="landing__section-title">
            Why Choose maesta
          </h2>
          <div className="landing__features-grid">
            {features.map((f) => (
              <div key={f.id} className="landing__feature-card">
                <div className="landing__feature-icon" aria-hidden>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="landing__success" aria-labelledby="impact-heading">
          <h2 id="impact-heading" className="landing__section-title">
            Our Impact
          </h2>
          <div className="landing__success-grid">
            <div className="landing__success-card">
              <div className="landing__success-icon">🚀</div>
              <h3>TechFlow Hiring</h3>
              <div className="landing__success-result">500+ Hires</div>
              <p className="landing__success-desc">
                Found top engineering talent in weeks, not months
              </p>
            </div>
            <div className="landing__success-card">
              <div className="landing__success-icon">😊</div>
              <h3>Talent Satisfaction</h3>
              <div className="landing__success-result">95% Happy</div>
              <p className="landing__success-desc">
                95% of job seekers find roles in under 30 days
              </p>
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="landing__pricing"
          aria-labelledby="pricing-heading">
          <h2 id="pricing-heading" className="landing__section-title">
            Simple Pricing
          </h2>
          <div className="landing__pricing-grid">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`landing__pricing-card ${
                  plan.highlighted ? "landing__pricing-card--highlighted" : ""
                }`}>
                <h3>{plan.name}</h3>
                <p className="landing__plan-desc">{plan.description}</p>
                <div className="landing__plan-price">{plan.price}</div>
                <Button variant={plan.highlighted ? "primary" : "secondary"}>
                  {plan.cta}
                </Button>
                <ul className="landing__plan-features">
                  {plan.features.map((f, idx) => (
                    <li key={idx}>
                      <span className="landing__check">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section
          id="testimonials"
          className="landing__testimonials"
          aria-labelledby="testimonials-heading">
          <h2 id="testimonials-heading" className="landing__section-title">
            Success Stories From Our Users
          </h2>
          <div className="landing__testimonials-grid">
            {testimonials.map((t) => (
              <blockquote key={t.id} className="landing__testimonial-card">
                <footer className="landing__testimonial-header">
                  <div className="landing__testimonial-avatar" aria-hidden>
                    {t.avatar}
                  </div>
                  <div className="landing__testimonial-info">
                    <h4>{t.name}</h4>
                    <p className="landing__testimonial-role">
                      {t.role} — {t.company}
                    </p>
                  </div>
                </footer>
                <p className="landing__testimonial-content">{`"${t.content}"`}</p>
                <div className="landing__testimonial-rating" aria-hidden>
                  ⭐⭐⭐⭐⭐
                </div>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="landing__cta-section">
          <h2>Ready to find your perfect role?</h2>
          <p>
            Join thousands of professionals who found their dream job on maesta
          </p>
          <Button
            variant="primary"
            className="landing__cta-btn--large"
            onClick={() => scrollToId("jobs")}>
            Start Your Search
          </Button>
        </section>

        <footer className="landing__footer">
          <div className="landing__footer-content">
            <div className="landing__footer-section">
              <h4>For Job Seekers</h4>
              <ul>
                <li>
                  <a href="#jobs">Browse Jobs</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
                <li>
                  <a href="#guide">Career Guide</a>
                </li>
                <li>
                  <a href="#resources">Resources</a>
                </li>
              </ul>
            </div>
            <div className="landing__footer-section">
              <h4>For Companies</h4>
              <ul>
                <li>
                  <a href="#hiring">Start Hiring</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#contact">Contact Sales</a>
                </li>
              </ul>
            </div>
            <div className="landing__footer-section">
              <h4>Company</h4>
              <ul>
                <li>
                  <a href="#about">About Us</a>
                </li>
                <li>
                  <a href="#blog">Blog</a>
                </li>
                <li>
                  <a href="#careers">Careers</a>
                </li>
                <li>
                  <a href="#press">Press Kit</a>
                </li>
              </ul>
            </div>
            <div className="landing__footer-section">
              <h4>Legal & Support</h4>
              <ul>
                <li>
                  <a href="#privacy">Privacy</a>
                </li>
                <li>
                  <a href="#terms">Terms</a>
                </li>
                <li>
                  <a href="#security">Security</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="landing__footer-bottom">
            <p>&copy; 2025 maesta. Find your dream job today.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
