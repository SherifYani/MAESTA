# 📋 دليل حقول التسجيل - JobMagnet

## 🎯 نظرة عامة

هذا الدليل هو المرجع النهائي والشامل لجميع الحقول التي يمكن للمستخدم إدخالها أثناء عملية التسجيل أو استكمال الملف الشخصي.

---

## 👤 1. الحقول الأساسية (User Entity)
**مشتركة لجميع أنواع المستخدمين**

| الحقل | النوع | إلزامي؟ | التحقق | الوصف |
|-------|------|---------|--------|-------|
| **Email** | string | ✅ نعم | `[EmailAddress]` | البريد الإلكتروني |
| **Password** | string | ✅ نعم | `[MinLength(8)]` | كلمة المرور |
| **FirstName** | string | ✅ نعم | `[StringLength(50)]` | الاسم الأول |
| **LastName** | string | ✅ نعم | `[StringLength(50)]` | الاسم الأخير |
| **Phone** | string | ⚪ لا | `[RegularExpression]` | رقم الهاتف |
| **ProfilePictureUrl** | string | ⚪ لا | `[Url]` | رابط الصورة الشخصية |
| **LinkedInUrl** | string | ⚪ لا | `[Url]` | رابط LinkedIn |
| **Gender** | string | ⚪ لا | `Male/Female` | الجنس |
| **DateOfBirth**| date | ⚪ لا | - | تاريخ الميلاد |
| **Country** | string | ⚪ لا | `[StringLength(100)]` | الدولة |
| **City** | string | ⚪ لا | `[StringLength(100)]` | المدينة |

---

## 💼 2. Freelancer (مستقل)

| الحقل | النوع | الوصف |
|-------|-------|-------|
| **ProfessionalTitle** | string | المسمى الوظيفي (مثال: Senior Web Developer) |
| **ExperienceYears** | int | سنوات الخبرة (0-50) |
| **Bio** | string | نبذة تعريفية (10-2000 حرف) |
| **HourlyRate** | decimal | السعر بالساعة |
| **Currency** | string | العملة (USD, EGP, SAR) |
| **PortfolioUrl** | string | رابط معرض الأعمال |
| **DocumentVerificationUrl** | string | رابط وثيقة التحقق (هوية/جواز سفر) |

---

## 🏢 3. Employer (صاحب عمل)

### **أ. بيانات الشركة (Company Entity):**
| الحقل | النوع | الوصف |
|-------|-------|-------|
| **CompanyName** | string | اسم الشركة (إلزامي إذا تم اختيار "شركة") |
| **Description** | string | نبذة عن الشركة (حتى 2000 حرف) |
| **Industry** | string | مجال الشركة (مثال: Software, Construction) |
| **CompanySize** | string | حجم الشركة (1-10, 11-50, etc.) |
| **FoundedYear** | int | سنة التأسيس |
| **Website** | string | موقع الشركة الإلكتروني |
| **Country** | string | دولة المقر الرئيسي |
| **City** | string | مدينة المقر الرئيسي |
| **CommercialRegistrationNumber** | string | رقم السجل التجاري |
| **LogoUrl** | string | رابط شعار الشركة |

### **ب. بيانات صاحب العمل (Employer Entity):**
| الحقل | النوع | الوصف |
|-------|-------|-------|
| **BusinessEmail** | string | البريد الإلكتروني للعمل |
| **ContactPerson** | string | اسم جهة الاتصال |
| **ContactPhone** | string | رقم هاتف جهة الاتصال |
| **NationalId** | string | الرقم القومي (للأفراد) |
| **TaxNumber** | string | الرقم الضريبي |

---

## 🔍 4. JobSeeker (باحث عن عمل)

| الحقل | النوع | الوصف |
|-------|-------|-------|
| **ProfessionalTitle** | string | المسمى الوظيفي (مثال: Civil Engineer) |
| **ExperienceYears** | int | سنوات الخبرة (0-50) |
| **Bio** | string | نبذة تعريفية |
| **CVUrl** | string | رابط السيرة الذاتية |
| **PreferredJobType** | string | نوع الوظيفة المفضل (FullTime, PartTime, etc.) |

---

## 👔 5. Client (عميل)

| الحقل | النوع | الوصف |
|-------|-------|-------|
| **LegalName** | string | الاسم القانوني |
| **Website** | string | الموقع الإلكتروني |
| **ContactPhone** | string | رقم الهاتف |
| **Address** | string | العنوان |
| **IdentityDocumentUrl** | string | رابط وثيقة الهوية |

---

## 📝 نموذج التسجيل المقترح (HTML)

```html
<!-- 1. البيانات الأساسية (إلزامي) -->
<input type="text" name="firstName" required placeholder="الاسم الأول" />
<input type="text" name="lastName" required placeholder="الاسم الأخير" />
<input type="email" name="email" required placeholder="البريد الإلكتروني" />
<input type="password" name="password" required placeholder="كلمة المرور" />

<!-- 2. نوع الحساب -->
<select name="userType" required>
  <option value="Freelancer">مستقل</option>
  <option value="Employer">صاحب عمل</option>
  <option value="JobSeeker">باحث عن عمل</option>
  <option value="Client">عميل</option>
</select>

<!-- 3. بيانات إضافية (حسب النوع - اختياري) -->
<!-- Employer -->
<input type="text" name="companyName" placeholder="اسم الشركة (اختياري)" />
<textarea name="description" placeholder="نبذة عن الشركة (اختياري)"></textarea>
<input type="number" name="foundedYear" placeholder="سنة التأسيس (اختياري)" />
<input type="text" name="country" placeholder="الدولة (اختياري)" />
<input type="text" name="city" placeholder="المدينة (اختياري)" />
```

---

**تم التحديث النهائي: 2025-11-30** ✅
