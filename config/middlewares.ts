export default [
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
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