/**
 * Image Processing Utilities for Cloudinary Integration
 * معالجة وتحسين الصور مع Cloudinary
 */

export interface ImageTransformation {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
  format?: string;
  gravity?: string;
  radius?: number;
  effect?: string;
}

export interface ProcessedImage {
  id: number;
  url: string;
  thumbnail: string;
  medium: string;
  large: string;
  formats: {
    thumbnail?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
  };
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  size: number;
  mime: string;
  ext: string;
  hash: string;
  provider: string;
  provider_metadata?: any;
}

/**
 * Process images for different sizes and formats
 * معالجة الصور لأحجام وتنسيقات مختلفة
 */
export class ImageProcessor {
  private static cloudinaryBaseUrl = 'https://res.cloudinary.com';

  /**
   * Generate Cloudinary URL with transformations
   * إنشاء رابط Cloudinary مع التحويلات
   */
  static generateCloudinaryUrl(
    publicId: string,
    cloudName: string,
    transformations: ImageTransformation = {}
  ): string {
    const {
      width = 'auto',
      height = 'auto',
      crop = 'limit',
      quality = 'auto:good',
      format = 'auto',
      gravity = 'auto',
      radius,
      effect
    } = transformations;

    let transformationString = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;
    
    if (gravity) transformationString += `,g_${gravity}`;
    if (radius) transformationString += `,r_${radius}`;
    if (effect) transformationString += `,e_${effect}`;

    return `${this.cloudinaryBaseUrl}/${cloudName}/image/upload/${transformationString}/${publicId}`;
  }

  /**
   * Process single image with multiple formats
   * معالجة صورة واحدة بتنسيقات متعددة
   */
  static processImage(image: any, cloudName: string | null): ProcessedImage {
    if (!image || !image.url) {
      throw new Error('Invalid image data provided');
    }

    if (!cloudName) {
      // If no cloudName provided, return original image data
      return {
        ...image,
        thumbnail: image.url,
        medium: image.url,
        large: image.url,
        formats: {
          thumbnail: { url: image.url, width: 150, height: 150 },
          small: { url: image.url, width: 300, height: 300 },
          medium: { url: image.url, width: 600, height: 600 },
          large: { url: image.url, width: 1200, height: 1200 }
        }
      };
    }

    // Extract public ID from Cloudinary URL
    const publicId = this.extractPublicId(image.url);
    
    if (!publicId) {
      // If not a Cloudinary URL, return original
      return {
        ...image,
        thumbnail: image.url,
        medium: image.url,
        large: image.url,
        formats: {
          thumbnail: { url: image.url, width: 150, height: 150 },
          small: { url: image.url, width: 300, height: 300 },
          medium: { url: image.url, width: 600, height: 600 },
          large: { url: image.url, width: 1200, height: 1200 }
        }
      };
    }

    // Generate different sizes
    const thumbnail = this.generateCloudinaryUrl(publicId, cloudName, {
      width: 150,
      height: 150,
      crop: 'fill',
      quality: 'auto:good'
    });

    const small = this.generateCloudinaryUrl(publicId, cloudName, {
      width: 300,
      height: 300,
      crop: 'limit',
      quality: 'auto:good'
    });

    const medium = this.generateCloudinaryUrl(publicId, cloudName, {
      width: 600,
      height: 600,
      crop: 'limit',
      quality: 'auto:good'
    });

    const large = this.generateCloudinaryUrl(publicId, cloudName, {
      width: 1200,
      height: 1200,
      crop: 'limit',
      quality: 'auto:good'
    });

    return {
      ...image,
      thumbnail,
      medium,
      large,
      formats: {
        thumbnail: { url: thumbnail, width: 150, height: 150 },
        small: { url: small, width: 300, height: 300 },
        medium: { url: medium, width: 600, height: 600 },
        large: { url: large, width: 1200, height: 1200 }
      }
    };
  }

  /**
   * Process multiple images
   * معالجة عدة صور
   */
  static processImages(images: any[], cloudName: string | null): ProcessedImage[] {
    if (!Array.isArray(images)) {
      return [];
    }

    return images.map(image => this.processImage(image, cloudName));
  }

  /**
   * Extract public ID from Cloudinary URL
   * استخراج معرف الصورة من رابط Cloudinary
   */
  private static extractPublicId(url: string): string | null {
    if (!url || typeof url !== 'string') {
      return null;
    }

    // Match Cloudinary URL pattern
    const cloudinaryPattern = /cloudinary\.com\/[^\/]+\/image\/upload\/(?:[^\/]+\/)?(.+?)(?:\.[^.]+)?$/;
    const match = url.match(cloudinaryPattern);
    
    return match ? match[1] : null;
  }

  /**
   * Generate optimized image URL for specific use case
   * إنشاء رابط صورة محسن لاستخدام محدد
   */
  static getOptimizedImageUrl(
    image: any,
    cloudName: string | null,
    useCase: 'thumbnail' | 'card' | 'hero' | 'gallery' = 'card'
  ): string {
    if (!cloudName) {
      return image?.url || '';
    }

    const publicId = this.extractPublicId(image?.url);
    
    if (!publicId) {
      return image?.url || '';
    }

    const transformations: Record<string, ImageTransformation> = {
      thumbnail: {
        width: 150,
        height: 150,
        crop: 'fill',
        quality: 'auto:good',
        format: 'auto'
      },
      card: {
        width: 400,
        height: 400,
        crop: 'limit',
        quality: 'auto:good',
        format: 'auto'
      },
      hero: {
        width: 1200,
        height: 600,
        crop: 'fill',
        quality: 'auto:good',
        format: 'auto',
        gravity: 'auto'
      },
      gallery: {
        width: 800,
        height: 800,
        crop: 'limit',
        quality: 'auto:good',
        format: 'auto'
      }
    };

    return this.generateCloudinaryUrl(publicId, cloudName, transformations[useCase]);
  }

  /**
   * Validate Cloudinary configuration
   * التحقق من إعدادات Cloudinary
   */
  static validateCloudinaryConfig(cloudName: string): boolean {
    return !!(cloudName && cloudName.length > 0);
  }
}

/**
 * Middleware to process images in API responses
 * وسيط لمعالجة الصور في استجابات API
 */
export const imageProcessingMiddleware = (cloudName: string) => {
  return (data: any) => {
    if (!data) return data;

    // Process single product
    if (data.attributes && data.attributes.images) {
      data.attributes.images = ImageProcessor.processImages(
        data.attributes.images,
        cloudName
      );
    }

    // Process multiple products
    if (Array.isArray(data) && data.length > 0) {
      data.forEach((item: any) => {
        if (item.attributes && item.attributes.images) {
          item.attributes.images = ImageProcessor.processImages(
            item.attributes.images,
            cloudName
          );
        }
      });
    }

    // Process data array (Strapi format)
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((item: any) => {
        if (item.attributes && item.attributes.images) {
          item.attributes.images = ImageProcessor.processImages(
            item.attributes.images,
            cloudName
          );
        }
      });
    }

    return data;
  };
};
