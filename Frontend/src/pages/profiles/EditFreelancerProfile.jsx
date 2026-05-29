import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import profileService from "../../services/profileService";
import GeneralSelect from "../../components/common/GeneralSelect";
import "../../styles/profile.css";
import "../../styles/edit-profile.css";

/**
 * @file EditFreelancerProfile.jsx
 * @description Edit freelancer profile component with form fields for personal info, skills, and portfolio.
 * Uses BEM methodology for CSS class naming and follows React functional component patterns.
 * @author Shahd Mohay
 * @version 2.1.0
 * @date 2025-12-11
 *
 * @last-modified-by Antigravity
 * @last-modified-date 2026-05-27
 *
 * @update:
 * - Fixed duplicate company profile issue and implemented true Freelancer form
 * - Wired profileService API endpoints
 * - Use API response to update context (not local data)
 * - Improved error message extraction
 * - Added successMsg state and banner
 * - Added disabled={loading} to all inputs/textareas
 * - Removed unused Link import
 */
export default function EditFreelancerProfile() {
  const navigate = useNavigate();
  const { freelancerData, updateFreelancerData } = useProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form state management
  const [formData, setFormData] = useState({
    fullName: freelancerData.fullName || "",
    email: freelancerData.email || "",
    phoneNumber: freelancerData.phoneNumber || "",
    profilePictureUrl: freelancerData.profilePictureUrl || "",
    headline: freelancerData.profile?.headline || "",
    overview: freelancerData.profile?.overview || "",
    hourlyRate: freelancerData.profile?.hourlyRate || 0,
  });

  const [skills, setSkills] = useState(freelancerData.skills || []);
  const [experiences, setExperiences] = useState(freelancerData.experiences || []);
  const [portfolio, setPortfolio] = useState(freelancerData.portfolio || []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillChange = (index, field, value) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    setSkills(updated);
  };

  const addSkill = () => {
    setSkills([...skills, { name: "", proficiencyLevel: "Beginner" }]);
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      { id: Date.now(), jobTitle: "", companyName: "", description: "", startDate: "", endDate: "" },
    ]);
  };

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handlePortfolioChange = (index, field, value) => {
    const updated = [...portfolio];
    updated[index] = { ...updated[index], [field]: value };
    setPortfolio(updated);
  };

  const addPortfolio = () => {
    setPortfolio([
      ...portfolio,
      { id: Date.now(), title: "", description: "", itemUrl: "" },
    ]);
  };

  const removePortfolio = (index) => {
    setPortfolio(portfolio.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      alert("Full name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const updatedFreelancerData = {
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      profilePictureUrl: formData.profilePictureUrl,
      profile: {
        ...freelancerData.profile,
        headline: formData.headline,
        overview: formData.overview,
        hourlyRate: Number(formData.hourlyRate),
      },
      skills,
      experiences,
      portfolio,
    };

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      // Call the API via profileService and use the API response to update context
      const apiResponse = await profileService.updateFreelancerProfile(updatedFreelancerData);
      updateFreelancerData(apiResponse || updatedFreelancerData);

      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => navigate("/dashboard/profile"), 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update profile. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
      navigate("/dashboard/profile");
    }
  };

  return (
    <div className="profile">
      <main className="profile__content">
        <header className="edit__header">
          <h1 className="edit__title">Edit Freelancer Profile</h1>
          <p className="edit__subtitle">Update your personal information, skills, and portfolio.</p>
        </header>

        {error && (
          <div className="edit__error-banner" role="alert">
            <i className="fa-solid fa-circle-exclamation" />
            &nbsp; {error}
          </div>
        )}

        {successMsg && (
          <div className="edit__success-banner" role="status">
            <i className="fa-solid fa-circle-check" />
            &nbsp; {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit__form" noValidate>
          {/* Personal Info */}
          <section className="edit__section">
            <h2 className="edit__section-title">Personal Information</h2>
            <div className="edit__grid">
              <div className="edit__field">
                <label className="edit__label">Full Name <span className="edit__required">*</span></label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="edit__input"
                  required
                  aria-required="true"
                  aria-label="Full name"
                />
              </div>
              <div className="edit__field">
                <label className="edit__label">Email <span className="edit__required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="edit__input"
                  required
                  aria-required="true"
                  aria-label="Email address"
                />
              </div>
              <div className="edit__field">
                <label className="edit__label">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="edit__input"
                  aria-label="Phone number"
                />
              </div>
              <div className="edit__field">
                <label className="edit__label">Profile Picture URL</label>
                <input
                  type="url"
                  name="profilePictureUrl"
                  value={formData.profilePictureUrl}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="edit__input"
                  aria-label="Profile picture URL"
                  placeholder="https://example.com/profile.jpg"
                />
              </div>
              <div className="edit__field">
                <label className="edit__label">Headline</label>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="edit__input"
                  aria-label="Professional headline"
                  maxLength={200}
                />
              </div>
              <div className="edit__field">
                <label className="edit__label">Hourly Rate ($)</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  disabled={loading}
                  min="0"
                  className="edit__input"
                  aria-label="Hourly rate in dollars"
                />
              </div>
              <div className="edit__field edit__field--full">
                <label className="edit__label">Overview</label>
                <textarea
                  name="overview"
                  value={formData.overview}
                  onChange={handleInputChange}
                  rows={4}
                  disabled={loading}
                  className="edit__textarea"
                  aria-label="Professional overview"
                  maxLength={1000}
                />
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="edit__section">
            <div className="edit__section-header">
              <h2 className="edit__section-title">Skills</h2>
              <button type="button" className="edit__add-btn" onClick={addSkill} aria-label="Add new skill">
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
                  <div key={index} className="edit__member-item">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => handleSkillChange(index, "name", e.target.value)}
                      disabled={loading}
                      className="edit__input"
                      placeholder="Skill name"
                      aria-label={`Skill ${index + 1} name`}
                    />
                    <GeneralSelect
                      value={skill.proficiencyLevel || "Beginner"}
                      onChange={(v) => handleSkillChange(index, "proficiencyLevel", v)}
                      options={[
                        { value: "Beginner", label: "Beginner" },
                        { value: "Intermediate", label: "Intermediate" },
                        { value: "Expert", label: "Expert" }
                      ]}
                      className="edit__select"
                    />
                    <button
                      type="button"
                      className="edit__remove-btn"
                      onClick={() => removeSkill(index)}
                      aria-label={`Remove skill ${index + 1}`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Portfolio */}
          <section className="edit__section">
            <div className="edit__section-header">
              <h2 className="edit__section-title">Portfolio</h2>
              <button type="button" className="edit__add-btn" onClick={addPortfolio} aria-label="Add portfolio item">
                + Add Item
              </button>
            </div>
            {portfolio.length === 0 ? (
              <div className="edit__empty-state">
                <p>No portfolio items yet. Click "Add Item" to create one.</p>
              </div>
            ) : (
              portfolio.map((item, index) => (
                <div key={index} className="edit__item-card">
                  <div className="edit__item-header">
                    <h3 className="edit__item-title">Portfolio Item {index + 1}</h3>
                    <button
                      type="button"
                      className="edit__remove-btn"
                      onClick={() => removePortfolio(index)}
                      aria-label={`Remove portfolio item ${index + 1}`}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="edit__grid">
                    <div className="edit__field">
                      <label className="edit__label">Title</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handlePortfolioChange(index, "title", e.target.value)}
                        disabled={loading}
                        className="edit__input"
                        aria-label={`Portfolio item ${index + 1} title`}
                      />
                    </div>
                    <div className="edit__field">
                      <label className="edit__label">Image URL</label>
                      <input
                        type="url"
                        value={item.itemUrl}
                        onChange={(e) => handlePortfolioChange(index, "itemUrl", e.target.value)}
                        disabled={loading}
                        className="edit__input"
                        placeholder="https://example.com/project.jpg"
                        aria-label={`Portfolio item ${index + 1} URL`}
                      />
                    </div>
                    <div className="edit__field edit__field--full">
                      <label className="edit__label">Description</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => handlePortfolioChange(index, "description", e.target.value)}
                        rows={2}
                        disabled={loading}
                        className="edit__textarea"
                        aria-label={`Portfolio item ${index + 1} description`}
                        maxLength={500}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Error and success messages are displayed in the header banner area above */}

          <div className="edit__actions">
            <button
              type="button"
              className="edit__cancel-btn"
              onClick={handleCancel}
              disabled={loading}
              aria-label="Cancel editing and return to profile"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="edit__save-btn"
              disabled={loading}
              aria-label="Save all freelancer profile changes"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
