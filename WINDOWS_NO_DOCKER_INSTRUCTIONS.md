# تشغيل المشروع على Windows بدون Docker 🚀

إذا واجهت أي مشاكل في تثبيت أو تشغيل Docker/Podman على جهازك، يمكنك الآن تشغيل المشروع بالكامل محلياً (Native) بدون الحاجة إلى Docker.

---

## المتطلبات الأساسية (Prerequisites)

تأكد من تثبيت البرامج التالية على جهازك:
1. **.NET 9.0 SDK**: [تحميل من هنا](https://dotnet.microsoft.com/download/dotnet/9.0)
2. **Node.js (LTS)**: [تحميل من هنا](https://nodejs.org/)
3. **SQL Server**:
   - إما تثبيت **LocalDB** (يأتي تلقائياً مع Visual Studio عند اختيار ASP.NET development).
   - أو تثبيت **SQL Server Express** المجاني: [تحميل من هنا](https://www.microsoft.com/sql-server/sql-server-downloads).

---

## خطوات الإعداد والتشغيل

### الخطوة 1: ضبط قاعدة البيانات والملفات في `appsettings.json`

افتح ملف `JobMagnet.API/appsettings.json` وقم بالتعديل التالي:

1. **نص الاتصال بقاعدة البيانات (Connection String)**:
   ابحث عن قسم `ConnectionStrings` وقم بتعديل `DefaultConnection` ليكون أحد الخيارين التاليين:
   
   * إذا كنت تستخدم **LocalDB** (موصى به للسهولة):
     ```json
     "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=JobMagnetDB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;"
     ```
   * إذا كنت تستخدم **SQL Server Express**:
     ```json
     "DefaultConnection": "Server=.\\SQLEXPRESS;Database=JobMagnetDB;Trusted_Connection=True;TrustServerCertificate=True;"
     ```

2. **تفعيل التخزين المحلي (بدون MinIO/Docker)**:
   تأكد من وجود قسم التخزين وتعيينه إلى `Local` لحفظ الملفات المرفوعة مباشرة على جهازك بدلاً من MinIO:
   ```json
   "Storage": {
     "Provider": "Local",
     "LocalBaseUrl": "http://localhost:5024"
   }
   ```

---

### الخطوة 2: إنشاء قاعدة البيانات وتطبيق الجداول (EF Migrations)

افتح سطر الأوامر (CMD or PowerShell) في المجلد الرئيسي للمشروع ونفذ الأمر التالي:

1. أولاً، تأكد من تثبيت أداة EF Core:
   ```bash
   dotnet tool install --global dotnet-ef
   ```
2. قم بتحديث قاعدة البيانات لإنشاء الجداول تلقائياً:
   ```bash
   dotnet ef database update --project JobMagnet.Infrastructure --startup-project JobMagnet.API
   ```

---

### الخطوة 3: تشغيل الـ Backend (API)

من المجلد الرئيسي للمشروع، نفذ الأمر التالي لتشغيل السيرفر:
```bash
dotnet run --project JobMagnet.API --launch-profile http
```
سيبدأ الـ Backend في العمل على البورت `5024` ويمكنك تصفح Swagger عبر الرابط:
`http://localhost:5024/index.html`

---

### الخطوة 4: تشغيل الـ Frontend (React)

افتح سطر أوامر جديد وانتقل إلى مجلد `Frontend` لتشغيل الواجهة الرسومية:
1. الانتقال للمجلد:
   ```bash
   cd Frontend
   ```
2. تثبيت المكتبات (لأول مرة فقط):
   ```bash
   npm install
   ```
3. تشغيل الواجهة:
   ```bash
   npm start
   ```
ستفتح واجهة المستخدم تلقائياً على الرابط: `http://localhost:3000`
