export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  // إضافة إعدادات CORS للسماح بعرض الصور من Cloudinary
  cors: {
    enabled: true,
    headers: '*',
    origin: [
      'http://localhost:1337', 
      'http://localhost:3000', 
      'https://res.cloudinary.com',
      'https://*.vercel.app',
      'https://*.vercel.com'
    ]
  },
  // إعدادات الأمان للصور
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
