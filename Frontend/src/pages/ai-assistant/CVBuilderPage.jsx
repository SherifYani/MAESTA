/**
 * @file CVBuilderPage.jsx
 * @description Interactive CV/Resume builder with AI assistance (FR-202)
 * @author Sherif Talaat
 * @date 2026-02-05
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-05
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Briefcase, GraduationCap, Zap, Sparkles, Plus,
    Trash2, X, Loader2, Bot, Download, ArrowLeft
} from 'lucide-react';
import aiAssistantService from '../../services/aiAssistantService';
import { PageContainer } from '../../components/layout';
import styles from './CVBuilderPage.module.css';

/**
 * Interactive CV/Resume builder with AI assistance
 * @component
 * @returns {JSX.Element} The CV builder page component
 */
const CVBuilderPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState(null);

    const [cvData, setCvData] = useState({
        personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            title: '',
            summary: ''
        },
        experience: [],
        education: [],
        skills: [],
        languages: [],
        certifications: []
    });

    const steps = [
        { id: 1, title: 'Personal Information', icon: <User size={20} aria-hidden="true" /> },
        { id: 2, title: 'Work Experience', icon: <Briefcase size={20} aria-hidden="true" /> },
        { id: 3, title: 'Education', icon: <GraduationCap size={20} aria-hidden="true" /> },
        { id: 4, title: 'Skills', icon: <Zap size={20} aria-hidden="true" /> },
        { id: 5, title: 'Review & Improve', icon: <Sparkles size={20} aria-hidden="true" /> }
    ];

    /**
     * Updates personal information field
     * @param {string} field - Field name to update
     * @param {string} value - New field value
     */
    const handlePersonalInfoChange = (field, value) => {
        setCvData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [field]: value }
        }));
    };

    /**
     * Adds a new work experience entry
     */
    const addExperience = () => {
        setCvData(prev => ({
            ...prev,
            experience: [...prev.experience, {
                id: Date.now(),
                company: '',
                title: '',
                startDate: '',
                endDate: '',
                current: false,
                description: ''
            }]
        }));
    };

    /**
     * Updates a specific experience entry
     * @param {number} id - Experience entry ID
     * @param {string} field - Field name to update
     * @param {string} value - New field value
     */
    const updateExperience = (id, field, value) => {
        setCvData(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === id ? { ...exp, [field]: value } : exp
            )
        }));
    };

    /**
     * Removes a work experience entry
     * @param {number} id - Experience entry ID to remove
     */
    const removeExperience = (id) => {
        setCvData(prev => ({
            ...prev,
            experience: prev.experience.filter(exp => exp.id !== id)
        }));
    };

    /**
     * Adds a new education entry
     */
    const addEducation = () => {
        setCvData(prev => ({
            ...prev,
            education: [...prev.education, {
                id: Date.now(),
                institution: '',
                degree: '',
                field: '',
                startDate: '',
                endDate: ''
            }]
        }));
    };

    /**
     * Updates a specific education entry
     * @param {number} id - Education entry ID
     * @param {string} field - Field name to update
     * @param {string} value - New field value
     */
    const updateEducation = (id, field, value) => {
        setCvData(prev => ({
            ...prev,
            education: prev.education.map(edu =>
                edu.id === id ? { ...edu, [field]: value } : edu
            )
        }));
    };

    /**
     * Removes an education entry
     * @param {number} id - Education entry ID to remove
     */
    const removeEducation = (id) => {
        setCvData(prev => ({
            ...prev,
            education: prev.education.filter(edu => edu.id !== id)
        }));
    };

    /**
     * Adds a skill to the skills list
     * @param {string} skill - Skill to add
     */
    const addSkill = (skill) => {
        if (skill.trim() && !cvData.skills.includes(skill.trim())) {
            setCvData(prev => ({
                ...prev,
                skills: [...prev.skills, skill.trim()]
            }));
        }
    };

    /**
     * Removes a skill from the skills list
     * @param {string} skill - Skill to remove
     */
    const removeSkill = (skill) => {
        setCvData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skill)
        }));
    };

    /**
     * Analyzes CV using AI assistant
     * @async
     * @returns {Promise<void>}
     */
    const analyzeCV = async () => {
        setIsAnalyzing(true);
        try {
            const result = await aiAssistantService.analyzeResume(cvData);
            setAiSuggestions(result);
        } catch (error) {
            console.error('Error analyzing CV:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    /**
     * Improves professional summary using AI
     * @async
     * @returns {Promise<void>}
     */
    const improveSummary = async () => {
        try {
            const result = await aiAssistantService.improveText(
                cvData.personalInfo.summary,
                'professional'
            );
            handlePersonalInfoChange('summary', result.improvedText || result.text);
        } catch (error) {
            console.error('Error improving summary:', error);
        }
    };

    /**
     * Renders the current step content
     * @returns {JSX.Element} The step content
     */
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>Personal Information</h2>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label htmlFor="fullName">Full Name *</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    value={cvData.personalInfo.fullName}
                                    onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                    aria-required="true"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="title">Job Title *</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={cvData.personalInfo.title}
                                    onChange={(e) => handlePersonalInfoChange('title', e.target.value)}
                                    placeholder="e.g., Software Developer"
                                    required
                                    aria-required="true"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={cvData.personalInfo.email}
                                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                                    placeholder="example@email.com"
                                    required
                                    aria-required="true"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={cvData.personalInfo.phone}
                                    onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                                    placeholder="+20 xxx xxx xxxx"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="location">Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    value={cvData.personalInfo.location}
                                    onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label htmlFor="summary">
                                Professional Summary
                                <button
                                    type="button"
                                    className={styles.aiButton}
                                    onClick={improveSummary}
                                    aria-label="Improve summary with AI"
                                >
                                    <Sparkles size={16} aria-hidden="true" /> Improve with AI
                                </button>
                            </label>
                            <textarea
                                id="summary"
                                value={cvData.personalInfo.summary}
                                onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                                placeholder="Write a brief summary about yourself and your career goals..."
                                rows={4}
                                aria-label="Professional summary"
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className={styles.stepContent}>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Work Experience</h2>
                            <button className={styles.addButton} onClick={addExperience}>
                                <Plus size={16} aria-hidden="true" /> Add Experience
                            </button>
                        </div>

                        {cvData.experience.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No experience added yet</p>
                                <button className={styles.addButton} onClick={addExperience}>
                                    <Plus size={16} aria-hidden="true" /> Add Your First Experience
                                </button>
                            </div>
                        ) : (
                            cvData.experience.map((exp, index) => (
                                <div key={exp.id} className={styles.entryCard}>
                                    <div className={styles.entryHeader}>
                                        <span>Experience {index + 1}</span>
                                        <button
                                            className={styles.removeButton}
                                            onClick={() => removeExperience(exp.id)}
                                            aria-label={`Remove experience ${index + 1}`}
                                        >
                                            <Trash2 size={16} aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor={`company-${exp.id}`}>Company</label>
                                            <input
                                                type="text"
                                                id={`company-${exp.id}`}
                                                value={exp.company}
                                                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                                aria-label="Company name"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor={`title-${exp.id}`}>Job Title</label>
                                            <input
                                                type="text"
                                                id={`title-${exp.id}`}
                                                value={exp.title}
                                                onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                                                aria-label="Job title"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor={`startDate-${exp.id}`}>Start Date</label>
                                            <input
                                                type="month"
                                                id={`startDate-${exp.id}`}
                                                value={exp.startDate}
                                                onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                                aria-label="Start date"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor={`endDate-${exp.id}`}>End Date</label>
                                            <input
                                                type="month"
                                                id={`endDate-${exp.id}`}
                                                value={exp.endDate}
                                                onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                                disabled={exp.current}
                                                aria-label="End date"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor={`description-${exp.id}`}>Description & Responsibilities</label>
                                        <textarea
                                            id={`description-${exp.id}`}
                                            value={exp.description}
                                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                            rows={3}
                                            aria-label="Job description and responsibilities"
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                );

            case 3:
                return (
                    <div className={styles.stepContent}>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Education</h2>
                            <button className={styles.addButton} onClick={addEducation}>
                                <Plus size={16} aria-hidden="true" /> Add Education
                            </button>
                        </div>

                        {cvData.education.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No education added yet</p>
                                <button className={styles.addButton} onClick={addEducation}>
                                    <Plus size={16} aria-hidden="true" /> Add Your First Education
                                </button>
                            </div>
                        ) : (
                            cvData.education.map((edu, index) => (
                                <div key={edu.id} className={styles.entryCard}>
                                    <div className={styles.entryHeader}>
                                        <span>Education {index + 1}</span>
                                        <button
                                            className={styles.removeButton}
                                            onClick={() => removeEducation(edu.id)}
                                            aria-label={`Remove education ${index + 1}`}
                                        >
                                            <Trash2 size={16} aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor={`institution-${edu.id}`}>Institution</label>
                                            <input
                                                type="text"
                                                id={`institution-${edu.id}`}
                                                value={edu.institution}
                                                onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                                aria-label="Educational institution"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor={`degree-${edu.id}`}>Degree</label>
                                            <input
                                                type="text"
                                                id={`degree-${edu.id}`}
                                                value={edu.degree}
                                                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                                aria-label="Degree earned"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor={`field-${edu.id}`}>Field of Study</label>
                                            <input
                                                type="text"
                                                id={`field-${edu.id}`}
                                                value={edu.field}
                                                onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                                aria-label="Field of study"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>Skills</h2>
                        <div className={styles.formGroup}>
                            <label htmlFor="skillInput">Add Your Skills</label>
                            <div className={styles.skillInput}>
                                <input
                                    type="text"
                                    id="skillInput"
                                    placeholder="Type a skill and press Enter"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            addSkill(e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                    aria-label="Add new skill"
                                />
                            </div>
                        </div>
                        <div className={styles.skillsTags} role="list" aria-label="Skills list">
                            {cvData.skills.map((skill, index) => (
                                <span key={index} className={styles.skillTag} role="listitem">
                                    {skill}
                                    <button
                                        onClick={() => removeSkill(skill)}
                                        aria-label={`Remove ${skill} skill`}
                                    >
                                        <X size={12} aria-hidden="true" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>Review & AI Improvement</h2>

                        <div className={styles.reviewSection}>
                            <button
                                className={styles.analyzeButton}
                                onClick={analyzeCV}
                                disabled={isAnalyzing}
                                aria-label="Analyze CV with AI"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 size={18} className={styles.spinner} aria-hidden="true" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Bot size={18} aria-hidden="true" /> Analyze CV
                                    </>
                                )}
                            </button>

                            {aiSuggestions && (
                                <div className={styles.suggestionsPanel}>
                                    <h3>Improvement Suggestions</h3>
                                    <div className={styles.scoreCard}>
                                        <span className={styles.score}>{aiSuggestions.score || 75}%</span>
                                        <span>CV Strength</span>
                                    </div>
                                    <ul className={styles.suggestionsList}>
                                        {(aiSuggestions.suggestions || []).map((suggestion, index) => (
                                            <li key={index} className={styles.suggestionItem}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className={styles.previewSection}>
                            <h3 className={styles.previewTitle}>CV Preview</h3>
                            <div className={styles.cvPreview}>
                                <h4>{cvData.personalInfo.fullName || 'Name'}</h4>
                                <p className={styles.previewJobTitle}>{cvData.personalInfo.title}</p>
                                <p>{cvData.personalInfo.email} | {cvData.personalInfo.phone}</p>
                                <p>{cvData.personalInfo.summary}</p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <PageContainer>
            <header className={styles.header}>
                <button
                    className={styles.backButton}
                    onClick={() => navigate(-1)}
                    aria-label="Go back to previous page"
                >
                    <ArrowLeft size={20} aria-hidden="true" /> Back
                </button>
                <h1 className={styles.title}>CV Builder</h1>
            </header>

            <nav className={styles.progressBar} aria-label="CV builder steps">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={`${styles.progressStep} ${currentStep >= step.id ? styles.active : ''}`}
                        onClick={() => setCurrentStep(step.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setCurrentStep(step.id);
                            }
                        }}
                        aria-label={`Go to ${step.title} step`}
                        aria-current={currentStep === step.id ? 'step' : undefined}
                    >
                        <div className={styles.stepIcon}>{step.icon}</div>
                        <span className={styles.stepLabel}>{step.title}</span>
                    </div>
                ))}
            </nav>

            <main className={styles.content}>
                {renderStep()}
            </main>

            <div className={styles.navigation}>
                {currentStep > 1 && (
                    <button
                        className={styles.prevButton}
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        aria-label="Go to previous step"
                    >
                        Previous
                    </button>
                )}
                {currentStep < 5 ? (
                    <button
                        className={styles.nextButton}
                        onClick={() => setCurrentStep(prev => prev + 1)}
                        aria-label="Go to next step"
                    >
                        Next
                    </button>
                ) : (
                    <button className={styles.downloadButton} aria-label="Download CV">
                        <Download size={18} aria-hidden="true" /> Download CV
                    </button>
                )}
            </div>
        </PageContainer>
    );
};

export default CVBuilderPage;