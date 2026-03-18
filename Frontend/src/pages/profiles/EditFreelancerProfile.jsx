import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import GeneralSelect from "../../components/common/GeneralSelect";
import "../../styles/profile.css";
import "../../styles/edit-profile.css";

/**
 * Edit company profile component with forms for company info, team members, and job listings.
 * @returns {JSX.Element} The rendered edit company profile form.
 * @author Shadh Mohay
 * @date 2025-12-11
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-1-20
 * 
 * @update :-
 * - removed navigation section 
 * - edit the link to the profile page (because include {profile} and {edit profile} to dashboard)
 */

export default function EditCompanyProfile() {
  const navigate = useNavigate();
  const { companyData, updateCompanyData } = useProfile();

  const [formData, setFormData] = useState({
    name: companyData.name,
    websiteUrl: companyData.websiteUrl,
    logoUrl: companyData.logoUrl,
    description: companyData.description,
    industry: companyData.industry,
    companySize: companyData.companySize,
    location: companyData.location,
    commercialRegistrationID: companyData.commercialRegistrationID,
  });

  const [members, setMembers] = useState(companyData.members);
  const [jobs, setJobs] = useState(companyData.jobs);

  /**
   * Handles changes to form input fields.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>} e - The input change event.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handles changes to team member fields.
   * @param {number} index - The member index.
   * @param {string} field - The field name to update.
   * @param {string} value - The new value.
   */
  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  /**
   * Adds a new empty team member to the list.
   */
  const addMember = () => {
    setMembers([
      ...members,
      {
        id: Date.now(),
        name: "",
        role: "Member",
        avatar: "/placeholder.svg?height=48&width=48",
      },
    ]);
  };

  /**
   * Removes a team member from the list.
   * @param {number} index - The member index to remove.
   */
  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  /**
   * Handles changes to job listing fields.
   * @param {number} index - The job index.
   * @param {string} field - The field name to update.
   * @param {string} value - The new value.
   */
  const handleJobChange = (index, field, value) => {
    const updated = [...jobs];
    updated[index] = { ...updated[index], [field]: value };
    setJobs(updated);
  };

  /**
   * Adds a new empty job listing to the list.
   */
  const addJob = () => {
    setJobs([
      ...jobs,
      {
        id: Date.now(),
        uuid: `job${Date.now()}`,
        title: "",
        location: "",
        jobType: "Full-time",
        status: "Open",
        postedAt: new Date().toISOString().split("T")[0],
        applicationsCount: 0,
      },
    ]);
  };

  /**
   * Removes a job listing from the list.
   * @param {number} index - The job index to remove.
   */
  const removeJob = (index) => {
    setJobs(jobs.filter((_, i) => i !== index));
  };

  /**
   * Handles form submission and updates profile data.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submit event.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    updateCompanyData({
      ...formData,
      members,
      jobs,
    });
    navigate("/profile");
  };

  return (
    <div className="profile">

      <main className="profile__content">
        <div className="edit__header">
          <h1 className="edit__title">Edit Company Profile</h1>
          <p className="edit__subtitle">
            Update your company information, team members, and job listings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="edit__form">
          <div className="edit__section">
            <h2 className="edit__section-title">Company Information</h2>
            <div className="edit__grid">
              <div className="edit__field">
                <label htmlFor="name" className="edit__label">
                  Company Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="edit__input"
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
                />
              </div>
              <div className="edit__field">
                <label htmlFor="logoUrl" className="edit__label">
                  Logo URL
                </label>
                <input
                  type="text"
                  id="logoUrl"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  className="edit__input"
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
                />
              </div>
            </div>
          </div>

          <div className="edit__section">
            <div className="edit__section-header">
              <h2 className="edit__section-title">Team Members</h2>
              <button
                type="button"
                className="edit__add-btn"
                onClick={addMember}>
                + Add Member
              </button>
            </div>
            <div className="edit__members-grid">
              {members.map((member, index) => (
                <div key={member.id} className="edit__member-item">
                  <div className="edit__field">
                    <label className="edit__label">Name</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) =>
                        handleMemberChange(index, "name", e.target.value)
                      }
                      className="edit__input"
                    />
                  </div>
                  <div className="edit__field">
                    <label className="edit__label">Role</label>
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
                    />
                  </div>
                  <div className="edit__field">
                    <label className="edit__label">Avatar URL</label>
                    <input
                      type="text"
                      value={member.avatar}
                      onChange={(e) =>
                        handleMemberChange(index, "avatar", e.target.value)
                      }
                      className="edit__input"
                    />
                  </div>
                  <button
                    type="button"
                    className="edit__remove-btn"
                    onClick={() => removeMember(index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="edit__section">
            <div className="edit__section-header">
              <h2 className="edit__section-title">Job Listings</h2>
              <button type="button" className="edit__add-btn" onClick={addJob}>
                + Add Job
              </button>
            </div>
            {jobs.map((job, index) => (
              <div key={job.id} className="edit__item-card">
                <div className="edit__item-header">
                  <h3 className="edit__item-title">Job {index + 1}</h3>
                  <button
                    type="button"
                    className="edit__remove-btn"
                    onClick={() => removeJob(index)}>
                    Remove
                  </button>
                </div>
                <div className="edit__grid">
                  <div className="edit__field">
                    <label className="edit__label">Job Title</label>
                    <input
                      type="text"
                      value={job.title}
                      onChange={(e) =>
                        handleJobChange(index, "title", e.target.value)
                      }
                      className="edit__input"
                    />
                  </div>
                  <div className="edit__field">
                    <label className="edit__label">Location</label>
                    <input
                      type="text"
                      value={job.location}
                      onChange={(e) =>
                        handleJobChange(index, "location", e.target.value)
                      }
                      className="edit__input"
                    />
                  </div>
                  <div className="edit__field">
                    <label className="edit__label">Job Type</label>
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
                    />
                  </div>
                  <div className="edit__field">
                    <label className="edit__label">Status</label>
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
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="edit__actions">
            <button
              type="button"
              className="edit__cancel-btn"
              onClick={() => navigate("/dashboard/profile")}>
              Cancel
            </button>
            <button type="submit" className="edit__save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
