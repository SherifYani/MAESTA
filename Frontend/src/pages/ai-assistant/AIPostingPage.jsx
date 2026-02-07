/**
 * @file AIPostingPage.jsx
 * @description AI-assisted job posting page (FR-205)
 * @author Sherif Talaat
 * @date 2026-02-05
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-05
 */



import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bot, Loader2, Sparkles, RefreshCw, Check, Rocket } from "lucide-react";
import aiAssistantService from "../../services/aiAssistantService";
import jobService from "../../services/jobService";
import styles from "./AIPostingPage.module.css";

/**
 * AI-assisted job posting creation wizard
 * @component
 * @returns {JSX.Element} The AI job posting page component
 */
const AIPostingPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    const [simpleInput, setSimpleInput] = useState({
        jobTitle: "",
        industry: "",
        experienceLevel: "",
        workType: "",
        additionalNotes: "",
    });

    const [generatedJob, setGeneratedJob] = useState(null);

    /**
     * Updates simple input field value
     * @param {string} field - Field name to update
     * @param {string} value - New field value
     */
    const handleInputChange = (field, value) => {
        setSimpleInput((prev) => ({ ...prev, [field]: value }));
    };

    /**
     * Generates job post using AI assistant
     * @async
     * @returns {Promise<void>}
     */
    const generateJobPost = async () => {
        setIsGenerating(true);
        try {
            const result = await aiAssistantService.generateJobDescription({
                title: simpleInput.jobTitle,
                industry: simpleInput.industry,
                experienceLevel: simpleInput.experienceLevel,
                workType: simpleInput.workType,
                notes: simpleInput.additionalNotes,
            });

            setGeneratedJob({
                title: simpleInput.jobTitle,
                description: result.description ||
                    `We are looking for a talented ${simpleInput.jobTitle} to join our team.
          
We will be happy to welcome someone with a passion for ${simpleInput.industry} who possesses excellent technical skills and the ability to work in a team.

Basic Requirements:
- Experience of ${simpleInput.experienceLevel === "entry"
                        ? "at least one year"
                        : simpleInput.experienceLevel === "mid"
                            ? "3-5 years"
                            : "5 years or more"
                    }
- Excellent communication skills
- Ability to work ${simpleInput.workType === "remote"
                        ? "remotely"
                        : simpleInput.workType === "hybrid"
                            ? "in a hybrid system"
                            : "from the office"
                    }`,
                requirements: [
                    `Experience in the field of ${simpleInput.industry}`,
                    "Strong analytical skills",
                    "Proficiency in Arabic and English",
                    "Ability to work under pressure",
                ],
                responsibilities: [
                    "Perform required tasks with high efficiency",
                    "Collaborate with team members",
                    "Participate in process improvements",
                    "Provide periodic reports",
                ],
                skills: result.skills || ["Communication", "Teamwork", "Problem Solving"],
                benefits: [
                    "Competitive salary",
                    "Health insurance",
                    "Motivating work environment",
                    "Professional development opportunities",
                ],
                salary: {
                    min: 8000,
                    max: 15000,
                    currency: "EGP",
                },
                location: simpleInput.workType === "remote" ? "Remote" : "Cairo, Egypt",
                workType: simpleInput.workType,
                experienceLevel: simpleInput.experienceLevel,
            });

            setStep(2);
        } catch (error) {
            console.error("Error generating job post:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    /**
     * Updates generated job field
     * @param {string} field - Field name to update
     * @param {any} value - New field value
     */
    const updateGeneratedField = (field, value) => {
        setGeneratedJob((prev) => ({ ...prev, [field]: value }));
    };

    /**
     * Regenerates specific section using AI
     * @async
     * @param {string} section - Section to regenerate
     * @returns {Promise<void>}
     */
    const regenerateSection = async (section) => {
        try {
            const result = await aiAssistantService.improveText(
                generatedJob[section],
                "professional"
            );
            updateGeneratedField(section, result.improvedText || result.text);
        } catch (error) {
            console.error("Error regenerating section:", error);
        }
    };

    /**
     * Publishes job post to the system
     * @async
     * @returns {Promise<void>}
     */
    const publishJob = async () => {
        setIsPosting(true);
        try {
            await jobService.createJob(generatedJob);
            navigate("/dashboard", {
                state: {
                    message: "Job posted successfully!",
                    type: "success"
                }
            });
        } catch (error) {
            console.error("Error publishing job:", error);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button
                    className={styles.backButton}
                    onClick={() => navigate(-1)}
                    aria-label="Go back to previous page"
                >
                    <ArrowLeft size={20} aria-hidden="true" /> Back
                </button>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>
                        <Bot size={28} className={styles.titleIcon} aria-hidden="true" />
                        Smart Publishing
                    </h1>
                    <p className={styles.subtitle}>
                        Let AI help you create a professional job ad
                    </p>
                </div>
            </header>

            <nav className={styles.progress} aria-label="AI posting progress">
                <div
                    className={`${styles.progressStep} ${step >= 1 ? styles.progressStepActive : ""
                        }`}
                    aria-current={step === 1 ? "step" : undefined}
                >
                    <div className={styles.stepNumber} aria-hidden="true">1</div>
                    <span className={styles.stepLabel}>
                        Basic Information
                    </span>
                </div>
                <div className={styles.progressLine} aria-hidden="true"></div>
                <div
                    className={`${styles.progressStep} ${step >= 2 ? styles.progressStepActive : ""
                        }`}
                    aria-current={step === 2 ? "step" : undefined}
                >
                    <div className={styles.stepNumber} aria-hidden="true">2</div>
                    <span className={styles.stepLabel}>
                        Review & Edit
                    </span>
                </div>
                <div className={styles.progressLine} aria-hidden="true"></div>
                <div
                    className={`${styles.progressStep} ${step >= 3 ? styles.progressStepActive : ""
                        }`}
                    aria-current={step === 3 ? "step" : undefined}
                >
                    <div className={styles.stepNumber} aria-hidden="true">3</div>
                    <span className={styles.stepLabel}>Publish</span>
                </div>
            </nav>

            <main className={styles.mainContent}>
                {step === 1 && (
                    <div className={styles.stepContent}>
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>
                                Tell us about the job
                            </h2>
                            <p className={styles.cardSubtitle}>
                                Enter basic information and AI will create the complete description
                            </p>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="jobTitle" className={styles.formLabel}>
                                        Job Title *
                                    </label>
                                    <input
                                        type="text"
                                        id="jobTitle"
                                        className={styles.formInput}
                                        value={simpleInput.jobTitle}
                                        onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                                        placeholder="Example: Application Developer"
                                        required
                                        aria-required="true"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="industry" className={styles.formLabel}>
                                        Industry *
                                    </label>
                                    <select
                                        id="industry"
                                        className={styles.formSelect}
                                        value={simpleInput.industry}
                                        onChange={(e) => handleInputChange("industry", e.target.value)}
                                        required
                                        aria-required="true"
                                    >
                                        <option value="">Select Industry</option>
                                        <option value="technology">Information Technology</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="finance">Finance</option>
                                        <option value="healthcare">Healthcare</option>
                                        <option value="education">Education</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="experienceLevel" className={styles.formLabel}>
                                        Experience Level *
                                    </label>
                                    <select
                                        id="experienceLevel"
                                        className={styles.formSelect}
                                        value={simpleInput.experienceLevel}
                                        onChange={(e) =>
                                            handleInputChange("experienceLevel", e.target.value)
                                        }
                                        required
                                        aria-required="true"
                                    >
                                        <option value="">Select Level</option>
                                        <option value="entry">Beginner (0-2 years)</option>
                                        <option value="mid">Intermediate (3-5 years)</option>
                                        <option value="senior">Expert (5+ years)</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="workType" className={styles.formLabel}>
                                        Work Type *
                                    </label>
                                    <select
                                        id="workType"
                                        className={styles.formSelect}
                                        value={simpleInput.workType}
                                        onChange={(e) => handleInputChange("workType", e.target.value)}
                                        required
                                        aria-required="true"
                                    >
                                        <option value="">Select Type</option>
                                        <option value="onsite">From Office</option>
                                        <option value="remote">Remote</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>

                                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                    <label htmlFor="additionalNotes" className={styles.formLabel}>
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        id="additionalNotes"
                                        className={styles.formTextarea}
                                        value={simpleInput.additionalNotes}
                                        onChange={(e) =>
                                            handleInputChange("additionalNotes", e.target.value)
                                        }
                                        placeholder="Any additional details you want to include..."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <button
                                className={styles.generateButton}
                                onClick={generateJobPost}
                                disabled={
                                    isGenerating ||
                                    !simpleInput.jobTitle ||
                                    !simpleInput.industry ||
                                    !simpleInput.experienceLevel ||
                                    !simpleInput.workType
                                }
                                aria-label="Generate job ad with AI"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            className={styles.spinner}
                                            aria-hidden="true"
                                        />{" "}
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} aria-hidden="true" /> Generate Ad
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && generatedJob && (
                    <div className={styles.stepContent}>
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>
                                Review the Ad
                            </h2>
                            <p className={styles.cardSubtitle}>
                                Review the content and edit what you want before publishing
                            </p>

                            <div className={styles.editableSection}>
                                <div className={styles.sectionHeader}>
                                    <label htmlFor="generatedTitle" className={styles.sectionLabel}>
                                        Job Title
                                    </label>
                                </div>
                                <input
                                    type="text"
                                    id="generatedTitle"
                                    className={styles.formInput}
                                    value={generatedJob.title}
                                    onChange={(e) => updateGeneratedField("title", e.target.value)}
                                    aria-label="Edit job title"
                                />
                            </div>

                            <div className={styles.editableSection}>
                                <div className={styles.sectionHeader}>
                                    <label htmlFor="generatedDescription" className={styles.sectionLabel}>
                                        Description
                                    </label>
                                    <button
                                        className={styles.regenerateButton}
                                        onClick={() => regenerateSection("description")}
                                        aria-label="Regenerate description with AI"
                                    >
                                        <RefreshCw size={14} aria-hidden="true" /> Regenerate
                                    </button>
                                </div>
                                <textarea
                                    id="generatedDescription"
                                    className={styles.formTextarea}
                                    value={generatedJob.description}
                                    onChange={(e) =>
                                        updateGeneratedField("description", e.target.value)
                                    }
                                    rows={6}
                                    aria-label="Edit job description"
                                />
                            </div>

                            <div className={styles.editableSection}>
                                <div className={styles.sectionHeader}>
                                    <label className={styles.sectionLabel}>
                                        Requirements
                                    </label>
                                </div>
                                <ul className={styles.editableList} aria-label="Job requirements list">
                                    {generatedJob.requirements.map((req, index) => (
                                        <li
                                            key={`requirement-${index}`}
                                            className={styles.editableListItem}
                                        >
                                            <input
                                                type="text"
                                                className={styles.formInput}
                                                value={req}
                                                onChange={(e) => {
                                                    const newReqs = [...generatedJob.requirements];
                                                    newReqs[index] = e.target.value;
                                                    updateGeneratedField("requirements", newReqs);
                                                }}
                                                aria-label={`Edit requirement ${index + 1}`}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className={styles.editableSection}>
                                <div className={styles.sectionHeader}>
                                    <label className={styles.sectionLabel}>
                                        Benefits
                                    </label>
                                </div>
                                <div className={styles.benefitsTags} role="list" aria-label="Job benefits">
                                    {generatedJob.benefits.map((benefit, index) => (
                                        <span
                                            key={`benefit-${index}`}
                                            className={styles.benefitTag}
                                            role="listitem"
                                        >
                                            <Check size={14} aria-hidden="true" /> {benefit}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <button
                                    className={styles.backStepButton}
                                    onClick={() => setStep(1)}
                                    aria-label="Go back to basic information step"
                                >
                                    Back
                                </button>
                                <button
                                    className={styles.publishButton}
                                    onClick={publishJob}
                                    disabled={isPosting}
                                    aria-label="Publish job posting"
                                >
                                    {isPosting ? (
                                        <>
                                            <Loader2
                                                size={18}
                                                className={styles.spinner}
                                                aria-hidden="true"
                                            />{" "}
                                            Publishing...
                                        </>
                                    ) : (
                                        <>
                                            <Rocket size={18} aria-hidden="true" /> Publish Job
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AIPostingPage;