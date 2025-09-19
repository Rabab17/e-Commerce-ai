/**
 * Custom Error Handling Middleware
 */

import { Core } from '@strapi/strapi';
import { ErrorHandler, AppError, ErrorResponse } from '../utils/errors';

export default (config: any, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    try {
      await next();
    } catch (error) {
      // Log error for debugging
      strapi.log.error('Error caught by middleware:', {
        error: error.message,
        stack: error.stack,
        url: ctx.url,
        method: ctx.method,
        user: ctx.state.user?.id,
        timestamp: new Date().toISOString()
      });

      // Generate request ID for tracking
      const requestId = generateRequestId();

      // Handle the error and get formatted response
      const errorResponse = ErrorHandler.handle(error);

      // Add request context to error response
      errorResponse.requestId = requestId;
      errorResponse.path = ctx.url;

      // Set appropriate HTTP status code
      ctx.status = errorResponse.statusCode;

      // Set response body
      ctx.body = errorResponse;

      // Add error tracking headers
      ctx.set('X-Request-ID', requestId);
      ctx.set('X-Error-Code', errorResponse.errorCode);

      // Send error to monitoring service in production
      if (process.env.NODE_ENV === 'production') {
        await sendErrorToMonitoring(error, ctx, requestId);
      }
    }
  };
};

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Send error to monitoring service
 */
async function sendErrorToMonitoring(error: any, ctx: any, requestId: string) {
  try {
    // This would integrate with your monitoring service (e.g., Sentry, DataDog, etc.)
    const errorData = {
      requestId,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context: {
        url: ctx.url,
        method: ctx.method,
        userAgent: ctx.get('User-Agent'),
        ip: ctx.ip,
        user: ctx.state.user?.id
      },
      timestamp: new Date().toISOString()
    };

    // Example: Send to external monitoring service
    // await fetch('https://your-monitoring-service.com/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData)
    // });

    console.log('Error sent to monitoring:', errorData);
  } catch (monitoringError) {
    console.error('Failed to send error to monitoring:', monitoringError);
  }
}
