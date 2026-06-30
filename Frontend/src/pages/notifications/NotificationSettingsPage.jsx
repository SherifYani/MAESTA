/**
 * @file NotificationSettingsPage.jsx
 * @description Notification preferences and settings page
 * @author Sherif Talaat
 * @date 2026-02-07
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 * 
 * @requires ../../context/NotificationContext
 * @requires ../../utils/notificationTypes
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw, Bell, Mail, Smartphone } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { NOTIFICATION_CATEGORIES } from '../../utils/notificationTypes';
import { PageContainer } from '../../components/layout';
import styles from './NotificationSettingsPage.module.css';

/**
 * NotificationSettingsPage component - Manage notification preferences
 * @returns {JSX.Element} Rendered settings page
 */
const NotificationSettingsPage = () => {
    const navigate = useNavigate();
    const context = useNotifications();
    const {
        preferences = {},
        updatePreferences = () => { },
    } = context || {};

    const defaultPreferences = {
        inApp: { jobs: true, gigs: true, communication: true, system: true },
        email: { jobs: true, gigs: true, communication: false, system: true },
        push: { enabled: false, jobs: false, gigs: false, communication: false, system: false },
    };

    // Merge backend flat prefs (EmailNotifications, PushNotifications) into the nested local shape
    const mergePreferences = (backendPrefs) => {
        if (!backendPrefs || Object.keys(backendPrefs).length === 0) return defaultPreferences;
        // If it's already nested (has inApp key), use it directly
        if (backendPrefs.inApp) return backendPrefs;
        // Otherwise it's the flat backend format — map it
        return {
            ...defaultPreferences,
            email: {
                ...defaultPreferences.email,
                jobs: backendPrefs.emailNotifications ?? backendPrefs.EmailNotifications ?? true,
                gigs: backendPrefs.emailNotifications ?? backendPrefs.EmailNotifications ?? true,
                communication: backendPrefs.emailNotifications ?? backendPrefs.EmailNotifications ?? false,
                system: backendPrefs.emailNotifications ?? backendPrefs.EmailNotifications ?? true,
            },
            push: {
                ...defaultPreferences.push,
                enabled: backendPrefs.pushNotifications ?? backendPrefs.PushNotifications ?? false,
            },
        };
    };

    // Local state for preferences
    const [localPreferences, setLocalPreferences] = useState(defaultPreferences);

    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Use a ref to track initialization so we only sync from context ONCE.
    // This prevents infinite re-render loops caused by context returning a new
    // object reference for `preferences` on every render cycle.
    const hasInitialized = useRef(false);

    // Load preferences from context
    useEffect(() => {
        if (!hasInitialized.current && preferences && Object.keys(preferences).length > 0) {
            hasInitialized.current = true;
            setLocalPreferences(mergePreferences(preferences));
        }
    }, [preferences, mergePreferences]);

    /**
     * Handle toggle change
     * @param {string} channel - Channel type (inApp, email, push)
     * @param {string} category - Notification category
     */
    const handleToggle = (channel, category) => {
        setLocalPreferences(prev => ({
            ...prev,
            [channel]: {
                ...prev[channel],
                [category]: !prev[channel][category],
            },
        }));
        setHasChanges(true);
    };

    /**
     * Handle push notifications toggle
     */
    const handlePushToggle = () => {
        setLocalPreferences(prev => ({
            ...prev,
            push: {
                ...prev.push,
                enabled: !prev.push.enabled,
            },
        }));
        setHasChanges(true);
    };

    /**
     * Save preferences
     */
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updatePreferences(localPreferences);
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to save preferences:', error);
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Reset to defaults
     */
    const handleReset = () => {
        setLocalPreferences({
            inApp: {
                jobs: true,
                gigs: true,
                communication: true,
                system: true,
            },
            email: {
                jobs: true,
                gigs: true,
                communication: false,
                system: true,
            },
            push: {
                enabled: false,
                jobs: false,
                gigs: false,
                communication: false,
                system: false,
            },
        });
        setHasChanges(true);
    };

    return (
        <PageContainer className={styles.container} size="md">
            {/* Header */}
            <header className={styles.header}>
                <button
                    className={styles.backButton}
                    onClick={() => navigate('/notifications')}
                    aria-label="Go back to notifications"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Notifications</span>
                </button>

                <h1 className={styles.title}>Notification Settings</h1>
                <p className={styles.subtitle}>
                    Manage how you receive notifications across different channels
                </p>
            </header>

            {/* Settings Content */}
            <div className={styles.content}>
                {/* In-App Notifications */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionIcon}>
                            <Bell size={24} />
                        </div>
                        <div>
                            <h2 className={styles.sectionTitle}>In-App Notifications</h2>
                            <p className={styles.sectionDescription}>
                                Receive notifications within the app
                            </p>
                        </div>
                    </div>

                    <div className={styles.settingsList}>
                        {Object.entries(NOTIFICATION_CATEGORIES).map(([key, category]) => (
                            <div key={key} className={styles.settingItem}>
                                <div className={styles.settingInfo}>
                                    <span className={styles.settingLabel}>{category}</span>
                                    <span className={styles.settingHint}>
                                        Get in-app notifications for {category.toLowerCase()}
                                    </span>
                                </div>
                                <label className={styles.toggle}>
                                    <input
                                        type="checkbox"
                                        checked={localPreferences.inApp[key.toLowerCase()] ?? false}
                                        onChange={() => handleToggle('inApp', key.toLowerCase())}
                                        aria-label={`Toggle ${category} in-app notifications`}
                                    />
                                    <span className={styles.toggleSlider}></span>
                                </label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Email Notifications */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionIcon}>
                            <Mail size={24} />
                        </div>
                        <div>
                            <h2 className={styles.sectionTitle}>Email Notifications</h2>
                            <p className={styles.sectionDescription}>
                                Receive notifications via email
                            </p>
                        </div>
                    </div>

                    <div className={styles.settingsList}>
                        {Object.entries(NOTIFICATION_CATEGORIES).map(([key, category]) => (
                            <div key={key} className={styles.settingItem}>
                                <div className={styles.settingInfo}>
                                    <span className={styles.settingLabel}>{category}</span>
                                    <span className={styles.settingHint}>
                                        Get email notifications for {category.toLowerCase()}
                                    </span>
                                </div>
                                <label className={styles.toggle}>
                                    <input
                                        type="checkbox"
                                        checked={localPreferences.email[key.toLowerCase()] ?? false}
                                        onChange={() => handleToggle('email', key.toLowerCase())}
                                        aria-label={`Toggle ${category} email notifications`}
                                    />
                                    <span className={styles.toggleSlider}></span>
                                </label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Push Notifications */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionIcon}>
                            <Smartphone size={24} />
                        </div>
                        <div>
                            <h2 className={styles.sectionTitle}>Push Notifications</h2>
                            <p className={styles.sectionDescription}>
                                Receive push notifications on your device
                            </p>
                        </div>
                    </div>

                    <div className={styles.settingsList}>
                        {/* Master Push Toggle */}
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <span className={styles.settingLabel}>Enable Push Notifications</span>
                                <span className={styles.settingHint}>
                                    Allow push notifications from Job Magnet
                                </span>
                            </div>
                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={localPreferences.push.enabled ?? false}
                                    onChange={handlePushToggle}
                                    aria-label="Toggle push notifications"
                                />
                                <span className={styles.toggleSlider}></span>
                            </label>
                        </div>

                        {/* Individual Push Settings (disabled if push not enabled) */}
                        {localPreferences.push.enabled && (
                            <>
                                {Object.entries(NOTIFICATION_CATEGORIES).map(([key, category]) => (
                                    <div key={key} className={styles.settingItem}>
                                        <div className={styles.settingInfo}>
                                            <span className={styles.settingLabel}>{category}</span>
                                            <span className={styles.settingHint}>
                                                Get push notifications for {category.toLowerCase()}
                                            </span>
                                        </div>
                                        <label className={styles.toggle}>
                                            <input
                                                type="checkbox"
                                                checked={localPreferences.push[key.toLowerCase()] ?? false}
                                                onChange={() => handleToggle('push', key.toLowerCase())}
                                                aria-label={`Toggle ${category} push notifications`}
                                            />
                                            <span className={styles.toggleSlider}></span>
                                        </label>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </section>
            </div>

            {/* Actions Footer */}
            {hasChanges && (
                <footer className={styles.footer}>
                    <div className={styles.footerContent}>
                        <button
                            className={styles.resetButton}
                            onClick={handleReset}
                            aria-label="Reset to default settings"
                        >
                            <RotateCcw size={18} />
                            Reset to Defaults
                        </button>

                        <div className={styles.actionButtons}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => navigate('/notifications')}
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.saveButton}
                                onClick={handleSave}
                                disabled={isSaving}
                                aria-label="Save notification settings"
                            >
                                <Save size={18} />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </footer>
            )}
        </PageContainer>
    );
};

export default NotificationSettingsPage;
