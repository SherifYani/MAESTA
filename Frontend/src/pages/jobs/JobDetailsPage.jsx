/**
 * @file JobDetailsPage.jsx
 * @description Job details page with full job information, company details, and apply button
 * @author Sherif Talaat
 * @date 2026-02-05
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-06-22
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jobService from "../../services/jobService";
import profileService from "../../services/profileService"; // ✅ import
import { PageContainer } from "../../components/layout";
import styles from "./JobDetailsPage.module.css";

const JobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null); // ✅ store fetched company
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const jobData = await jobService.getJobById(jobId);
        console.log("Job data:", jobData); // for debugging
        setJob(jobData);
        setIsSaved(jobData.isSaved || false);

        // ✅ Fetch company profile if companyId exists
        if (jobData.companyId) {
          try {
            const companyData = await profileService.getCompanyProfile(
              jobData.companyId,
            );
            setCompany(companyData);
          } catch (err) {
            console.warn("Could not fetch company profile:", err);
            setCompany(null);
          }
        }

        // Fetch similar jobs
        try {
          const similar = await jobService.getSimilarJobs(jobId);
          setSimilarJobs(similar.slice(0, 4));
        } catch (err) {
          console.log("Could not load similar jobs");
        }
      } catch (err) {
        setError(err.message || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  // --- Handlers ---
  const handleSaveJob = async () => {
    try {
      if (isSaved) {
        await jobService.unsaveJob(jobId);
      } else {
        await jobService.saveJob(jobId);
      }
      setIsSaved(!isSaved);
    } catch (err) {
      console.error("Error saving job:", err);
    }
  };

  const handleApply = () => {
    navigate(`/jobs/${jobId}/apply`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const navigateToSimilarJob = (similarJobId) => {
    navigate(`/jobs/${similarJobId}`);
  };

  // --- Loading / Error ---
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} aria-label="Loading"></div>
        <p>Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button
          className={styles.errorButton}
          onClick={() => navigate("/jobs")}>
          Back to Jobs
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className={styles.errorContainer}>
        <h2>Job Not Found</h2>
        <p>The job you're looking for doesn't exist or has been removed.</p>
        <button
          className={styles.errorButton}
          onClick={() => navigate("/jobs")}>
          Back to Jobs
        </button>
      </div>
    );
  }

  // --- Render ---
  return (
    <PageContainer className={styles.pageGrid}>
      <main className={styles.mainContent}>
        <article className={styles.jobHeader}>
          <div className={styles.companyLogo}>
            {job.company?.logo ?
              <img src={job.company.logo} alt={`${job.company.name} logo`} />
            : <div className={styles.logoPlaceholder}>
                {job.company?.name?.charAt(0) || "C"}
              </div>
            }
          </div>
          <div className={styles.jobInfo}>
            <h1 className={styles.jobTitle}>{job.title}</h1>
            <p className={styles.companyName}>
              {job.company?.name || company?.name || "Company"}
            </p>
            <div className={styles.jobMeta}>
              <span className={styles.metaItem}>📍 {job.location}</span>
              <span className={styles.metaItem}>
                💼 {job.type || job.jobType}
              </span>
              <span className={styles.metaItem}>
                📅 Posted {formatDate(job.createdAt)}
              </span>
            </div>
          </div>
          <div className={styles.jobActions}>
            <button
              className={`${styles.saveButton} ${isSaved ? styles.saved : ""}`}
              onClick={handleSaveJob}
              aria-label={isSaved ? "Remove from saved jobs" : "Save this job"}>
              {isSaved ? "★ Saved" : "☆ Save"}
            </button>
            <button
              className={styles.applyButton}
              onClick={handleApply}
              aria-label="Apply for this job">
              Apply Now
            </button>
          </div>
        </article>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Job Description</h2>
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </section>

        {job.requirements && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Requirements</h2>
            <ul className={styles.requirementsList}>
              {Array.isArray(job.requirements) ?
                job.requirements.map((req, index) => (
                  <li key={index} className={styles.requirementsItem}>
                    {req}
                  </li>
                ))
              : <li className={styles.requirementsItem}>{job.requirements}</li>}
            </ul>
          </section>
        )}

        {job.responsibilities && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Responsibilities</h2>
            <ul className={styles.responsibilitiesList}>
              {Array.isArray(job.responsibilities) ?
                job.responsibilities.map((resp, index) => (
                  <li key={index} className={styles.responsibilitiesItem}>
                    {resp}
                  </li>
                ))
              : <li className={styles.responsibilitiesItem}>
                  {job.responsibilities}
                </li>
              }
            </ul>
          </section>
        )}

        {job.skills && job.skills.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Required Skills</h2>
            <div className={styles.skillsTags}>
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  className={styles.skillTag}
                  aria-label={`Required skill: ${skill}`}>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {job.benefits && job.benefits.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Benefits</h2>
            <div className={styles.benefitsGrid}>
              {job.benefits.map((benefit, index) => (
                <div key={index} className={styles.benefitItem}>
                  <span className={styles.benefitIcon} aria-hidden="true">
                    ✓
                  </span>
                  {benefit}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <aside className={styles.sidebar}>
        {/* Job Overview Card */}
        <div className={styles.overviewCard}>
          <h3 className={styles.cardTitle}>Job Overview</h3>
          <div className={styles.overviewItem}>
            <span className={styles.label}>Salary</span>
            <span className={styles.value}>
              {job.salary || "Not specified"}
            </span>
          </div>
          <div className={styles.overviewItem}>
            <span className={styles.label}>Experience</span>
            <span className={styles.value}>
              {job.experienceLevel || "Not specified"}
            </span>
          </div>
          <div className={styles.overviewItem}>
            <span className={styles.label}>Job Type</span>
            <span className={styles.value}>{job.type || job.jobType}</span>
          </div>
          <div className={styles.overviewItem}>
            <span className={styles.label}>Location</span>
            <span className={styles.value}>{job.location}</span>
          </div>
          {job.deadline && (
            <div className={styles.overviewItem}>
              <span className={styles.label}>Deadline</span>
              <span className={styles.value}>{formatDate(job.deadline)}</span>
            </div>
          )}
        </div>

        {job.companyId && (
          <div className={styles.companyCard}>
            <h3 className={styles.cardTitle}>About the Company</h3>
            <div className={styles.companyHeader}>
              <div className={styles.companyLogoSmall}>
                {company?.logo ?
                  <img
                    src={company.logo}
                    alt={`${company?.name || "Company"} logo`}
                  />
                : <div className={styles.logoPlaceholderSmall}>
                    {company?.name?.charAt(0) || "C"}
                  </div>
                }
              </div>
              <div>
                <h4 className={styles.companyNameSmall}>
                  {company?.name || "Company Name"}
                </h4>
                <p className={styles.companyIndustry}>
                  {company?.industry || "Loading..."}
                </p>
              </div>
            </div>
            {company?.description && (
              <p className={styles.companyDescription}>
                {company.description.substring(0, 200)}...
              </p>
            )}
            {!company && (
              <p className={styles.companyLoading}>
                Loading company details...
              </p>
            )}
            <button
              className={styles.viewCompanyButton}
              onClick={() => navigate(`/company/${job.companyId}`)}
              aria-label={`View ${company?.name || "company"} profile`}>
              View Company Profile
            </button>
          </div>
        )}

        {/* Similar Jobs Card */}
        {similarJobs.length > 0 && (
          <div className={styles.similarJobsCard}>
            <h3 className={styles.cardTitle}>Similar Jobs</h3>
            {similarJobs.map((similarJob) => (
              <article
                key={similarJob._id || similarJob.id}
                className={styles.similarJobItem}
                onClick={() =>
                  navigateToSimilarJob(similarJob._id || similarJob.id)
                }
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigateToSimilarJob(similarJob._id || similarJob.id);
                  }
                }}
                aria-label={`View ${similarJob.title} at ${similarJob.company?.name}`}>
                <h4 className={styles.similarJobTitle}>{similarJob.title}</h4>
                <p className={styles.similarJobCompany}>
                  {similarJob.company?.name}
                </p>
                <span className={styles.similarJobLocation}>
                  {similarJob.location}
                </span>
              </article>
            ))}
          </div>
        )}
      </aside>
    </PageContainer>
  );
};

export default JobDetailsPage;
