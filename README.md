# قطرة — واجهة الويب

واجهة React لمنصة **قطرة** (تنسيق توزيع مياه الشرب على مخيمات غزة). تعمل مع الـ API: https://github.com/ (مستودع `qatra-backend`).

## التقنيات
React **19.3.1** • TypeScript • Vite • React Router • TanStack Query • Leaflet (OpenStreetMap). عربي RTL كامل.

## التشغيل محليًا
```bash
cp .env.example .env     # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev              # http://localhost:3000
```
الخادم (API) يجب أن يعمل، وأن يسمح بـ CORS للأصل `http://localhost:3000` (القيمة الافتراضية في `CORS_ORIGINS`).

## الأوامر
| الأمر | الوظيفة |
|---|---|
| `npm run dev` | تشغيل التطوير |
| `npm run build` | فحص الأنواع + بناء الإنتاج |
| `npm test` | اختبارات Vitest |
| `npm run lint` | فحص TypeScript |

## Docker
```bash
docker build -t qatra-web --build-arg VITE_API_URL=https://api.example.org/api .
docker run -p 8080:80 qatra-web          # أو: docker compose up --build
```
المتغيرات `VITE_*` تُدمج وقت البناء، فمرّر عنوان الـ API الصحيح كـ build arg.

## الهيكل
```
src/
  api/          عميل الـ API (تجديد الـ token تلقائيًا) والأنواع
  app/          الراوتر والـ providers
  components/   مكونات مشتركة (Button, Field, Pagination, Modal, DataTable ...)
  features/     auth • public • camp • org • admin • notifications (لكل ميزة صفحاتها ومساراتها)
  layouts/      القوالب: عام، مصادقة، لوحة التحكم
  lib/          التنسيق والتسميات
public/         اللوجو والأيقونات
```

## ملاحظات
- وجهة المستخدم بعد الدخول (`landing`) يحددها الخادم: `EMAIL_VERIFY | PENDING | REJECTED | DASHBOARD | SUSPENDED`، والواجهة تتبعها فقط. القيود الحقيقية تُفرض في الخادم.
- كل القوائم مرقّمة (10 عناصر لكل صفحة افتراضيًا).
- الإشعارات بالـ polling كل 3 دقائق (بدون WebSockets).
- الـ tokens في `localStorage`؛ الواجهة لا تعرض HTML خامًا لتقليل خطر XSS.
- CAPTCHA: عيّن `VITE_TURNSTILE_SITE_KEY` (Cloudflare Turnstile) ليظهر في التسجيل؛ بدونه لا يظهر (للتطوير).

## استراتيجية الفروع
`main` مستقر • `develop` للتكامل • `feature/*` فرع لكل ميزة يُدمج بـ PR (`--no-ff`).
