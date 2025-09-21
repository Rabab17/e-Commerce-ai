# دليل رفع مشروع E-Commerce AI على Vercel

## نظرة عامة
هذا المشروع هو تطبيق Strapi (Node.js backend) مع قاعدة بيانات PostgreSQL و Cloudinary للصور. ستحتاج إلى إعداد قاعدة بيانات خارجية لأن Vercel لا يدعم قواعد البيانات المحلية.

## المتطلبات الأساسية
- حساب Vercel
- حساب قاعدة بيانات PostgreSQL (Neon, Supabase, أو Railway)
- حساب Cloudinary للصور

## الخطوات التفصيلية

### 1. إعداد قاعدة بيانات PostgreSQL

#### الخيار الأول: Neon (مُوصى به)
1. اذهب إلى [Neon](https://neon.tech)
2. أنشئ حساب جديد
3. أنشئ مشروع جديد
4. احصل على connection string من لوحة التحكم
5. مثال: `postgresql://username:password@hostname:5432/database?sslmode=require`

#### الخيار الثاني: Supabase
1. اذهب إلى [Supabase](https://supabase.com)
2. أنشئ مشروع جديد
3. اذهب إلى Settings > Database
4. احصل على connection string

#### الخيار الثالث: Railway
1. اذهب إلى [Railway](https://railway.app)
2. أنشئ مشروع جديد
3. أضف PostgreSQL service
4. احصل على connection string

### 2. إعداد Cloudinary
1. اذهب إلى [Cloudinary](https://cloudinary.com)
2. أنشئ حساب جديد
3. احصل على:
   - Cloud Name
   - API Key
   - API Secret

### 3. رفع المشروع على Vercel

#### الطريقة الأولى: عبر Vercel CLI
```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# رفع المشروع
vercel

# اتبع التعليمات على الشاشة
```

#### الطريقة الثانية: عبر GitHub
1. ارفع المشروع على GitHub
2. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
3. اضغط "New Project"
4. اختر المشروع من GitHub
5. اتبع خطوات الإعداد

### 4. إعداد متغيرات البيئة في Vercel

اذهب إلى Project Settings > Environment Variables وأضف:

#### متغيرات قاعدة البيانات
```
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://username:password@hostname:5432/database?sslmode=require
DATABASE_SSL=true
```

#### متغيرات Cloudinary
```
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret
```

#### متغيرات Strapi الأساسية
```
HOST=0.0.0.0
PORT=1337
NODE_ENV=production
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your_api_token_salt
ADMIN_JWT_SECRET=your_admin_jwt_secret
TRANSFER_TOKEN_SALT=your_transfer_token_salt
ENCRYPTION_KEY=your_encryption_key
JWT_SECRET=your_jwt_secret
```

### 5. إنشاء مفاتيح آمنة

استخدم الأوامر التالية لإنشاء مفاتيح آمنة:

```bash
# لـ APP_KEYS (4 مفاتيح مفصولة بفاصلة)
node -e "console.log(Array.from({length: 4}, () => require('crypto').randomBytes(32).toString('base64')).join(','))"

# لـ API_TOKEN_SALT
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# لـ ADMIN_JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# لـ TRANSFER_TOKEN_SALT
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# لـ ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# لـ JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 6. إعداد قاعدة البيانات

بعد رفع المشروع، ستحتاج إلى:

1. **تشغيل migrations** (إذا لزم الأمر):
```bash
# في Vercel Functions أو عبر Vercel CLI
npx strapi db:migrate
```

2. **إنشاء admin user**:
```bash
# في Vercel Functions أو عبر Vercel CLI
npx strapi admin:create-user
```

### 7. اختبار المشروع

1. اذهب إلى URL المشروع على Vercel
2. تحقق من أن Strapi يعمل بشكل صحيح
3. اختبر رفع الصور على Cloudinary
4. اختبر API endpoints

### 8. إعدادات إضافية

#### إعدادات CORS
تم تحديث إعدادات CORS في `config/server.ts` لتشمل:
- `https://*.vercel.app`
- `https://*.vercel.com`

#### إعدادات الأمان
تم إعداد Content Security Policy للسماح بصور Cloudinary.

### 9. استكشاف الأخطاء

#### مشاكل شائعة:
1. **خطأ في قاعدة البيانات**: تأكد من صحة DATABASE_URL
2. **خطأ في Cloudinary**: تأكد من صحة مفاتيح Cloudinary
3. **خطأ في CORS**: تأكد من إعدادات CORS
4. **خطأ في المفاتيح**: تأكد من إنشاء مفاتيح آمنة

#### سجلات الأخطاء:
- اذهب إلى Vercel Dashboard > Functions
- افحص logs للعثور على الأخطاء

### 10. نصائح مهمة

1. **استخدم HTTPS دائماً** في الإنتاج
2. **احتفظ بنسخة احتياطية** من قاعدة البيانات
3. **راقب الأداء** عبر Vercel Analytics
4. **استخدم Environment Variables** لجميع البيانات الحساسة
5. **اختبر المشروع محلياً** قبل الرفع

### 11. تحديث المشروع

للتحديث:
```bash
# في المجلد المحلي
git add .
git commit -m "Update project"
git push

# Vercel سيقوم بالبناء والرفع تلقائياً
```

## الدعم

إذا واجهت مشاكل:
1. راجع سجلات Vercel
2. تأكد من صحة متغيرات البيئة
3. اختبر المشروع محلياً أولاً
4. راجع وثائق Strapi و Vercel

## روابط مفيدة
- [Vercel Documentation](https://vercel.com/docs)
- [Strapi Documentation](https://docs.strapi.io)
- [Neon Documentation](https://neon.tech/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
