/**
 * @file AssistantSettings.jsx
 * @description Sherif Talaat settings panel component
 * @author Sherif Talaat
 * @verison 1.1.0
 * @date 2026-02-06
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */



import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import GeneralSelect from "../common/GeneralSelect";
import styles from "./AssistantSettings.module.css";

/**
 * Sherif Talaat settings panel component
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Function to close the settings panel
 * @returns {JSX.Element} Rendered settings panel
 */
const AssistantSettings = ({ onClose, useRag, onToggleRag }) => {
    const defaultSettings = {
        language: "en",
        voiceEnabled: true,
        autoPlayResponses: false,
        voiceSpeed: 1,
        theme: "auto",
        notifications: true,
        chatbotUrl: localStorage.getItem("maesta_chatbot_api_url") || process.env.REACT_APP_CHATBOT_API_URL || "http://localhost:5000",
        chatbotApiKey: localStorage.getItem("maesta_chatbot_api_key") || "",
    };

    const [settings, setSettings] = useState(defaultSettings);

    /**
     * Loads settings from localStorage on component mount
     */
    useEffect(() => {
        const savedSettings = localStorage.getItem("ai_assistant_settings");
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                setSettings(parsedSettings);
            } catch (error) {
                console.error("Failed to parse saved settings:", error);
                localStorage.removeItem("ai_assistant_settings");
            }
        }
    }, []);

    /**
     * Handles setting changes and saves to localStorage
     * @param {string} key - Setting key to update
     * @param {*} value - New value for the setting
     */
    const handleSettingChange = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem("ai_assistant_settings", JSON.stringify(newSettings));

        if (key === "chatbotUrl") {
            localStorage.setItem("maesta_chatbot_api_url", value.trim());
        }

        if (key === "chatbotApiKey") {
            localStorage.setItem("maesta_chatbot_api_key", value.trim());
        }
    };

    /**
     * Resets all settings to default values
     */
    const handleResetSettings = () => {
        setSettings(defaultSettings);
        localStorage.setItem("ai_assistant_settings", JSON.stringify(defaultSettings));
    };

    return (
        <div className={styles.panel} role="dialog" aria-label="Assistant Settings">
            <header className={styles.header}>
                <h4 className={styles.title}>Assistant Settings</h4>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close settings"
                >
                    ×
                </button>
            </header>

            <div className={styles.content}>
                {/* Language Setting */}
                <div className={styles.setting}>
                    <label htmlFor="language" className={styles.label}>
                        Language
                    </label>
                    <GeneralSelect
                        value={settings.language}
                        onChange={(selectedValue) => handleSettingChange("language", selectedValue)}
                        options={[
                            { value: "ar", label: "Arabic" },
                            { value: "en", label: "English" }
                        ]}
                        className={styles.select}
                        aria-label="Select language"
                    />
                </div>

                {/* Voice Enabled Setting */}
                <div className={styles.setting}>
                    <label className={styles.label}>Voice Enabled</label>
                    <label className={styles.toggle}>
                        <input
                            type="checkbox"
                            checked={settings.voiceEnabled}
                            onChange={(e) => handleSettingChange("voiceEnabled", e.target.checked)}
                            aria-label="Toggle voice enabled"
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                {/* Auto Play Responses Setting */}
                <div className={styles.setting}>
                    <label className={styles.label}>Auto Play Responses</label>
                    <label className={styles.toggle}>
                        <input
                            type="checkbox"
                            checked={settings.autoPlayResponses}
                            onChange={(e) => handleSettingChange("autoPlayResponses", e.target.checked)}
                            aria-label="Toggle auto play responses"
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                {/* Voice Speed Setting */}
                <div className={styles.setting}>
                    <label htmlFor="voiceSpeed" className={styles.label}>
                        Voice Speed
                    </label>
                    <div className={styles.rangeContainer}>
                        <input
                            id="voiceSpeed"
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={settings.voiceSpeed}
                            onChange={(e) => handleSettingChange("voiceSpeed", parseFloat(e.target.value))}
                            className={styles.range}
                            aria-label="Adjust voice speed"
                        />
                        <span className={styles.speedValue}>{settings.voiceSpeed}x</span>
                    </div>
                </div>

                {/* Notifications Setting */}
                <div className={styles.setting}>
                    <label className={styles.label}>Notifications</label>
                    <label className={styles.toggle}>
                        <input
                            type="checkbox"
                            checked={settings.notifications}
                            onChange={(e) => handleSettingChange("notifications", e.target.checked)}
                            aria-label="Toggle notifications"
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                <div className={styles.setting}>
                    <div>
                        <span className={styles.label}>Document Search</span>
                        <p className={styles.hint}>Use chatbot RAG knowledge base when answering.</p>
                    </div>
                    <label className={styles.toggle}>
                        <input
                            type="checkbox"
                            checked={useRag}
                            onChange={onToggleRag}
                            aria-label="Toggle document search"
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                <div className={styles.fieldSetting}>
                    <label htmlFor="chatbotUrl" className={styles.label}>Chatbot API URL</label>
                    <input
                        id="chatbotUrl"
                        className={styles.textInput}
                        value={settings.chatbotUrl}
                        onChange={(event) => handleSettingChange("chatbotUrl", event.target.value)}
                        placeholder="http://localhost:5000"
                    />
                </div>

                <div className={styles.fieldSetting}>
                    <label htmlFor="chatbotApiKey" className={styles.label}>Chatbot API Key</label>
                    <input
                        id="chatbotApiKey"
                        className={styles.textInput}
                        value={settings.chatbotApiKey}
                        onChange={(event) => handleSettingChange("chatbotApiKey", event.target.value)}
                        placeholder="Paste key from Flask admin"
                    />
                </div>
            </div>

            <footer className={styles.footer}>
                <button
                    className={styles.resetButton}
                    onClick={handleResetSettings}
                    aria-label="Reset settings to default"
                >
                    Reset to Default
                </button>
            </footer>
        </div>
    );
};

AssistantSettings.propTypes = {
    onClose: PropTypes.func.isRequired,
    useRag: PropTypes.bool,
    onToggleRag: PropTypes.func,
};

AssistantSettings.defaultProps = {
    useRag: true,
    onToggleRag: null,
};

export default AssistantSettings;
