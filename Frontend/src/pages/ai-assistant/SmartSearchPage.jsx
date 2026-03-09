/**
 * @file SmartSearchPage.jsx
 * @description AI-powered smart search for jobs and candidates (FR-204)
 * @author Sherif Talaat
 * @date 2026-02-05
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-05
 */



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Search, Users, Bot, Loader2, Sparkles,
    MapPin, Banknote, Clock, FileText
} from 'lucide-react';
import aiAssistantService from '../../services/aiAssistantService';
import { PageContainer } from '../../components/layout';
import styles from './SmartSearchPage.module.css';

/**
 * AI-powered smart search for jobs and candidates
 * @component
 * @returns {JSX.Element} The smart search page component
 */
const SmartSearchPage = () => {
    const navigate = useNavigate();
    const [searchType, setSearchType] = useState('jobs');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState([]);
    const [filters, setFilters] = useState({
        location: '',
        experienceLevel: '',
        salary: '',
        skills: []
    });
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const getSuggestions = async () => {
            if (searchQuery.length > 2) {
                try {
                    const aiSuggestions = [
                        `${searchQuery} in Cairo`,
                        `${searchQuery} remote`,
                        `${searchQuery} jobs for graduates`,
                    ];
                    setSuggestions(aiSuggestions);
                } catch (error) {
                    console.error('Error getting suggestions:', error);
                }
            } else {
                setSuggestions([]);
            }
        };

        const debounce = setTimeout(getSuggestions, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    /**
     * Handles search submission
     * @param {React.FormEvent} e - The form submit event
     * @returns {Promise<void>}
     */
    const handleSearch = async (e) => {
        e?.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await aiAssistantService.getJobRecommendations({
                query: searchQuery,
                type: searchType,
                filters
            });

            setResults(response);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setIsSearching(false);
        }
    };

    /**
     * Handles suggestion click
     * @param {string} suggestion - The clicked suggestion
     */
    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        setSuggestions([]);
        handleSearch();
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
                    <h1 className={styles.title}>Smart Search</h1>
                    <p className={styles.subtitle}>
                        Search using natural language and let AI find the best results
                    </p>
                </div>
            </header>

            <nav className={styles.searchTypeToggle} aria-label="Search type">
                <button
                    className={`${styles.toggleButton} ${searchType === 'jobs' ? styles.toggleActive : ''}`}
                    onClick={() => setSearchType('jobs')}
                    aria-label="Search for jobs"
                    aria-pressed={searchType === 'jobs'}
                >
                    <Search size={18} aria-hidden="true" /> Search Jobs
                </button>
                <button
                    className={`${styles.toggleButton} ${searchType === 'candidates' ? styles.toggleActive : ''}`}
                    onClick={() => setSearchType('candidates')}
                    aria-label="Search for candidates"
                    aria-pressed={searchType === 'candidates'}
                >
                    <Users size={18} aria-hidden="true" /> Search Candidates
                </button>
            </nav>

            <form onSubmit={handleSearch} className={styles.searchBox}>
                <div className={styles.searchInputWrapper}>
                    <span className={styles.searchIcon}>
                        <Bot size={24} aria-hidden="true" />
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                            searchType === 'jobs'
                                ? 'Search like: "I want a React developer job with good salary in Cairo"'
                                : 'Search like: "Looking for a developer with 3 years experience who knows React"'
                        }
                        className={styles.searchInput}
                        aria-label="Search query"
                    />
                    <button
                        type="submit"
                        className={styles.searchButton}
                        disabled={isSearching}
                        aria-label="Search"
                    >
                        {isSearching ? (
                            <Loader2 size={20} className={styles.spinner} aria-hidden="true" />
                        ) : 'Search'}
                    </button>
                </div>

                {suggestions.length > 0 && (
                    <div className={styles.suggestionsDropdown} role="listbox" aria-label="AI suggestions">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                className={styles.suggestionItem}
                                onClick={() => handleSuggestionClick(suggestion)}
                                role="option"
                            >
                                <Sparkles size={14} aria-hidden="true" /> {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </form>

            <div className={styles.filters}>
                <select
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className={styles.filterSelect}
                    aria-label="Filter by location"
                >
                    <option value="">All Locations</option>
                    <option value="cairo">Cairo</option>
                    <option value="alexandria">Alexandria</option>
                    <option value="remote">Remote</option>
                </select>
                <select
                    value={filters.experienceLevel}
                    onChange={(e) => setFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
                    className={styles.filterSelect}
                    aria-label="Filter by experience level"
                >
                    <option value="">All Levels</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                </select>
                <select
                    value={filters.salary}
                    onChange={(e) => setFilters(prev => ({ ...prev, salary: e.target.value }))}
                    className={styles.filterSelect}
                    aria-label="Filter by salary"
                >
                    <option value="">All Salaries</option>
                    <option value="0-10000">Less than 10,000</option>
                    <option value="10000-20000">10,000 - 20,000</option>
                    <option value="20000+">More than 20,000</option>
                </select>
            </div>

            {results.length > 0 && (
                <main className={styles.results}>
                    <h2 className={styles.resultsTitle}>
                        Results ({results.length})
                    </h2>
                    <div className={styles.resultsGrid}>
                        {results.map((result) => (
                            <article key={result.id} className={styles.resultCard}>
                                <div className={styles.matchBadge} aria-label={`${result.matchScore}% match`}>
                                    Match {result.matchScore}%
                                </div>
                                {searchType === 'jobs' ? (
                                    <>
                                        <h3 className={styles.resultTitle}>{result.title}</h3>
                                        <p className={styles.company}>{result.company}</p>
                                        <p className={styles.location}>
                                            <MapPin size={16} aria-hidden="true" /> {result.location}
                                        </p>
                                        <p className={styles.salary}>
                                            <Banknote size={16} aria-hidden="true" /> {result.salary}
                                        </p>
                                        <div className={styles.skills} aria-label="Required skills">
                                            {result.skills.map((skill, i) => (
                                                <span key={`job-skill-${i}`} className={styles.skillTag}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                        <div className={styles.cardFooter}>
                                            <span className={styles.posted}>{result.posted}</span>
                                            <button
                                                className={styles.applyButton}
                                                aria-label={`Apply for ${result.title} at ${result.company}`}
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h3 className={styles.resultTitle}>{result.name}</h3>
                                        <p className={styles.candidateTitle}>{result.title}</p>
                                        <p className={styles.experience}>
                                            <Clock size={16} aria-hidden="true" /> {result.experience}
                                        </p>
                                        <div className={styles.skills} aria-label="Candidate skills">
                                            {result.skills.map((skill, i) => (
                                                <span key={`candidate-skill-${i}`} className={styles.skillTag}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                        <div className={styles.cardFooter}>
                                            <span className={styles.availability}>{result.availability}</span>
                                            <button
                                                className={styles.viewButton}
                                                aria-label={`View ${result.name}'s profile`}
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    </>
                                )}
                            </article>
                        ))}
                    </div>
                </main>
            )}

            {!isSearching && searchQuery && results.length === 0 && (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>
                        <Search size={48} aria-hidden="true" />
                    </span>
                    <h3 className={styles.emptyTitle}>No Results Found</h3>
                    <p className={styles.emptySubtitle}>Try adjusting your search criteria</p>
                </div>
            )}
        </PageContainer>
    );
};

export default SmartSearchPage;