// Vercel Serverless Function Entry Point
const { createStrapi } = require('@strapi/strapi');

let strapi;

module.exports = async (req, res) => {
  if (!strapi) {
    try {
      strapi = await createStrapi({
        distDir: './dist',
        appDir: './src',
      });
      await strapi.start();
    } catch (error) {
      console.error('Failed to start Strapi:', error);
      return res.status(500).json({ error: 'Failed to start Strapi' });
    }
  }

  // Handle the request
  try {
    await strapi.server.app(req, res);
  } catch (error) {
    console.error('Request handling error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
