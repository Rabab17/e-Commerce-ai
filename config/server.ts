// export default ({ env }) => ({
//   host: env('HOST', '0.0.0.0'),
//   port: env.int('PORT', 1337),
//   app: {
//     keys: env.array('APP_KEYS'),
//   },
//   // إضافة إعدادات CORS للسماح بعرض الصور من Cloudinary
//   cors: {
//     enabled: true,
//     headers: '*',
//     origin: [
//       'http://localhost:1337', 
//       'http://localhost:3000', 
//       'https://res.cloudinary.com',
//       'https://*.vercel.app',
//       'https://*.vercel.com'
//     ]
//   },
//   // إعدادات الأمان للصور
//   security: {
//     contentSecurityPolicy: {
//       useDefaults: true,
//       directives: {
//         'img-src': ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
//         'media-src': ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
//       },
//     },
//   },
// });

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'https://e-commerce-ai-production.up.railway.app'),
  app: {
    keys: env.array('APP_KEYS'),
  },
  cors: {
    enabled: true,
    headers: '*',
    origin: [
      'http://localhost:1337',
      'http://localhost:3000',
      'https://res.cloudinary.com',
      'https://*.vercel.app',
      'https://*.vercel.com',
      'https://e-commerce-ai-production.up.railway.app',
    ],
  },
  security: {
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'img-src': ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
        'media-src': ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
      },
    },
  },
});
