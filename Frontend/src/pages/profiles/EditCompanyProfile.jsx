/**
 * @file EditCompanyProfile.jsx
 * @description Edit company profile component with forms for company info, team members, and job listings.
 * Uses BEM methodology for CSS class naming and follows React functional component patterns.
 * @author Shadh Mohay
 * @version 2.0.0
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
 * EditCompanyProfile Component
 * @description Form component for editing company profile information, team members, and job listings.
 * Provides comprehensive form validation and dynamic management of team members and job postings.
 * @returns {JSX.Element} The rendered edit company profile form with validation.
 */
export default function EditCompanyProfile() {
  const navigate = useNavigate();
  const { companyData, updateCompanyData } = useProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state management
  const [formData, setFormData] = useState({
    name: companyData?.name || "",
    websiteUrl: companyData?.websiteUrl || "",
    logoUrl: companyData?.logoUrl || "",
    description: companyData?.description || "",
    industry: companyData?.industry || "",
    companySize: companyData?.companySize || "",
    location: companyData?.location || "",
    commercialRegistrationID: companyData?.commercialRegistrationID || "",
  });

  // Team members state management
  const [members, setMembers] = useState(companyData?.members || []);

  // Job listings state management
  const [jobs, setJobs] = useState(companyData?.jobs || []);

  /**
   * Handles changes to form input fields.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>} event - The input change event.
   */
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previousData) => ({ ...previousData, [name]: value }));
  };

  /**
   * Handles changes to team member fields.
   * @param {number} memberIndex - The index of the team member to update.
   * @param {string} field - The field name to update.
   * @param {string} value - The new value for the field.
   */
  const handleMemberChange = (memberIndex, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[memberIndex] = {
      ...updatedMembers[memberIndex],
      [field]: value,
    };
    setMembers(updatedMembers);
  };

  /**
   * Adds a new empty team member to the list.
   */
  const addMember = () => {
    const newMemberId = Date.now();
    const placeholderAvatar = "/placeholder.svg?height=48&width=48";

    setMembers([
      ...members,
      {
        id: newMemberId,
        name: "",
        role: "Member",
        avatar: placeholderAvatar,
      },
    ]);
  };

  /**
   * Removes a team member from the list.
   * @param {number} memberIndex - The index of the team member to remove.
   */
  const removeMember = (memberIndex) => {
    const updatedMembers = members.filter((_, index) => index !== memberIndex);
    setMembers(updatedMembers);
  };

  /**
   * Handles changes to job listing fields.
   * @param {number} jobIndex - The index of the job listing to update.
   * @param {string} field - The field name to update.
   * @param {string} value - The new value for the field.
   */
  const handleJobChange = (jobIndex, field, value) => {
    const updatedJobs = [...jobs];
    updatedJobs[jobIndex] = {
      ...updatedJobs[jobIndex],
      [field]: value,
    };
    setJobs(updatedJobs);
  };

  /**
   * Adds a new empty job listing to the list.
   */
  const addJob = () => {
    const newJobId = Date.now();
    const newJobUuid = `job${newJobId}`;
    const currentDate = new Date().toISOString().split("T")[0];

    setJobs([
      ...jobs,
      {
        id: newJobId,
        uuid: newJobUuid,
        title: "",
        location: "",
        jobType: "Full-time",
        status: "Open",
        postedAt: currentDate,
        applicationsCount: 0,
      },
    ]);
  };

  /**
   * Removes a job listing from the list.
   * @param {number} jobIndex - The index of the job listing to remove.
   */
  const removeJob = (jobIndex) => {
    const updatedJobs = jobs.filter((_, index) => index !== jobIndex);
    setJobs(updatedJobs);
  };

  /**
   * Validates form data before submission.
   * @returns {boolean} True if form is valid, false otherwise.
   */
  const validateForm = () => {
    if (!formData?.name?.trim()) {
      alert("Company name is required");
      return false;
    }

    if (formData.websiteUrl && !formData.websiteUrl.startsWith("http")) {
      alert("Website URL must start with http:// or https://");
      return false;
    }

    if (formData.logoUrl && !formData.logoUrl.startsWith("http")) {
      alert("Logo URL must be a valid URL starting with http:// or https://");
      return false;
    }

    // Validate team members
    for (const member of (members || [])) {
      if (!member?.name?.trim()) {
        alert("All team members must have a name");
        return false;
      }
    }

    // Validate job listings
    for (const job of (jobs || [])) {
      if (!job?.title?.trim()) {
        alert("All job listings must have a title");
        return false;
      }

      if (!job?.location?.trim()) {
        alert("All job listings must have a location");
        return false;
      }
    }

    return true;
  };

  /**
   * Handles form submission and updates company profile data.
   * @param {React.FormEvent<HTMLFormElement>} event - The form submit event.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare updated company data
    const updatedCompanyData = {
      ...formData,
      members,
      jobs,
    };

    try {
      setLoading(true);
      setError(null);
      // Call the API via profileService
      await profileService.updateCompanyProfile(updatedCompanyData);
      
      // Update context and navigate back
      updateCompanyData(updatedCompanyData);
      navigate("/dashboard/profile");
    } catch (err) {
      setError(err.message || "Failed to update company profile. Please try again.");
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
          <h1 className="edit__title" aria-label="Edit company profile page">
            Edit Company Profile
          </h1>
          <p className="edit__subtitle">
            Update your company information, team members, and job listings
          </p>
        </header>

        {/* Edit Form */}
        <form
          onSubmit={handleSubmit}
          className="edit__form"
          aria-label="Edit company profile form"
          noValidate>
          {/* Company Information Section */}
          <section className="edit__section" aria-label="Company information">
            <h2 className="edit__section-title">Company Information</h2>

            <div className="edit__grid">
              <div className="edit__field">
                <label htmlFor="name" className="edit__label">
                  Company Name <span className="edit__required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="edit__input"
                  aria-required="true"
                  aria-label="Company name"
                  maxLength={100}
                />
              </div>

              <div className="edit__field">
                <label htmlFor="websiteUrl" className="edit__label">
                  Website URL
                </label>
                <input
                  type="url"
                  id="websiteUrl"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  className="edit__input"
                  aria-label="Company website URL"
                  placeholder="https://example.com"
                />
              </div>

              <div className="edit__field">
                <label htmlFor="logoUrl" className="edit__label">
                  Logo URL
                </label>
                <input
                  type="url"
                  id="logoUrl"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  className="edit__input"
                  aria-label="Company logo URL"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="edit__field">
                <label htmlFor="industry" className="edit__label">
                  Industry
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="edit__input"
                  aria-label="Company industry"
                  maxLength={50}
                />
              </div>

              <div className="edit__field">
                <label htmlFor="companySize" className="edit__label">
                  Company Size
                </label>
                <GeneralSelect
                  value={formData.companySize || "1-10 employees"}
                  onChange={(selectedValue) => handleInputChange({ target: { name: "companySize", value: selectedValue } })}
                  options={[
                    { value: "1-10 employees", label: "1-10 employees" },
                    { value: "11-50 employees", label: "11-50 employees" },
                    { value: "51-200 employees", label: "51-200 employees" },
                    { value: "201-500 employees", label: "201-500 employees" },
                    { value: "501-1000 employees", label: "501-1000 employees" },
                    { value: "1000+ employees", label: "1000+ employees" }
                  ]}
                  className="edit__select"
                  aria-label="Company size"
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
                  aria-label="Company location"
                  maxLength={100}
                />
              </div>

              <div className="edit__field">
                <label
                  htmlFor="commercialRegistrationID"
                  className="edit__label">
                  Registration ID
                </label>
                <input
                  type="text"
                  id="commercialRegistrationID"
                  name="commercialRegistrationID"
                  value={formData.commercialRegistrationID}
                  onChange={handleInputChange}
                  className="edit__input"
                  aria-label="Commercial registration ID"
                  maxLength={50}
                />
              </div>

              <div className="edit__field edit__field--full">
                <label htmlFor="description" className="edit__label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="edit__textarea"
                  aria-label="Company description"
                  maxLength={1000}
                />
                <div className="edit__character-count">
                  {(formData.description || "").length}/1000 characters
                </div>
              </div>
            </div>
          </section>

          {/* Team Members Section */}
          <section
            className="edit__section"
            aria-label="Team members management">
            <div className="edit__section-header">
              <h2 className="edit__section-title">Team Members</h2>
              <button
                type="button"
                className="edit__add-btn"
                onClick={addMember}
                aria-label="Add new team member">
                + Add Member
              </button>
            </div>

            {(members || []).length === 0 ? (
              <div className="edit__empty-state">
                <p>
                  No team members added yet. Click "Add Member" to create one.
                </p>
              </div>
            ) : (
              <div className="edit__members-grid">
                {(members || []).map((member, index) => (
                  <article
                    key={member.id || index}
                    className="edit__member-item"
                    aria-label={`Team member ${index + 1}`}>
                    <div className="edit__field">
                      <label
                        htmlFor={`member-name-${index}`}
                        className="edit__label">
                        Name <span className="edit__required">*</span>
                      </label>
                      <input
                        type="text"
                        id={`member-name-${index}`}
                        value={member.name}
                        onChange={(event) =>
                          handleMemberChange(index, "name", event.target.value)
                        }
                        required
                        className="edit__input"
                        aria-required="true"
                        aria-label={`Team member ${index + 1} name`}
                      />
                    </div>

                    <div className="edit__field">
                      <label
                        htmlFor={`member-role-${index}`}
                        className="edit__label">
                        Role
                      </label>
                      <GeneralSelect
                        value={member.role || "Member"}
                        onChange={(selectedValue) =>
                          handleMemberChange(index, "role", selectedValue)
                        }
                        options={[
                          { value: "Admin", label: "Admin" },
                          { value: "HR_Manager", label: "HR Manager" },
                          { value: "Member", label: "Member" }
                        ]}
                        className="edit__select"
                        aria-label={`Team member ${index + 1} role`}
                      />
                    </div>

                    <div className="edit__field">
                      <label
                        htmlFor={`member-avatar-${index}`}
                        className="edit__label">
                        Avatar URL
                      </label>
                      <input
                        type="url"
                        id={`member-avatar-${index}`}
                        value={member.avatar}
                        onChange={(event) =>
                          handleMemberChange(
                            index,
                            "avatar",
                            event.target.value
                          )
                        }
                        className="edit__input"
                        aria-label={`Team member ${index + 1} avatar URL`}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>

                    <button
                      type="button"
                      className="edit__remove-btn edit__remove-btn--member"
                      onClick={() => removeMember(index)}
                      aria-label={`Remove team member ${index + 1}`}>
                      Remove
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Job Listings Section */}
          <section
            className="edit__section"
            aria-label="Job listings management">
            <div className="edit__section-header">
              <h2 className="edit__section-title">Job Listings</h2>
              <button
                type="button"
                className="edit__add-btn"
                onClick={addJob}
                aria-label="Add new job listing">
                + Add Job
              </button>
            </div>

            {(jobs || []).length === 0 ? (
              <div className="edit__empty-state">
                <p>No job listings added yet. Click "Add Job" to create one.</p>
              </div>
            ) : (
              (jobs || []).map((job, index) => (
                <article
                  key={job.id || index}
                  className="edit__item-card"
                  aria-label={`Job listing ${index + 1}`}>
                  <div className="edit__item-header">
                    <h3 className="edit__item-title">Job {index + 1}</h3>
                    <button
                      type="button"
                      className="edit__remove-btn"
                      onClick={() => removeJob(index)}
                      aria-label={`Remove job listing ${index + 1}`}>
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
                        value={job.title}
                        onChange={(event) =>
                          handleJobChange(index, "title", event.target.value)
                        }
                        required
                        className="edit__input"
                        aria-required="true"
                        aria-label={`Job ${index + 1} title`}
                      />
                    </div>

                    <div className="edit__field">
                      <label
                        htmlFor={`job-location-${index}`}
                        className="edit__label">
                        Location <span className="edit__required">*</span>
                      </label>
                      <input
                        type="text"
                        id={`job-location-${index}`}
                        value={job.location}
                        onChange={(event) =>
                          handleJobChange(index, "location", event.target.value)
                        }
                        required
                        className="edit__input"
                        aria-required="true"
                        aria-label={`Job ${index + 1} location`}
                      />
                    </div>

                    <div className="edit__field">
                      <label
                        htmlFor={`job-type-${index}`}
                        className="edit__label">
                        Job Type
                      </label>
                      <GeneralSelect
                        value={job.jobType || "Full-time"}
                        onChange={(selectedValue) =>
                          handleJobChange(index, "jobType", selectedValue)
                        }
                        options={[
                          { value: "Full-time", label: "Full-time" },
                          { value: "Part-time", label: "Part-time" },
                          { value: "Contract", label: "Contract" },
                          { value: "Internship", label: "Internship" }
                        ]}
                        className="edit__select"
                        aria-label={`Job ${index + 1} type`}
                      />
                    </div>

                    <div className="edit__field">
                      <label
                        htmlFor={`job-status-${index}`}
                        className="edit__label">
                        Status
                      </label>
                      <GeneralSelect
                        value={job.status || "Open"}
                        onChange={(selectedValue) =>
                          handleJobChange(index, "status", selectedValue)
                        }
                        options={[
                          { value: "Open", label: "Open" },
                          { value: "Closed", label: "Closed" }
                        ]}
                        className="edit__select"
                        aria-label={`Job ${index + 1} status`}
                      />
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
              aria-label="Cancel editing and return to company profile">
              Cancel
            </button>
            <button
              type="submit"
              className="edit__save-btn"
              disabled={loading}
              aria-label="Save all company profile changes">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
