/**
 * @file Footer.jsx
 * @description Reusable footer component with responsive design and accessibility features
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */



import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram, Heart } from 'lucide-react';
import styles from './Footer.module.css';

/**
 * Main footer component for the application with multiple sections and responsive design.
 * Includes navigation links, contact information, social media, and legal information.
 * @returns {JSX.Element} Rendered footer component
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();

    /**
     * Footer section data structure for maintainability
     */
    const footerSections = [
        {
            title: 'For Job Seekers',
            links: [
                { label: 'Browse Jobs', href: '/jobs' },
                { label: 'Pricing', href: '/subscription/plans' },
                { label: 'Resume Builder', href: '/ai/cv-builder' },
                { label: 'Browse Gigs', href: '/gigs' },
            ],
        },
        {
            title: 'For Companies',
            links: [
                { label: 'Post a Job', href: '/jobs/post' },
                { label: 'Pricing', href: '/subscription/plans' },
                { label: 'Find Candidates', href: '/dashboard/applicants' },
                { label: 'AI Hiring Tools', href: '/ai/candidate-analysis' },
            ],
        },
        {
            title: 'Company',
            links: [
                { label: 'About Us', href: '/about' },
                { label: 'Blog', href: '/blog' },
                { label: 'Careers', href: '/careers' },
            ],
        },
        {
            title: 'Legal & Support',
            links: [
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Security', href: '/security' },
                { label: 'Contact Support', href: '/contact' },
            ],
        },
    ];

    /**
     * Contact information
     */
    const contactInfo = [
        {
            icon: Mail,
            label: 'Email',
            value: 'hello@maesta.com',
            href: 'mailto:hello@maesta.com',
        },
        {
            icon: Phone,
            label: 'Phone',
            value: '+1 (555) 123-4567',
            href: 'tel:+15551234567',
        },
        {
            icon: MapPin,
            label: 'Address',
            value: '123 Career St, San Francisco, CA 94107',
            href: 'https://maps.google.com',
        },
    ];

    /**
     * Social media links
     */
    const socialLinks = [
        { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/company/maesta' },
        { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/maesta' },
        { icon: Facebook, label: 'Facebook', href: 'https://facebook.com/maesta' },
        { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/maesta' },
    ];

    /**
     * Handle link clicks for analytics (placeholder)
     * @param {string} linkName - Name of the link clicked
     * @param {string} href - Link URL
     */
    const handleLinkClick = (linkName, href) => {
        // In a real app, you would track this with analytics
        console.log(`Footer link clicked: ${linkName} -> ${href}`);
    };

    return (
        <footer className={styles.footer} role="contentinfo">
            {/* Top Section */}
            <div className={styles.footerTop}>
                <div className={styles.footerWrapper}>
                    {/* Logo and Description */}
                    <div className={styles.brandSection}>
                        <div className={styles.brandLogo}>
                            <span className={styles.logoText}>maesta</span>
                            <span className={styles.logoDot} aria-hidden="true">•</span>
                        </div>
                        <p className={styles.brandDescription}>
                            Connecting talented professionals with exceptional opportunities.
                            Find your dream job or the perfect candidate today.
                        </p>

                        {/* Contact Information */}
                        <address className={styles.contactInfo} aria-label="Contact information">
                            {contactInfo.map((contact, index) => {
                                const Icon = contact.icon;
                                return (
                                    <a
                                        key={`contact-${index}`}
                                        href={contact.href}
                                        className={styles.contactItem}
                                        onClick={() => handleLinkClick(contact.label, contact.href)}
                                        aria-label={`Contact via ${contact.label}: ${contact.value}`}
                                    >
                                        <Icon size={16} className={styles.contactIcon} aria-hidden="true" />
                                        <span className={styles.contactValue}>{contact.value}</span>
                                    </a>
                                );
                            })}
                        </address>

                        {/* Social Media Links */}
                        <div className={styles.socialSection}>
                            <h4 className={styles.socialTitle}>Follow Us</h4>
                            <div className={styles.socialLinks} aria-label="Social media links">
                                {socialLinks.map((social, index) => {
                                    const Icon = social.icon;
                                    return (
                                        <a
                                            key={`social-${index}`}
                                            href={social.href}
                                            className={styles.socialLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => handleLinkClick(social.label, social.href)}
                                            aria-label={`Follow us on ${social.label}`}
                                        >
                                            <Icon size={20} className={styles.socialIcon} aria-hidden="true" />
                                            <span className="sr-only">{social.label}</span>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Sections */}
                    <div className={styles.navigationSections}>
                        {footerSections.map((section, index) => (
                            <nav
                                key={`section-${index}`}
                                className={styles.footerSection}
                                aria-label={`${section.title} navigation`}
                            >
                                <h3 className={styles.sectionTitle}>{section.title}</h3>
                                <ul className={styles.sectionList}>
                                    {section.links.map((link, linkIndex) => (
                                        <li key={`link-${index}-${linkIndex}`} className={styles.sectionItem}>
                                            <Link
                                                to={link.href}
                                                className={styles.sectionLink}
                                                onClick={() => handleLinkClick(link.label, link.href)}
                                                aria-label={link.label}
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className={styles.footerBottom}>
                <div className={styles.footerWrapper}>
                    {/* Copyright */}
                    <div className={styles.copyrightSection}>
                        <p className={styles.copyrightText}>
                            &copy; {currentYear} maesta. All rights reserved.
                        </p>
                        <p className={styles.copyrightSubtext}>
                            Made with <Heart size={12} className={styles.heartIcon} aria-hidden="true" />{' '}
                            to help you find your dream job.
                        </p>
                    </div>

                    {/* Legal Links */}
                    <div className={styles.legalSection}>
                        <nav className={styles.legalLinks} aria-label="Legal links">
                            <Link
                                to="/privacy"
                                className={styles.legalLink}
                                onClick={() => handleLinkClick('Privacy Policy', '/privacy')}
                            >
                                Privacy Policy
                            </Link>
                            <span className={styles.legalSeparator} aria-hidden="true">•</span>
                            <Link
                                to="/terms"
                                className={styles.legalLink}
                                onClick={() => handleLinkClick('Terms of Service', '/terms')}
                            >
                                Terms of Service
                            </Link>
                            <span className={styles.legalSeparator} aria-hidden="true">•</span>
                            <Link
                                to="/cookies"
                                className={styles.legalLink}
                                onClick={() => handleLinkClick('Cookie Policy', '/cookies')}
                            >
                                Cookie Policy
                            </Link>
                            <span className={styles.legalSeparator} aria-hidden="true">•</span>
                            <Link
                                to="/accessibility"
                                className={styles.legalLink}
                                onClick={() => handleLinkClick('Accessibility', '/accessibility')}
                            >
                                Accessibility
                            </Link>
                        </nav>
                    </div>

                    {/* Back to Top */}
                    <div className={styles.backToTopSection}>
                        <button
                            type="button"
                            className={styles.backToTopButton}
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            aria-label="Scroll back to top of page"
                        >
                            Back to Top
                        </button>
                    </div>
                </div>
            </div>

        </footer>
    );
};

Footer.propTypes = {
    // Optional custom className prop
    className: PropTypes.string,
};

Footer.defaultProps = {
    className: '',
};

export default Footer;