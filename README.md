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

## عنوان الـ API (ملف `.env`)
كل الإعدادات تُقرأ من **ملف `.env` واحد**، بدون أي معاملات في الأمر:
```
VITE_API_URL=https://qatra-api.onrender.com/api
VITE_TURNSTILE_SITE_KEY=          # اختياري
```
- **التطوير:** `npm run dev` يقرأ `.env` تلقائيًا.
- **Docker:** القيمة **لا تُدمج في الصورة**؛ تُقرأ من بيئة الحاوية عند التشغيل، فنفس الصورة تعمل مع أي عنوان.
- **استضافة ثابتة (Render Static Site / Netlify / Vercel):** عرّف `VITE_API_URL` في إعدادات البيئة هناك ثم أعد البناء.
- ترتيب الأولوية: القيمة وقت التشغيل (Docker) ثم قيمة وقت البناء ثم `http://localhost:4000/api`.

## Docker
```bash
cp .env.example .env            # عدّل VITE_API_URL
docker build -t qatra-web .
docker run --env-file .env -p 8080:80 qatra-web
# أو ببساطة:
docker compose up --build       # يقرأ .env عبر env_file
```
لتغيير العنوان لاحقًا: عدّل `.env` وأعد تشغيل الحاوية فقط (بدون إعادة بناء).

## اللغات (عربي / English)
- زر **🌐** في الهيدر يبدّل بين العربية (RTL) والإنجليزية (LTR)، ويُحفظ الاختيار في المتصفح، وتتغير اتجاهات الصفحة والتواريخ والخط.
- الترجمة بدون مكتبات: `t('النص العربي')` من `src/i18n`، والنص العربي هو المفتاح، والإنجليزي في `src/i18n/en.ts`.
- **إضافة نص جديد:** اكتبه بالعربي داخل `t('...')` (مع `{0}` `{1}` للقيم المتغيرة) ثم أضف ترجمته في `en.ts`. اختبار `coverage.test.ts` يفشل إن نسيت.
- رسائل الأخطاء القادمة من الـ API بالعربية؛ المعروفة منها مترجمة في `en.ts`، وغيرها تظهر بالعربية إلى أن يدعم الـ API لغتين.
- أسماء المخيمات والجهات والأسباب التي يكتبها المستخدمون تبقى كما أُدخلت.

## الصور والأيقونات
- **صورة الصفحة الرئيسية:** ضعها في **`src/assets/images/hero.webp`** (بنفس الاسم وصيغة **WebP**، يُفضّل 1600×1000). تُبنى منها تلقائيًا نسخ 640/960/1280/1600 بالمكتبة `vite-imagetools` (sharp) بأسماء مُبصمة (hash) وكاش سنة، والمتصفح يختار الأنسب (`srcset`). التفاصيل في `src/assets/images/README.md`.
- **اللوجو:** `src/assets/images/logo.webp` (شفاف) ويُستورد من الكود.
- **الأيقونات** (تبقى في `public/` لأن أسماءها ثابتة): `favicon.svg` (متجهي، 5KB) + `favicon.ico` للمتصفحات القديمة + `apple-touch-icon.png` (180، خلفية بيضاء لأن iOS لا يدعم الشفافية) + `icon-192/512.png` + `icon-maskable-512.png` للتثبيت على الجوال (`manifest.webmanifest`).
- **الصور التي يرفعها المستخدمون** (إثباتات التسليم، شعارات المانحين): تُصغَّر وتُحوَّل إلى WebP في المتصفح قبل الرفع (`src/lib/imageUpload.ts`، توفيرًا للإنترنت الضعيف)، ثم يحوّلها الخادم مرة أخرى إلى WebP ويحذف بيانات EXIF ويحفظها في `public/uploads/` (راجع مستودع الـ API).
- nginx يُخدّم `/assets/` بكاش سنة (`immutable`) و`index.html` و`env-config.js` بدون كاش، مع ترويسات أمان أساسية.

## التحميل
لا توجد صفحة بيضاء في أي مرحلة: شاشة تحميل داخل `index.html` قبل تشغيل التطبيق، و`PageLoader` أثناء فحص الجلسة وتحميل الصفحات (كل صفحة تُحمَّل عند الحاجة)، وشريط تقدم علوي لأي طلب، وسبينر في الأزرار والقوائم.

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

## Deployment

Deployed on Vercel: [Visit Website](https://qatra-frontend.vercel.app/)

## ملاحظات
- وجهة المستخدم بعد الدخول (`landing`) يحددها الخادم: `EMAIL_VERIFY | PENDING | REJECTED | DASHBOARD | SUSPENDED`، والواجهة تتبعها فقط. القيود الحقيقية تُفرض في الخادم.
- كل القوائم مرقّمة (10 عناصر لكل صفحة افتراضيًا).
- الإشعارات بالـ polling كل 3 دقائق (بدون WebSockets).
- الـ tokens في `localStorage`؛ الواجهة لا تعرض HTML خامًا لتقليل خطر XSS.
- CAPTCHA: عيّن `VITE_TURNSTILE_SITE_KEY` (Cloudflare Turnstile) في `.env` ليظهر في التسجيل؛ بدونه لا يظهر (للتطوير).

## استراتيجية الفروع
`main` مستقر • `develop` للتكامل • `feature/*` فرع لكل ميزة يُدمج بـ PR (`--no-ff`).
