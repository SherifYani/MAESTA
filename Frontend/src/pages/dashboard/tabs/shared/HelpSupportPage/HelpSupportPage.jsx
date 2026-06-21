/**
 * @file HelpSupportPage.jsx
 * @description Help & Support page — provides FAQ accordion, contact information,
 *              and quick-link cards for common support topics. Static page since
 *              the SupportTicket backend API is not yet implemented.
 * @author Sherif Talaat
 * @date 2026-06-17
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-06-17
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    HelpCircle, ChevronDown, Mail, MessageSquare,
    FileText, Shield, CreditCard, Users, Briefcase, BookOpen
} from 'lucide-react';
import styles from './HelpSupportPage.module.css';

// ─── FAQ Data ──────────────────────────────────────────────────────────────────

const FAQ_SECTIONS = [
    {
        id: 'account',
        title: 'Account & Profile',
        icon: <Users size={18} />,
        items: [
            {
                q: 'How do I update my profile information?',
                a: 'Navigate to your Dashboard → Profile Settings to update your name, bio, skills, and other personal information. Changes are saved automatically when you submit the form.',
            },
            {
                q: 'How do I change my password?',
                a: 'Go to Dashboard → Account Settings → Security tab. Enter your current password, then your new password twice to confirm. Your password must be at least 8 characters.',
            },
            {
                q: 'How do I enable two-factor authentication?',
                a: 'Visit Dashboard → Account Settings → Security tab and click "Enable 2FA". You will receive a verification code via email each time you log in.',
            },
            {
                q: 'Can I delete my account?',
                a: 'Yes. Go to Dashboard → Account Settings → Danger Zone and click "Delete My Account". This action is permanent and cannot be undone.',
            },
        ],
    },
    {
        id: 'billing',
        title: 'Billing & Payments',
        icon: <CreditCard size={18} />,
        items: [
            {
                q: 'How do I view my transaction history?',
                a: 'Go to Dashboard → Billing to see all past transactions, your current wallet balance, and saved payment methods.',
            },
            {
                q: 'How do I add a payment method?',
                a: 'Visit Dashboard → Billing → Payment Methods section and click "Add Card". You can also link a bank account for withdrawals.',
            },
            {
                q: 'How does the escrow system work?',
                a: 'When a client creates a contract, funds are deposited into escrow. Once the freelancer completes the milestone and the client approves, funds are released. This protects both parties.',
            },
        ],
    },
    {
        id: 'jobs',
        title: 'Jobs & Applications',
        icon: <Briefcase size={18} />,
        items: [
            {
                q: 'How do I apply for a job?',
                a: 'Browse available jobs on the Jobs page, click on a listing to view details, and click "Apply". You can attach your resume and write a cover letter with your application.',
            },
            {
                q: 'How can I track my applications?',
                a: 'Go to Dashboard → My Applications to see the status of all your submitted applications, including shortlisted, interviewed, and hired stages.',
            },
            {
                q: 'How do I post a job as a company?',
                a: 'Navigate to Dashboard → Post a Job. Fill in the job title, description, requirements, salary range, and other details, then submit for review.',
            },
        ],
    },
    {
        id: 'security',
        title: 'Security & Privacy',
        icon: <Shield size={18} />,
        items: [
            {
                q: 'Is my personal data secure?',
                a: 'Yes. We use industry-standard encryption (TLS/SSL) for all data in transit and at rest. Your password is hashed using bcrypt and never stored in plain text.',
            },
            {
                q: 'How do I sign out of all devices?',
                a: 'Go to Dashboard → Account Settings → Sessions tab and click "Sign Out of All Devices". This revokes all active sessions except your current one.',
            },
        ],
    },
];

// ─── Quick Links ────────────────────────────────────────────────────────────────

const QUICK_LINKS = [
    { label: 'Getting Started Guide', icon: <BookOpen size={20} />, href: '#faq' },
    { label: 'Settings', icon: <Users size={20} />, href: '/dashboard/account' },
    { label: 'Billing & Wallet', icon: <CreditCard size={20} />, href: '/dashboard/billing' },
];

// ─── Accordion Item ──────────────────────────────────────────────────────────────

/**
 * A single FAQ accordion item.
 * @param {Object} props
 * @param {string} props.question - The question text.
 * @param {string} props.answer - The answer text.
 * @param {boolean} props.isOpen - Whether this item is expanded.
 * @param {Function} props.onToggle - Callback to toggle open/close.
 * @returns {JSX.Element}
 */
const AccordionItem = ({ question, answer, isOpen, onToggle }) => (
    <div className={`${styles.accordion__item} ${isOpen ? styles['accordion__item--open'] : ''}`}>
        <button
            type="button"
            className={styles.accordion__trigger}
            onClick={onToggle}
            aria-expanded={isOpen}
        >
            <span className={styles.accordion__question}>{question}</span>
            <ChevronDown
                size={18}
                className={`${styles.accordion__chevron} ${isOpen ? styles['accordion__chevron--open'] : ''}`}
            />
        </button>
        {isOpen && (
            <div className={styles.accordion__content} role="region">
                <p className={styles.accordion__answer}>{answer}</p>
            </div>
        )}
    </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────────

/**
 * Help & Support page — FAQ accordion with contact information.
 * @returns {JSX.Element}
 */
const HelpSupportPage = () => {
    // Track which FAQ item is open: "sectionId-itemIndex" or null
    const [openItem, setOpenItem] = useState(null);

    console.log('HelpSupportPage component mounted');

    /**
     * Toggle a FAQ item open/closed.
     * @param {string} key - Unique identifier for the FAQ item.
     */
    const handleToggle = (key) => {
        setOpenItem(prev => (prev === key ? null : key));
    };

    return (
        <div className={styles.page}>
            <div className={styles.page__bg} aria-hidden="true" />

            {/* Page Header */}
            <div className={styles.page__header}>
                <div className={styles.page__headerIcon}>
                    <HelpCircle size={28} />
                </div>
                <div>
                    <h1 className={styles.page__title}>Help & Support</h1>
                    <p className={styles.page__subtitle}>
                        Find answers to common questions or get in touch with our support team.
                    </p>
                </div>
            </div>

            {/* Quick Links */}
            <div className={styles.quickLinks}>
                {QUICK_LINKS.map((link) => {
                    const isAnchor = link.href.startsWith('#');
                    return isAnchor ? (
                        <a key={link.label} href={link.href} className={styles.quickLink}>
                            <div className={styles.quickLink__icon}>{link.icon}</div>
                            <span className={styles.quickLink__label}>{link.label}</span>
                        </a>
                    ) : (
                        <Link key={link.label} to={link.href} className={styles.quickLink}>
                            <div className={styles.quickLink__icon}>{link.icon}</div>
                            <span className={styles.quickLink__label}>{link.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* FAQ Sections */}
            <div className={styles.faqContainer} id="faq">
                <h2 className={styles.faqContainer__title}>Frequently Asked Questions</h2>

                {FAQ_SECTIONS.map((section) => (
                    <div key={section.id} className={styles.faqSection}>
                        <div className={styles.faqSection__header}>
                            <div className={styles.faqSection__icon}>{section.icon}</div>
                            <h3 className={styles.faqSection__title}>{section.title}</h3>
                        </div>

                        <div className={styles.accordion}>
                            {section.items.map((item, idx) => {
                                const key = `${section.id}-${idx}`;
                                return (
                                    <AccordionItem
                                        key={key}
                                        question={item.q}
                                        answer={item.a}
                                        isOpen={openItem === key}
                                        onToggle={() => handleToggle(key)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Contact Card */}
            <div className={styles.contactCard}>
                <div className={styles.contactCard__header}>
                    <MessageSquare size={22} />
                    <h2 className={styles.contactCard__title}>Still need help?</h2>
                </div>
                <p className={styles.contactCard__desc}>
                    Our support team is here to help. Reach out and we'll get back to you within 24 hours.
                </p>

                <div className={styles.contactCard__channels}>
                    <a href="mailto:support@jobmagnet.com" className={styles.contactChannel}>
                        <Mail size={20} className={styles.contactChannel__icon} />
                        <div>
                            <p className={styles.contactChannel__label}>Email Support</p>
                            <p className={styles.contactChannel__value}>support@jobmagnet.com</p>
                        </div>
                    </a>
                    <a
                        href="https://docs.jobmagnet.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.contactChannel}
                    >
                        <FileText size={20} className={styles.contactChannel__icon} />
                        <div>
                            <p className={styles.contactChannel__label}>Documentation</p>
                            <p className={styles.contactChannel__value}>docs.jobmagnet.com</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default HelpSupportPage;
