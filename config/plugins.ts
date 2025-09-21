module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {
          folder: 'ecommerce-ai',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          resource_type: 'auto',
        },
        delete: {},
      },
    },
  },
  'documentation': {
    enabled: true,
    config: {
      info: {
        version: '1.0.0',
        title: 'Strapi API Documentation',
        description: 'API documentation for my E-commerce project',
      },
      servers: [
        {
          url: 'http://localhost:1337/api',
          description: 'Local server',
        },
      ],
      openapi: '3.0.0',
    },

    
  },
});
