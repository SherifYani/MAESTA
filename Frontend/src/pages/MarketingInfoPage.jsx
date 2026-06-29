/**
 * @file MarketingInfoPage.jsx
 * @description Public informational pages for footer navigation links.
 * @author Sherif Talaat
 * @date 2026-06-21
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-06-21
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Building2,
  Cookie,
  FileText,
  HelpCircle,
  Lock,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import styles from './MarketingInfoPage.module.css';

const pageContent = {
  about: {
    icon: Building2,
    eyebrow: 'About Job Magnet',
    title: 'Connecting talent with meaningful work.',
    description:
      'Job Magnet brings job seekers, companies, freelancers, and clients together in one trusted marketplace for jobs, gigs, collaboration, and secure payments.',
    highlights: [
      'Role-based dashboards for every user type',
      'AI-assisted tools for hiring and career growth',
      'Escrow-ready workflows for freelance projects',
    ],
    ctaLabel: 'Explore jobs',
    ctaPath: '/jobs',
  },
  blog: {
    icon: Newspaper,
    eyebrow: 'Job Magnet Blog',
    title: 'Career, hiring, and freelancing insights.',
    description:
      'Read practical guidance for finding better opportunities, improving hiring pipelines, and managing project-based work.',
    highlights: [
      'Career growth playbooks',
      'Hiring strategy articles',
      'Freelance marketplace best practices',
    ],
    ctaLabel: 'Try AI tools',
    ctaPath: '/ai',
  },
  careers: {
    icon: Briefcase,
    eyebrow: 'Careers',
    title: 'Help build the future of work.',
    description:
      'Job Magnet is designed by builders who care about accessible hiring, trusted collaboration, and modern professional growth.',
    highlights: [
      'Product and engineering opportunities',
      'Design and research collaboration',
      'Operations and customer success roles',
    ],
    ctaLabel: 'Browse jobs',
    ctaPath: '/jobs',
  },
  privacy: {
    icon: Lock,
    eyebrow: 'Privacy Policy',
    title: 'Your data should stay protected and transparent.',
    description:
      'This privacy overview explains the kinds of account, profile, job, gig, payment, and communication data Job Magnet may process to operate the platform.',
    highlights: [
      'Account and profile data support personalization',
      'Application and proposal data support marketplace workflows',
      'Security controls protect authentication and platform activity',
    ],
    ctaLabel: 'Manage account',
    ctaPath: '/dashboard/account',
  },
  terms: {
    icon: FileText,
    eyebrow: 'Terms of Service',
    title: 'Clear rules for using Job Magnet safely.',
    description:
      'These terms summarize expected user responsibilities across job posts, applications, gig proposals, payments, messaging, and platform conduct.',
    highlights: [
      'Use accurate information in profiles and listings',
      'Respect other users in chats, applications, and proposals',
      'Follow platform payment and dispute workflows',
    ],
    ctaLabel: 'Contact support',
    ctaPath: '/contact',
  },
  security: {
    icon: ShieldCheck,
    eyebrow: 'Security',
    title: 'Security-first workflows for every role.',
    description:
      'Job Magnet uses authenticated routes, JWT-protected API calls, role-based access, and account verification flows to keep platform actions controlled.',
    highlights: [
      'Protected dashboards and role-specific navigation',
      'Token-based authentication for API requests',
      'Verification and approval flows for sensitive account types',
    ],
    ctaLabel: 'Open settings',
    ctaPath: '/dashboard/account',
  },
  cookies: {
    icon: Cookie,
    eyebrow: 'Cookie Policy',
    title: 'Cookies help keep Job Magnet usable and consistent.',
    description:
      'Cookies and local storage may be used for authentication state, interface preferences, theme settings, and platform experience improvements.',
    highlights: [
      'Authentication and session continuity',
      'Theme and interface preferences',
      'Basic performance and product analytics readiness',
    ],
    ctaLabel: 'View privacy policy',
    ctaPath: '/privacy',
  },
  accessibility: {
    icon: Users,
    eyebrow: 'Accessibility',
    title: 'A platform that works for more people.',
    description:
      'Job Magnet pages should support keyboard navigation, clear focus states, semantic HTML, readable contrast, and reduced-motion preferences.',
    highlights: [
      'Skip links and semantic page landmarks',
      'Accessible labels for navigation and controls',
      'Responsive layouts for different screen sizes',
    ],
    ctaLabel: 'Contact support',
    ctaPath: '/contact',
  },
  contact: {
    icon: HelpCircle,
    eyebrow: 'Contact Support',
    title: 'Get help with your Job Magnet account.',
    description:
      'Reach support for account access, job applications, gig proposals, billing questions, or platform safety concerns.',
    highlights: [
      'Email: hello@Job Magnet.com',
      'Phone: +1 (555) 123-4567',
      'Dashboard users can also open Help & Support',
    ],
    ctaLabel: 'Open help center',
    ctaPath: '/dashboard/help',
  },
};

/**
 * Public informational page used by footer links.
 * @param {Object} props - Component props.
 * @param {string} props.pageKey - Content key for the page to render.
 * @returns {JSX.Element} Rendered marketing information page.
 */
const MarketingInfoPage = ({ pageKey }) => {
  const page = pageContent[pageKey] || pageContent.about;
  const Icon = page.icon;

  return (
    <MainLayout>
      <section className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.iconWrap} aria-hidden="true">
            <Icon size={34} />
          </div>
          <p className={styles.eyebrow}>{page.eyebrow}</p>
          <h1 className={styles.title}>{page.title}</h1>
          <p className={styles.description}>{page.description}</p>
          <div className={styles.actions}>
            <Link to={page.ctaPath} className={styles.primaryAction}>
              {page.ctaLabel}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/" className={styles.secondaryAction}>
              Back to home
            </Link>
          </div>
        </div>

        <div className={styles.cardGrid}>
          {page.highlights.map((highlight) => (
            <article key={highlight} className={styles.card}>
              <Sparkles size={20} className={styles.cardIcon} aria-hidden="true" />
              <p>{highlight}</p>
            </article>
          ))}
        </div>
      </section>
    </MainLayout>
  );
};

MarketingInfoPage.propTypes = {
  pageKey: PropTypes.oneOf(Object.keys(pageContent)).isRequired,
};

export default MarketingInfoPage;
