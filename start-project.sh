#!/bin/bash

# 🎨 تلوين المخرجات
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 بدء تشغيل مشروع JobMagnet...${NC}"

# 1. تفعيل Podman Socket (حل مشكلة الاتصال)
if command -v systemctl &> /dev/null; then
    echo -e "${YELLOW}⚙️  تفعيل محرك الحاويات (Podman Socket)...${NC}"
    systemctl --user start podman.socket
fi

# 2. تشغيل الـ Backend عبر Docker Compose
echo -e "${YELLOW}📦 بناء وتشغيل الحاويات (Database, MinIO, API, Adminer)...${NC}"
docker-compose up -d --build

if [ $? -ne 0 ]; then
    echo -e "❌ حدث خطأ أثناء تشغيل الحاويات. تأكد من أن Docker/Podman يعمل."
    exit 1
fi

# 3. تطبيق تحديثات قاعدة البيانات
echo -e "${YELLOW}🗄️  تطبيق التحديثات على قاعدة البيانات (EF Migrations)...${NC}"
dotnet ef database update --project JobMagnet.Infrastructure --startup-project JobMagnet.API

# 4. تجهيز وتشغيل الـ Frontend
echo -e "${YELLOW}💻 تجهيز الواجهة الأمامية (Frontend)...${NC}"
cd Frontend

if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📥 تحميل مكتبات الـ Frontend (npm install)...${NC}"
    npm install
fi

echo -e "${GREEN}✅ كل شيء جاهز! يتم الآن تشغيل واجهة المستخدم...${NC}"
echo -e "${BLUE}🔗 Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}🔗 API Swagger: http://localhost:5024${NC}"
echo -e "${BLUE}🔗 Database UI: http://localhost:8081${NC}"

npm start
