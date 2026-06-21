import ApiService from './ApiService';

const parsePreferences = (preferences) => {
  if (!preferences) return {};
  try {
    return JSON.parse(preferences);
  } catch {
    return {};
  }
};

export const getDraft = async (key) => {
  const response = await ApiService.get('/api/Profile/me/settings');
  const preferences = parsePreferences(response.data?.preferences || response.data?.Preferences);
  return preferences[key] || null;
};

export const saveDraft = async (key, draftData) => {
  const settingsResponse = await ApiService.get('/api/Profile/me/settings');
  const settings = settingsResponse.data || {};
  const preferences = parsePreferences(settings.preferences || settings.Preferences);

  preferences[key] = draftData;

  const response = await ApiService.put('/api/Profile/me/settings', {
    language: settings.language || settings.Language || 'en',
    timeZone: settings.timeZone || settings.TimeZone || null,
    emailNotifications: settings.emailNotifications ?? settings.EmailNotifications ?? true,
    smsNotifications: settings.smsNotifications ?? settings.SmsNotifications ?? false,
    pushNotifications: settings.pushNotifications ?? settings.PushNotifications ?? true,
    darkMode: settings.darkMode ?? settings.DarkMode ?? false,
    preferences: JSON.stringify(preferences),
  });

  return response.data;
};

const draftService = {
  getDraft,
  saveDraft,
};

export default draftService;
