"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "../styles/landing-page.css";


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
  const { t } = useTranslation(['landing', 'common']);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    /**
     * Updates scroll position state on window scroll.
     */
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const jobs = [
    {
      id: "senior-react-developer",
      title: t('landing:jobs.seniorReact', "Senior React Developer"),
      company: "TechFlow Inc",
      location: t('landing:jobs.sanFrancisco', "San Francisco, CA"),
      type: t('landing:jobs.fullTime', "Full-time"),
      salary: "$140K - $180K",
    },
    {
      id: "ux-ui-designer",
      title: t('landing:jobs.uxDesigner', "UX/UI Designer"),
      company: "Creative Studios",
      location: t('landing:jobs.remote', "Remote"),
      type: t('landing:jobs.fullTime', "Full-time"),
      salary: "$100K - $130K",
    },
    {
      id: "product-manager",
      title: t('landing:jobs.productManager', "Product Manager"),
      company: "StartupHub",
      location: t('landing:jobs.newYork', "New York, NY"),
      type: t('landing:jobs.fullTime', "Full-time"),
      salary: "$120K - $160K",
    },
    {
      id: "devops-engineer",
      title: t('landing:jobs.devopsEngineer', "DevOps Engineer"),
      company: "CloudTech Solutions",
      location: t('landing:jobs.austin', "Austin, TX"),
      type: t('landing:jobs.contract', "Contract"),
      salary: "$130K - $170K",
    },
  ];

  const testimonials = [
    {
      id: "alex-chen",
      name: "Alex Chen",
      role: t('landing:testimonials.alexRole', "Found job in 2 weeks"),
      company: t('landing:testimonials.alexCompany', "Senior Developer at Google"),
      avatar: "👨‍💼",
      content: t('landing:testimonials.alexContent', "maesta made my job search incredibly easy. I found my dream role without any hassle!"),
    },
    {
      id: "sarah-martinez",
      name: "Sarah Martinez",
      role: t('landing:testimonials.sarahRole', "Career switcher"),
      company: t('landing:testimonials.sarahCompany', "UX Designer at Adobe"),
      avatar: "👩‍💼",
      content: t('landing:testimonials.sarahContent', "The platform is intuitive and the job matches are spot on. Highly recommend!"),
    },
  ];

  const features = [
    {
      id: "smart-matching",
      icon: "🎯",
      title: t('landing:features.smartMatchingTitle', "Smart Matching"),
      description: t('landing:features.smartMatchingDesc', "AI-powered algorithm finds jobs that match your skills and goals perfectly"),
    },
    {
      id: "quick-apply",
      icon: "⚡",
      title: t('landing:features.quickApplyTitle', "Quick Apply"),
      description: t('landing:features.quickApplyDesc', "Apply to jobs with one click using your profile information"),
    },
    {
      id: "salary-insights",
      icon: "📊",
      title: t('landing:features.salaryInsightsTitle', "Salary Insights"),
      description: t('landing:features.salaryInsightsDesc', "See real salary data and compensation packages upfront"),
    },
  ];

  const pricingPlans = [
    {
      id: "free",
      name: t('landing:pricing.freeName', "Job Seeker Free"),
      price: t('landing:pricing.freePrice', "Free"),
      description: t('landing:pricing.freeDesc', "Perfect for exploring opportunities"),
      features: [
        t('landing:pricing.freeFeat1', "Unlimited job search"),
        t('landing:pricing.freeFeat2', "5 applications/day"),
        t('landing:pricing.freeFeat3', "Resume upload")
      ],
      cta: t('landing:pricing.freeCta', "Get Started"),
    },
    {
      id: "premium",
      name: t('landing:pricing.premiumName', "Premium"),
      price: "$9.99",
      description: t('landing:pricing.premiumDesc', "For serious job hunters"),
      features: [
        t('landing:pricing.premiumFeat1', "Unlimited applications"),
        t('landing:pricing.premiumFeat2', "Advanced job alerts"),
        t('landing:pricing.premiumFeat3', "Salary negotiation guide"),
      ],
      cta: t('landing:pricing.premiumCta', "Start Free Trial"),
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
        {t('common:actions.skipToContent', "Skip to content")}
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
            <p className="landing__badge">{t('landing:hero.badge', "Your next opportunity awaits")}</p>
            <h1 id="hero-heading" className="landing__hero-title">
              {t('landing:hero.title', "Find Your Dream Job")}
            </h1>
            <p className="landing__hero-subtitle">
              {t('landing:hero.subtitle', "Discover opportunities at top tech companies. Smart matching, quick apply, and real salaries. Your next great career move is just a few clicks away.")}
            </p>

            <div className="landing__hero-btns">
              <Button variant="primary" onClick={() => scrollToId("jobs")}>
                {t('landing:hero.startSearching', "Start Searching")}
              </Button>
              <Button
                variant="secondary"
                onClick={() => scrollToId("features")}>
                {t('landing:hero.learnMore', "Learn More")}
              </Button>
            </div>

            <ul className="landing__hero-stats" aria-hidden>
              <li>
                <span className="landing__stat-value">50K+</span>
                <span className="landing__stat-label">{t('landing:hero.activeJobs', "Active Jobs")}</span>
              </li>
              <li>
                <span className="landing__stat-value">1000+</span>
                <span className="landing__stat-label">{t('landing:hero.companies', "Companies")}</span>
              </li>
              <li>
                <span className="landing__stat-value">95%</span>
                <span className="landing__stat-label">{t('landing:hero.successRate', "Success Rate")}</span>
              </li>
            </ul>
          </div>
        </section>

        <section
          id="jobs"
          className="landing__jobs"
          aria-labelledby="jobs-heading">
          <h2 id="jobs-heading" className="landing__section-title">
            {t('landing:jobs.heading', "Featured Opportunities")}
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
                    {t('landing:jobs.viewDetails', "View Details")}
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
            {t('landing:features.heading', "Why Choose maesta")}
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
            {t('landing:impact.heading', "Our Impact")}
          </h2>
          <div className="landing__success-grid">
            <div className="landing__success-card">
              <div className="landing__success-icon">🚀</div>
              <h3>{t('landing:impact.stat1Title', "TechFlow Hiring")}</h3>
              <div className="landing__success-result">{t('landing:impact.stat1Result', "500+ Hires")}</div>
              <p className="landing__success-desc">
                {t('landing:impact.stat1Desc', "Found top engineering talent in weeks, not months")}
              </p>
            </div>
            <div className="landing__success-card">
              <div className="landing__success-icon">😊</div>
              <h3>{t('landing:impact.stat2Title', "Talent Satisfaction")}</h3>
              <div className="landing__success-result">{t('landing:impact.stat2Result', "95% Happy")}</div>
              <p className="landing__success-desc">
                {t('landing:impact.stat2Desc', "95% of job seekers find roles in under 30 days")}
              </p>
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="landing__pricing"
          aria-labelledby="pricing-heading">
          <h2 id="pricing-heading" className="landing__section-title">
            {t('landing:pricing.heading', "Simple Pricing")}
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
            {t('landing:testimonials.heading', "Success Stories From Our Users")}
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
          <h2>{t('landing:cta.heading', "Ready to find your perfect role?")}</h2>
          <p>
            {t('landing:cta.subtitle', "Join thousands of professionals who found their dream job on maesta")}
          </p>
          <Button
            variant="primary"
            className="landing__cta-btn--large"
            onClick={() => scrollToId("jobs")}>
            {t('landing:cta.button', "Start Your Search")}
          </Button>
        </section>

        <Footer />
      </main>
    </div>
  );
}
