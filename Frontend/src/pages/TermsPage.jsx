/**
 * @file TermsPage.jsx
 * @description Terms and Conditions page for MAESTA job portal.
 * @author Sherif Talaat
 * @date 2026-05-24
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-05-24
 */

import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import styles from './TermsPage.module.css';

/**
 * Terms and Conditions page component.
 * @returns {JSX.Element} The rendered terms page.
 */
const TermsPage = () => {
  return (
    <>
      <Header />
      <main className={styles.container}>
        <article className={styles.page}>
          <div className={styles.header}>
            <h1 className={styles.title}>Terms & Conditions</h1>
            <p className={styles.subtitle}>
              Last updated: <time dateTime="2026-05-24">May 24, 2026</time>
            </p>
          </div>

          <div className={styles.content}>
            <section className={styles.section}>
              <h2 className={styles['section-title']}>1. Acceptance of Terms</h2>
              <p className={styles.paragraph}>
                By accessing and using MAESTA, you accept and agree to be bound by the terms and
                provision of this agreement. If you do not agree to abide by the above, please do
                not use this service. We reserve the right to make changes to these terms at any
                time. Your continued use of the service after changes have been made constitutes
                your acceptance of the new terms.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles['section-title']}>2. Use of Platform</h2>
              <p className={styles.paragraph}>
                You agree to use MAESTA only for lawful purposes and in a way that does not infringe
                upon the rights of others or restrict their use and enjoyment of the website. Prohibited
                behavior includes:
              </p>
              <ul className={styles.list}>
                <li>Harassing or causing distress or inconvenience to any person</li>
                <li>Disrupting normal flow of dialogue within MAESTA</li>
                <li>Attempting to gain unauthorized access to systems</li>
                <li>Posting or uploading files that contain software or data that could damage the operation of the website</li>
                <li>Engaging in any form of discrimination or hate speech</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2 className={styles['section-title']}>3. Account Responsibility</h2>
              <p className={styles.paragraph}>
                You are responsible for maintaining the confidentiality of your account and password
                and for restricting access to your computer. You agree to accept responsibility for
                all activities that occur under your account or password. You agree to notify us
                immediately of any unauthorized use of your account or any other breaches of security.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles['section-title']}>4. Termination</h2>
              <p className={styles.paragraph}>
                MAESTA may terminate your access to the website at any time, without cause or notice,
                which shall become effective immediately. If you wish to terminate your account, you
                may do so by following the instructions on the account settings page.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles['section-title']}>5. Limitation of Liability</h2>
              <p className={styles.paragraph}>
                MAESTA and its suppliers will not be liable for damages of any kind arising from the
                use of or inability to use the materials on MAESTA, including but not limited to direct,
                indirect, incidental, punitive, and consequential damages. This applies even if MAESTA
                has been notified of the possibility of such damages.
              </p>
            </section>

            <div className={styles.footer}>
              <p className={styles['footer-text']}>
                By using this site, you agree to our Terms & Conditions. If you have any questions,
                please <a href="/support" className={styles.link}>contact our support team</a>.
              </p>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
};

export default TermsPage;
