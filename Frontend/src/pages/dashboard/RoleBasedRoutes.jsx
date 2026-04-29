import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardContext } from './layout/DashboardLayout';

// Profile Components
import ClientProfile from '../profiles/ClientProfile';
import FreelancerProfile from '../profiles/FreelancerProfile';
import JobSeekerProfile from '../profiles/JobSeekerProfile';
import CompanyProfile from '../profiles/CompanyProfile';

// Edit Profile Components
import EditClientProfile from '../profiles/EditClientProfile';
import EditFreelancerProfile from '../profiles/EditFreelancerProfile';
import EditJobSeekerProfile from '../profiles/EditJobSeekerProfile';
import EditCompanyProfile from '../profiles/EditCompanyProfile';

export const RoleBasedProfile = () => {
  const { currentRole } = useContext(DashboardContext);

  switch (currentRole) {
    case 'client': return <ClientProfile />;
    case 'freelancer': return <FreelancerProfile />;
    case 'company': return <CompanyProfile />;
    case 'jobseeker': return <JobSeekerProfile />;
    default: return <Navigate to="/dashboard" replace />;
  }
};

export const RoleBasedEditProfile = () => {
  const { currentRole } = useContext(DashboardContext);

  switch (currentRole) {
    case 'client': return <EditClientProfile />;
    case 'freelancer': return <EditFreelancerProfile />;
    case 'company': return <EditCompanyProfile />;
    case 'jobseeker': return <EditJobSeekerProfile />;
    default: return <Navigate to="/dashboard" replace />;
  }
};

// Jobseeker dedicated components - can be used directly or wrapped if needed
export const JobSeekerRoute = ({ component: Component }) => {
  const { currentRole } = useContext(DashboardContext);
  if (currentRole !== 'jobseeker') return <Navigate to="/dashboard" replace />;
  return <Component />;
};
