import React, { useState } from 'react';
import { UploadCloud, CheckCircle, XCircle, FileText, Briefcase, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import aiAssistantService from '../../services/aiAssistantService';
import styles from './CvAnalyzerPage.module.css';

const CvAnalyzerPage = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!file || !jobDescription.trim()) {
            setError('Please provide both a CV file (PDF) and a job description.');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const data = await aiAssistantService.scoreCv(file, jobDescription);
            if (data.error) {
                setError(data.error);
            } else {
                setResults(data);
            }
        } catch (err) {
            setError(err.message || 'Failed to analyze CV.');
        } finally {
            setLoading(false);
        }
    };

    const resetAnalysis = () => {
        setResults(null);
        setFile(null);
        setJobDescription('');
    };

    // Helper to determine score color
    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981'; // Green
        if (score >= 50) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>AI CV Analyzer</h1>
                <p className={styles.subtitle}>Upload your resume and the job description to see how well you match.</p>
            </div>

            {error && (
                <div className={styles.errorAlert}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {!results ? (
                <div className={styles.inputSection}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <FileText size={24} className={styles.iconPrimary} />
                            <h2>1. Upload your CV (PDF)</h2>
                        </div>
                        <div className={styles.uploadBox}>
                            <input 
                                type="file" 
                                accept=".pdf" 
                                id="cv-upload" 
                                className={styles.fileInput} 
                                onChange={handleFileChange}
                            />
                            <label htmlFor="cv-upload" className={styles.fileLabel}>
                                <UploadCloud size={48} className={styles.uploadIcon} />
                                <span className={styles.uploadText}>
                                    {file ? file.name : 'Click to browse or drag and drop'}
                                </span>
                                <span className={styles.uploadSubtext}>PDF up to 5MB</span>
                            </label>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Briefcase size={24} className={styles.iconPrimary} />
                            <h2>2. Paste Job Description</h2>
                        </div>
                        <textarea
                            className={styles.textarea}
                            placeholder="Paste the job description here..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </div>

                    <div className={styles.actionContainer}>
                        <button 
                            className={styles.analyzeButton} 
                            onClick={handleAnalyze}
                            disabled={loading || !file || !jobDescription.trim()}
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className={styles.spinIcon} size={20} />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    Analyze Match <ChevronRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className={styles.resultsSection}>
                    <div className={styles.scoreCard}>
                        <div className={styles.scoreCircleWrapper}>
                            <svg viewBox="0 0 36 36" className={styles.circularChart}>
                                <path
                                    className={styles.circleBg}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className={styles.circle}
                                    strokeDasharray={`${results.score}, 100`}
                                    stroke={getScoreColor(results.score)}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <text x="18" y="20.35" className={styles.percentage}>{results.score}%</text>
                            </svg>
                        </div>
                        <div className={styles.scoreInfo}>
                            <h2>Match Score</h2>
                            <p>Based on our AI analysis, your CV is a <strong>{results.score}% match</strong> for this position.</p>
                            <p className={styles.recommendationBox}>{results.recommendation}</p>
                        </div>
                    </div>

                    <div className={styles.detailsGrid}>
                        <div className={styles.detailCard}>
                            <h3 className={styles.successText}>
                                <CheckCircle size={20} /> Matched Skills
                            </h3>
                            <ul className={styles.skillList}>
                                {results.matched_skills?.map((skill, idx) => (
                                    <li key={idx} className={styles.skillBadgeSuccess}>{skill}</li>
                                )) || <li>None identified</li>}
                            </ul>
                        </div>
                        
                        <div className={styles.detailCard}>
                            <h3 className={styles.dangerText}>
                                <XCircle size={20} /> Missing Skills
                            </h3>
                            <ul className={styles.skillList}>
                                {results.missing_skills?.map((skill, idx) => (
                                    <li key={idx} className={styles.skillBadgeDanger}>{skill}</li>
                                )) || <li>None identified</li>}
                            </ul>
                        </div>

                        <div className={styles.detailCard}>
                            <h3>Strengths</h3>
                            <ul className={styles.bulletList}>
                                {results.strengths?.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className={styles.detailCard}>
                            <h3>Areas for Improvement</h3>
                            <ul className={styles.bulletList}>
                                {results.weaknesses?.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className={styles.actionContainer}>
                        <button className={styles.secondaryButton} onClick={resetAnalysis}>
                            Try Another CV
                        </button>
                        <button className={styles.primaryButton} onClick={() => navigate('/jobs')}>
                            Find Jobs to Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CvAnalyzerPage;
