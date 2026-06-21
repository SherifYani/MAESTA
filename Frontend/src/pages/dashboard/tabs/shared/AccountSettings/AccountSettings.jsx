/**
 * @file AccountSettings.jsx
 * @description Account security settings page — allows users to change password,
 *              toggle 2FA, manage active sessions, and delete their account.
 *              All actions are wired to real backend APIs.
 * @author Sherif Talaat
 * @date 2026-06-17
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-06-17
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Key, Monitor, AlertTriangle, Eye, EyeOff, CheckCircle, XCircle, LogOut, Bell, Globe, Moon, Save } from 'lucide-react';
import authService from '../../../../../services/authService';
import profileService from '../../../../../services/profileService';
import styles from './AccountSettings.module.css';

// ─── Sub-components ────────────────────────────────────────────────────────────

/**
 * Tab button used in the top navigation of the page.
 * @param {Object} props
 * @param {boolean} props.active - Whether this tab is selected.
 * @param {Function} props.onClick - Click handler.
 * @param {React.ReactNode} props.icon - Icon element.
 * @param {string} props.label - Tab label text.
 * @returns {JSX.Element}
 */
const TabButton = ({ active, onClick, icon, label }) => (
    <button
        type="button"
        className={`${styles.tabButton} ${active ? styles.tabButtonActive : ''}`}
        onClick={onClick}
        aria-pressed={active}
    >
        {icon}
        <span>{label}</span>
    </button>
);

/**
 * Inline status message shown after an API action.
 * @param {Object} props
 * @param {'success'|'error'} props.type - Message type.
 * @param {string} props.message - Text to display.
 * @returns {JSX.Element|null}
 */
const StatusMessage = ({ type, message }) => {
    if (!message) return null;
    return (
        <div className={`${styles.statusMessage} ${styles[`statusMessage--${type}`]}`} role="alert">
            {type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <span>{message}</span>
        </div>
    );
};

// ─── Main Component ─────────────────────────────────────────────────────────────

/**
 * Account Settings page — Security, Sessions, and Danger Zone.
 * @returns {JSX.Element} The rendered account settings page.
 */
const AccountSettings = () => {
    const [activeTab, setActiveTab] = useState('preferences');

    console.log('AccountSettings component mounted');

    // Backend user settings
    const [settingsForm, setSettingsForm] = useState({
        language: 'en',
        timeZone: '',
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: false,
        darkMode: false,
        preferences: '',
    });
    const [settingsStatus, setSettingsStatus] = useState({ type: '', message: '' });
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    // Change Password
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // 2FA
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [is2FALoading, setIs2FALoading] = useState(false);
    const [twoFAStatus, setTwoFAStatus] = useState({ type: '', message: '' });

    // Sessions
    const [sessions, setSessions] = useState([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);
    const [sessionsStatus, setSessionsStatus] = useState({ type: '', message: '' });

    // Delete Account
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState({ type: '', message: '' });
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    // ─── Load backend user settings ────────────────────────────────────────
    const loadSettings = useCallback(async () => {
        setIsLoadingSettings(true);
        setSettingsStatus({ type: '', message: '' });
        try {
            const data = await profileService.getUserSettings();
            setSettingsForm({
                language: data?.language || 'en',
                timeZone: data?.timeZone || '',
                emailNotifications: Boolean(data?.emailNotifications),
                smsNotifications: Boolean(data?.smsNotifications),
                pushNotifications: Boolean(data?.pushNotifications),
                darkMode: Boolean(data?.darkMode),
                preferences: data?.preferences || '',
            });
        } catch (err) {
            setSettingsStatus({ type: 'error', message: err?.message || 'Failed to load settings.' });
        } finally {
            setIsLoadingSettings(false);
        }
    }, []);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const handleSettingsChange = (field, value) => {
        setSettingsForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setIsSavingSettings(true);
        setSettingsStatus({ type: '', message: '' });
        try {
            const updated = await profileService.updateUserSettings(settingsForm);
            setSettingsForm({
                language: updated?.language || settingsForm.language,
                timeZone: updated?.timeZone || settingsForm.timeZone,
                emailNotifications: Boolean(updated?.emailNotifications),
                smsNotifications: Boolean(updated?.smsNotifications),
                pushNotifications: Boolean(updated?.pushNotifications),
                darkMode: Boolean(updated?.darkMode),
                preferences: updated?.preferences || '',
            });
            setSettingsStatus({ type: 'success', message: 'Settings saved successfully.' });
        } catch (err) {
            setSettingsStatus({ type: 'error', message: err?.message || 'Failed to save settings.' });
        } finally {
            setIsSavingSettings(false);
        }
    };

    // ─── Load sessions when Sessions tab is opened ──────────────────────────
    const loadSessions = useCallback(async () => {
        setIsLoadingSessions(true);
        try {
            const data = await profileService.getActiveSessions?.();
            setSessions(Array.isArray(data) ? data : []);
        } catch {
            // Sessions endpoint may not return data yet — gracefully show empty
            setSessions([]);
        } finally {
            setIsLoadingSessions(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'sessions') {
            loadSessions();
        }
    }, [activeTab, loadSessions]);

    // ─── Change Password ─────────────────────────────────────────────────────
    /**
     * Submit the change-password form.
     * @param {React.FormEvent} e - Form submit event.
     */
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordStatus({ type: '', message: '' });

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            setPasswordStatus({ type: 'error', message: 'Password must be at least 8 characters.' });
            return;
        }

        setIsChangingPassword(true);
        try {
            await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            setPasswordStatus({ type: 'success', message: 'Password changed successfully.' });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordStatus({ type: 'error', message: err?.response?.data?.message || 'Failed to change password.' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    // ─── Toggle 2FA ──────────────────────────────────────────────────────────
    /**
     * Enable or disable Two-Factor Authentication.
     */
    const handleToggle2FA = async () => {
        setIs2FALoading(true);
        setTwoFAStatus({ type: '', message: '' });
        try {
            if (is2FAEnabled) {
                await authService.disable2FA();
                setIs2FAEnabled(false);
                setTwoFAStatus({ type: 'success', message: 'Two-factor authentication disabled.' });
            } else {
                await authService.enable2FA();
                setIs2FAEnabled(true);
                setTwoFAStatus({ type: 'success', message: 'Two-factor authentication enabled. Check your email for the setup code.' });
            }
        } catch (err) {
            setTwoFAStatus({ type: 'error', message: err?.response?.data?.message || 'Failed to update 2FA settings.' });
        } finally {
            setIs2FALoading(false);
        }
    };

    // ─── Logout All Sessions ─────────────────────────────────────────────────
    /**
     * Revoke all refresh tokens across all devices.
     */
    const handleLogoutAll = async () => {
        setSessionsStatus({ type: '', message: '' });
        try {
            await authService.logoutAll();
            setSessionsStatus({ type: 'success', message: 'Successfully signed out of all other devices.' });
            setSessions([]);
        } catch (err) {
            setSessionsStatus({ type: 'error', message: 'Failed to sign out of all devices.' });
        }
    };

    // ─── Delete Account ──────────────────────────────────────────────────────
    /**
     * Permanently delete the user's account.
     */
    const handleDeleteAccount = async () => {
        setIsDeletingAccount(true);
        setDeleteStatus({ type: '', message: '' });
        try {
            await profileService.deleteAccount();
            // Auth context will detect the 401 on next request and redirect to login
            window.location.href = '/login';
        } catch (err) {
            setDeleteStatus({ type: 'error', message: err?.response?.data?.message || 'Failed to delete account. Please try again.' });
            setIsDeletingAccount(false);
        }
    };

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <div className={styles.page}>
            {/* Radial gradient background effect */}
            <div className={styles.page__bg} aria-hidden="true" />

            {/* Page Header */}
            <div className={styles.page__header}>
                <div className={styles.page__headerContent}>
                    <h1 className={styles.page__title}>Account Settings</h1>
                    <p className={styles.page__subtitle}>Manage your security preferences and account details.</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <nav className={styles.tabs} role="tablist" aria-label="Account settings sections">
                <TabButton
                    active={activeTab === 'preferences'}
                    onClick={() => setActiveTab('preferences')}
                    icon={<Globe size={18} />}
                    label="Preferences"
                />
                <TabButton
                    active={activeTab === 'security'}
                    onClick={() => setActiveTab('security')}
                    icon={<Key size={18} />}
                    label="Security"
                />
                <TabButton
                    active={activeTab === 'sessions'}
                    onClick={() => setActiveTab('sessions')}
                    icon={<Monitor size={18} />}
                    label="Sessions"
                />
                <TabButton
                    active={activeTab === 'danger'}
                    onClick={() => setActiveTab('danger')}
                    icon={<AlertTriangle size={18} />}
                    label="Danger Zone"
                />
            </nav>

            {/* ── Preferences Tab ── */}
            {activeTab === 'preferences' && (
                <div className={styles.content} role="tabpanel" aria-label="User preferences">
                    <div className={styles.card}>
                        <div className={styles.card__header}>
                            <div className={styles.card__icon}><Globe size={22} /></div>
                            <div>
                                <h2 className={styles.card__title}>Platform Settings</h2>
                                <p className={styles.card__subtitle}>Manage backend-backed language, timezone, theme, and notification preferences.</p>
                            </div>
                        </div>

                        <StatusMessage type={settingsStatus.type} message={settingsStatus.message} />

                        {isLoadingSettings ? (
                            <div className={styles.sessions__loading}>
                                <div className={styles.spinner} aria-label="Loading settings" />
                            </div>
                        ) : (
                            <form className={styles.form} onSubmit={handleSaveSettings}>
                                <div className={styles.form__group}>
                                    <label className={styles.form__label} htmlFor="settings-language">Language</label>
                                    <select
                                        id="settings-language"
                                        className={styles.form__input}
                                        value={settingsForm.language}
                                        onChange={(e) => handleSettingsChange('language', e.target.value)}
                                    >
                                        <option value="en">English</option>
                                        <option value="ar">Arabic</option>
                                    </select>
                                </div>

                                <div className={styles.form__group}>
                                    <label className={styles.form__label} htmlFor="settings-timezone">Time Zone</label>
                                    <input
                                        id="settings-timezone"
                                        type="text"
                                        className={styles.form__input}
                                        value={settingsForm.timeZone}
                                        onChange={(e) => handleSettingsChange('timeZone', e.target.value)}
                                        placeholder="Africa/Cairo"
                                    />
                                </div>

                                <div className={styles.settingsGrid}>
                                    <label className={styles.settingsToggle}>
                                        <input
                                            type="checkbox"
                                            checked={settingsForm.emailNotifications}
                                            onChange={(e) => handleSettingsChange('emailNotifications', e.target.checked)}
                                        />
                                        <span><Bell size={18} /> Email notifications</span>
                                    </label>
                                    <label className={styles.settingsToggle}>
                                        <input
                                            type="checkbox"
                                            checked={settingsForm.smsNotifications}
                                            onChange={(e) => handleSettingsChange('smsNotifications', e.target.checked)}
                                        />
                                        <span><Bell size={18} /> SMS notifications</span>
                                    </label>
                                    <label className={styles.settingsToggle}>
                                        <input
                                            type="checkbox"
                                            checked={settingsForm.pushNotifications}
                                            onChange={(e) => handleSettingsChange('pushNotifications', e.target.checked)}
                                        />
                                        <span><Bell size={18} /> Push notifications</span>
                                    </label>
                                    <label className={styles.settingsToggle}>
                                        <input
                                            type="checkbox"
                                            checked={settingsForm.darkMode}
                                            onChange={(e) => handleSettingsChange('darkMode', e.target.checked)}
                                        />
                                        <span><Moon size={18} /> Dark mode preference</span>
                                    </label>
                                </div>

                                <div className={styles.form__group}>
                                    <label className={styles.form__label} htmlFor="settings-preferences">Advanced Preferences JSON</label>
                                    <textarea
                                        id="settings-preferences"
                                        className={`${styles.form__input} ${styles.form__textarea}`}
                                        value={settingsForm.preferences}
                                        onChange={(e) => handleSettingsChange('preferences', e.target.value)}
                                        placeholder='{"dashboardDensity":"comfortable"}'
                                        rows={4}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={styles.btn__primary}
                                    disabled={isSavingSettings}
                                >
                                    <Save size={16} />
                                    {isSavingSettings ? 'Saving…' : 'Save Settings'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ── Security Tab ── */}
            {activeTab === 'security' && (
                <div className={styles.content} role="tabpanel" aria-label="Security settings">

                    {/* Change Password Card */}
                    <div className={styles.card}>
                        <div className={styles.card__header}>
                            <div className={styles.card__icon}><Key size={22} /></div>
                            <div>
                                <h2 className={styles.card__title}>Change Password</h2>
                                <p className={styles.card__subtitle}>Update your account password. Use a strong, unique password.</p>
                            </div>
                        </div>

                        <StatusMessage type={passwordStatus.type} message={passwordStatus.message} />

                        <form className={styles.form} onSubmit={handleChangePassword} noValidate>
                            {/* Current Password */}
                            <div className={styles.form__group}>
                                <label className={styles.form__label} htmlFor="current-password">
                                    Current Password
                                </label>
                                <div className={styles.form__inputWrapper}>
                                    <input
                                        id="current-password"
                                        type={showPasswords.current ? 'text' : 'password'}
                                        className={styles.form__input}
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.form__eyeButton}
                                        onClick={() => setShowPasswords(s => ({ ...s, current: !s.current }))}
                                        aria-label={showPasswords.current ? 'Hide password' : 'Show password'}
                                    >
                                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className={styles.form__group}>
                                <label className={styles.form__label} htmlFor="new-password">
                                    New Password
                                </label>
                                <div className={styles.form__inputWrapper}>
                                    <input
                                        id="new-password"
                                        type={showPasswords.new ? 'text' : 'password'}
                                        className={styles.form__input}
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                                        autoComplete="new-password"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        className={styles.form__eyeButton}
                                        onClick={() => setShowPasswords(s => ({ ...s, new: !s.new }))}
                                        aria-label={showPasswords.new ? 'Hide password' : 'Show password'}
                                    >
                                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className={styles.form__group}>
                                <label className={styles.form__label} htmlFor="confirm-password">
                                    Confirm New Password
                                </label>
                                <div className={styles.form__inputWrapper}>
                                    <input
                                        id="confirm-password"
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        className={styles.form__input}
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.form__eyeButton}
                                        onClick={() => setShowPasswords(s => ({ ...s, confirm: !s.confirm }))}
                                        aria-label={showPasswords.confirm ? 'Hide password' : 'Show password'}
                                    >
                                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={styles.btn__primary}
                                disabled={isChangingPassword}
                            >
                                {isChangingPassword ? 'Updating…' : 'Update Password'}
                            </button>
                        </form>
                    </div>

                    {/* 2FA Card */}
                    <div className={styles.card}>
                        <div className={styles.card__header}>
                            <div className={styles.card__icon}><Shield size={22} /></div>
                            <div className={styles.card__headerText}>
                                <h2 className={styles.card__title}>Two-Factor Authentication</h2>
                                <p className={styles.card__subtitle}>
                                    Add an extra layer of security to your account. You'll receive a verification code on login.
                                </p>
                            </div>
                        </div>

                        <StatusMessage type={twoFAStatus.type} message={twoFAStatus.message} />

                        <div className={styles.twoFA__row}>
                            <div className={styles.twoFA__info}>
                                <span className={`${styles.twoFA__badge} ${is2FAEnabled ? styles['twoFA__badge--enabled'] : styles['twoFA__badge--disabled']}`}>
                                    {is2FAEnabled ? 'Enabled' : 'Disabled'}
                                </span>
                                <p className={styles.twoFA__desc}>
                                    {is2FAEnabled
                                        ? 'Your account is protected with two-factor authentication.'
                                        : 'Enable 2FA to significantly improve your account security.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                className={is2FAEnabled ? styles.btn__outline : styles.btn__primary}
                                onClick={handleToggle2FA}
                                disabled={is2FALoading}
                            >
                                {is2FALoading ? 'Updating…' : is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Sessions Tab ── */}
            {activeTab === 'sessions' && (
                <div className={styles.content} role="tabpanel" aria-label="Active sessions">
                    <div className={styles.card}>
                        <div className={styles.card__header}>
                            <div className={styles.card__icon}><Monitor size={22} /></div>
                            <div className={styles.card__headerText}>
                                <h2 className={styles.card__title}>Active Sessions</h2>
                                <p className={styles.card__subtitle}>
                                    These are devices currently logged into your account.
                                </p>
                            </div>
                        </div>

                        <StatusMessage type={sessionsStatus.type} message={sessionsStatus.message} />

                        {isLoadingSessions ? (
                            <div className={styles.sessions__loading}>
                                <div className={styles.spinner} aria-label="Loading sessions" />
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className={styles.sessions__empty}>
                                <Monitor size={40} className={styles.sessions__emptyIcon} />
                                <p>No active sessions found.</p>
                            </div>
                        ) : (
                            <ul className={styles.sessions__list}>
                                {sessions.map((session, idx) => (
                                    <li key={session.sessionId || idx} className={styles.sessions__item}>
                                        <Monitor size={20} className={styles.sessions__itemIcon} />
                                        <div className={styles.sessions__itemInfo}>
                                            <p className={styles.sessions__itemDevice}>{session.deviceInfo || 'Unknown Device'}</p>
                                            <p className={styles.sessions__itemMeta}>
                                                {session.ipAddress || ''} · {session.createdAt ? new Date(session.createdAt).toLocaleString() : ''}
                                            </p>
                                        </div>
                                        {session.isCurrent && (
                                            <span className={styles.sessions__currentBadge}>Current</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className={styles.card__footer}>
                            <button
                                type="button"
                                className={styles.btn__danger}
                                onClick={handleLogoutAll}
                            >
                                <LogOut size={16} />
                                Sign Out of All Devices
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Danger Zone Tab ── */}
            {activeTab === 'danger' && (
                <div className={styles.content} role="tabpanel" aria-label="Danger zone">
                    <div className={`${styles.card} ${styles['card--danger']}`}>
                        <div className={styles.card__header}>
                            <div className={`${styles.card__icon} ${styles['card__icon--danger']}`}>
                                <AlertTriangle size={22} />
                            </div>
                            <div className={styles.card__headerText}>
                                <h2 className={styles.card__title}>Delete Account</h2>
                                <p className={styles.card__subtitle}>
                                    Permanently delete your account and all associated data. This action <strong>cannot</strong> be undone.
                                </p>
                            </div>
                        </div>

                        <StatusMessage type={deleteStatus.type} message={deleteStatus.message} />

                        {!showDeleteConfirm ? (
                            <button
                                type="button"
                                className={styles.btn__danger}
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                Delete My Account
                            </button>
                        ) : (
                            <div className={styles.deleteConfirm}>
                                <p className={styles.deleteConfirm__text}>
                                    Are you absolutely sure? All your data — applications, messages, and profile — will be permanently removed.
                                </p>
                                <div className={styles.deleteConfirm__actions}>
                                    <button
                                        type="button"
                                        className={styles.btn__outline}
                                        onClick={() => setShowDeleteConfirm(false)}
                                        disabled={isDeletingAccount}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.btn__danger}
                                        onClick={handleDeleteAccount}
                                        disabled={isDeletingAccount}
                                    >
                                        {isDeletingAccount ? 'Deleting…' : 'Yes, Delete My Account'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountSettings;
