/**
 * Custom validation service for Order
 */

interface OrderData {
  orderStatus?: string;
  paymentStatus?: string;
  totalAmount?: number;
  trackingNumber?: string;
  orderNumber?: string;
  items?: any[];
  address?: any;
}

export default {
  /**
   * Validate order data before creation/update
   */
  async validateOrderData(data: OrderData, action: 'create' | 'update' = 'create') {
    const errors: string[] = [];

    // Order status validation
    if (data.orderStatus !== undefined) {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(data.orderStatus)) {
        errors.push('Invalid order status');
      }
    }

    // Payment status validation
    if (data.paymentStatus !== undefined) {
      const validPaymentStatuses = ['complete', 'pending', 'paid', 'failed', 'refunded'];
      if (!validPaymentStatuses.includes(data.paymentStatus)) {
        errors.push('Invalid payment status');
      }
    }

    // Total amount validation
    if (data.totalAmount !== undefined) {
      if (data.totalAmount < 0.01) {
        errors.push('Total amount must be at least $0.01');
      }
      if (data.totalAmount > 999999.99) {
        errors.push('Total amount must not exceed $999,999.99');
      }
    }

    // Tracking number validation
    if (data.trackingNumber !== undefined && data.trackingNumber) {
      if (data.trackingNumber.length < 5) {
        errors.push('Tracking number must be at least 5 characters');
      }
      if (data.trackingNumber.length > 50) {
        errors.push('Tracking number must not exceed 50 characters');
      }
      // Check for valid tracking number format (alphanumeric)
      if (!/^[A-Z0-9]+$/i.test(data.trackingNumber)) {
        errors.push('Tracking number must contain only letters and numbers');
      }
    }

    // Order number validation
    if (data.orderNumber !== undefined) {
      if (!data.orderNumber || data.orderNumber.length < 8) {
        errors.push('Order number must be at least 8 characters');
      }
      if (data.orderNumber.length > 20) {
        errors.push('Order number must not exceed 20 characters');
      }
      // Check for valid order number format (alphanumeric with optional dashes)
      if (!/^[A-Z0-9-]+$/i.test(data.orderNumber)) {
        errors.push('Order number must contain only letters, numbers, and dashes');
      }
    }

    // Items validation
    if (data.items !== undefined) {
      if (!Array.isArray(data.items)) {
        errors.push('Items must be an array');
      } else {
        if (data.items.length === 0) {
          errors.push('Order must contain at least one item');
        }
        if (data.items.length > 50) {
          errors.push('Order cannot contain more than 50 items');
        }
        
        // Validate each item
        data.items.forEach((item, index) => {
          if (!item.quantity || item.quantity < 1) {
            errors.push(`Item ${index + 1}: Quantity must be at least 1`);
          }
          if (item.quantity > 999) {
            errors.push(`Item ${index + 1}: Quantity cannot exceed 999`);
          }
          if (!item.size) {
            errors.push(`Item ${index + 1}: Size is required`);
          }
        });
      }
    }

    // Business logic validation
    if (data.orderStatus === 'delivered' && !data.trackingNumber) {
      errors.push('Delivered orders must have a tracking number');
    }

    if (data.paymentStatus === 'paid' && data.orderStatus === 'pending') {
      errors.push('Paid orders cannot have pending status');
    }

    if (errors.length > 0) {
      throw new Error(`Order validation failed: ${errors.join(', ')}`);
    }

    return true;
  },

  /**
   * Generate unique order number
   */
  generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  },

  /**
   * Validate order workflow
   */
  async validateOrderWorkflow(currentStatus: string, newStatus: string) {
    const validTransitions: { [key: string]: string[] } = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [], // Final state
      'cancelled': [] // Final state
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    return true;
  },

  /**
   * Calculate order total from items
   */
  calculateOrderTotal(items: any[]): number {
    return items.reduce((total, item) => {
      const itemTotal = (item.price || 0) * (item.quantity || 0);
      return total + itemTotal;
    }, 0);
  },

  /**
   * Sanitize order data
   */
  sanitizeOrderData(data: OrderData): OrderData {
    const sanitized = { ...data };

    // Sanitize tracking number
    if (sanitized.trackingNumber) {
      sanitized.trackingNumber = sanitized.trackingNumber.trim().toUpperCase();
    }

    // Sanitize order number
    if (sanitized.orderNumber) {
      sanitized.orderNumber = sanitized.orderNumber.trim().toUpperCase();
    }

    // Round total amount
    if (sanitized.totalAmount) {
      sanitized.totalAmount = Math.round(sanitized.totalAmount * 100) / 100;
    }

    return sanitized;
  }
};
