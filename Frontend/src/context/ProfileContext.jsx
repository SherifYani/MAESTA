/**
 * @file ProfileContext.jsx
 * @description React context provider for managing profile data across the application.
 * Supports multiple user types: clients, freelancers, job seekers, and companies.
 * @author Shahd Mohay
 * @version 2.0.0
 * @date 2025-12-11
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-12-16
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAuth } from "./AuthContext";
import profileService from "../services/profileService";

/**
 * Initial client profile data structure.
 * @type {Object}
 */
const initialClientData = {
  id: 1,
  uuid: "c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
  fullName: "Michael Anderson",
  email: "michael.anderson@techcorp.com",
  profilePictureUrl: "/professional-businessman.png",
  phoneNumber: "+1 (555) 123-4567",
  isEmailVerified: true,
  isPhoneVerified: true,
  createdAt: "2024-06-15",
  projects: [
    {
      id: 1,
      uuid: "p1a2b3c4",
      title: "E-commerce Platform Development",
      description: "Build a modern e-commerce platform with React and Node.js",
      budget: 15000,
      status: "Open",
      postedAt: "2025-01-10",
      requiredSkills: ["React", "Node.js", "PostgreSQL"],
    },
    {
      id: 2,
      uuid: "p2a2b3c4",
      title: "Mobile App UI/UX Design",
      description:
        "Design a user-friendly mobile app interface for iOS and Android",
      budget: 5000,
      status: "In Progress",
      postedAt: "2025-01-05",
      requiredSkills: ["Figma", "UI/UX", "Mobile Design"],
    },
    {
      id: 3,
      uuid: "p3a2b3c4",
      title: "API Integration Service",
      description: "Integrate third-party payment APIs into existing system",
      budget: 3500,
      status: "Completed",
      postedAt: "2024-12-20",
      requiredSkills: ["REST API", "Python", "Stripe"],
    },
  ],
  stats: {
    totalProjects: 12,
    activeProjects: 3,
    completedProjects: 9,
    totalSpent: 85000,
  },
};

/**
 * Initial freelancer profile data structure.
 * @type {Object}
 */
const initialFreelancerData = {
  id: 2,
  uuid: "f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
  fullName: "Sarah Johnson",
  email: "sarah.johnson@freelance.com",
  profilePictureUrl: "/professional-woman-developer.png",
  phoneNumber: "+1 (555) 987-6543",
  isEmailVerified: true,
  isPhoneVerified: true,
  createdAt: "2023-09-20",
  profile: {
    headline: "Full-Stack Developer & UI/UX Designer",
    overview:
      "Passionate developer with 7+ years of experience building scalable web applications. I specialize in React, Node.js, and cloud technologies. My focus is on creating clean, maintainable code and exceptional user experiences.",
    hourlyRate: 85,
    identityVerificationStatus: "Verified",
    averageRating: 4.9,
  },
  skills: [
    { name: "React", proficiencyLevel: "Expert" },
    { name: "Node.js", proficiencyLevel: "Expert" },
    { name: "TypeScript", proficiencyLevel: "Expert" },
    { name: "PostgreSQL", proficiencyLevel: "Intermediate" },
    { name: "AWS", proficiencyLevel: "Intermediate" },
    { name: "Figma", proficiencyLevel: "Intermediate" },
  ],
  experiences: [
    {
      id: 1,
      jobTitle: "Senior Frontend Developer",
      companyName: "TechCorp Inc.",
      description:
        "Led frontend development for enterprise SaaS platform serving 100K+ users",
      startDate: "2021-03",
      endDate: null,
    },
    {
      id: 2,
      jobTitle: "Full-Stack Developer",
      companyName: "StartupXYZ",
      description:
        "Built MVP and scaled product from 0 to 50K users in 18 months",
      startDate: "2018-06",
      endDate: "2021-02",
    },
  ],
  portfolio: [
    {
      id: 1,
      title: "E-commerce Dashboard",
      description: "Admin dashboard for managing online store operations",
      itemUrl: "/ecommerce-dashboard-design.jpg",
    },
    {
      id: 2,
      title: "Health & Fitness App",
      description: "Mobile app design for tracking workouts and nutrition",
      itemUrl: "/fitness-app-mobile-design.jpg",
    },
    {
      id: 3,
      title: "SaaS Landing Page",
      description: "Modern landing page for B2B software product",
      itemUrl: "/saas-landing-page.png",
    },
  ],
  stats: {
    completedProjects: 47,
    totalEarnings: 125000,
    repeatClients: 12,
  },
};

/**
 * Initial job seeker profile data structure.
 * @type {Object}
 */
const initialJobSeekerData = {
  id: 3,
  uuid: "j1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
  fullName: "Sherif Talaat",
  email: "sheriftalaat@email.com",
  profilePictureUrl: "/professional-asian-man.png",
  phoneNumber: "+1 (555) 456-7890",
  isEmailVerified: true,
  isPhoneVerified: false,
  createdAt: "2024-11-10",
  profile: {
    headline: "Software Engineer | React & Python Specialist",
    summary:
      "Results-driven software engineer with 4 years of experience developing web applications and data pipelines. Seeking a challenging role where I can leverage my technical skills to drive innovation and deliver impactful solutions.",
    resumeUrl: "/resume-david-chen.pdf",
    location: "San Francisco, CA",
    identityVerificationStatus: "Verified",
  },
  skills: [
    { name: "Python", proficiencyLevel: "Expert" },
    { name: "React", proficiencyLevel: "Expert" },
    { name: "JavaScript", proficiencyLevel: "Expert" },
    { name: "Django", proficiencyLevel: "Intermediate" },
    { name: "Docker", proficiencyLevel: "Intermediate" },
    { name: "Machine Learning", proficiencyLevel: "Beginner" },
  ],
  experiences: [
    {
      id: 1,
      jobTitle: "Software Engineer",
      companyName: "DataFlow Systems",
      description:
        "Developed RESTful APIs and data processing pipelines handling 1M+ daily transactions",
      startDate: "2022-01",
      endDate: null,
    },
    {
      id: 2,
      jobTitle: "Junior Developer",
      companyName: "WebSolutions Co.",
      description:
        "Built responsive web applications using React and integrated third-party APIs",
      startDate: "2020-06",
      endDate: "2021-12",
    },
  ],
  education: [
    {
      id: 1,
      institutionName: "University of California, Berkeley",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      startYear: 2016,
      endYear: 2020,
    },
  ],
  applications: [
    {
      id: 1,
      jobTitle: "Senior Software Engineer",
      company: "TechFlow Inc",
      status: "Interviewing",
      appliedAt: "2025-01-08",
      matchScore: 92,
    },
    {
      id: 2,
      jobTitle: "Full-Stack Developer",
      company: "StartupHub",
      status: "Under Review",
      appliedAt: "2025-01-10",
      matchScore: 87,
    },
    {
      id: 3,
      jobTitle: "Backend Engineer",
      company: "CloudTech Solutions",
      status: "Applied",
      appliedAt: "2025-01-12",
      matchScore: 78,
    },
  ],
};

/**
 * Initial company profile data structure.
 * @type {Object}
 */
const initialCompanyData = {
  id: 1,
  uuid: "co1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
  name: "TechFlow Inc",
  websiteUrl: "https://techflow.com",
  logoUrl: "/modern-tech-logo.png",
  description:
    "TechFlow is a leading technology company specializing in cloud solutions and enterprise software. We help businesses transform their operations through innovative digital solutions. Our team of experts delivers cutting-edge products that drive growth and efficiency.",
  industry: "Information Technology",
  companySize: "201-500 employees",
  location: "San Francisco, CA",
  verificationStatus: "Verified",
  commercialRegistrationID: "CR-2024-SF-78421",
  createdAt: "2023-01-15",
  members: [
    { id: 1, name: "John Smith", role: "Admin", avatar: "/man-face.png" },
    {
      id: 2,
      name: "Emily Davis",
      role: "HR_Manager",
      avatar: "/serene-woman.png",
    },
    {
      id: 3,
      name: "Robert Wilson",
      role: "Member",
      avatar: "/professional-man.jpg",
    },
  ],
  jobs: [
    {
      id: 1,
      uuid: "job1",
      title: "Senior React Developer",
      location: "San Francisco, CA",
      jobType: "Full-time",
      status: "Open",
      postedAt: "2025-01-10",
      applicationsCount: 45,
    },
    {
      id: 2,
      uuid: "job2",
      title: "DevOps Engineer",
      location: "Remote",
      jobType: "Full-time",
      status: "Open",
      postedAt: "2025-01-08",
      applicationsCount: 32,
    },
    {
      id: 3,
      uuid: "job3",
      title: "Product Designer",
      location: "New York, NY",
      jobType: "Full-time",
      status: "Closed",
      postedAt: "2024-12-15",
      applicationsCount: 78,
    },
  ],
  stats: {
    totalJobs: 24,
    activeJobs: 8,
    totalHires: 156,
    avgTimeToHire: 18,
  },
};

/**
 * React context for profile data management.
 * Provides access to multiple user type profiles across the application.
 * @type {React.Context<Object|null>}
 */
const ProfileContext = createContext(null);

/**
 * ProfileProvider Component
 * @description Provider component that manages profile data state and provides update functions.
 * Wraps the application to make profile data accessible anywhere in the component tree.
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Child components to be wrapped by the provider.
 * @returns {JSX.Element} Context provider wrapping children with profile data.
 */
/**
 * Build an empty jobseeker shell seeded from the AuthContext user.
 * Used as a safe fallback when no backend profile record exists yet.
 */
const emptyJobSeekerFromUser = (user) => ({
  id: user?.id || null,
  fullName: user?.name || '',
  email: user?.email || '',
  phoneNumber: localStorage.getItem(`phone_${user?.id}`) || '',
  profilePictureUrl: user?.profilePicture || '',
  isEmailVerified: false,
  isPhoneVerified: false,
  createdAt: '',
  profile: {
    headline: '',
    summary: '',
    resumeUrl: '',
    location: '',
    identityVerificationStatus: null,
  },
  skills: [],
  experiences: [],
  education: [],
  applications: [],
});

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [clientData, setClientData] = useState(initialClientData);
  const [freelancerData, setFreelancerData] = useState(initialFreelancerData);
  const [jobSeekerData, setJobSeekerData] = useState(initialJobSeekerData);
  const [companyData, setCompanyData] = useState(initialCompanyData);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    // Reset to empty user-seeded state when user changes (or clears on logout)
    if (!user) {
      setJobSeekerData(initialJobSeekerData);
      setFreelancerData(initialFreelancerData);
      setClientData(initialClientData);
      setCompanyData(initialCompanyData);
      return;
    }

    const loadData = async () => {
      setProfileLoading(true);
      try {
        if (user.role === 'jobseeker') {
          // Seed from AuthContext while waiting for API
          setJobSeekerData(emptyJobSeekerFromUser(user));
          
          const [profileData, jobseekerData, skillsData, experiencesData, educationData] = await Promise.all([
            profileService.getMyProfile().catch(err => ({})),
            profileService.getJobseekerProfile().catch(err => ({})),
            profileService.getJobseekerSkills().catch(err => []),
            profileService.getJobseekerExperiences().catch(err => []),
            profileService.getJobseekerEducation().catch(err => [])
          ]);

          const userObj = profileData?.user || {};
          const jobseekerObj = profileData?.jobSeeker || jobseekerData || {};

          // Map skills list from array of strings to array of objects
          const skillsList = (skillsData || []).map(skillName => ({
            name: skillName,
            proficiencyLevel: "Intermediate"
          }));

          // Map experiences list
          const experiencesList = (experiencesData || []).map(exp => ({
            id: exp.workExperienceId,
            jobTitle: exp.jobTitle,
            companyName: exp.company,
            startDate: exp.startDate ? exp.startDate.substring(0, 7) : "", // YYYY-MM
            endDate: exp.endDate ? exp.endDate.substring(0, 7) : null,
            description: exp.description || ""
          }));

          // Map education list
          const educationList = (educationData || []).map(edu => ({
            id: edu.educationId,
            institutionName: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy || "",
            startYear: edu.startYear || new Date().getFullYear(),
            endYear: edu.endYear || null
          }));

          setJobSeekerData(prev => ({
            ...prev,
            jobSeekerId: jobseekerObj.jobSeekerId || prev.jobSeekerId,
            userId: userObj.userId || prev.userId,
            fullName: `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() || user.name || prev.fullName,
            email: userObj.email || user.email || prev.email,
            profilePictureUrl: userObj.profilePictureUrl || user.profilePicture || prev.profilePictureUrl,
            phoneNumber: userObj.phone || prev.phoneNumber,
            experienceYears: jobseekerObj.experienceYears !== undefined ? jobseekerObj.experienceYears : prev.experienceYears,
            preferredJobType: jobseekerObj.preferredJobType || prev.preferredJobType,
            profile: {
              ...prev.profile,
              headline: jobseekerObj.professionalTitle || prev.profile.headline,
              summary: jobseekerObj.bio || prev.profile.summary,
              resumeUrl: jobseekerObj.cvUrl || prev.profile.resumeUrl,
              location: [userObj.city, userObj.country].filter(Boolean).join(', ') || prev.profile.location,
              identityVerificationStatus: jobseekerObj.isVerified ? 'Verified' : 'Unverified',
            },
            skills: skillsList.length > 0 ? skillsList : prev.skills,
            experiences: experiencesList.length > 0 ? experiencesList : prev.experiences,
            education: educationList.length > 0 ? educationList : prev.education,
          }));
        } else if (user.role === 'freelancer') {
          const data = await profileService.getFreelancerProfile();
          setFreelancerData(prev => ({ ...prev, ...data }));
        } else if (user.role === 'company' || user.role === 'employer') {
          const data = await profileService.getCompanyProfile();
          // Normalize backend PascalCase properties to frontend camelCase expectations
          const normalizedData = {
            ...data,
            name: data.companyName,
            websiteUrl: data.website || "",
            verificationStatus: data.isVerified ? "Verified" : "Unverified",
            // If backend returns PascalCase lists, normalize them
            members: (data.members || []).map(m => ({
              id: m.id,
              name: m.name,
              role: m.role,
              avatar: m.avatar
            })),
            jobs: (data.jobs || []).map(j => ({
              id: j.id,
              title: j.title,
              location: j.location,
              jobType: j.jobType,
              status: j.status,
              postedAt: j.postedAt,
              applicationsCount: j.applicationsCount
            })),
            stats: {
              totalJobs: data.stats?.totalJobs || 0,
              activeJobs: data.stats?.activeJobs || 0,
              totalHires: data.stats?.totalHires || 0,
              avgTimeToHire: data.stats?.avgTimeToHire || 0
            }
          };
          setCompanyData(prev => ({ ...prev, ...normalizedData }));
        } else if (user.role === 'client') {
          const data = await profileService.getClientProfile();
          setClientData(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        const is404 = err?.status === 404 || err?.response?.status === 404 || (typeof err === 'string' && err.includes('404'));
        if (is404) {
          console.warn("No backend profile record found — using auth user data as fallback.");
          if (user.role === 'jobseeker') setJobSeekerData(emptyJobSeekerFromUser(user));
        } else {
          console.error("Failed to load live profile data in context:", err);
        }
      } finally {
        setProfileLoading(false);
      }
    };

    loadData();
  }, [user]);

  /**
   * Updates client profile data with new values using shallow merge.
   * @param {Object} newData - Partial client data to merge with existing data.
   */
  const updateClientData = (newData) => {
    setClientData((prev) => ({ ...prev, ...newData }));
  };

  /**
   * Updates freelancer profile data with new values using shallow merge.
   * @param {Object} newData - Partial freelancer data to merge with existing data.
   */
  const updateFreelancerData = (newData) => {
    setFreelancerData((prev) => ({ ...prev, ...newData }));
  };

  /**
   * Updates job seeker profile data with new values using shallow merge.
   * @param {Object} newData - Partial job seeker data to merge with existing data.
   */
  const updateJobSeekerData = (newData) => {
    if (newData.phoneNumber !== undefined && user?.id) {
      localStorage.setItem(`phone_${user.id}`, newData.phoneNumber);
    }
    setJobSeekerData((prev) => ({ ...prev, ...newData }));
  };

  /**
   * Updates company profile data — normalizes backend PascalCase if detected.
   * @param {Object} newData - Partial company data to merge with existing data.
   */
  const updateCompanyData = (newData) => {
    const normalized = newData.companyName ? {
      ...newData,
      name: newData.companyName,
      websiteUrl: newData.website || newData.websiteUrl || "",
      verificationStatus: newData.isVerified != null
        ? (newData.isVerified ? "Verified" : "Unverified")
        : newData.verificationStatus,
      location: newData.city
        ? [newData.city, newData.country].filter(Boolean).join(", ")
        : newData.location,
    } : newData;
    setCompanyData((prev) => ({ ...prev, ...normalized }));
  };

  const contextValue = {
    clientData,
    freelancerData,
    jobSeekerData,
    companyData,
    profileLoading,
    updateClientData,
    updateFreelancerData,
    updateJobSeekerData,
    updateCompanyData,
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
}

/**
 * PropTypes validation for ProfileProvider component.
 * @type {Object}
 */
ProfileProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * useProfile Hook
 * @description Custom hook to access profile context data and update functions.
 * Must be used within a ProfileProvider component.
 * @returns {Object} Profile context value containing all profile data and update functions.
 * @throws {Error} If used outside of ProfileProvider component context.
 */
export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }

  return context;
}
