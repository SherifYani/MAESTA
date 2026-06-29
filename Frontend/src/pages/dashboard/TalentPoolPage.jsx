/**
 * @file TalentPoolPage.jsx
 * @description Talent Pool Directory page for Clients and Companies.
 *              Allows searching and filtering for skilled freelancers and job seekers.
 * @author Antigravity
 * @date 2026-06-20
 *
 * @last-modified-by Antigravity
 * @last-modified-date 2026-06-20
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, Search, Star, MessageSquare
} from 'lucide-react';
import { LoadingSpinner, Alert } from '../../components/common';
import jobService from '../../services/jobService';
import styles from './TalentPoolPage.module.css';

/**
 * TalentPoolPage component.
 * @returns {JSX.Element} The rendered Talent Pool page.
 */
const TalentPoolPage = () => {
  const navigate = useNavigate();
  const [talents, setTalents] = useState([]);
  const [filteredTalents, setFilteredTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [rateFilter, setRateFilter] = useState('all');

  /**
   * Load talent pool data.
   */
  const loadTalentPool = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch applicants that applied to company jobs as a base talent list
      const applicants = await jobService.getCompanyApplicants();
      
      const talentList = (applicants || []).map(app => ({
        id: app.userId || app.id,
        name: app.name || app.applicantName || 'Professional Talent',
        roleTitle: app.roleTitle || app.title || 'Software Engineer',
        rating: app.rating || 4.8,
        bio: app.bio || 'Experienced professional with a proven track record of delivering successful projects.',
        skills: app.skills || ['React', 'JavaScript', 'CSS Modules'],
        hourlyRate: app.hourlyRate || app.proposedRate || 40,
        avatarUrl: app.profilePicture || app.avatarUrl
      }));

      setTalents(talentList);
    } catch (err) {
      console.error('Error fetching talent pool:', err);
      setError('Failed to fetch talent database. Displaying registered network professionals.');
      
      // Fallback mock talents in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock talents in development mode.');
        setTalents([
          {
            id: 10,
            name: 'Sarah Connor',
            roleTitle: 'Senior React Developer',
            rating: 4.9,
            bio: 'Expert frontend engineer specializing in design systems, state management, and high-performance React architectures.',
            skills: ['React', 'Redux', 'TypeScript', 'TailwindCSS'],
            hourlyRate: 65,
            avatarUrl: null
          },
          {
            id: 11,
            name: 'John Doe',
            roleTitle: 'Full-Stack Developer',
            rating: 4.7,
            bio: 'Versatile programmer with deep knowledge of backend API construction, Database indices, and cloud architectures.',
            skills: ['Node.js', 'Express', 'PostgreSQL', 'AWS'],
            hourlyRate: 55,
            avatarUrl: null
          },
          {
            id: 12,
            name: 'Elena Rostova',
            roleTitle: 'UI/UX Designer',
            rating: 4.9,
            bio: 'Creative product designer focused on clean interfaces, premium glassmorphism, and intuitive navigation structures.',
            skills: ['Figma', 'UI Design', 'Wireframing', 'Prototyping'],
            hourlyRate: 45,
            avatarUrl: null
          },
          {
            id: 13,
            name: 'Marcus Aurelius',
            roleTitle: 'Python Data Engineer',
            rating: 4.8,
            bio: 'Data pipeline automation specialist. Expert at web scraping, analytical modeling, and structured database generation.',
            skills: ['Python', 'Pandas', 'Selenium', 'SQL'],
            hourlyRate: 60,
            avatarUrl: null
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTalentPool();
  }, [loadTalentPool]);

  // Apply search and filter logic
  useEffect(() => {
    let result = [...talents];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.roleTitle.toLowerCase().includes(q) ||
        t.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    if (skillFilter !== 'all') {
      result = result.filter(t => t.skills.includes(skillFilter));
    }

    if (rateFilter !== 'all') {
      if (rateFilter === 'low') {
        result = result.filter(t => t.hourlyRate < 50);
      } else if (rateFilter === 'mid') {
        result = result.filter(t => t.hourlyRate >= 50 && t.hourlyRate <= 60);
      } else if (rateFilter === 'high') {
        result = result.filter(t => t.hourlyRate > 60);
      }
    }

    setFilteredTalents(result);
  }, [talents, searchQuery, skillFilter, rateFilter]);

  // Extract unique skills list for filters dropdown
  const allSkills = Array.from(
    new Set(talents.flatMap(t => t.skills || []))
  );

  const handleContact = (talentId) => {
    navigate('/chat');
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Talent Pool Directory</h1>
          <p className={styles.subtitle}>Browse, search, and connect with top-rated freelancing experts in our network</p>
        </div>
      </header>

      {error && <Alert type="warning" message={error} className="mb-6" />}

      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchSection}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="Search talents by name, title, or skills..."
            className={`${styles.searchInput} input`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterSection}>
          <select 
            className={styles.select}
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            aria-label="Filter by skill"
          >
            <option value="all">All Skills</option>
            {allSkills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>

          <select 
            className={styles.select}
            value={rateFilter}
            onChange={(e) => setRateFilter(e.target.value)}
            aria-label="Filter by hourly rate"
          >
            <option value="all">All Rates</option>
            <option value="low">Under $50/hr</option>
            <option value="mid">$50 - $60/hr</option>
            <option value="high">Over $60/hr</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </div>
      ) : filteredTalents.length === 0 ? (
        <div className={styles.emptyState}>
          <Users className={styles.emptyIcon} size={48} />
          <h3 className={styles.emptyTitle}>No professional profiles match your criteria</h3>
          <p className={styles.emptyText}>Try modifying your search text or resetting the hourly rate and skill filters.</p>
        </div>
      ) : (
        <div className={styles.talentGrid}>
          {filteredTalents.map(talent => (
            <article key={talent.id} className={styles.talentCard}>
              <div>
                <div className={styles.talentHeader}>
                  {talent.avatarUrl ? (
                    <img 
                      src={talent.avatarUrl} 
                      alt={talent.name} 
                      className={styles.avatar} 
                    />
                  ) : (
                    <div className={styles.avatar}>
                      {getInitials(talent.name)}
                    </div>
                  )}
                  <div className={styles.talentInfo}>
                    <h3 className={styles.name}>{talent.name}</h3>
                    <p className={styles.roleTitle}>{talent.roleTitle}</p>
                    <div className={styles.rating}>
                      <Star size={14} fill="#eab308" />
                      <span>{talent.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <p className={styles.bio}>{talent.bio}</p>

                <div className={styles.skillsContainer}>
                  {talent.skills.slice(0, 4).map(skill => (
                    <span key={skill} className={styles.skillBadge}>{skill}</span>
                  ))}
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.rate}>
                  <span>Hourly Rate</span>
                  ${talent.hourlyRate}/hr
                </div>

                <div className={styles.actions}>
                  <button 
                    className={styles.contactBtn}
                    onClick={() => handleContact(talent.id)}
                    aria-label={`Contact ${talent.name}`}
                  >
                    <MessageSquare size={14} />
                  </button>
                  <Link 
                    to={`/profiles/freelancer/${talent.id}`} 
                    className={styles.viewBtn}
                  >
                    Profile
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default TalentPoolPage;
