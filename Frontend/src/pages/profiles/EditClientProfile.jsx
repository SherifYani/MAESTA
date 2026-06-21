/**
 * @file EditClientProfile.jsx
 * @description Edit client profile component with form fields for personal info and projects.
 * Uses BEM methodology for CSS class naming and follows React functional component patterns.
 * @author Shahd Mohay
 * @version 2.1.0
 * @date 2025-12-11
 *
 * @last-modified-by Antigravity
 * @last-modified-date 2026-05-01
 * 
 * @update :-
 * - removed navigation section 
 * - edit the link to the edit profile page (because include {profile} and {edit profile} to dashboard)
 * - wired profileService API endpoints
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import profileService from "../../services/profileService";
import GeneralSelect from "../../components/common/GeneralSelect";
import "../../styles/profile.css";
import "../../styles/edit-profile.css";

/**
 * EditClientProfile Component
 * @description Form component for editing client profile information and managing projects.
 * Provides form validation, dynamic project management, and skill editing.
 * @returns {JSX.Element} The rendered edit client profile form with validation.
 */
export default function EditClientProfile() {
  const navigate = useNavigate();
  const { clientData, updateClientData } = useProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state management
  const [formData, setFormData] = useState({
    fullName: clientData.fullName,
    email: clientData.email,
    phoneNumber: clientData.phoneNumber,
    profilePictureUrl: clientData.profilePictureUrl,
  });

  // Projects state management
  const [projects, setProjects] = useState(clientData.projects);

  /**
   * Handles changes to form input fields.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
   */
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previousData) => ({ ...previousData, [name]: value }));
  };

  /**
   * Handles changes to project fields.
   * @param {number} projectIndex - The index of the project to update.
   * @param {string} field - The field name to update.
   * @param {string|number} value - The new value for the field.
   */
  const handleProjectChange = (projectIndex, field, value) => {
    const updatedProjects = [...projects];
    updatedProjects[projectIndex] = {
      ...updatedProjects[projectIndex],
      [field]: value,
    };
    setProjects(updatedProjects);
  };

  /**
   * Handles changes to project skills.
   * @param {number} projectIndex - The index of the project.
   * @param {number} skillIndex - The index of the skill within the project.
   * @param {string} value - The new skill value.
   */
  const handleSkillChange = (projectIndex, skillIndex, value) => {
    const updatedProjects = [...projects];
    updatedProjects[projectIndex].requiredSkills[skillIndex] = value;
    setProjects(updatedProjects);
  };

  /**
   * Adds a new skill to a specific project.
   * @param {number} projectIndex - The index of the project to add the skill to.
   */
  const addSkillToProject = (projectIndex) => {
    const updatedProjects = [...projects];
    updatedProjects[projectIndex].requiredSkills.push("");
    setProjects(updatedProjects);
  };

  /**
   * Removes a skill from a specific project.
   * @param {number} projectIndex - The index of the project.
   * @param {number} skillIndex - The index of the skill to remove.
   */
  const removeSkillFromProject = (projectIndex, skillIndex) => {
    const updatedProjects = [...projects];
    updatedProjects[projectIndex].requiredSkills.splice(skillIndex, 1);
    setProjects(updatedProjects);
  };

  /**
   * Adds a new empty project to the list.
   */
  const addProject = () => {
    const newProjectId = Date.now();
    const newProjectUuid = `p${newProjectId}`;
    const currentDate = new Date().toISOString().split("T")[0];

    setProjects([
      ...projects,
      {
        id: newProjectId,
        uuid: newProjectUuid,
        title: "",
        description: "",
        budget: 0,
        status: "Open",
        postedAt: currentDate,
        requiredSkills: [],
      },
    ]);
  };

  /**
   * Removes a project from the list.
   * @param {number} projectIndex - The index of the project to remove.
   */
  const removeProject = (projectIndex) => {
    const updatedProjects = projects.filter(
      (_, index) => index !== projectIndex
    );
    setProjects(updatedProjects);
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

    // Validate projects
    for (const project of projects) {
      if (!project.title.trim()) {
        alert("All projects must have a title");
        return false;
      }

      if (project.budget < 0) {
        alert("Project budget cannot be negative");
        return false;
      }
    }

    return true;
  };

  /**
   * Handles form submission and updates profile data.
   * @param {React.FormEvent<HTMLFormElement>} event - The form submit event.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const clientProfilePayload = {
      legalName: formData.fullName?.trim() || "",
      contactPhone: formData.phoneNumber?.replace(/[\s()-]/g, "") || "",
      identityDocumentUrl: formData.profilePictureUrl?.trim() || "",
    };

    try {
      setLoading(true);
      setError(null);
      const savedProfile = await profileService.updateClientProfile(clientProfilePayload);
      updateClientData({
        ...clientData,
        fullName: savedProfile?.legalName || formData.fullName,
        phoneNumber: savedProfile?.contactPhone || formData.phoneNumber,
        profilePictureUrl: savedProfile?.identityDocumentUrl || formData.profilePictureUrl,
        email: formData.email,
        projects,
      });
      navigate("/dashboard/profile");
    } catch (err) {
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="profile">

      {/* Main Content Area */}
      <main className="profile__content">
        <header className="edit__header">
          <h1 className="edit__title" aria-label="Edit client profile page">
            Edit Client Profile
          </h1>
          <p className="edit__subtitle">
            Update your profile information and manage your projects
          </p>
        </header>

        {/* Edit Form */}
        <form
          onSubmit={handleSubmit}
          className="edit__form"
          aria-label="Edit client profile form"
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
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section className="edit__section" aria-label="Projects management">
            <div className="edit__section-header">
              <h2 className="edit__section-title">Projects</h2>
              <button
                type="button"
                className="edit__add-btn"
                onClick={addProject}
                aria-label="Add new project">
                + Add Project
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="edit__empty-state">
                <p>No projects added yet. Click "Add Project" to create one.</p>
              </div>
            ) : (
              projects.map((project, projectIndex) => (
                <article
                  key={project.id || projectIndex}
                  className="edit__item-card"
                  aria-label={`Project ${projectIndex + 1}`}>
                  <div className="edit__item-header">
                    <h3 className="edit__item-title">
                      Project {projectIndex + 1}
                    </h3>
                    <button
                      type="button"
                      className="edit__remove-btn"
                      onClick={() => removeProject(projectIndex)}
                      aria-label={`Remove project ${projectIndex + 1}`}>
                      Remove
                    </button>
                  </div>

                  <div className="edit__grid">
                    <div className="edit__field">
                      <label
                        htmlFor={`project-title-${projectIndex}`}
                        className="edit__label">
                        Title <span className="edit__required">*</span>
                      </label>
                      <input
                        type="text"
                        id={`project-title-${projectIndex}`}
                        value={project.title}
                        onChange={(event) =>
                          handleProjectChange(
                            projectIndex,
                            "title",
                            event.target.value
                          )
                        }
                        required
                        className="edit__input"
                        aria-required="true"
                        aria-label={`Project ${projectIndex + 1} title`}
                      />
                    </div>

                    <div className="edit__field">
                      <label
                        htmlFor={`project-budget-${projectIndex}`}
                        className="edit__label">
                        Budget ($)
                      </label>
                      <input
                        type="number"
                        id={`project-budget-${projectIndex}`}
                        value={project.budget}
                        onChange={(event) =>
                          handleProjectChange(
                            projectIndex,
                            "budget",
                            Number(event.target.value)
                          )
                        }
                        min="0"
                        step="1"
                        className="edit__input"
                        aria-label={`Project ${
                          projectIndex + 1
                        } budget in dollars`}
                      />
                    </div>

                    <div className="edit__field">
                      <label
                        htmlFor={`project-status-${projectIndex}`}
                        className="edit__label">
                        Status
                      </label>
                      <GeneralSelect
                        value={project.status || "Open"}
                        onChange={(selectedValue) =>
                          handleProjectChange(
                            projectIndex,
                            "status",
                            selectedValue
                          )
                        }
                        options={[
                          { value: "Open", label: "Open" },
                          { value: "In Progress", label: "In Progress" },
                          { value: "Completed", label: "Completed" }
                        ]}
                        className="edit__select"
                        aria-label={`Project ${projectIndex + 1} status`}
                      />
                    </div>

                    <div className="edit__field edit__field--full">
                      <label
                        htmlFor={`project-description-${projectIndex}`}
                        className="edit__label">
                        Description
                      </label>
                      <textarea
                        id={`project-description-${projectIndex}`}
                        value={project.description}
                        onChange={(event) =>
                          handleProjectChange(
                            projectIndex,
                            "description",
                            event.target.value
                          )
                        }
                        rows={3}
                        className="edit__textarea"
                        aria-label={`Project ${projectIndex + 1} description`}
                        maxLength={500}
                      />
                    </div>

                    <div className="edit__field edit__field--full">
                      <div className="edit__skills-header">
                        <label className="edit__label">Required Skills</label>
                        <span className="edit__skills-count">
                          {project.requiredSkills.length} skills
                        </span>
                      </div>

                      <div className="edit__skills-input">
                        {project.requiredSkills.map((skill, skillIndex) => (
                          <div
                            key={skillIndex}
                            className="edit__skill-item"
                            aria-label={`Skill ${skillIndex + 1}`}>
                            <input
                              type="text"
                              value={skill}
                              onChange={(event) =>
                                handleSkillChange(
                                  projectIndex,
                                  skillIndex,
                                  event.target.value
                                )
                              }
                              placeholder="Skill name"
                              className="edit__skill-input"
                              aria-label={`Skill ${skillIndex + 1}`}
                              maxLength={50}
                            />
                            <button
                              type="button"
                              className="edit__remove-skill-btn"
                              onClick={() =>
                                removeSkillFromProject(projectIndex, skillIndex)
                              }
                              aria-label={`Remove skill ${skillIndex + 1}`}>
                              ×
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          className="edit__add-skill-btn"
                          onClick={() => addSkillToProject(projectIndex)}
                          aria-label="Add new skill">
                          + Add Skill
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>

          {/* Error Message */}
          {error && (
            <div className="edit__error-message" role="alert">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="edit__actions">
            <button
              type="button"
              className="edit__cancel-btn"
              onClick={handleCancel}
              disabled={loading}
              aria-label="Cancel editing and return to profile">
              Cancel
            </button>
            <button
              type="submit"
              className="edit__save-btn"
              disabled={loading}
              aria-label="Save all changes">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
