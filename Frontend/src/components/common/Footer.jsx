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
import PropTypes from 'prop-types';
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './Footer.module.css';

/**
 * Main footer component for the application with multiple sections and responsive design.
 * Includes navigation links, contact information, social media, and legal information.
 * @returns {JSX.Element} Rendered footer component
 */
const Footer = () => {
    const { t } = useTranslation(['common']);
    const currentYear = new Date().getFullYear();

    /**
     * Footer section data structure for maintainability
     */
    const footerSections = [
        {
            title: t('common:footer.sections.jobSeekers', 'For Job Seekers'),
            links: [
                { label: t('common:footer.links.browseJobs', 'Browse Jobs'), href: '/jobs' },
                { label: t('common:footer.links.pricing', 'Pricing'), href: '/pricing' },
                { label: t('common:footer.links.careerGuide', 'Career Guide'), href: '/career-guide' },
                { label: t('common:footer.links.resumeBuilder', 'Resume Builder'), href: '/resume-builder' },
                { label: t('common:footer.links.interviewPrep', 'Interview Prep'), href: '/interview-prep' },
            ],
        },
        {
            title: t('common:footer.sections.companies', 'For Companies'),
            links: [
                { label: t('common:footer.links.startHiring', 'Start Hiring'), href: '/hiring' },
                { label: t('common:footer.links.employersPricing', 'Pricing'), href: '/pricing/employers' },
                { label: t('common:footer.links.features', 'Features'), href: '/features' },
                { label: t('common:footer.links.postJob', 'Post a Job'), href: '/post-job' },
                { label: t('common:footer.links.contactSales', 'Contact Sales'), href: '/contact-sales' },
            ],
        },
        {
            title: t('common:footer.sections.company', 'Company'),
            links: [
                { label: t('common:footer.links.aboutUs', 'About Us'), href: '/about' },
                { label: t('common:footer.links.blog', 'Blog'), href: '/blog' },
                { label: t('common:footer.links.careers', 'Careers'), href: '/careers' },
                { label: t('common:footer.links.pressKit', 'Press Kit'), href: '/press' },
                { label: t('common:footer.links.brandGuidelines', 'Brand Guidelines'), href: '/brand' },
            ],
        },
        {
            title: t('common:footer.sections.legalSupport', 'Legal & Support'),
            links: [
                { label: t('common:footer.links.privacyPolicy', 'Privacy Policy'), href: '/privacy' },
                { label: t('common:footer.links.termsOfService', 'Terms of Service'), href: '/terms' },
                { label: t('common:footer.links.security', 'Security'), href: '/security' },
                { label: t('common:footer.links.cookiePolicy', 'Cookie Policy'), href: '/cookies' },
                { label: t('common:footer.links.contactSupport', 'Contact Support'), href: '/contact' },
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
            label: t('common:footer.contact.address', 'Address'),
            value: t('common:footer.contact.addressValue', '123 Career St, San Francisco, CA 94107'),
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
                            {t('common:footer.brandDescription', 'Connecting talented professionals with exceptional opportunities. Find your dream job or the perfect candidate today.')}
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
                            <h4 className={styles.socialTitle}>{t('common:footer.followUs', 'Follow Us')}</h4>
                            <div className={styles.socialLinks} aria-label={t('common:footer.socialMediaLinks', 'Social media links')}>
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
                                <ul className={styles.sectionList} role="list">
                                    {section.links.map((link, linkIndex) => (
                                        <li key={`link-${index}-${linkIndex}`} className={styles.sectionItem}>
                                            <a
                                                href={link.href}
                                                className={styles.sectionLink}
                                                onClick={() => handleLinkClick(link.label, link.href)}
                                                aria-label={link.label}
                                            >
                                                {link.label}
                                            </a>
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
                            &copy; {currentYear} {t('common:footer.copyright', 'maesta. All rights reserved.')}
                        </p>
                        <p className={styles.copyrightSubtext}>
                            {t('common:footer.madeWith', 'Made with')} <Heart size={12} className={styles.heartIcon} aria-hidden="true" />{' '}
                            {t('common:footer.toHelpYou', 'to help you find your dream job.')}
                        </p>
                    </div>

                    {/* Legal Links */}
                    <div className={styles.legalSection}>
                        <nav className={styles.legalLinks} aria-label={t('common:footer.legalLinksAria', 'Legal links')}>
                            <a
                                href="/privacy"
                                className={styles.legalLink}
                                onClick={() => handleLinkClick(t('common:footer.links.privacyPolicy', 'Privacy Policy'), '/privacy')}
                            >
                                {t('common:footer.links.privacyPolicy', 'Privacy Policy')}
                            </a>
                            <span className={styles.legalSeparator} aria-hidden="true">•</span>
                            <a
                                href="/terms"
                                className={styles.legalLink}
                                onClick={() => handleLinkClick(t('common:footer.links.termsOfService', 'Terms of Service'), '/terms')}
                            >
                                {t('common:footer.links.termsOfService', 'Terms of Service')}
                            </a>
                            <span className={styles.legalSeparator} aria-hidden="true">•</span>
                            <a
                                href="/cookies"
                                className={styles.legalLink}
                                onClick={() => handleLinkClick(t('common:footer.links.cookiePolicy', 'Cookie Policy'), '/cookies')}
                            >
                                {t('common:footer.links.cookiePolicy', 'Cookie Policy')}
                            </a>
                            <span className={styles.legalSeparator} aria-hidden="true">•</span>
                            <a
                                href="/accessibility"
                                className={styles.legalLink}
                                onClick={() => handleLinkClick(t('common:footer.links.accessibility', 'Accessibility'), '/accessibility')}
                            >
                                {t('common:footer.links.accessibility', 'Accessibility')}
                            </a>
                        </nav>
                    </div>

                    {/* Back to Top */}
                    <div className={styles.backToTopSection}>
                        <button
                            type="button"
                            className={styles.backToTopButton}
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            aria-label={t('common:footer.backToTopAria', 'Scroll back to top of page')}
                        >
                            {t('common:footer.backToTop', 'Back to Top')}
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