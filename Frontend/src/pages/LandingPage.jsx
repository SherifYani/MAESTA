"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "../styles/landing-page.css";
import generalService from "../services/generalService";
import jobService from "../services/jobService";


/**
 * Reusable button component with multiple style variants.
 * @param {ButtonProps} props - Button component props.
 * @returns {JSX.Element} Styled button element.
 */
const Button = React.forwardRef(
  ({ children, variant = "primary", className = "", onClick }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className={`landing__cta-btn landing__cta-btn--${variant} ${className}`.trim()}>
      {children}
    </button>
  ),
);

Button.displayName = "Button";

/**
 * Main landing page component with hero, features, pricing, and testimonials sections.
 * @returns {React.ReactElement} The rendered landing page.
 */
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [stats, setStats] = useState({ totalJobs: "50K+", totalCompanies: "1000+", successRate: "95%" });
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    
    // Fetch live data
    const fetchData = async () => {
      try {
        const [statsData, jobsData] = await Promise.all([
          generalService.getPublicStats(),
          jobService.getJobs({ limit: 4 })
        ]);
        
        if (statsData) {
          setStats({
            totalJobs: statsData.totalJobs > 1000 ? `${(statsData.totalJobs / 1000).toFixed(1)}K+` : statsData.totalJobs,
            totalCompanies: statsData.totalCompanies > 1000 ? `${(statsData.totalCompanies / 1000).toFixed(1)}K+` : statsData.totalCompanies,
            successRate: statsData.successfulPlacements > 0 ? "95%" : "0%" // Placeholder logic for success rate
          });
        }

        if (jobsData) {
            const items = jobsData.jobs || jobsData.Jobs || jobsData.items || jobsData.data || (Array.isArray(jobsData) ? jobsData : []);
            setFeaturedJobs(items.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching landing page data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const testimonials = [
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

  const features = [
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

  const pricingPlans = [
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
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="landing" data-scroll-y={Math.round(scrollY)}>
      <a className="landing__skip-link" href="#main-content">
        Skip to content
      </a>

      {/* Unified Header — rendered first, always on top via z-index in CSS */}
      <Header />

      <div
        className="landing__parallax"
        aria-hidden
        style={{
          "--scrollY": `${scrollY * 0.03}px`,
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
                <span className="landing__stat-value">{stats.totalJobs}</span>
                <span className="landing__stat-label">Active Jobs</span>
              </li>
              <li>
                <span className="landing__stat-value">{stats.totalCompanies}</span>
                <span className="landing__stat-label">Companies</span>
              </li>
              <li>
                <span className="landing__stat-value">{stats.successRate}</span>
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
            {featuredJobs.map((job) => (
              <article
                key={job.id || job.jobId}
                className="landing__job-card"
                aria-labelledby={`${job.id || job.jobId}-title`}>
                <header className="landing__job-header">
                  <h3 id={`${job.id || job.jobId}-title`}>{job.title || job.jobTitle}</h3>
                  <span className="landing__job-type">{job.type || job.jobType}</span>
                </header>
                <p className="landing__job-company">{job.company || job.companyName}</p>
                <p className="landing__job-location">📍 {job.location || job.jobLocation}</p>
                {(job.salary || job.salaryRange) && (
                  <p className="landing__job-salary">{job.salary || job.salaryRange}</p>
                )}
                <div className="landing__job-actions">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/jobs/${job.id || job.jobId}`)}>
                    View Details
                  </Button>
                </div>
              </article>
            ))}
            {featuredJobs.length === 0 && !loading && (
                <p className="landing__no-data">No featured jobs available at the moment.</p>
            )}
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
                className={`landing__pricing-card ${plan.highlighted ? "landing__pricing-card--highlighted" : ""
                  }`}>
                <h3>{plan.name}</h3>
                <p className="landing__plan-desc">{plan.description}</p>
                <div className="landing__plan-price">{plan.price}</div>
                <Button 
                  variant={plan.highlighted ? "primary" : "secondary"}
                  onClick={() => navigate("/register")}
                >
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

        <Footer />
      </main>
    </div>
  );
}
