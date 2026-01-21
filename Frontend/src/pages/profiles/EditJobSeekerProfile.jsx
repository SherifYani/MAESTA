/**
 * @file EditJobSeekerProfile.jsx
 * @description Edit job seeker profile component with forms for personal info, skills, experience, and education.
 * Uses BEM methodology for CSS class naming and follows React functional component patterns.
 * @author Shahd Mohay
 * @version 2.1.0
 * @date 2025-12-11
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-1-20
 * 
 * @update :-
 * - removed navigation section 
 * - edit the link to the profile page (because include {profile} and {edit profile} to dashboard)
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import "../../styles/profile.css";
import "../../styles/edit-profile.css";

/**
 * EditJobSeekerProfile Component
 * @description Form component for editing job seeker profile information including:
 * personal details, skills, work experience, and education.
 * Provides comprehensive form validation and dynamic management of multiple entries.
 * @returns {JSX.Element} The rendered edit job seeker profile form with validation.
 */
export default function EditJobSeekerProfile() {
  const navigate = useNavigate();
  const { jobSeekerData, updateJobSeekerData } = useProfile();

  // Form state management for personal information
  const [formData, setFormData] = useState({
    fullName: jobSeekerData.fullName,
    email: jobSeekerData.email,
    phoneNumber: jobSeekerData.phoneNumber,
    profilePictureUrl: jobSeekerData.profilePictureUrl,
    headline: jobSeekerData.profile.headline,
    summary: jobSeekerData.profile.summary,
    location: jobSeekerData.profile.location,
    resumeUrl: jobSeekerData.profile.resumeUrl,
  });

  // Skills state management
  const [skills, setSkills] = useState(jobSeekerData.skills);

  // Work experience state management
  const [experiences, setExperiences] = useState(jobSeekerData.experiences);

  // Education state management
  const [education, setEducation] = useState(jobSeekerData.education);

  /**
   * Handles changes to form input fields.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} event - The input change event.
   */
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previousData) => ({ ...previousData, [name]: value }));
  };

  /**
   * Handles changes to skill fields.
   * @param {number} skillIndex - The index of the skill to update.
   * @param {string} field - The field name to update.
   * @param {string} value - The new value for the field.
   */
  const handleSkillChange = (skillIndex, field, value) => {
    const updatedSkills = [...skills];
    updatedSkills[skillIndex] = {
      ...updatedSkills[skillIndex],
      [field]: value,
    };
    setSkills(updatedSkills);
  };

  /**
   * Adds a new empty skill to the list.
   */
  const addSkill = () => {
    setSkills([...skills, { name: "", proficiencyLevel: "Beginner" }]);
  };

  /**
   * Removes a skill from the list.
   * @param {number} skillIndex - The index of the skill to remove.
   */
  const removeSkill = (skillIndex) => {
    const updatedSkills = skills.filter((_, index) => index !== skillIndex);
    setSkills(updatedSkills);
  };

  /**
   * Handles changes to experience fields.
   * @param {number} experienceIndex - The index of the experience to update.
   * @param {string} field - The field name to update.
   * @param {string|null} value - The new value for the field.
   */
  const handleExperienceChange = (experienceIndex, field, value) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[experienceIndex] = {
      ...updatedExperiences[experienceIndex],
      [field]: value,
    };
    setExperiences(updatedExperiences);
  };

  /**
   * Adds a new empty experience to the list.
   */
  const addExperience = () => {
    const newExperienceId = Date.now();

    setExperiences([
      ...experiences,
      {
        id: newExperienceId,
        jobTitle: "",
        companyName: "",
        description: "",
        startDate: "",
        endDate: null,
      },
    ]);
  };

  /**
   * Removes an experience from the list.
   * @param {number} experienceIndex - The index of the experience to remove.
   */
  const removeExperience = (experienceIndex) => {
    const updatedExperiences = experiences.filter(
      (_, index) => index !== experienceIndex
    );
    setExperiences(updatedExperiences);
  };

  /**
   * Handles changes to education fields.
   * @param {number} educationIndex - The index of the education entry to update.
   * @param {string} field - The field name to update.
   * @param {string|number|null} value - The new value for the field.
   */
  const handleEducationChange = (educationIndex, field, value) => {
    const updatedEducation = [...education];
    updatedEducation[educationIndex] = {
      ...updatedEducation[educationIndex],
      [field]: value,
    };
    setEducation(updatedEducation);
  };

  /**
   * Adds a new empty education entry to the list.
   */
  const addEducation = () => {
    const newEducationId = Date.now();
    const currentYear = new Date().getFullYear();

    setEducation([
      ...education,
      {
        id: newEducationId,
        institutionName: "",
        degree: "",
        fieldOfStudy: "",
        startYear: currentYear,
        endYear: null,
      },
    ]);
  };

  /**
   * Removes an education entry from the list.
   * @param {number} educationIndex - The index of the education entry to remove.
   */
  const removeEducation = (educationIndex) => {
    const updatedEducation = education.filter(
      (_, index) => index !== educationIndex
    );
    setEducation(updatedEducation);
  };

  /**
   * Validates form data before submission.
   * @returns {boolean} True if form is valid, false otherwise.
   */
  const validateForm = () => {
    if (!formData.fullName.trim()) {
      alert("Full name is required");
      return false;
    }

    if (!formData.email.trim()) {
      alert("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return false;
    }

    // Validate skills
    for (const skill of skills) {
      if (!skill.name.trim()) {
        alert("All skills must have a name");
        return false;
      }
    }

    // Validate experiences
    for (const experience of experiences) {
      if (!experience.jobTitle.trim()) {
        alert("All experiences must have a job title");
        return false;
      }

      if (!experience.companyName.trim()) {
        alert("All experiences must have a company name");
        return false;
      }

      if (!experience.startDate.trim()) {
        alert("All experiences must have a start date");
        return false;
      }
    }

    // Validate education
    for (const edu of education) {
      if (!edu.institutionName.trim()) {
        alert("All education entries must have an institution name");
        return false;
      }

      if (!edu.degree.trim()) {
        alert("All education entries must have a degree");
        return false;
      }

      if (edu.startYear && edu.endYear && edu.startYear > edu.endYear) {
        alert("Start year cannot be later than end year");
        return false;
      }
    }

    return true;
  };

  /**
   * Handles form submission and updates job seeker profile data.
   * @param {React.FormEvent<HTMLFormElement>} event - The form submit event.
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare updated job seeker data
    const updatedJobSeekerData = {
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      profilePictureUrl: formData.profilePictureUrl,
      profile: {
        ...jobSeekerData.profile,
        headline: formData.headline,
        summary: formData.summary,
        location: formData.location,
        resumeUrl: formData.resumeUrl,
      },
      skills,
      experiences,
      education,
    };

    // Update context and navigate back
    updateJobSeekerData(updatedJobSeekerData);
    navigate("/profile");
  };

  /**
   * Handles cancellation of editing and navigates back.
   */
  const handleCancel = () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel? All unsaved changes will be lost."
    );

    if (confirmCancel) {
      navigate("/dashboard/profile");
    }
  };

  /**
   * Formats month value for display in date inputs.
   * @param {string} dateString - Date string in YYYY-MM format.
   * @returns {string} Formatted date string.
   */
  const formatMonthValue = (dateString) => {
    return dateString || "";
  };

  /**
   * Formats year value for display in number inputs.
   * @param {number|null} year - Year value.
   * @returns {string|number} Formatted year value.
   */
  const formatYearValue = (year) => {
    return year || "";
  };

  return (
    <div className="profile">

      {/* Main Content Area */}
      <main className="profile__content">
        <header className="edit__header">
          <h1 className="edit__title" aria-label="Edit job seeker profile page">
            Edit Job Seeker Profile
          </h1>
          <p className="edit__subtitle">
            Update your profile, skills, experience, and education
          </p>
        </header>

        {/* Edit Form */}
        <form
          onSubmit={handleSubmit}
          className="edit__form"
          aria-label="Edit job seeker profile form"
          noValidate>
          {/* Personal Information Section */}
          <section className="edit__section" aria-label="Personal information">
            <h2 className="edit__section-title">Personal Information</h2>

            <div className="edit__grid">
              <div className="edit__field">
                <label htmlFor="fullName" className="edit__label">
                  Full Name <span className="edit__required">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="edit__input"
                  aria-required="true"
                  aria-label="Full name"
                  maxLength={100}
                />
              </div>

              <div className="edit__field">
                <label htmlFor="email" className="edit__label">
                  Email <span className="edit__required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="edit__input"
                  aria-required="true"
                  aria-label="Email address"
                />
              </div>

              <div className="edit__field">
                <label htmlFor="phoneNumber" className="edit__label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="edit__input"
                  aria-label="Phone number"
                  pattern="[\+]\d{1,4}[-\s]?\(?\d{1,3}?\)?[-\s]?\d{1,4}[-\s]?\d{1,4}[-\s]?\d{1,9}"
                  title="Format: +1 (555) 123-4567"
                />
              </div>

              <div className="edit__field">
                <label htmlFor="location" className="edit__label">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="edit__input"
                  aria-label="Location"
                  maxLength={100}
                />
              </div>

              <div className="edit__field">
                <label htmlFor="profilePictureUrl" className="edit__label">
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  id="profilePictureUrl"
                  name="profilePictureUrl"
                  value={formData.profilePictureUrl}
                  onChange={handleInputChange}
                  className="edit__input"
                  aria-label="Profile picture URL"
                  placeholder="https://example.com/profile.jpg"
                />
              </div>

              <div className="edit__field">
                <label htmlFor="resumeUrl" className="edit__label">
                  Resume URL
                </label>
                <input
                  type="url"
                  id="resumeUrl"
                  name="resumeUrl"
                  value={formData.resumeUrl}
                  onChange={handleInputChange}
                  className="edit__input"
                  aria-label="Resume URL"
                  placeholder="https://example.com/resume.pdf"
                />
              </div>

              <div className="edit__field edit__field--full">
                <label htmlFor="headline" className="edit__label">
                  Headline
                </label>
                <input
                  type="text"
                  id="headline"
                  name="headline"
                  value={formData.headline}
                  onChange={handleInputChange}
                  className="edit__input"
                  aria-label="Professional headline"
                  maxLength={200}
                />
              </div>

              <div className="edit__field edit__field--full">
                <label htmlFor="summary" className="edit__label">
                  Professional Summary
                </label>
                <textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  rows={4}
                  className="edit__textarea"
                  aria-label="Professional summary"
                  maxLength={1000}
                />
                <div className="edit__character-count">
                  {formData.summary.length}/1000 characters
                </div>
              </div>
            </div>
          </section>

          {/* Skills Section */}
          <section className="edit__section" aria-label="Skills management">
            <div className="edit__section-header">
              <h2 className="edit__section-title">Skills</h2>
              <button
                type="button"
                className="edit__add-btn"
                onClick={addSkill}
                aria-label="Add new skill">
                + Add Skill
              </button>
            </div>

            {skills.length === 0 ? (
              <div className="edit__empty-state">
                <p>No skills added yet. Click "Add Skill" to create one.</p>
              </div>
            ) : (
              <div className="edit__skills-grid">
                {skills.map((skill, index) => (
                  <article
                    key={index}
                    className="edit__skill-edit-item"
                    aria-label={`Skill ${index + 1}`}>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(event) =>
                        handleSkillChange(index, "name", event.target.value)
                      }
                      placeholder="Skill name"
                      className="edit__skill-name-input"
                      aria-label={`Skill ${index + 1} name`}
                      maxLength={50}
                    />
                    <select
                      value={skill.proficiencyLevel}
                      onChange={(event) =>
                        handleSkillChange(
                          index,
                          "proficiencyLevel",
                          event.target.value
                        )
                      }
                      className="edit__skill-select"
                      aria-label={`Skill ${index + 1} proficiency level`}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Expert">Expert</option>
                    </select>
                    <button
                      type="button"
                      className="edit__remove-skill-btn"
                      onClick={() => removeSkill(index)}
                      aria-label={`Remove skill ${index + 1}`}>
                      ×
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Experience Section */}
          <section
            className="edit__section"
            aria-label="Work experience management">
            <div className="edit__section-header">
              <h2 className="edit__section-title">Work Experience</h2>
              <button
                type="button"
                className="edit__add-btn"
                onClick={addExperience}
                aria-label="Add new work experience">
                + Add Experience
              </button>
            </div>

            {experiences.length === 0 ? (
              <div className="edit__empty-state">
                <p>
                  No work experience added yet. Click "Add Experience" to create
                  one.
                </p>
              </div>
            ) : (
              experiences.map((experience, index) => (
                <article
                  key={experience.id || index}
                  className="edit__item-card"
                  aria-label={`Work experience ${index + 1}`}>
                  <div className="edit__item-header">
                    <h3 className="edit__item-title">Experience {index + 1}</h3>
                    <button
                      type="button"
                      className="edit__remove-btn"
                      onClick={() => removeExperience(index)}
                      aria-label={`Remove work experience ${index + 1}`}>
                      Remove
                    </button>
                  </div>

                  <div className="edit__grid">
                    <div className="edit__field">
                      <label
                        htmlFor={`job-title-${index}`}
                        className="edit__label">
                        Job Title <span className="edit__required">*</span>
                      </label>
                      <input
                        type="text"
                        id={`job-title-${index}`}
                        value={experience.jobTitle}
                        onChange={(event) =>
                          handleExperienceChange(
                            index,
                            "jobTitle",
                            event.target.value
                          )
                        }
                        required
                        className="edit__input"
                        aria-required="true"
                        aria-label={`Experience ${index + 1} job title`}
                      />
                    </div>

                    <div className="edit__field">
                      <label
                        htmlFor={`company-name-${index}`}
                        className="edit__label">
                        Company Name <span className="edit__required">*</span>
                      </label>
                      <input
                        type="text"
                        id={`company-name-${index}`}
                        value={experience.companyName}
                        onChange={(event) =>
                          handleExperienceChange(
                            index,
                            "companyName",
                            event.target.value
                          )
                        }
                        required
                        className="edit__input"
                        aria-required="true"
                        aria-label={`Experience ${index + 1} company name`}
                      />
                    </div>

                    <div className="edit__field">
                      <label
                        htmlFor={`start-date-${index}`}
                        className="edit__label">
                        Start Date <span className="edit__required">*</span>
                      </label>
                      <input
                        type="month"
                        id={`start-date-${index}`}
                        value={formatMonthValue(experience.startDate)}
                        onChange={(event) =>
                          handleExperienceChange(
                            index,
                            "startDate",
                            event.target.value
                          )
                        }
                        required
                        className="edit__input"
                        aria-required="true"
                        aria-label={`Experience ${index + 1} start date`}
                      />
                    </div>

                    <div className="edit__field">
                      <label
                        htmlFor={`end-date-${index}`}
                        className="edit__label">
                        End Date (leave empty for current)
                      </label>
                      <input
                        type="month"
                        id={`end-date-${index}`}
                        value={formatMonthValue(experience.endDate)}
                        onChange={(event) =>
                          handleExperienceChange(
                            index,
                            "endDate",
                            event.target.value || null
                          )
                        }
                        className="edit__input"
                        aria-label={`Experience ${index + 1} end date`}
                      />
                    </div>

                    <div className="edit__field edit__field--full">
                      <label
                        htmlFor={`description-${index}`}
                        className="edit__label">
                        Description
                      </label>
                      <textarea
                        id={`description-${index}`}
                        value={experience.description}
                        onChange={(event) =>
                          handleExperienceChange(
                            index,
                            "description",
                            event.target.value
                          )
                        }
                        rows={3}
                        className="edit__textarea"
                        aria-label={`Experience ${index + 1} description`}
                        maxLength={500}
                      />
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>

          {/* Education Section */}
          <section className="edit__section" aria-label="Education management">
            <div className="edit__section-header">
              <h2 className="edit__section-title">Education</h2>
              <button
                type="button"
                className="edit__add-btn"
                onClick={addEducation}
                aria-label="Add new education entry">
                + Add Education
              </button>
            </div>

            {education.length === 0 ? (
              <div className="edit__empty-state">
                <p>
                  No education added yet. Click "Add Education" to create one.
                </p>
              </div>
            ) : (
              education.map((edu, index) => (
                <article
                  key={edu.id || index}
                  className="edit__item-card"
                  aria-label={`Education ${index + 1}`}>
                  <div className="edit__item-header">
                    <h3 className="edit__item-title">Education {index + 1}</h3>
                    <button
                      type="button"
                      className="edit__remove-btn"
                      onClick={() => removeEducation(index)}
                      aria-label={`Remove education entry ${index + 1}`}>
                      Remove
                    </button>
                  </div>

                  <div className="edit__grid">
                    <div className="edit__field edit__field--full">
                      <label
                        htmlFor={`institution-name-${index}`}
                        className="edit__label">
                        Institution Name{" "}
                        <span className="edit__required">*</span>
                      </label>
                      <input
                        type="text"
                        id={`institution-name-${index}`}
                        value={edu.institutionName}
                        onChange={(event) =>
                          handleEducationChange(
                            index,
                            "institutionName",
                            event.target.value
                          )
                        }
                        required
                        className="edit__input"
                        aria-required="true"
                        aria-label={`Education ${index + 1} institution name`}
                      />
                    </div>

                    <div className="edit__field">
                      <label
                        htmlFor={`degree-${index}`}
                        className="edit__label">
                        Degree <span className="edit__required">*</span>
                      </label>
                      <input
                        type="text"
                        id={`degree-${index}`}
                        value={edu.degree}
                        onChange={(event) =>
                          handleEducationChange(
                            index,
                            "degree",
                            event.target.value
                          )
                        }
                        required
                        className="edit__input"
                        aria-required="true"
                        aria-label={`Education ${index + 1} degree`}
                      />
                    </div>

                    <div className="edit__field">
                      <label
                        htmlFor={`field-of-study-${index}`}
                        className="edit__label">
                        Field of Study
                      </label>
                      <input
                        type="text"
                        id={`field-of-study-${index}`}
                        value={edu.fieldOfStudy}
                        onChange={(event) =>
                          handleEducationChange(
                            index,
                            "fieldOfStudy",
                            event.target.value
                          )
                        }
                        className="edit__input"
                        aria-label={`Education ${index + 1} field of study`}
                      />
                    </div>

                    <div className="edit__field">
                      <label
                        htmlFor={`start-year-${index}`}
                        className="edit__label">
                        Start Year
                      </label>
                      <input
                        type="number"
                        id={`start-year-${index}`}
                        value={formatYearValue(edu.startYear)}
                        onChange={(event) =>
                          handleEducationChange(
                            index,
                            "startYear",
                            Number(event.target.value)
                          )
                        }
                        min="1900"
                        max={new Date().getFullYear() + 5}
                        className="edit__input"
                        aria-label={`Education ${index + 1} start year`}
                      />
                    </div>

                    <div className="edit__field">
                      <label
                        htmlFor={`end-year-${index}`}
                        className="edit__label">
                        End Year (leave empty if ongoing)
                      </label>
                      <input
                        type="number"
                        id={`end-year-${index}`}
                        value={formatYearValue(edu.endYear)}
                        onChange={(event) =>
                          handleEducationChange(
                            index,
                            "endYear",
                            event.target.value
                              ? Number(event.target.value)
                              : null
                          )
                        }
                        min="1900"
                        max={new Date().getFullYear() + 5}
                        className="edit__input"
                        aria-label={`Education ${index + 1} end year`}
                      />
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>

          {/* Form Actions */}
          <div className="edit__actions">
            <button
              type="button"
              className="edit__cancel-btn"
              onClick={handleCancel}
              aria-label="Cancel editing and return to job seeker profile">
              Cancel
            </button>
            <button
              type="submit"
              className="edit__save-btn"
              aria-label="Save all job seeker profile changes">
              Save Changes
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
