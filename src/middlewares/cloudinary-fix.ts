/**
 * Cloudinary Image Display Fix Middleware
 * إصلاح مشكلة عرض صور Cloudinary في Strapi Admin Panel
 */

export default (config, { strapi }) => {
  return async (ctx, next) => {
    await next();

    // إصلاح URLs الصور في استجابات Media Library
    if (ctx.url.includes('/upload/files') && ctx.body && ctx.body.data) {
      if (Array.isArray(ctx.body.data)) {
        ctx.body.data = ctx.body.data.map(file => {
          if (file.url && file.url.includes('cloudinary.com')) {
            // إضافة معاملات لضمان عرض الصور
            const url = new URL(file.url);
            url.searchParams.set('_t', Date.now().toString()); // cache busting
            file.url = url.toString();
            
            // إضافة URLs بديلة
            file.formats = file.formats || {};
            if (file.formats.thumbnail) {
              const thumbUrl = new URL(file.formats.thumbnail.url);
              thumbUrl.searchParams.set('_t', Date.now().toString());
              file.formats.thumbnail.url = thumbUrl.toString();
            }
          }
          return file;
        });
      } else if (ctx.body.data.url && ctx.body.data.url.includes('cloudinary.com')) {
        const url = new URL(ctx.body.data.url);
        url.searchParams.set('_t', Date.now().toString());
        ctx.body.data.url = url.toString();
      }
    }

    // إصلاح URLs الصور في استجابات Content Types
    if (ctx.body && ctx.body.data) {
      const fixImageUrls = (obj) => {
        if (Array.isArray(obj)) {
          return obj.map(fixImageUrls);
        } else if (obj && typeof obj === 'object') {
          const fixed = { ...obj };
          for (const key in fixed) {
            if (key === 'url' && typeof fixed[key] === 'string' && fixed[key].includes('cloudinary.com')) {
              const url = new URL(fixed[key]);
              url.searchParams.set('_t', Date.now().toString());
              fixed[key] = url.toString();
            } else if (key === 'images' || key === 'image' || key === 'media') {
              fixed[key] = fixImageUrls(fixed[key]);
            } else if (typeof fixed[key] === 'object') {
              fixed[key] = fixImageUrls(fixed[key]);
            }
          }
          return fixed;
        }
        return obj;
      };

      ctx.body.data = fixImageUrls(ctx.body.data);
    }
  };
};
