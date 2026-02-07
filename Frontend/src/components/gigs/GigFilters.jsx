/**
 * @file GigFilters.jsx
 * @description Sidebar filter component for searching and filtering gigs.
 * @author Sherif Talaat
 * @date 2026-02-05
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    X,
    ChevronDown,
    ChevronUp,
    Filter,
    Check,
    DollarSign,
    Clock,
    Briefcase,
    Users,
    Search
} from 'lucide-react';
import { Button, Input } from '../common';
import styles from './GigFilters.module.css';

/**
 * Budget range filter component.
 * @param {Object} props - Component props.
 * @param {Object} props.filters - Current filter state.
 * @param {function} props.onFilterChange - Filter change handler.
 * @returns {JSX.Element} Budget range filter component.
 */
const BudgetFilter = ({ filters, onFilterChange }) => {
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        const numericValue = value === '' ? '' : Math.max(0, parseInt(value) || 0);

        onFilterChange({
            ...filters,
            budget: {
                ...filters.budget,
                [name]: numericValue
            }
        });
    }, [filters, onFilterChange]);

    return (
        <div className={styles.filterSection}>
            <div className={styles.budgetInputs}>
                <div className={styles.inputGroup}>
                    <label htmlFor="budget-min" className={styles.visuallyHidden}>
                        Minimum budget
                    </label>
                    <div className={styles.inputWrapper}>
                        <span className={styles.currencyPrefix}>$</span>
                        <Input
                            id="budget-min"
                            name="min"
                            type="number"
                            placeholder="Min"
                            value={filters.budget?.min || ''}
                            onChange={handleChange}
                            min="0"
                            step="100"
                            className={styles.budgetInput}
                            aria-label="Minimum budget"
                        />
                    </div>
                </div>

                <span className={styles.separator} aria-hidden="true">—</span>

                <div className={styles.inputGroup}>
                    <label htmlFor="budget-max" className={styles.visuallyHidden}>
                        Maximum budget
                    </label>
                    <div className={styles.inputWrapper}>
                        <span className={styles.currencyPrefix}>$</span>
                        <Input
                            id="budget-max"
                            name="max"
                            type="number"
                            placeholder="Max"
                            value={filters.budget?.max || ''}
                            onChange={handleChange}
                            min="0"
                            step="100"
                            className={styles.budgetInput}
                            aria-label="Maximum budget"
                        />
                    </div>
                </div>
            </div>

            {filters.budget?.min > filters.budget?.max && filters.budget?.max !== '' && (
                <div className={styles.validationError} role="alert">
                    Maximum must be greater than minimum
                </div>
            )}
        </div>
    );
};

BudgetFilter.propTypes = {
    filters: PropTypes.object.isRequired,
    onFilterChange: PropTypes.func.isRequired
};

/**
 * Skills filter component.
 * @param {Object} props - Component props.
 * @param {Array<string>} props.skills - Available skills.
 * @param {Array<string>} props.selectedSkills - Currently selected skills.
 * @param {function} props.onSkillToggle - Skill toggle handler.
 * @param {function} props.onClearSkills - Clear all skills handler.
 * @returns {JSX.Element} Skills filter component.
 */
const SkillsFilter = ({
    skills,
    selectedSkills = [],
    onSkillToggle,
    onClearSkills
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSkills = skills.filter(skill =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    return (
        <div className={styles.filterSection}>
            <div className={styles.skillsSearch}>
                <Input
                    type="text"
                    placeholder="Search skills..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className={styles.searchInput}
                    aria-label="Search skills"
                />
            </div>

            {selectedSkills.length > 0 && (
                <div className={styles.selectedSkills}>
                    <div className={styles.selectedSkillsHeader}>
                        <span className={styles.selectedCount}>
                            {selectedSkills.length} selected
                        </span>
                        <button
                            type="button"
                            onClick={onClearSkills}
                            className={styles.clearSkillsButton}
                            aria-label="Clear all selected skills"
                        >
                            Clear all
                        </button>
                    </div>

                    <div className={styles.selectedSkillsList}>
                        {selectedSkills.map(skill => (
                            <button
                                key={skill}
                                type="button"
                                onClick={() => onSkillToggle(skill)}
                                className={styles.selectedSkillTag}
                                aria-label={`Remove ${skill}`}
                            >
                                {skill}
                                <X size={12} aria-hidden="true" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.skillsGrid} role="listbox" aria-label="Available skills">
                {filteredSkills.map(skill => (
                    <button
                        key={skill}
                        type="button"
                        onClick={() => onSkillToggle(skill)}
                        className={`${styles.skillTag} ${selectedSkills.includes(skill) ? styles.activeSkill : ''
                            }`}
                        aria-selected={selectedSkills.includes(skill)}
                        role="option"
                    >
                        {skill}
                        {selectedSkills.includes(skill) && (
                            <Check size={12} className={styles.checkIcon} aria-hidden="true" />
                        )}
                    </button>
                ))}

                {filteredSkills.length === 0 && (
                    <div className={styles.noResults}>
                        No skills found matching "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
};

SkillsFilter.propTypes = {
    skills: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedSkills: PropTypes.arrayOf(PropTypes.string),
    onSkillToggle: PropTypes.func.isRequired,
    onClearSkills: PropTypes.func.isRequired
};

/**
 * Main gig filters component.
 * @param {Object} props - Component props.
 * @param {Object} props.filters - Current filter state.
 * @param {function} props.onFilterChange - Handler for filter updates.
 * @param {function} props.onApplyFilters - Handler to apply filters.
 * @param {function} props.onClearFilters - Handler to clear all filters.
 * @param {Array<string>} props.availableSkills - List of available skills for tags.
 * @param {Array<string>} props.experienceLevels - Available experience levels.
 * @param {Array<string>} props.gigTypes - Available gig types.
 * @param {boolean} props.isMobile - Whether to show mobile-optimized layout.
 * @returns {JSX.Element} The rendered gig filters component.
 */
const GigFilters = ({
    filters,
    onFilterChange,
    onApplyFilters,
    onClearFilters,
    availableSkills = [],
    experienceLevels = ['Entry Level', 'Intermediate', 'Expert'],
    gigTypes = ['Fixed-price', 'Hourly', 'Negotiable'],
    isMobile = false
}) => {
    const [expandedSections, setExpandedSections] = useState({
        budget: true,
        type: true,
        skills: true,
        experience: true,
        duration: true
    });

    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    /**
     * Toggles a filter section.
     * @param {string} section - Section to toggle.
     * @returns {void}
     */
    const toggleSection = useCallback((section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    }, []);

    /**
     * Handles checkbox/radio changes.
     * @param {string} field - Field name.
     * @param {string} value - Field value.
     * @returns {void}
     */
    const handleOptionChange = useCallback((field, value) => {
        onFilterChange({
            ...filters,
            [field]: filters[field] === value ? '' : value
        });
    }, [filters, onFilterChange]);

    /**
     * Handles skill toggle.
     * @param {string} skill - Skill to toggle.
     * @returns {void}
     */
    const handleSkillToggle = useCallback((skill) => {
        const currentSkills = filters.skills || [];
        const newSkills = currentSkills.includes(skill)
            ? currentSkills.filter(s => s !== skill)
            : [...currentSkills, skill];

        onFilterChange({ ...filters, skills: newSkills });
    }, [filters, onFilterChange]);

    /**
     * Clears all selected skills.
     * @returns {void}
     */
    const handleClearSkills = useCallback(() => {
        onFilterChange({ ...filters, skills: [] });
    }, [filters, onFilterChange]);

    /**
     * Clears all filters.
     * @returns {void}
     */
    const handleClearAll = useCallback(() => {
        const defaultFilters = {
            budget: { min: '', max: '' },
            type: '',
            skills: [],
            experienceLevel: '',
            duration: ''
        };

        onFilterChange(defaultFilters);
        if (onClearFilters) {
            onClearFilters();
        }
    }, [onFilterChange, onClearFilters]);

    /**
     * Applies filters.
     * @returns {void}
     */
    const handleApplyFilters = useCallback(() => {
        if (onApplyFilters) {
            onApplyFilters(filters);
        }
    }, [filters, onApplyFilters]);

    // Calculate active filters count
    useEffect(() => {
        let count = 0;

        if (filters.budget?.min || filters.budget?.max) count++;
        if (filters.type) count++;
        if (filters.skills?.length > 0) count++;
        if (filters.experienceLevel) count++;
        if (filters.duration) count++;

        setActiveFiltersCount(count);
    }, [filters]);

    return (
        <aside
            className={styles.container}
            aria-label="Gig filters"
        >
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.titleWrapper}>
                    <Filter
                        size={20}
                        className={styles.filterIcon}
                        aria-hidden="true"
                    />
                    <h2 className={styles.title}>
                        Filters
                        {activeFiltersCount > 0 && (
                            <span className={styles.filterCount} aria-label={`${activeFiltersCount} active filters`}>
                                ({activeFiltersCount})
                            </span>
                        )}
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={handleClearAll}
                    className={styles.clearButton}
                    disabled={activeFiltersCount === 0}
                    aria-label="Clear all filters"
                >
                    <X size={16} aria-hidden="true" />
                    Clear all
                </button>
            </div>

            {/* Search Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <Search size={16} className={styles.sectionIcon} aria-hidden="true" />
                    <span className={styles.sectionTitle}>Search</span>
                </div>

                <div className={styles.sectionContent}>
                    <Input
                        type="text"
                        placeholder="Search gigs..."
                        value={filters.search || ''}
                        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                        className={styles.searchInput}
                        aria-label="Search gigs by title or description"
                    />
                </div>
            </div>

            {/* Budget Section */}
            <div className={styles.section}>
                <button
                    type="button"
                    className={styles.sectionToggle}
                    onClick={() => toggleSection('budget')}
                    aria-expanded={expandedSections.budget}
                    aria-controls="budget-section"
                >
                    <div className={styles.sectionHeader}>
                        <DollarSign size={16} className={styles.sectionIcon} aria-hidden="true" />
                        <span className={styles.sectionTitle}>Budget</span>
                    </div>
                    {expandedSections.budget ?
                        <ChevronUp size={16} aria-hidden="true" /> :
                        <ChevronDown size={16} aria-hidden="true" />
                    }
                </button>

                {expandedSections.budget && (
                    <div
                        id="budget-section"
                        className={styles.sectionContent}
                        role="region"
                        aria-label="Budget filter options"
                    >
                        <BudgetFilter
                            filters={filters}
                            onFilterChange={onFilterChange}
                        />
                    </div>
                )}
            </div>

            {/* Gig Type Section */}
            <div className={styles.section}>
                <button
                    type="button"
                    className={styles.sectionToggle}
                    onClick={() => toggleSection('type')}
                    aria-expanded={expandedSections.type}
                    aria-controls="type-section"
                >
                    <div className={styles.sectionHeader}>
                        <Briefcase size={16} className={styles.sectionIcon} aria-hidden="true" />
                        <span className={styles.sectionTitle}>Gig Type</span>
                    </div>
                    {expandedSections.type ?
                        <ChevronUp size={16} aria-hidden="true" /> :
                        <ChevronDown size={16} aria-hidden="true" />
                    }
                </button>

                {expandedSections.type && (
                    <div
                        id="type-section"
                        className={styles.sectionContent}
                        role="region"
                        aria-label="Gig type filter options"
                    >
                        <div className={styles.optionsList} role="radiogroup" aria-label="Select gig type">
                            {gigTypes.map(type => (
                                <label
                                    key={type}
                                    className={styles.optionLabel}
                                >
                                    <input
                                        type="radio"
                                        name="gig-type"
                                        checked={filters.type === type}
                                        onChange={() => handleOptionChange('type', type)}
                                        className={styles.optionInput}
                                        aria-label={type}
                                    />
                                    <span className={styles.optionText}>{type}</span>
                                    {filters.type === type && (
                                        <Check size={14} className={styles.optionCheck} aria-hidden="true" />
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Skills Section */}
            <div className={styles.section}>
                <button
                    type="button"
                    className={styles.sectionToggle}
                    onClick={() => toggleSection('skills')}
                    aria-expanded={expandedSections.skills}
                    aria-controls="skills-section"
                >
                    <div className={styles.sectionHeader}>
                        <Users size={16} className={styles.sectionIcon} aria-hidden="true" />
                        <span className={styles.sectionTitle}>Skills</span>
                    </div>
                    {expandedSections.skills ?
                        <ChevronUp size={16} aria-hidden="true" /> :
                        <ChevronDown size={16} aria-hidden="true" />
                    }
                </button>

                {expandedSections.skills && (
                    <div
                        id="skills-section"
                        className={styles.sectionContent}
                        role="region"
                        aria-label="Skills filter options"
                    >
                        <SkillsFilter
                            skills={availableSkills}
                            selectedSkills={filters.skills || []}
                            onSkillToggle={handleSkillToggle}
                            onClearSkills={handleClearSkills}
                        />
                    </div>
                )}
            </div>

            {/* Experience Level Section */}
            <div className={styles.section}>
                <button
                    type="button"
                    className={styles.sectionToggle}
                    onClick={() => toggleSection('experience')}
                    aria-expanded={expandedSections.experience}
                    aria-controls="experience-section"
                >
                    <div className={styles.sectionHeader}>
                        <Briefcase size={16} className={styles.sectionIcon} aria-hidden="true" />
                        <span className={styles.sectionTitle}>Experience Level</span>
                    </div>
                    {expandedSections.experience ?
                        <ChevronUp size={16} aria-hidden="true" /> :
                        <ChevronDown size={16} aria-hidden="true" />
                    }
                </button>

                {expandedSections.experience && (
                    <div
                        id="experience-section"
                        className={styles.sectionContent}
                        role="region"
                        aria-label="Experience level filter options"
                    >
                        <div className={styles.optionsList} role="radiogroup" aria-label="Select experience level">
                            {experienceLevels.map(level => (
                                <label
                                    key={level}
                                    className={styles.optionLabel}
                                >
                                    <input
                                        type="radio"
                                        name="experience-level"
                                        checked={filters.experienceLevel === level}
                                        onChange={() => handleOptionChange('experienceLevel', level)}
                                        className={styles.optionInput}
                                        aria-label={level}
                                    />
                                    <span className={styles.optionText}>{level}</span>
                                    {filters.experienceLevel === level && (
                                        <Check size={14} className={styles.optionCheck} aria-hidden="true" />
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Duration Section */}
            <div className={styles.section}>
                <button
                    type="button"
                    className={styles.sectionToggle}
                    onClick={() => toggleSection('duration')}
                    aria-expanded={expandedSections.duration}
                    aria-controls="duration-section"
                >
                    <div className={styles.sectionHeader}>
                        <Clock size={16} className={styles.sectionIcon} aria-hidden="true" />
                        <span className={styles.sectionTitle}>Duration</span>
                    </div>
                    {expandedSections.duration ?
                        <ChevronUp size={16} aria-hidden="true" /> :
                        <ChevronDown size={16} aria-hidden="true" />
                    }
                </button>

                {expandedSections.duration && (
                    <div
                        id="duration-section"
                        className={styles.sectionContent}
                        role="region"
                        aria-label="Duration filter options"
                    >
                        <div className={styles.durationOptions}>
                            {[
                                { value: '7', label: '≤ 1 week' },
                                { value: '14', label: '≤ 2 weeks' },
                                { value: '30', label: '≤ 1 month' },
                                { value: '60', label: '≤ 2 months' },
                                { value: '90', label: '≤ 3 months' }
                            ].map(({ value, label }) => (
                                <label
                                    key={value}
                                    className={styles.optionLabel}
                                >
                                    <input
                                        type="radio"
                                        name="duration"
                                        checked={filters.duration === value}
                                        onChange={() => handleOptionChange('duration', value)}
                                        className={styles.optionInput}
                                        aria-label={label}
                                    />
                                    <span className={styles.optionText}>{label}</span>
                                    {filters.duration === value && (
                                        <Check size={14} className={styles.optionCheck} aria-hidden="true" />
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
                <Button
                    variant="ghost"
                    onClick={handleClearAll}
                    disabled={activeFiltersCount === 0}
                    className={styles.clearFiltersButton}
                    aria-label="Clear all filters"
                >
                    Clear All
                </Button>

                <Button
                    variant="primary"
                    onClick={handleApplyFilters}
                    className={styles.applyButton}
                    aria-label="Apply filters"
                >
                    Apply Filters
                </Button>
            </div>
        </aside>
    );
};

GigFilters.propTypes = {
    filters: PropTypes.shape({
        search: PropTypes.string,
        budget: PropTypes.shape({
            min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            max: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        }),
        type: PropTypes.string,
        skills: PropTypes.arrayOf(PropTypes.string),
        experienceLevel: PropTypes.string,
        duration: PropTypes.string
    }).isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onApplyFilters: PropTypes.func,
    onClearFilters: PropTypes.func,
    availableSkills: PropTypes.arrayOf(PropTypes.string),
    experienceLevels: PropTypes.arrayOf(PropTypes.string),
    gigTypes: PropTypes.arrayOf(PropTypes.string),
    isMobile: PropTypes.bool
};

GigFilters.defaultProps = {
    availableSkills: [
        'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java',
        'TypeScript', 'GraphQL', 'AWS', 'Docker', 'Kubernetes',
        'UI/UX Design', 'Figma', 'Adobe XD', 'Product Management',
        'Content Writing', 'SEO', 'Digital Marketing', 'Social Media',
        'Data Analysis', 'Machine Learning', 'Blockchain', 'DevOps'
    ],
    experienceLevels: ['Entry Level', 'Intermediate', 'Expert'],
    gigTypes: ['Fixed-price', 'Hourly', 'Negotiable'],
    isMobile: false
};

export default GigFilters;