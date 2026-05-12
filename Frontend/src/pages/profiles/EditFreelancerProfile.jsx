import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
 * @last-modified-date 2026-05-01
 * 
 * @update :-
 * - Fixed duplicate company profile issue and implemented true Freelancer form
 * - wired profileService API endpoints
 */
export default function EditFreelancerProfile() {
  const navigate = useNavigate();
  const { freelancerData, updateFreelancerData } = useProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state management
  const [formData, setFormData] = useState({
    fullName: freelancerData.fullName,
    email: freelancerData.email,
    phoneNumber: freelancerData.phoneNumber,
    profilePictureUrl: freelancerData.profilePictureUrl,
    headline: freelancerData.profile.headline,
    overview: freelancerData.profile.overview,
    hourlyRate: freelancerData.profile.hourlyRate,
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
      await profileService.updateFreelancerProfile(updatedFreelancerData);
      
      updateFreelancerData(updatedFreelancerData);
      navigate("/dashboard/profile");
    } catch (err) {
      setError(err.message || "Failed to update profile. Please try again.");
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

        <form onSubmit={handleSubmit} className="edit__form" noValidate>
          {/* Personal Info */}
          <section className="edit__section">
            <h2 className="edit__section-title">Personal Information</h2>
            <div className="edit__grid">
              <div className="edit__field">
                <label className="edit__label">Full Name *</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="edit__input" required />
              </div>
              <div className="edit__field">
                <label className="edit__label">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="edit__input" required />
              </div>
              <div className="edit__field">
                <label className="edit__label">Phone Number</label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="edit__input" />
              </div>
              <div className="edit__field">
                <label className="edit__label">Profile Picture URL</label>
                <input type="url" name="profilePictureUrl" value={formData.profilePictureUrl} onChange={handleInputChange} className="edit__input" />
              </div>
              <div className="edit__field">
                <label className="edit__label">Headline</label>
                <input type="text" name="headline" value={formData.headline} onChange={handleInputChange} className="edit__input" />
              </div>
              <div className="edit__field">
                <label className="edit__label">Hourly Rate ($)</label>
                <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleInputChange} className="edit__input" />
              </div>
              <div className="edit__field edit__field--full">
                <label className="edit__label">Overview</label>
                <textarea name="overview" value={formData.overview} onChange={handleInputChange} rows={4} className="edit__textarea" />
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="edit__section">
            <div className="edit__section-header">
              <h2 className="edit__section-title">Skills</h2>
              <button type="button" className="edit__add-btn" onClick={addSkill}>+ Add Skill</button>
            </div>
            <div className="edit__skills-grid">
              {skills.map((skill, index) => (
                <div key={index} className="edit__member-item">
                  <input type="text" value={skill.name} onChange={(e) => handleSkillChange(index, "name", e.target.value)} className="edit__input" placeholder="Skill name" />
                  <GeneralSelect value={skill.proficiencyLevel} onChange={(v) => handleSkillChange(index, "proficiencyLevel", v)} options={[
                    { value: "Beginner", label: "Beginner" },
                    { value: "Intermediate", label: "Intermediate" },
                    { value: "Expert", label: "Expert" }
                  ]} className="edit__select" />
                  <button type="button" className="edit__remove-btn" onClick={() => removeSkill(index)}>Remove</button>
                </div>
              ))}
            </div>
          </section>

          {/* Portfolio */}
          <section className="edit__section">
            <div className="edit__section-header">
              <h2 className="edit__section-title">Portfolio</h2>
              <button type="button" className="edit__add-btn" onClick={addPortfolio}>+ Add Item</button>
            </div>
            {portfolio.map((item, index) => (
              <div key={index} className="edit__item-card">
                <div className="edit__field">
                  <label className="edit__label">Title</label>
                  <input type="text" value={item.title} onChange={(e) => handlePortfolioChange(index, "title", e.target.value)} className="edit__input" />
                </div>
                <div className="edit__field">
                  <label className="edit__label">Image URL</label>
                  <input type="url" value={item.itemUrl} onChange={(e) => handlePortfolioChange(index, "itemUrl", e.target.value)} className="edit__input" />
                </div>
                <div className="edit__field edit__field--full">
                  <label className="edit__label">Description</label>
                  <textarea value={item.description} onChange={(e) => handlePortfolioChange(index, "description", e.target.value)} rows={2} className="edit__textarea" />
                </div>
                <button type="button" className="edit__remove-btn" onClick={() => removePortfolio(index)}>Remove</button>
              </div>
            ))}
          </section>

          {error && <div className="edit__error-message" role="alert">{error}</div>}

          <div className="edit__actions">
            <button type="button" className="edit__cancel-btn" onClick={handleCancel} disabled={loading}>Cancel</button>
            <button type="submit" className="edit__save-btn" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
