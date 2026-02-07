/**
 * @file JobFilters.jsx
 * @description Sidebar filter component for searching and filtering jobs.
 * @author Sherif Talaat
 * @date 2026-02-07
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
    Search,
    MapPin
} from 'lucide-react';
import { Button, Input } from '../common';
import styles from './JobFilters.module.css';

/**
 * Salary range filter component.
 */
const SalaryFilter = ({ filters, onFilterChange }) => {
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        const numericValue = value === '' ? '' : Math.max(0, parseInt(value) || 0);

        onFilterChange({
            ...filters,
            salaryRange: {
                ...filters.salaryRange,
                [name]: numericValue
            }
        });
    }, [filters, onFilterChange]);

    return (
        <div className={styles.filterSection}>
            <div className={styles.salaryInputs}>
                <div className={styles.inputGroup}>
                    <label htmlFor="salary-min" className={styles.visuallyHidden}>
                        Minimum salary
                    </label>
                    <div className={styles.inputWrapper}>
                        <span className={styles.currencyPrefix}>$</span>
                        <Input
                            id="salary-min"
                            name="min"
                            type="number"
                            placeholder="Min"
                            value={filters.salaryRange?.min || ''}
                            onChange={handleChange}
                            min="0"
                            step="1000"
                            className={styles.salaryInput}
                            aria-label="Minimum salary"
                        />
                    </div>
                </div>

                <span className={styles.separator} aria-hidden="true">—</span>

                <div className={styles.inputGroup}>
                    <label htmlFor="salary-max" className={styles.visuallyHidden}>
                        Maximum salary
                    </label>
                    <div className={styles.inputWrapper}>
                        <span className={styles.currencyPrefix}>$</span>
                        <Input
                            id="salary-max"
                            name="max"
                            type="number"
                            placeholder="Max"
                            value={filters.salaryRange?.max || ''}
                            onChange={handleChange}
                            min="0"
                            step="1000"
                            className={styles.salaryInput}
                            aria-label="Maximum salary"
                        />
                    </div>
                </div>
            </div>

            {filters.salaryRange?.min > filters.salaryRange?.max && filters.salaryRange?.max !== '' && (
                <div className={styles.validationError} role="alert">
                    Maximum must be greater than minimum
                </div>
            )}
        </div>
    );
};

SalaryFilter.propTypes = {
    filters: PropTypes.object.isRequired,
    onFilterChange: PropTypes.func.isRequired
};

/**
 * Skills filter component.
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
 * Main job filters component.
 */
const JobFilters = ({
    filters,
    onFilterChange,
    onApplyFilters,
    onClearFilters,
    availableSkills = [],
    experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
    jobTypes = ['Full Time', 'Part Time', 'Contract', 'Remote'],
    datePostedOptions = ['Today', 'This Week', 'This Month', 'All Time']
}) => {
    const [expandedSections, setExpandedSections] = useState({
        salary: true,
        type: true,
        skills: true,
        experience: true,
        datePosted: true
    });

    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    const toggleSection = useCallback((section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    }, []);

    const handleOptionChange = useCallback((field, value) => {
        onFilterChange({
            ...filters,
            [field]: filters[field] === value ? '' : value
        });
    }, [filters, onFilterChange]);

    const handleSkillToggle = useCallback((skill) => {
        const currentSkills = filters.skills || [];
        const newSkills = currentSkills.includes(skill)
            ? currentSkills.filter(s => s !== skill)
            : [...currentSkills, skill];

        onFilterChange({ ...filters, skills: newSkills });
    }, [filters, onFilterChange]);

    const handleClearSkills = useCallback(() => {
        onFilterChange({ ...filters, skills: [] });
    }, [filters, onFilterChange]);

    const handleClearAll = useCallback(() => {
        const defaultFilters = {
            keyword: '',
            location: '',
            salaryRange: { min: '', max: '' },
            jobType: '',
            skills: [],
            experienceLevel: '',
            datePosted: 'all'
        };

        onFilterChange(defaultFilters);
        if (onClearFilters) {
            onClearFilters();
        }
    }, [onFilterChange, onClearFilters]);

    const handleApplyFilters = useCallback(() => {
        if (onApplyFilters) {
            onApplyFilters(filters);
        }
    }, [filters, onApplyFilters]);

    // Calculate active filters count
    useEffect(() => {
        let count = 0;

        if (filters.salaryRange?.min || filters.salaryRange?.max) count++;
        if (filters.jobType) count++;
        if (filters.skills?.length > 0) count++;
        if (filters.experienceLevel) count++;
        if (filters.datePosted && filters.datePosted !== 'all') count++;

        setActiveFiltersCount(count);
    }, [filters]);

    return (
        <aside
            className={styles.container}
            aria-label="Job filters"
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
                        placeholder="Search jobs..."
                        value={filters.keyword || ''}
                        onChange={(e) => onFilterChange({ ...filters, keyword: e.target.value })}
                        className={styles.searchInput}
                        aria-label="Search jobs by keyword"
                    />
                </div>
            </div>

            {/* Location Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <MapPin size={16} className={styles.sectionIcon} aria-hidden="true" />
                    <span className={styles.sectionTitle}>Location</span>
                </div>

                <div className={styles.sectionContent}>
                    <Input
                        type="text"
                        placeholder="City, state, or remote"
                        value={filters.location || ''}
                        onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
                        className={styles.searchInput}
                        aria-label="Filter by location"
                    />
                </div>
            </div>

            {/* Salary Section */}
            <div className={styles.section}>
                <button
                    type="button"
                    className={styles.sectionToggle}
                    onClick={() => toggleSection('salary')}
                    aria-expanded={expandedSections.salary}
                    aria-controls="salary-section"
                >
                    <div className={styles.sectionHeader}>
                        <DollarSign size={16} className={styles.sectionIcon} aria-hidden="true" />
                        <span className={styles.sectionTitle}>Salary Range</span>
                    </div>
                    {expandedSections.salary ?
                        <ChevronUp size={16} aria-hidden="true" /> :
                        <ChevronDown size={16} aria-hidden="true" />
                    }
                </button>

                {expandedSections.salary && (
                    <div
                        id="salary-section"
                        className={styles.sectionContent}
                        role="region"
                        aria-label="Salary range filter options"
                    >
                        <SalaryFilter
                            filters={filters}
                            onFilterChange={onFilterChange}
                        />
                    </div>
                )}
            </div>

            {/* Job Type Section */}
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
                        <span className={styles.sectionTitle}>Job Type</span>
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
                        aria-label="Job type filter options"
                    >
                        <div className={styles.optionsList} role="radiogroup" aria-label="Select job type">
                            {jobTypes.map(type => (
                                <label
                                    key={type}
                                    className={styles.optionLabel}
                                >
                                    <input
                                        type="radio"
                                        name="job-type"
                                        checked={filters.jobType === type}
                                        onChange={() => handleOptionChange('jobType', type)}
                                        className={styles.optionInput}
                                        aria-label={type}
                                    />
                                    <span className={styles.optionText}>{type}</span>
                                    {filters.jobType === type && (
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

            {/* Date Posted Section */}
            <div className={styles.section}>
                <button
                    type="button"
                    className={styles.sectionToggle}
                    onClick={() => toggleSection('datePosted')}
                    aria-expanded={expandedSections.datePosted}
                    aria-controls="datePosted-section"
                >
                    <div className={styles.sectionHeader}>
                        <Clock size={16} className={styles.sectionIcon} aria-hidden="true" />
                        <span className={styles.sectionTitle}>Date Posted</span>
                    </div>
                    {expandedSections.datePosted ?
                        <ChevronUp size={16} aria-hidden="true" /> :
                        <ChevronDown size={16} aria-hidden="true" />
                    }
                </button>

                {expandedSections.datePosted && (
                    <div
                        id="datePosted-section"
                        className={styles.sectionContent}
                        role="region"
                        aria-label="Date posted filter options"
                    >
                        <div className={styles.optionsList} role="radiogroup" aria-label="Select date posted">
                            {datePostedOptions.map(option => {
                                const value = option.toLowerCase().replace(' ', '');
                                return (
                                    <label
                                        key={option}
                                        className={styles.optionLabel}
                                    >
                                        <input
                                            type="radio"
                                            name="date-posted"
                                            checked={filters.datePosted === value}
                                            onChange={() => handleOptionChange('datePosted', value)}
                                            className={styles.optionInput}
                                            aria-label={option}
                                        />
                                        <span className={styles.optionText}>{option}</span>
                                        {filters.datePosted === value && (
                                            <Check size={14} className={styles.optionCheck} aria-hidden="true" />
                                        )}
                                    </label>
                                );
                            })}
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

JobFilters.propTypes = {
    filters: PropTypes.shape({
        keyword: PropTypes.string,
        location: PropTypes.string,
        salaryRange: PropTypes.shape({
            min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            max: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        }),
        jobType: PropTypes.string,
        skills: PropTypes.arrayOf(PropTypes.string),
        experienceLevel: PropTypes.string,
        datePosted: PropTypes.string
    }).isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onApplyFilters: PropTypes.func,
    onClearFilters: PropTypes.func,
    availableSkills: PropTypes.arrayOf(PropTypes.string),
    experienceLevels: PropTypes.arrayOf(PropTypes.string),
    jobTypes: PropTypes.arrayOf(PropTypes.string),
    datePostedOptions: PropTypes.arrayOf(PropTypes.string)
};

JobFilters.defaultProps = {
    availableSkills: [
        'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java',
        'TypeScript', 'JavaScript', 'C++', 'C#', 'Ruby', 'PHP',
        'Swift', 'Kotlin', 'Go', 'Rust', 'SQL', 'MongoDB',
        'AWS', 'Azure', 'Docker', 'Kubernetes', 'DevOps',
        'UI/UX Design', 'Figma', 'Adobe XD', 'Product Management',
        'Project Management', 'Agile', 'Scrum', 'Data Analysis',
        'Machine Learning', 'AI', 'Blockchain', 'Cybersecurity'
    ],
    experienceLevels: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
    jobTypes: ['Full Time', 'Part Time', 'Contract', 'Remote'],
    datePostedOptions: ['Today', 'This Week', 'This Month', 'All Time']
};

export default JobFilters;
