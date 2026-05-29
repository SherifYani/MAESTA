/**
 * @file SupportPage.jsx
 * @description Support and issue reporting page combining contact info and support form.
 * @author Sherif Talaat
 * @date 2026-05-24
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-05-24
 */

import React, { useState, useCallback } from 'react';
import { Mail, Phone, Clock, MessageSquare, Send } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import FormInput from '../components/forms/FormInput';
import FormTextarea from '../components/forms/FormTextarea';
import FormSelect from '../components/forms/FormSelect';
import { Alert } from '../components/common/Alert';
import styles from './SupportPage.module.css';

/**
 * Support page component. Displays contact info and support form.
 * @returns {JSX.Element} The rendered support page.
 */
const SupportPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    category: '',
    message: '',
  });

  const [formErrors, setFormErrors] = useState({
    email: '',
    subject: '',
    category: '',
    message: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const categoryOptions = [
    { value: 'bug', label: 'Bug Report' },
    { value: 'inquiry', label: 'Inquiry' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'other', label: 'Other' },
  ];

  /**
   * Validates form fields.
   * @returns {boolean} True if form is valid.
   */
  const validateForm = useCallback(() => {
    const errors = {};
    let isValid = true;

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Subject validation
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
      isValid = false;
    }

    // Category validation
    if (!formData.category) {
      errors.category = 'Please select a category';
      isValid = false;
    }

    // Message validation
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  }, [formData]);

  /**
   * Handles input change for text fields.
   * @param {React.ChangeEvent} e - The change event.
   */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }, [formErrors]);

  /**
   * Handles form submission.
   * @param {React.FormEvent} e - The form submit event.
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Simulate API call with 2-second delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate 10% random failure rate
      if (Math.random() < 0.1) {
        throw new Error('API error');
      }

      // Log form data (mock submission)
      console.log('Support form submission:', formData);

      setSuccessMsg(
        "Your message has been sent. We'll reply within 24 hours."
      );

      // Reset form
      setFormData({
        email: '',
        subject: '',
        category: '',
        message: '',
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMsg('');
      }, 5000);
    } catch (error) {
      console.error('Support form error:', error);
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm]);

  return (
    <>
      <Header />
      <main className={styles.container}>
        <div className={styles.page}>
          <div className={styles.header}>
            <h1 className={styles.title}>Help & Support</h1>
            <p className={styles.subtitle}>
              Get in touch with our support team or report an issue
            </p>
          </div>

          <div className={styles.wrapper}>
            {/* Contact Information Section */}
            <aside className={styles.sidebar}>
              <div className={styles['contact-card']}>
                <h2 className={styles['contact-title']}>Get in Touch</h2>

                <div className={styles['contact-item']}>
                  <Mail
                    size={20}
                    className={styles['contact-icon']}
                    aria-hidden="true"
                  />
                  <div>
                    <p className={styles['contact-label']}>Email</p>
                    <a
                      href="mailto:support@yourjobportal.com"
                      className={styles['contact-value']}
                    >
                      support@yourjobportal.com
                    </a>
                  </div>
                </div>

                <div className={styles['contact-item']}>
                  <Phone
                    size={20}
                    className={styles['contact-icon']}
                    aria-hidden="true"
                  />
                  <div>
                    <p className={styles['contact-label']}>Phone</p>
                    <a href="tel:+15551234567" className={styles['contact-value']}>
                      +1 (555) 123-4567
                    </a>
                  </div>
                </div>

                <div className={styles['contact-item']}>
                  <Clock
                    size={20}
                    className={styles['contact-icon']}
                    aria-hidden="true"
                  />
                  <div>
                    <p className={styles['contact-label']}>Support Hours</p>
                    <p className={styles['contact-value']}>
                      Mon–Fri, 9:00am–6:00pm EST
                    </p>
                  </div>
                </div>

                <div className={styles['contact-note']}>
                  <MessageSquare
                    size={16}
                    className={styles['note-icon']}
                    aria-hidden="true"
                  />
                  <p className={styles['note-text']}>
                    Average response time: 2–4 hours during business hours
                  </p>
                </div>
              </div>
            </aside>

            {/* Support Form Section */}
            <section className={styles.main}>
              <div className={styles.form__card}>
                {successMsg && (
                  <Alert
                    type="success"
                    message={successMsg}
                    onClose={() => setSuccessMsg('')}
                  />
                )}

                {errorMsg && (
                  <Alert
                    type="error"
                    message={errorMsg}
                    onClose={() => setErrorMsg('')}
                  />
                )}

                <form onSubmit={handleSubmit} className={styles.form} noValidate>
                  <FormInput
                    icon={Mail}
                    type="email"
                    name="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    hasError={!!formErrors.email}
                    aria-required="true"
                    aria-invalid={!!formErrors.email}
                  />
                  {formErrors.email && (
                    <p className={styles['field-error']}>{formErrors.email}</p>
                  )}

                  <FormInput
                    type="text"
                    name="subject"
                    placeholder="Brief subject of your message"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    hasError={!!formErrors.subject}
                    aria-required="true"
                    aria-invalid={!!formErrors.subject}
                  />
                  {formErrors.subject && (
                    <p className={styles['field-error']}>{formErrors.subject}</p>
                  )}

                  <FormSelect
                    icon="box"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    options={categoryOptions}
                    required
                    hasError={!!formErrors.category}
                    aria-required="true"
                    aria-invalid={!!formErrors.category}
                  />
                  {formErrors.category && (
                    <p className={styles['field-error']}>{formErrors.category}</p>
                  )}

                  <FormTextarea
                    name="message"
                    placeholder="Please describe your issue or question in detail..."
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    required
                    hasError={!!formErrors.message}
                    aria-required="true"
                    aria-invalid={!!formErrors.message}
                  />
                  {formErrors.message && (
                    <p className={styles['field-error']}>{formErrors.message}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={styles['submit-btn']}
                    aria-busy={isLoading}
                  >
                    <Send
                      size={16}
                      aria-hidden="true"
                      className={styles['btn-icon']}
                    />
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SupportPage;
