export default [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'res.cloudinary.com',
            'https://res.cloudinary.com',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'res.cloudinary.com',
            'https://res.cloudinary.com',
          ],
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  // Cloudinary image fix middleware
  {
    name: 'global::cloudinary-fix',
    config: {
      // Cloudinary image display fix settings
    },
  },
  // Custom validation middleware
  {
    name: 'global::validation',
    config: {
      // Global validation settings
    },
  },
  // Custom error handling middleware
  {
    name: 'global::validation-error-handler',
    config: {
      // Validation error handler settings
    },
  },
  {
    name: 'global::error-handler',
    config: {
      // Error handler settings
    },
  },
];