/**
 * Custom validation service for Cart
 */

interface CartData {
  sessionId?: string;
  items?: any[];
  users_permissions_user?: any;
}

export default {
  /**
   * Validate cart data before creation/update
   */
  async validateCartData(data: CartData, action: 'create' | 'update' = 'create') {
    const errors: string[] = [];

    // Session ID validation
    if (data.sessionId !== undefined) {
      if (!data.sessionId || data.sessionId.length < 10) {
        errors.push('Session ID must be at least 10 characters');
      }
      if (data.sessionId.length > 100) {
        errors.push('Session ID must not exceed 100 characters');
      }
      // Check for valid session ID format (alphanumeric with optional dashes)
      if (!/^[A-Z0-9-]+$/i.test(data.sessionId)) {
        errors.push('Session ID must contain only letters, numbers, and dashes');
      }
    }

    // Items validation
    if (data.items !== undefined) {
      if (!Array.isArray(data.items)) {
        errors.push('Items must be an array');
      } else {
        if (data.items.length > 20) {
          errors.push('Cart cannot contain more than 20 items');
        }
        
        // Validate each cart item
        data.items.forEach((item, index) => {
          if (!item.quantity || item.quantity < 1) {
            errors.push(`Item ${index + 1}: Quantity must be at least 1`);
          }
          if (item.quantity > 99) {
            errors.push(`Item ${index + 1}: Quantity cannot exceed 99`);
          }
          if (!item.size) {
            errors.push(`Item ${index + 1}: Size is required`);
          }
          if (item.size && !['XXXL', 'XXL', 'XL', 'L', 'S', 'XS'].includes(item.size)) {
            errors.push(`Item ${index + 1}: Invalid size`);
          }
          if (!item.color || item.color.trim().length < 2) {
            errors.push(`Item ${index + 1}: Color must be at least 2 characters`);
          }
        });
      }
    }

    // Business logic validation
    if (data.items && data.items.length > 0) {
      // Check for duplicate items (same product, size, color)
      const itemKeys = data.items.map(item => 
        `${item.product?.id || item.product}-${item.size}-${item.color}`
      );
      const uniqueKeys = new Set(itemKeys);
      if (uniqueKeys.size !== itemKeys.length) {
        errors.push('Cart contains duplicate items');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Cart validation failed: ${errors.join(', ')}`);
    }

    return true;
  },

  /**
   * Generate unique session ID
   */
  generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 8);
    return `CART-${timestamp}-${random}`.toUpperCase();
  },

  /**
   * Calculate cart total
   */
  calculateCartTotal(items: any[]): number {
    return items.reduce((total, item) => {
      const itemPrice = item.product?.price || 0;
      const itemTotal = itemPrice * (item.quantity || 0);
      return total + itemTotal;
    }, 0);
  },

  /**
   * Validate cart item addition
   */
  async validateCartItemAddition(cartItems: any[], newItem: any) {
    const errors: string[] = [];

    // Check if cart is full
    if (cartItems.length >= 20) {
      errors.push('Cart is full (maximum 20 items)');
    }

    // Check if item already exists
    const existingItem = cartItems.find(item => 
      item.product?.id === newItem.product?.id && 
      item.size === newItem.size && 
      item.color === newItem.color
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + newItem.quantity;
      if (newQuantity > 99) {
        errors.push('Total quantity for this item cannot exceed 99');
      }
    }

    // Check individual item quantity
    if (newItem.quantity > 99) {
      errors.push('Item quantity cannot exceed 99');
    }

    if (errors.length > 0) {
      throw new Error(`Cart item validation failed: ${errors.join(', ')}`);
    }

    return true;
  },

  /**
   * Sanitize cart data
   */
  sanitizeCartData(data: CartData): CartData {
    const sanitized = { ...data };

    // Sanitize session ID
    if (sanitized.sessionId) {
      sanitized.sessionId = sanitized.sessionId.trim().toUpperCase();
    }

    // Sanitize items
    if (sanitized.items && Array.isArray(sanitized.items)) {
      sanitized.items = sanitized.items.map(item => ({
        ...item,
        color: item.color?.trim(),
        quantity: Math.floor(item.quantity || 1)
      }));
    }

    return sanitized;
  },

  /**
   * Merge cart items (for user login)
   */
  mergeCartItems(existingItems: any[], newItems: any[]): any[] {
    const mergedItems = [...existingItems];
    
    newItems.forEach(newItem => {
      const existingIndex = mergedItems.findIndex(item => 
        item.product?.id === newItem.product?.id && 
        item.size === newItem.size && 
        item.color === newItem.color
      );

      if (existingIndex >= 0) {
        // Merge quantities
        mergedItems[existingIndex].quantity += newItem.quantity;
        // Cap at 99
        if (mergedItems[existingIndex].quantity > 99) {
          mergedItems[existingIndex].quantity = 99;
        }
      } else {
        // Add new item
        mergedItems.push(newItem);
      }
    });

    return mergedItems;
  }
};
