import ApiService from './ApiService';

export const searchCompanies = async (query) => {
  const response = await ApiService.get('/api/companies/search', { params: { query } });
  return response.data;
};

export const getCompanyById = async (companyId) => {
  const response = await ApiService.get(`/api/companies/${companyId}`);
  return response.data;
};

export const uploadCompanyMemberProfilePhoto = async (file) => {
  if (!file) return null;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucketName', 'profile-pictures');

  const response = await ApiService.upload('/api/Files/upload', formData);
  return response.data?.url || response.data?.Url || null;
};

export const submitCompanyMemberOnboarding = async (payload) => {
  const response = await ApiService.post('/api/companies/member-onboarding', payload);
  return response.data;
};

export const getCompanyMemberOnboardingDraft = async () => {
  const response = await ApiService.get('/api/companies/member-onboarding/draft');
  return response.data;
};

export const saveCompanyMemberOnboardingDraft = async (payload) => {
  const response = await ApiService.put('/api/companies/member-onboarding/draft', payload);
  return response.data;
};

const companyMemberOnboardingService = {
  searchCompanies,
  getCompanyById,
  uploadCompanyMemberProfilePhoto,
  submitCompanyMemberOnboarding,
  getCompanyMemberOnboardingDraft,
  saveCompanyMemberOnboardingDraft,
};

export default companyMemberOnboardingService;
