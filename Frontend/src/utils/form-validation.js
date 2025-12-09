/**
 * @file form-validation.js
 * @description Comprehensive form validation utilities for all forms in the application
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 10-10-2025
 *
 * @features:
 * - Phone number validation with international formats
 * - Password strength validation with detailed feedback
 * - Email validation
 * - URL validation
 * - File validation with size and type checks
 * - Date validation with age restrictions
 * - Real-time validation for all form types
 * - Custom error messages
 */

// ============================================
// GENERAL VALIDATION UTILITIES
// ============================================

/**
 * Validates required fields
 * @param {string} value - Field value
 * @param {string} fieldName - Name of the field for error message
 * @returns {string} Error message or empty string
 */
export const validateRequired = (value, fieldName = "This field") => {
  if (!value || value.trim() === "") {
    return `${fieldName} is required`;
  }
  return "";
};

/**
 * Validates minimum length
 * @param {string} value - Field value
 * @param {number} minLength - Minimum required length
 * @param {string} fieldName - Name of the field for error message
 * @returns {string} Error message or empty string
 */
export const validateMinLength = (
  value,
  minLength,
  fieldName = "This field"
) => {
  if (value && value.trim().length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return "";
};

/**
 * Validates maximum length
 * @param {string} value - Field value
 * @param {number} maxLength - Maximum allowed length
 * @param {string} fieldName - Name of the field for error message
 * @returns {string} Error message or empty string
 */
export const validateMaxLength = (
  value,
  maxLength,
  fieldName = "This field"
) => {
  if (value && value.trim().length > maxLength) {
    return `${fieldName} must be less than ${maxLength} characters`;
  }
  return "";
};

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {string} Error message or empty string
 */
export const validateEmail = (email) => {
  if (!email) return "Email is required";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  // Check for common disposable email domains
  const disposableDomains = [
    "tempmail.com",
    "throwaway.com",
    "guerrillamail.com",
    "mailinator.com",
    "10minutemail.com",
    "yopmail.com",
  ];

  const domain = email.split("@")[1];
  if (disposableDomains.some((d) => domain.includes(d))) {
    return "Disposable email addresses are not allowed";
  }

  return "";
};

// ============================================
// PHONE NUMBER VALIDATION
// ============================================

/**
 * Validates phone number format with international support
 * @param {string} phone - Phone number to validate
 * @returns {Object} Validation result with isValid and errorMessage
 */
export const validatePhoneNumber = (phone) => {
  // GUIDE SAYS: Phone field is optional (⚪ لا), but current validation makes it required
  // Current implementation makes phone required, while guide says optional
  if (!phone || phone.trim() === "") {
    // Commented out to match guide's optional requirement
    // return { isValid: false, errorMessage: "Phone number is required" };
    return { isValid: true, errorMessage: "" }; // Empty phone is acceptable per guide
  }

  // Remove all non-digit characters except + for international numbers
  const cleanedPhone = phone.replace(/[^\d+]/g, "");

  // Phone number validation patterns
  const patterns = {
    international: /^\+[1-9]\d{1,14}$/, // E.164 format
    usCanada: /^(\+1\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/,
    general: /^[\+]?[(]?[\d\s\(\)\-]{10,}$/, // General pattern for most countries
  };

  if (phone.length < 10) {
    return { isValid: false, errorMessage: "Phone number is too short" };
  }

  if (phone.length > 20) {
    return { isValid: false, errorMessage: "Phone number is too long" };
  }

  // Check if phone contains only valid characters
  const validChars = /^[\d\s\(\)\-\+\.]+$/;
  if (!validChars.test(phone)) {
    return {
      isValid: false,
      errorMessage: "Invalid characters in phone number",
    };
  }

  // Check against patterns
  const isValid =
    patterns.international.test(cleanedPhone) ||
    patterns.usCanada.test(phone) ||
    patterns.general.test(phone);

  if (!isValid) {
    return {
      isValid: false,
      errorMessage: "Please enter a valid phone number",
    };
  }

  return { isValid: true, errorMessage: "" };
};

/**
 * Formats phone number as user types (US/Canada format)
 * @param {string} phone - Raw phone number input
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  const numbers = phone.replace(/\D/g, "");

  // US/Canada formatting
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  } else {
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(
      6,
      10
    )}`;
  }
};

// ============================================
// PASSWORD VALIDATION
// ============================================

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with individual requirements
 */
export const validatePassword = (password) => {
  // GUIDE SAYS: Password must have [MinLength(8)]
  const validation = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  return validation;
};

/**
 * Gets password strength score (0-100)
 * @param {Object} passwordValidation - Result from validatePassword
 * @returns {number} Strength score
 */
export const getPasswordStrengthScore = (passwordValidation) => {
  const requirements = Object.values(passwordValidation);
  const metRequirements = requirements.filter(Boolean).length;
  return (metRequirements / requirements.length) * 100;
};

/**
 * Gets password strength text
 * @param {Object} passwordValidation - Result from validatePassword
 * @returns {string} Strength description
 */
export const getPasswordStrengthText = (passwordValidation) => {
  const score = getPasswordStrengthScore(passwordValidation);

  if (score === 0) return "";
  if (score < 40) return "Very Weak";
  if (score < 60) return "Weak";
  if (score < 80) return "Fair";
  if (score < 100) return "Strong";
  return "Very Strong";
};

/**
 * Validates password match
 * @param {string} password - First password
 * @param {string} confirmPassword - Confirmation password
 * @returns {string} Error message or empty string
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return "";
};

// ============================================
// FILE VALIDATION
// ============================================

/**
 * Validates file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @param {Array<string>} options.allowedTypes - Allowed MIME types
 * @param {number} options.maxSizeMB - Maximum file size in MB
 * @param {string} options.fieldName - Name of the field for error message
 * @returns {string} Error message or empty string
 */
export const validateFile = (file, options = {}) => {
  const {
    allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"],
    maxSizeMB = 5,
    fieldName = "File",
  } = options;

  if (!file) return `${fieldName} is required`;

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes
      .map((type) => type.split("/")[1])
      .join(", ");
    return `${fieldName} must be one of: ${allowedExtensions}`;
  }

  // Check file size
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `${fieldName} must be less than ${maxSizeMB}MB`;
  }

  return "";
};

/**
 * Validates multiple files
 * @param {Array<File>} files - Array of files
 * @param {Object} options - Validation options
 * @param {number} options.minCount - Minimum number of files
 * @param {number} options.maxCount - Maximum number of files
 * @returns {string} Error message or empty string
 */
export const validateMultipleFiles = (files, options = {}) => {
  const { minCount = 0, maxCount = Infinity, fieldName = "Files" } = options;

  if (!files || files.length === 0) {
    if (minCount > 0)
      return `At least ${minCount} ${fieldName.toLowerCase()} required`;
    return "";
  }

  if (files.length < minCount) {
    return `At least ${minCount} ${fieldName.toLowerCase()} required`;
  }

  if (files.length > maxCount) {
    return `Maximum ${maxCount} ${fieldName.toLowerCase()} allowed`;
  }

  return "";
};

// ============================================
// DATE VALIDATION
// ============================================

/**
 * Validates date of birth with age restrictions
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @param {Object} options - Validation options
 * @param {number} options.minAge - Minimum age in years
 * @param {number} options.maxAge - Maximum age in years
 * @returns {Object} Validation result with isValid and errorMessage
 */
export const validateBirthDate = (dateString, options = {}) => {
  const { minAge = 18, maxAge = 100 } = options;

  // GUIDE SAYS: DateOfBirth is optional (⚪ لا), but current validation makes it required
  if (!dateString) {
    // Commented out to match guide's optional requirement
    // return { isValid: false, errorMessage: "Date of birth is required" };
    return { isValid: true, errorMessage: "", age: null }; // Empty date is acceptable per guide
  }

  const birthDate = new Date(dateString);
  const today = new Date();

  // Check if date is valid
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, errorMessage: "Invalid date format" };
  }

  // Check if date is in the future
  if (birthDate > today) {
    return {
      isValid: false,
      errorMessage: "Date of birth cannot be in the future",
    };
  }

  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  // Validate age range
  if (age < minAge) {
    return {
      isValid: false,
      errorMessage: `You must be at least ${minAge} years old`,
    };
  }

  if (age > maxAge) {
    return {
      isValid: false,
      errorMessage: `Maximum age is ${maxAge} years`,
    };
  }

  return { isValid: true, errorMessage: "", age };
};

// ============================================
// URL VALIDATION
// ============================================

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @param {boolean} required - Whether URL is required
 * @returns {string} Error message or empty string
 */
export const validateURL = (url, required = false) => {
  if (!url || url.trim() === "") {
    return required ? "URL is required" : "";
  }

  try {
    const urlObj = new URL(url);

    // Check for common protocols
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return "URL must start with http:// or https://";
    }

    return "";
  } catch {
    return "Please enter a valid URL";
  }
};

// ============================================
// SPECIFIC FORM VALIDATIONS
// ============================================

/**
 * Validates freelancer onboarding form
 * @param {Object} formData - Form data object
 * @returns {Object} Validation errors object
 */
export const validateFreelancerOnboarding = (formData) => {
  const errors = {};

  // GUIDE FIELDS for Freelancer:
  // ProfessionalTitle, ExperienceYears (0-50), Bio (10-2000), HourlyRate, Currency (USD, EGP, SAR), PortfolioUrl, DocumentVerificationUrl

  // Current form has different field names and additional fields not in guide
  // ProfessionalTitle (headline in current form)
  errors.headline = validateRequired(
    formData.headline,
    "Professional title" // Guide: ProfessionalTitle
  );

  // GUIDE MISSING: ExperienceYears field - not in current form
  // Should add: ExperienceYears validation (0-50 integer)

  // Bio (overview in current form)
  // GUIDE: Bio 10-2000 characters
  // CURRENT: overview 50-1000 characters (mismatch)
  errors.overview = validateMinLength(formData.overview, 10, "Bio"); // Changed to guide's min 10
  if (formData.overview && formData.overview.length > 2000) {
    // Changed to guide's max 2000
    errors.overview = "Bio must be less than 2000 characters";
  }

  // HourlyRate validation
  if (formData.hourlyRate) {
    const rate = parseFloat(formData.hourlyRate);
    if (isNaN(rate)) {
      errors.hourlyRate = "Hourly rate must be a number";
    } else if (rate < 0) {
      errors.hourlyRate = "Hourly rate cannot be negative";
    } else if (rate > 1000) {
      errors.hourlyRate = "Hourly rate is too high";
    }
  } else {
    errors.hourlyRate = "Hourly rate is required";
  }

  // GUIDE MISSING: Currency field (USD, EGP, SAR) - not in current form
  // Should add: Currency validation with specific values

  // PortfolioUrl (portfolioLink in current form)
  // GUIDE: PortfolioUrl is optional
  // CURRENT: portfolioLink is optional (matches guide)
  errors.portfolioLink = validateURL(formData.portfolioLink, false);

  // GUIDE MISSING: DocumentVerificationUrl - not in current form
  // Should add: DocumentVerificationUrl validation (URL, optional)

  // CURRENT FORM HAS EXTRA FIELDS NOT IN GUIDE:
  // skills, location, portfolioImages - commented out as they're not in guide
  /*
  if (formData.skills) {
    const skillCount = formData.skills
      .split(",")
      .filter((s) => s.trim()).length;
    if (skillCount < 3) {
      errors.skills = "Please list at least 3 skills";
    }
  } else {
    errors.skills = "Skills are required";
  }
  */

  return errors;
};

/**
 * Validates company onboarding form
 * @param {Object} formData - Form data object
 * @returns {Object} Validation errors object
 */
export const validateCompanyOnboarding = (formData) => {
  const errors = {};

  // GUIDE FIELDS for Company Entity:
  // CompanyName, Description (up to 2000), Industry, CompanySize, FoundedYear, Website,
  // Country, City, CommercialRegistrationNumber, LogoUrl

  // GUIDE FIELDS for Employer Entity (MISSING IN CURRENT FORM):
  // BusinessEmail, ContactPerson, ContactPhone, NationalId, TaxNumber

  // CompanyName - NOT IN CURRENT FORM, should be added
  // Should add: CompanyName validation (required)

  // Description validation
  // GUIDE: Description up to 2000 characters
  errors.description = validateMinLength(
    formData.description,
    0, // Guide doesn't specify min length, just "حتى 2000 حرف"
    "Company description"
  );
  if (formData.description && formData.description.length > 2000) {
    errors.description = "Description must be less than 2000 characters";
  }

  // Industry validation
  errors.industry = validateRequired(formData.industry, "Industry");

  // CompanySize validation
  errors.companySize = validateRequired(formData.companySize, "Company size");

  // Location (City, Country combined in current form)
  // GUIDE: Separate Country and City fields, both optional
  // CURRENT: Single location field, required (mismatch)
  errors.location = validateRequired(formData.location, "Location");

  // GUIDE MISSING: FoundedYear, Website - not in current form
  // Should add: FoundedYear (optional number), Website (optional URL)

  // CommercialRegistrationNumber (commercialRegistrationID in current form)
  errors.commercialRegistrationID = validateRequired(
    formData.commercialRegistrationID,
    "Commercial registration number"
  );

  // LogoUrl - handled via file upload in current form, not URL
  // Current: Logo file upload, Guide: LogoUrl (URL)

  // EMPLOYER ENTITY FIELDS (ALL MISSING IN CURRENT FORM):
  // Should add: BusinessEmail, ContactPerson, ContactPhone, NationalId, TaxNumber

  return errors;
};

/**
 * Validates company member onboarding form
 * @param {Object} formData - Form data object
 * @param {Object} selectedCompany - Selected company object
 * @returns {Object} Validation errors object
 */
export const validateCompanyMemberOnboarding = (formData, selectedCompany) => {
  const errors = {};

  // NOTE: CompanyMemberOnboarding is NOT in the guide
  // This appears to be a custom role not specified in REGISTRATION_FORM_GUIDE.md
  // Guide only has: User, Freelancer, Employer, JobSeeker, Client

  if (!selectedCompany) {
    errors.company = "Please select a company";
  }

  errors.role = validateRequired(formData.role, "Role");
  errors.position = validateRequired(formData.position, "Position");
  errors.department = validateRequired(formData.department, "Department");

  return errors;
};

/**
 * Validates job seeker onboarding form
 * @param {Object} formData - Form data object
 * @param {Array} experiences - Array of experience objects
 * @param {Array} education - Array of education objects
 * @returns {Object} Validation errors object
 */
export const validateJobSeekerOnboarding = (
  formData,
  experiences = [],
  education = []
) => {
  const errors = {};

  // GUIDE FIELDS for JobSeeker:
  // ProfessionalTitle, ExperienceYears (0-50), Bio, CVUrl, PreferredJobType

  // ProfessionalTitle (headline in current form)
  errors.headline = validateRequired(
    formData.headline,
    "Professional title" // Guide: ProfessionalTitle
  );

  // GUIDE MISSING: ExperienceYears field - not in current form
  // Should add: ExperienceYears validation (0-50 integer)

  // Bio (summary in current form)
  // GUIDE: Bio is required but no length specified
  // CURRENT: summary required with 50-1500 characters (mismatch)
  errors.summary = validateRequired(formData.summary, "Professional summary");

  // CVUrl (resume in current form as file upload)
  // GUIDE: CVUrl is URL
  // CURRENT: resume is file upload (mismatch)
  // Note: Current form expects file upload, guide expects URL

  // GUIDE MISSING: PreferredJobType (FullTime, PartTime, etc.) - not in current form
  // Should add: PreferredJobType validation with specific values

  // CURRENT FORM HAS EXTRA FIELDS NOT IN GUIDE:
  // location, skills, experiences array, education array - commented out
  /*
  errors.location = validateRequired(formData.location, "Location");
  
  if (formData.skills) {
    const skillCount = formData.skills
      .split(",")
      .filter((s) => s.trim()).length;
    if (skillCount < 3) {
      errors.skills = "Please list at least 3 skills";
    }
  } else {
    errors.skills = "Skills are required";
  }

  // Validate experiences (not in guide)
  if (experiences.length === 0) {
    errors.experiences = "At least one work experience is required";
  } else {
    experiences.forEach((exp, index) => {
      if (!exp.title || exp.title.trim() === "") {
        errors[`experiences[${index}].title`] = "Job title is required";
      }
      if (!exp.company || exp.company.trim() === "") {
        errors[`experiences[${index}].company`] = "Company name is required";
      }
      if (!exp.duration || exp.duration.trim() === "") {
        errors[`experiences[${index}].duration`] = "Duration is required";
      }
    });
  }

  // Validate education (not in guide)
  if (education.length === 0) {
    errors.education = "At least one education entry is required";
  } else {
    education.forEach((edu, index) => {
      if (!edu.degree || edu.degree.trim() === "") {
        errors[`education[${index}].degree`] = "Degree is required";
      }
      if (!edu.institution || edu.institution.trim() === "") {
        errors[`education[${index}].institution`] = "Institution is required";
      }
      if (!edu.year || edu.year.trim() === "") {
        errors[`education[${index}].year`] = "Year is required";
      }
    });
  }
  */

  return errors;
};

/**
 * Validates registration form (Phase 1)
 * @param {Object} formData - Form data object
 * @param {string} selectedRole - Selected user role
 * @returns {Object} Validation errors object
 */
export const validateRegistrationForm = (formData, selectedRole) => {
  const errors = {};

  // GUIDE GENERAL FIELDS for all users:
  // Email, Password, FirstName, LastName, Phone, ProfilePictureUrl, LinkedInUrl,
  // Gender, DateOfBirth, Country, City

  // Current form has: fullName, email, phoneNumber, birthDate, password, confirmPassword
  // Missing: FirstName/LastName separate, ProfilePictureUrl, LinkedInUrl, Gender, Country, City

  // GUIDE ISSUE: Current form uses fullName instead of separate FirstName/LastName
  errors.fullName = validateRequired(formData.fullName, "Full name");
  if (
    formData.fullName &&
    (formData.fullName.length < 2 || formData.fullName.length > 100)
  ) {
    errors.fullName = "Full name must be between 2 and 100 characters";
  }

  errors.email = validateEmail(formData.email);

  // Phone validation - GUIDE says optional, current makes required
  const phoneValidation = validatePhoneNumber(formData.phoneNumber);
  if (!phoneValidation.isValid && formData.phoneNumber !== "") {
    errors.phoneNumber = phoneValidation.errorMessage;
  }

  // BirthDate validation - GUIDE says optional, current makes required
  const birthDateValidation = validateBirthDate(formData.birthDate);
  if (!birthDateValidation.isValid && formData.birthDate !== "") {
    errors.birthDate = birthDateValidation.errorMessage;
  }

  // Password validation
  if (!formData.password) {
    errors.password = "Password is required";
  } else {
    const passwordValidation = validatePassword(formData.password);
    const allValid = Object.values(passwordValidation).every((v) => v);
    if (!allValid) {
      errors.password = "Password does not meet requirements";
    }
  }

  errors.confirmPassword = validatePasswordMatch(
    formData.password,
    formData.confirmPassword
  );

  // GUIDE MISSING FIELDS in current form:
  // Gender, Country, City, LinkedInUrl, ProfilePictureUrl

  // Employer-specific fields (from Company entity in guide)
  if (selectedRole === "employer") {
    // CompanyName should be required per guide
    errors.companyName = validateRequired(formData.companyName, "Company name");
    errors.industry = validateRequired(formData.industry, "Industry");
    errors.companySize = validateRequired(formData.companySize, "Company size");
    errors.location = validateRequired(formData.location, "Company location");

    // GUIDE MISSING: FoundedYear, Website (optional), separate Country/City,
    // CommercialRegistrationNumber, LogoUrl

    // GUIDE MISSING: Employer entity fields (BusinessEmail, ContactPerson, ContactPhone, NationalId, TaxNumber)
  }

  return errors;
};

// ============================================
// FORM COMPLETION CALCULATORS
// ============================================

/**
 * Calculates completion percentage for freelancer onboarding
 * @param {Object} formData - Form data object
 * @param {File} profilePicture - Profile picture file
 * @param {Array} portfolioImages - Array of portfolio images
 * @returns {number} Completion percentage (0-100)
 */
export const calculateFreelancerCompletion = (
  formData,
  profilePicture,
  portfolioImages = []
) => {
  let progress = 0;

  // GUIDE FIELDS: ProfessionalTitle, ExperienceYears, Bio, HourlyRate, Currency, PortfolioUrl, DocumentVerificationUrl
  // CURRENT: headline, location, hourlyRate, overview, skills, portfolioLink, portfolioImages

  // Guide doesn't specify completion criteria, current uses:
  // Basic Info (33%): headline, location, hourlyRate
  // Professional Details (33%): overview, skills
  // Portfolio (34%): profilePicture, portfolioImages

  // Many mismatches with guide

  // Basic Info (33%)
  if (formData.headline && formData.location && formData.hourlyRate)
    progress += 33;

  // Professional Details (33%)
  if (
    formData.overview &&
    formData.overview.length >= 10 && // Guide: Bio min 10 chars
    formData.skills &&
    formData.skills.split(",").filter((s) => s.trim()).length >= 1 // Guide doesn't mention skills
  ) {
    progress += 33;
  }

  // Portfolio (34%) - Guide has PortfolioUrl (optional), DocumentVerificationUrl (optional)
  // Current has profilePicture and portfolioImages (not in guide)
  if (profilePicture && portfolioImages.length > 0) progress += 34;

  return Math.min(progress, 100);
};

/**
 * Calculates completion percentage for company onboarding
 * @param {Object} formData - Form data object
 * @param {File} logo - Company logo file
 * @param {File} registrationPhoto - Registration document file
 * @returns {number} Completion percentage (0-100)
 */
export const calculateCompanyCompletion = (
  formData,
  logo,
  registrationPhoto
) => {
  let progress = 0;

  // GUIDE FIELDS: CompanyName, Description, Industry, CompanySize, FoundedYear,
  // Website, Country, City, CommercialRegistrationNumber, LogoUrl
  // PLUS Employer entity fields: BusinessEmail, ContactPerson, ContactPhone, NationalId, TaxNumber

  // Current: description, industry, companySize, location, commercialRegistrationID, logo, registrationPhoto

  // Many fields missing from current form

  // Basic Info (33%)
  if (formData.industry && formData.companySize && formData.location)
    progress += 33;

  // Company Story (33%) - Guide: Description up to 2000 chars
  if (formData.description && formData.description.length >= 10 && logo)
    progress += 33;

  // Legal Verification (34%) - Guide: CommercialRegistrationNumber (optional), plus many other fields
  if (formData.commercialRegistrationID && registrationPhoto) progress += 34;

  return Math.min(progress, 100);
};

/**
 * Calculates completion percentage for company member onboarding
 * @param {Object} formData - Form data object
 * @param {Object} selectedCompany - Selected company
 * @param {File} profilePicture - Profile picture file
 * @returns {number} Completion percentage (0-100)
 */
export const calculateCompanyMemberCompletion = (
  formData,
  selectedCompany,
  profilePicture
) => {
  // NOTE: CompanyMemberOnboarding is NOT in the guide
  // This is a custom role not specified in REGISTRATION_FORM_GUIDE.md

  let progress = 0;

  // 25% per section
  if (selectedCompany) progress += 25;
  if (formData.role) progress += 25;
  if (formData.position && formData.department) progress += 25;
  if (profilePicture) progress += 25;

  return Math.min(progress, 100);
};

/**
 * Calculates completion percentage for job seeker onboarding
 * @param {Object} formData - Form data object
 * @param {File} profilePicture - Profile picture file
 * @param {File} resume - Resume file
 * @param {Array} experiences - Array of experiences
 * @param {Array} education - Array of education entries
 * @returns {number} Completion percentage (0-100)
 */
export const calculateJobSeekerCompletion = (
  formData,
  profilePicture,
  resume,
  experiences = [],
  education = []
) => {
  let progress = 0;

  // GUIDE FIELDS: ProfessionalTitle, ExperienceYears, Bio, CVUrl, PreferredJobType
  // CURRENT: headline, location, summary, skills, resume, experiences, education, profilePicture

  // Many mismatches with guide

  // Basic Information (20%) - Guide: ProfessionalTitle only
  if (
    formData.headline &&
    formData.headline.trim() &&
    formData.location && // Location not in guide for JobSeeker
    formData.location.trim()
  ) {
    progress += 20;
  }

  // Professional Profile (20%) - Guide: Bio only
  if (
    formData.summary &&
    formData.summary.length >= 10 && // Guide doesn't specify min length for Bio
    formData.skills && // Skills not in guide
    formData.skills.split(",").filter((s) => s.trim()).length >= 1
  ) {
    progress += 20;
  }

  // Experiences (20%) - NOT IN GUIDE
  if (
    experiences.length > 0 &&
    experiences.every(
      (exp) =>
        exp.title &&
        exp.title.trim() &&
        exp.company &&
        exp.company.trim() &&
        exp.duration &&
        exp.duration.trim()
    )
  ) {
    progress += 20;
  }

  // Education (20%) - NOT IN GUIDE
  if (
    education.length > 0 &&
    education.every(
      (edu) =>
        edu.degree &&
        edu.degree.trim() &&
        edu.institution &&
        edu.institution.trim() &&
        edu.year &&
        edu.year.trim()
    )
  ) {
    progress += 20;
  }

  // Documents (20%) - Guide: CVUrl (URL), not file upload
  if (profilePicture && resume) {
    progress += 20;
  }

  return Math.min(progress, 100);
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Checks if a form has any validation errors
 * @param {Object} errors - Validation errors object
 * @returns {boolean} True if no errors
 */
export const isFormValid = (errors) => {
  return Object.values(errors).every((error) => !error);
};

/**
 * Gets field validation state for UI feedback
 * @param {string} error - Error message
 * @returns {Object} Validation state object
 */
export const getValidationState = (error) => {
  return {
    hasError: !!error,
    isValid: !error,
    errorMessage: error || "",
  };
};

/**
 * Debounces a validation function to prevent excessive calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounceValidation = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// ============================================
// EXPORT ALL VALIDATION FUNCTIONS
// ============================================

export default {
  // General validations
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateEmail,

  // Phone validation
  validatePhoneNumber,
  formatPhoneNumber,

  // Password validation
  validatePassword,
  getPasswordStrengthScore,
  getPasswordStrengthText,
  validatePasswordMatch,

  // File validation
  validateFile,
  validateMultipleFiles,

  // Date validation
  validateBirthDate,

  // URL validation
  validateURL,

  // Specific form validations
  validateFreelancerOnboarding,
  validateCompanyOnboarding,
  validateCompanyMemberOnboarding,
  validateJobSeekerOnboarding,
  validateRegistrationForm,

  // Completion calculators
  calculateFreelancerCompletion,
  calculateCompanyCompletion,
  calculateCompanyMemberCompletion,
  calculateJobSeekerCompletion,

  // Helper functions
  isFormValid,
  getValidationState,
  debounceValidation,
};
