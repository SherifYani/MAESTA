/**
 * @file CandidateAnalysisPage.jsx
 * @description AI-powered candidate analysis for companies (FR-203)
 * @author Sherif Talaat
 * @date 2026-02-05
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-05
 */



import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, User, X, Loader2, Bot, Lightbulb, Upload } from 'lucide-react';
import aiAssistantService from '../../services/aiAssistantService';
import { PageContainer } from '../../components/layout';
import styles from './CandidateAnalysisPage.module.css';

/**
 * AI-powered candidate analysis page for companies
 * @component
 * @returns {JSX.Element} The candidate analysis page component
 */
const CandidateAnalysisPage = () => {
    const navigate = useNavigate();
    const [jobDescription, setJobDescription] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResults, setAnalysisResults] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    /**
     * Handles file upload for candidate resumes
     * @param {React.ChangeEvent<HTMLInputElement>} e - File input change event
     */
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const newCandidates = files.map((file, index) => ({
            id: Date.now() + index,
            name: file.name.replace(/\.[^/.]+$/, ''),
            file: file,
            status: 'pending'
        }));
        setCandidates(prev => [...prev, ...newCandidates]);
        setUploadedFiles(prev => [...prev, ...files]);
    };

    /**
     * Removes a candidate from the list
     * @param {number} id - Candidate ID to remove
     */
    const removeCandidate = (id) => {
        setCandidates(prev => prev.filter(c => c.id !== id));
    };

    /**
     * Analyzes all candidates against the job description
     * @async
     * @returns {Promise<void>}
     */
    const analyzeAllCandidates = async () => {
        if (!jobDescription.trim() || candidates.length === 0) {
            return;
        }

        setIsAnalyzing(true);
        try {
            // Simulate AI analysis
            const results = await Promise.all(
                candidates.map(async (candidate) => {
                    try {
                        const analysis = await aiAssistantService.getJobRecommendations({
                            resume: candidate.file,
                            jobDescription
                        });
                        return {
                            ...candidate,
                            status: 'analyzed',
                            score: Math.floor(Math.random() * 40) + 60, // Simulated score
                            matchingSkills: ['JavaScript', 'React', 'Node.js'],
                            missingSkills: ['Docker', 'AWS'],
                            experience: { years: 3, relevant: true },
                            recommendation: 'مرشح مناسب للمنصب'
                        };
                    } catch (error) {
                        return { ...candidate, status: 'error' };
                    }
                })
            );

            setAnalysisResults(results.sort((a, b) => (b.score || 0) - (a.score || 0)));
        } catch (error) {
            console.error('Error analyzing candidates:', error);
        } finally {
            setIsAnalyzing(false);
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
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>AI-powered Candidate Analysis</h1>
                    <p className={styles.subtitle}>Analyze resumes and compare them with job requirements</p>
                </div>
            </header>

            <main className={styles.content}>
                {/* Upload Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}> Upload Resumes</h2>
                    <div className={styles.uploadArea}>
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            id="cv-upload"
                            className={styles.fileInput}
                            aria-label="Upload candidate resumes"
                        />
                        <label htmlFor="cv-upload" className={styles.uploadLabel}>
                            <span className={styles.uploadIcon}>
                                <Upload size={32} aria-hidden="true" />
                            </span>
                            <span>Drag and drop files here or click to upload</span>
                            <span className={styles.uploadHint}>PDF, DOC, DOCX</span>
                        </label>
                    </div>

                    {/* Candidates List */}
                    {candidates.length > 0 && (
                        <div className={styles.candidatesList} role="list" aria-label="Uploaded candidates">
                            {candidates.map((candidate) => (
                                <div
                                    key={candidate.id}
                                    className={styles.candidateCard}
                                    role="listitem"
                                >
                                    <div className={styles.candidateInfo}>
                                        <span className={styles.candidateIcon}>
                                            <User size={20} aria-hidden="true" />
                                        </span>
                                        <span className={styles.candidateName}>{candidate.name}</span>
                                    </div>
                                    <button
                                        className={styles.removeButton}
                                        onClick={() => removeCandidate(candidate.id)}
                                        aria-label={`Remove ${candidate.name}`}
                                    >
                                        <X size={16} aria-hidden="true" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        className={styles.analyzeButton}
                        onClick={analyzeAllCandidates}
                        disabled={isAnalyzing || !jobDescription.trim() || candidates.length === 0}
                        aria-label="Analyze all candidates"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 size={18} className={styles.spinner} aria-hidden="true" />
                                Analysis...
                            </>
                        ) : (
                            <>
                                <Bot size={18} aria-hidden="true" />Analyze Candidates
                            </>
                        )}
                    </button>
                </section>

                {/* Results Section */}
                {analysisResults && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}> Results of Analysis</h2>
                        <div className={styles.resultsGrid}>
                            {analysisResults.map((result, index) => (
                                <article key={result.id} className={styles.resultCard}>
                                    <div className={styles.resultHeader}>
                                        <span className={styles.rank} aria-label={`Rank ${index + 1}`}>
                                            #{index + 1}
                                        </span>
                                        <h3 className={styles.resultTitle}>{result.name}</h3>
                                        <div
                                            className={`${styles.scoreCircle} ${result.score >= 80 ? styles.scoreHigh :
                                                result.score >= 60 ? styles.scoreMedium :
                                                    styles.scoreLow
                                                }`}
                                            aria-label={`Score: ${result.score}%`}
                                        >
                                            {result.score}%
                                        </div>
                                    </div>

                                    {result.status === 'analyzed' && (
                                        <div className={styles.resultDetails}>
                                            <div className={styles.skillsSection}>
                                                <h4 className={styles.skillsTitle}>Matching Skills</h4>
                                                <div className={styles.skillTags}>
                                                    {result.matchingSkills.map((skill, i) => (
                                                        <span
                                                            key={`match-${i}`}
                                                            className={styles.matchingSkill}
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className={styles.skillsSection}>
                                                <h4 className={styles.skillsTitle}>Missing Skills</h4>
                                                <div className={styles.skillTags}>
                                                    {result.missingSkills.map((skill, i) => (
                                                        <span
                                                            key={`missing-${i}`}
                                                            className={styles.missingSkill}
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className={styles.recommendation}>
                                                <Lightbulb size={16} aria-hidden="true" />
                                                {result.recommendation}
                                            </div>

                                            <div className={styles.resultActions}>
                                                <button
                                                    className={styles.viewProfileButton}
                                                    aria-label={`View full profile of ${result.name}`}
                                                >
                                                    View Full Profile
                                                </button>
                                                <button
                                                    className={styles.shortlistButton}
                                                    aria-label={`Add ${result.name} to shortlist`}
                                                >
                                                    Add to shortlist
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </PageContainer>
    );
};

export default CandidateAnalysisPage;