/**
 * @file AssessmentsPage.jsx
 * @description Skill Assessment Page for Jobseeker Dashboard.
 *              Includes landing screen, active assessment flow, and results screen.
 * @author Sherif Talaat
 * @date 2026-06-28
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-06-28
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Award, 
    Clock, 
    BookOpen, 
    ArrowLeft, 
    CheckCircle, 
    XCircle, 
    Play, 
    RefreshCw, 
    Sparkles,
    Check,
    AlertCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import styles from './AssessmentsPage.module.css';

// Mock Assessments Data
const AVAILABLE_ASSESSMENTS = [
    {
        id: 'react',
        name: 'React Development',
        description: 'Test your understanding of React Hooks, context, state management, and lifecycle methods.',
        difficulty: 'Intermediate',
        questionsCount: 5,
        duration: 5, // minutes
        icon: '⚛️',
        questions: [
            {
                id: 1,
                question: 'Which Hook is best suited for performing side effects in functional components?',
                options: ['useState', 'useEffect', 'useContext', 'useReducer'],
                correctAnswer: 1
            },
            {
                id: 2,
                question: 'What is the purpose of React Context?',
                options: [
                    'To access local component state',
                    'To pass props through intermediate elements without manual prop-drilling',
                    'To manage routing in a single page application',
                    'To perform API calls directly from a template'
                ],
                correctAnswer: 1
            },
            {
                id: 3,
                question: 'What does the second argument (dependency array) of useEffect do?',
                options: [
                    'Specifies component styles',
                    'Triggers the effect only when the specified variables change',
                    'Declares local variables for the effect',
                    'Defines fallback values for props'
                ],
                correctAnswer: 1
            },
            {
                id: 4,
                question: 'In React, what are keys used for in arrays of elements?',
                options: [
                    'To style individual elements uniquely',
                    'To help identify which items have changed, been added, or been removed',
                    'To bind event listeners to child components',
                    'To secure the items against client-side tampering'
                ],
                correctAnswer: 1
            },
            {
                id: 5,
                question: 'What is a key rule of React Hooks?',
                options: [
                    'Hooks must be declared inside nested helper functions',
                    'Hooks can only be called from class component render methods',
                    'Hooks must only be called at the top level of functional components',
                    'Hooks must be executed within loops to prevent render cycles'
                ],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 'uiux',
        name: 'UI/UX Design Principles',
        description: 'Evaluate your knowledge of user personas, accessibility, typography scales, contrast, and layout systems.',
        difficulty: 'Beginner',
        questionsCount: 5,
        duration: 5,
        icon: '🎨',
        questions: [
            {
                id: 1,
                question: 'What does "UX" stand for in product design?',
                options: ['User Experience', 'User eXtension', 'Universal XML', 'Utility eXchange'],
                correctAnswer: 0
            },
            {
                id: 2,
                question: 'According to WCAG accessibility guidelines, what is the minimum contrast ratio for normal text?',
                options: ['3:1', '4.5:1', '7:1', '10:1'],
                correctAnswer: 1
            },
            {
                id: 3,
                question: 'Which design concept is based on the idea that related elements should be grouped close together?',
                options: ['Proximity', 'Contrast', 'Alignment', 'Repetition'],
                correctAnswer: 0
            },
            {
                id: 4,
                question: 'What is a user persona in the design process?',
                options: [
                    'A marketing target database record',
                    'A fictional representation of a product\'s ideal customer based on real data',
                    'An administrative user role in the application',
                    'A security token mapped to jobseeker accounts'
                ],
                correctAnswer: 1
            },
            {
                id: 5,
                question: 'What is the primary purpose of a wireframe?',
                options: [
                    'To showcase final high-fidelity visual UI styles',
                    'To outline the structural blueprint and layout architecture of a page',
                    'To execute functional testing scripts',
                    'To database the site navigation URLs'
                ],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 'css3',
        name: 'CSS3 Layouts & Grids',
        description: 'Prove your proficiency in Flexbox, CSS Grid, media queries, CSS variables, and layout properties.',
        difficulty: 'Intermediate',
        questionsCount: 5,
        duration: 5,
        icon: '💅',
        questions: [
            {
                id: 1,
                question: 'Which flex property controls how items are aligned along the main axis?',
                options: ['align-items', 'justify-content', 'align-content', 'flex-direction'],
                correctAnswer: 1
            },
            {
                id: 2,
                question: 'How do you create a grid with three equal-width columns using CSS Grid?',
                options: [
                    'grid-template-columns: 1fr 1fr 1fr;',
                    'grid-template-columns: repeat(3, 33.3px);',
                    'grid-template-columns: auto auto auto auto;',
                    'grid-columns-count: 3;'
                ],
                correctAnswer: 0
            },
            {
                id: 3,
                question: 'What is the default value of the CSS position property?',
                options: ['relative', 'absolute', 'static', 'fixed'],
                correctAnswer: 2
            },
            {
                id: 4,
                question: 'What is the difference between block and inline elements?',
                options: [
                    'Inline elements start on a new line and take up the full available width.',
                    'Block elements start on a new line and take up the full available width.',
                    'Block elements cannot accept padding or margin values.',
                    'Inline elements automatically wrap block elements.'
                ],
                correctAnswer: 1
            },
            {
                id: 5,
                question: 'Which media query breakpoint is best suited for mobile phones?',
                options: [
                    '@media (min-width: 1200px)',
                    '@media (max-width: 640px) or (max-width: 40rem)',
                    '@media (min-height: 900px)',
                    '@media (orientation: landscape)'
                ],
                correctAnswer: 1
            }
        ]
    }
];

const AssessmentsPage = () => {
    const navigate = useNavigate();

    // Flow State: 'landing' | 'taking' | 'completed'
    const [flow, setFlow] = useState('landing');
    
    // Quiz States
    const [currentAssessment, setCurrentAssessment] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0); // seconds
    const [completedHistory, setCompletedHistory] = useState(() => {
        try {
            const saved = localStorage.getItem('skills_assessments_history');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    // Score calculations
    const [results, setResults] = useState(null);

    // Active assessment countdown timer
    useEffect(() => {
        if (flow !== 'taking' || timeLeft <= 0) {
            if (flow === 'taking' && timeLeft === 0) {
                // Auto submit when time runs out
                handleFinishAssessment();
            }
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [flow, timeLeft]);

    const handleStartAssessment = (assessment) => {
        setCurrentAssessment(assessment);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setTimeLeft(assessment.duration * 60);
        setFlow('taking');
    };

    const handleSelectOption = (optionIndex) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: optionIndex
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < currentAssessment.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleFinishAssessment = useCallback(() => {
        const questions = currentAssessment.questions;
        let correctCount = 0;

        questions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correctAnswer) {
                correctCount++;
            }
        });

        const scorePercent = Math.round((correctCount / questions.length) * 100);
        const passed = scorePercent >= 70;

        const newHistory = {
            ...completedHistory,
            [currentAssessment.id]: {
                score: scorePercent,
                passed,
                date: new Date().toLocaleDateString()
            }
        };

        setCompletedHistory(newHistory);
        try {
            localStorage.setItem('skills_assessments_history', JSON.stringify(newHistory));
        } catch (e) {
            console.error('Failed to save assessment history', e);
        }

        setResults({
            totalQuestions: questions.length,
            correctCount,
            scorePercent,
            passed
        });
        setFlow('completed');
    }, [currentAssessment, selectedAnswers, completedHistory]);

    const handleFinishAssessmentWrapper = () => {
        handleFinishAssessment();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleReset = () => {
        setFlow('landing');
        setCurrentAssessment(null);
        setResults(null);
    };

    // Render landing view
    if (flow === 'landing') {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <button onClick={() => navigate('/dashboard')} className={styles.backBtn} aria-label="Go back to dashboard">
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </button>
                    <div className={styles.headerTitleBlock}>
                        <h1 className={styles.title}>
                            <Award className={styles.titleIcon} size={28} />
                            Skills Assessments
                        </h1>
                        <p className={styles.subtitle}>
                            Validate your professional expertise, earn skills badges, and boost your visibility to prospective employers by scoring 70% or higher.
                        </p>
                    </div>
                </div>

                <div className={styles.assessmentsGrid}>
                    {AVAILABLE_ASSESSMENTS.map(item => {
                        const scoreInfo = completedHistory[item.id];
                        return (
                            <div key={item.id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.cardIcon}>{item.icon}</span>
                                    <span className={`${styles.badge} ${styles[item.difficulty.toLowerCase()]}`}>
                                        {item.difficulty}
                                    </span>
                                </div>
                                <h2 className={styles.cardTitle}>{item.name}</h2>
                                <p className={styles.cardDesc}>{item.description}</p>
                                
                                <div className={styles.metaRow}>
                                    <div className={styles.metaItem}>
                                        <BookOpen size={14} />
                                        {item.questionsCount} Questions
                                    </div>
                                    <div className={styles.metaItem}>
                                        <Clock size={14} />
                                        {item.duration} Mins
                                    </div>
                                </div>

                                {scoreInfo ? (
                                    <div className={styles.scoreRow}>
                                        <div className={styles.scoreDisplay}>
                                            <span className={styles.scoreLabel}>High Score:</span>
                                            <span className={`${styles.scoreVal} ${scoreInfo.passed ? styles.passedScore : styles.failedScore}`}>
                                                {scoreInfo.score}%
                                            </span>
                                        </div>
                                        {scoreInfo.passed ? (
                                            <span className={styles.earnedBadge}>
                                                <Sparkles size={12} /> Badge Earned
                                            </span>
                                        ) : (
                                            <span className={styles.failedBadge}>
                                                <AlertCircle size={12} /> Retake Ready
                                            </span>
                                        )}
                                    </div>
                                ) : null}

                                <button 
                                    className={styles.startBtn} 
                                    onClick={() => handleStartAssessment(item)}
                                >
                                    <Play size={14} />
                                    {scoreInfo ? 'Retake Assessment' : 'Start Assessment'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Render active assessment taking view
    if (flow === 'taking' && currentAssessment) {
        const currentQuestion = currentAssessment.questions[currentQuestionIndex];
        const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
        const progressPercent = Math.round(((currentQuestionIndex + 1) / currentAssessment.questions.length) * 100);

        return (
            <div className={styles.container}>
                <div className={styles.quizWrapper}>
                    {/* Header */}
                    <div className={styles.quizHeader}>
                        <div className={styles.quizHeaderLeft}>
                            <h2 className={styles.quizTitle}>{currentAssessment.name}</h2>
                            <span className={styles.questionIndex}>
                                Question {currentQuestionIndex + 1} of {currentAssessment.questions.length}
                            </span>
                        </div>
                        <div className={`${styles.timer} ${timeLeft < 60 ? styles.timerWarning : ''}`}>
                            <Clock size={16} />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className={styles.progressBarBg}>
                        <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
                    </div>

                    {/* Question Card */}
                    <div className={styles.questionCard}>
                        <h3 className={styles.questionText}>{currentQuestion.question}</h3>
                        
                        <div className={styles.optionsList}>
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = selectedAnswers[currentQuestionIndex] === index;
                                return (
                                    <div 
                                        key={index} 
                                        className={`${styles.optionItem} ${isSelected ? styles.optionSelected : ''}`}
                                        onClick={() => handleSelectOption(index)}
                                    >
                                        <span className={styles.optionLetter}>
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <span className={styles.optionText}>{option}</span>
                                        <div className={styles.optionRadio}>
                                            {isSelected && <div className={styles.optionRadioInner} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation Actions */}
                    <div className={styles.quizActions}>
                        <Button 
                            variant="outline" 
                            disabled={currentQuestionIndex === 0} 
                            onClick={handleBack}
                        >
                            Back
                        </Button>

                        {currentQuestionIndex < currentAssessment.questions.length - 1 ? (
                            <Button 
                                variant="primary" 
                                disabled={!isAnswered} 
                                onClick={handleNext}
                            >
                                Next Question
                            </Button>
                        ) : (
                            <Button 
                                variant="primary" 
                                disabled={!isAnswered} 
                                onClick={handleFinishAssessmentWrapper}
                                className={styles.submitQuizBtn}
                            >
                                Submit Assessment
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Render results view
    if (flow === 'completed' && results) {
        return (
            <div className={styles.container}>
                <div className={styles.resultsCard}>
                    <div className={styles.resultsBadgeHeader}>
                        {results.passed ? (
                            <div className={styles.resultsIconWrapperPassed}>
                                <Award size={64} className={styles.resultsAwardIcon} />
                            </div>
                        ) : (
                            <div className={styles.resultsIconWrapperFailed}>
                                <AlertCircle size={64} className={styles.resultsAlertIcon} />
                            </div>
                        )}
                    </div>

                    <h1 className={styles.resultsTitle}>
                        {results.passed ? 'Congratulations!' : 'Keep Practicing!'}
                    </h1>
                    
                    <p className={styles.resultsSubtitle}>
                        {results.passed 
                            ? `You successfully completed the ${currentAssessment.name} Assessment.` 
                            : `You scored below the passing threshold (70%) for the ${currentAssessment.name} Assessment.`
                        }
                    </p>

                    <div className={styles.scoreGrid}>
                        <div className={styles.scoreMetric}>
                            <span className={styles.metricVal}>{results.scorePercent}%</span>
                            <span className={styles.metricLabel}>Your Score</span>
                        </div>
                        <div className={styles.scoreMetric}>
                            <span className={styles.metricVal}>
                                {results.correctCount}/{results.totalQuestions}
                            </span>
                            <span className={styles.metricLabel}>Correct Answers</span>
                        </div>
                        <div className={styles.scoreMetric}>
                            <span className={styles.metricVal}>
                                {results.passed ? 'PASSED' : 'FAILED'}
                            </span>
                            <span className={styles.metricLabel}>Status</span>
                        </div>
                    </div>

                    {results.passed ? (
                        <div className={styles.passedMessageCard}>
                            <Sparkles size={16} className={styles.sparkleIcon} />
                            <div className={styles.passedMsgContent}>
                                <strong>Skill Badge Added to Profile</strong>
                                <span>Prospective employers will now see a verified checkmark beside this skill on your CV profile.</span>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.failedMessageCard}>
                            <RefreshCw size={16} className={styles.refreshIcon} />
                            <div className={styles.failedMsgContent}>
                                <strong>Need another try?</strong>
                                <span>No penalties apply for retakes. Review the materials and start again whenever you are ready.</span>
                            </div>
                        </div>
                    )}

                    <div className={styles.resultsActions}>
                        <Button variant="outline" onClick={handleReset}>
                            Back to Assessments
                        </Button>
                        <Button variant="primary" onClick={() => navigate('/dashboard')}>
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default AssessmentsPage;
