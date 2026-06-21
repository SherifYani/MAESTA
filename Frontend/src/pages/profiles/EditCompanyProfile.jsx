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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [members, setMembers] = useState(
    (companyData?.members || []).map((member) => ({
      ...member,
      email: member.email || "",
      isNew: false,
    }))
  );



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

    setMembers([
      ...members,
      {
        id: newMemberId,
        name: "",
        email: "",
        role: "Member",
        avatar: "",
        isNew: true,
      },
    ]);
  };

  /**
   * Removes a team member from the list.
   * @param {number} memberIndex - The index of the team member to remove.
   */
  const removeMember = async (memberIndex) => {
    const member = members[memberIndex];
    if (!member?.isNew && member?.id) {
      try {
        setLoading(true);
        await profileService.removeTeamMember(member.id);
      } catch (err) {
        setError(err.message || "Failed to remove team member.");
        return;
      } finally {
        setLoading(false);
      }
    }

    const updatedMembers = members.filter((_, index) => index !== memberIndex);
    setMembers(updatedMembers);
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
      if (member?.isNew && !member?.email?.trim()) {
        alert("New team members must have an email");
        return false;
      }

      if (member.email && !emailRegex.test(member.email)) {
        alert("Please enter a valid team member email");
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

    const [city = "", country = ""] = (formData.location || "")
      .split(",")
      .map((part) => part.trim());

    const existingMembers = members.filter((m) => !m.isNew);
    const sanitizedMembers = existingMembers
      .filter((m) => m.name?.trim())
      .map((m) => ({
        id: Number.isInteger(m.id) && m.id < 1000000000000 ? m.id : 0,
        name: m.name.trim(),
        role: m.role || "Member",
        avatar: m.avatar || "",
      }));

    const updatedCompanyData = {
      companyName: formData.name?.trim() || "",
      website: formData.websiteUrl?.trim() || "",
      industry: formData.industry?.trim() || "",
      companySize: formData.companySize?.trim() || "",
      description: formData.description?.trim() || "",
      country,
      city,
      address: formData.location?.trim() || "",
      foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : null,
      logoUrl: formData.logoUrl?.trim() || "",
      members: sanitizedMembers,
      jobs: [],
    };

    if (!updatedCompanyData.companyName) {
      setError("Company name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const savedProfile = await profileService.updateCompanyProfile(updatedCompanyData);
      const newMembers = members.filter((member) => member.isNew && member.email?.trim());
      await Promise.all(
        newMembers.map((member) => profileService.addTeamMember({ email: member.email.trim() }))
      );
      const refreshedProfile = await profileService.getCompanyProfile();
      updateCompanyData({ ...updatedCompanyData, ...savedProfile, ...refreshedProfile });
      navigate("/dashboard/profile");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update company profile. Please try again.";
      setError(errorMessage);
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
                        htmlFor={`member-email-${index}`}
                        className="edit__label">
                        Email {member.isNew && <span className="edit__required">*</span>}
                      </label>
                      <input
                        type="email"
                        id={`member-email-${index}`}
                        value={member.email || ""}
                        onChange={(event) =>
                          handleMemberChange(index, "email", event.target.value)
                        }
                        disabled={!member.isNew}
                        className="edit__input"
                        aria-label={`Team member ${index + 1} email`}
                        placeholder="member@example.com"
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
                          value={member.avatar || ""}
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
