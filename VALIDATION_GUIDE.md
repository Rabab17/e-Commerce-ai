# 🔧 Custom Validation Implementation Guide

## Overview

This guide documents the comprehensive custom validation system implemented for your Strapi e-commerce project. The validation system includes schema-level validation, custom service validation, middleware validation, and utility functions.

## 📋 Validation Components

### 1. **Schema-Level Validation**

Enhanced all content type schemas with validation rules:

#### **Product Schema** (`src/api/product/content-types/product/schema.json`)
```json
{
  "title": {
    "type": "string",
    "required": true,
    "minLength": 3,
    "maxLength": 100
  },
  "price": {
    "type": "decimal",
    "required": true,
    "min": 0.01,
    "max": 999999.99
  },
  "stock": {
    "type": "integer",
    "required": true,
    "min": 0,
    "max": 99999
  }
}
```

#### **Order Schema** (`src/api/order/content-types/order/schema.json`)
```json
{
  "orderNumber": {
    "type": "string",
    "required": true,
    "minLength": 8,
    "maxLength": 20,
    "unique": true
  },
  "totalAmount": {
    "type": "decimal",
    "required": true,
    "min": 0.01,
    "max": 999999.99
  }
}
```

#### **Cart Schema** (`src/api/cart/content-types/cart/schema.json`)
```json
{
  "sessionId": {
    "type": "string",
    "required": true,
    "minLength": 10,
    "maxLength": 100
  }
}
```

#### **Address Schema** (`src/api/address/content-types/address/schema.json`)
```json
{
  "street": {
    "type": "text",
    "required": true,
    "minLength": 5,
    "maxLength": 200
  },
  "postalCode": {
    "type": "string",
    "required": true,
    "minLength": 5,
    "maxLength": 10
  }
}
```

#### **Review Schema** (`src/api/review/content-types/review/schema.json`)
```json
{
  "rating": {
    "type": "integer",
    "required": true,
    "min": 1,
    "max": 5
  },
  "comment": {
    "type": "string",
    "minLength": 10,
    "maxLength": 1000
  }
}
```

### 2. **Custom Service Validation**

#### **Product Validation Service** (`src/api/product/services/validation.ts`)

**Features:**
- ✅ Data validation before create/update
- ✅ Business rule validation
- ✅ Data sanitization
- ✅ AI field validation
- ✅ Price and discount validation

**Usage:**
```typescript
import validationService from './validation';

// Validate product data
await validationService.validateProductData(data, 'create');

// Check business rules
const warnings = await validationService.validateBusinessRules(data);

// Sanitize data
const sanitizedData = validationService.sanitizeProductData(data);
```

#### **Order Validation Service** (`src/api/order/services/validation.ts`)

**Features:**
- ✅ Order status workflow validation
- ✅ Payment status validation
- ✅ Order number generation
- ✅ Business logic validation
- ✅ Total amount calculation

**Usage:**
```typescript
import validationService from './validation';

// Validate order data
await validationService.validateOrderData(data, 'create');

// Generate order number
const orderNumber = validationService.generateOrderNumber();

// Validate workflow
await validationService.validateOrderWorkflow('pending', 'confirmed');
```

#### **Cart Validation Service** (`src/api/cart/services/validation.ts`)

**Features:**
- ✅ Cart item validation
- ✅ Duplicate item detection
- ✅ Quantity limits
- ✅ Session ID generation
- ✅ Cart merging logic

**Usage:**
```typescript
import validationService from './validation';

// Validate cart data
await validationService.validateCartData(data, 'create');

// Generate session ID
const sessionId = validationService.generateSessionId();

// Merge cart items
const mergedItems = validationService.mergeCartItems(existingItems, newItems);
```

### 3. **Enhanced Service Implementation**

#### **Product Service** (`src/api/product/services/product.ts`)

**Enhanced Features:**
- ✅ Automatic validation on create/update
- ✅ Data sanitization
- ✅ Business rule warnings
- ✅ Computed fields (discounted price)
- ✅ Published products filtering

**Usage:**
```typescript
// Create product with validation
const product = await strapi.service('api::product.product').create({
  data: {
    title: 'Test Product',
    price: 99.99,
    stock: 10
  }
});

// Update product with validation
const updatedProduct = await strapi.service('api::product.product').update(1, {
  data: { stock: 5 }
});
```

### 4. **Custom Validation Middleware**

#### **Global Validation Middleware** (`src/middlewares/validation.ts`)

**Features:**
- ✅ Email validation
- ✅ Phone number validation
- ✅ URL validation
- ✅ Postal code validation
- ✅ Credit card validation
- ✅ Password strength validation
- ✅ HTML sanitization
- ✅ File type/size validation

**Usage:**
```typescript
// In your controller
ctx.validateRequest({
  email: { type: 'email', required: true },
  phone: { type: 'phone', required: true },
  password: { minLength: 8, maxLength: 50 }
});

// Use validation helpers
if (ctx.validate.email(userEmail)) {
  // Valid email
}
```

**TypeScript Support:**
```typescript
// Type definitions for validation rules
interface ValidationRule {
  required?: boolean;
  type?: 'email' | 'phone' | 'url';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}
```

### 5. **Global Validation Utilities**

#### **Validation Utils** (`src/utils/validation.ts`)

**Features:**
- ✅ ValidationError class
- ✅ Common validation methods
- ✅ E-commerce specific rules
- ✅ Data sanitization utilities

**Usage:**
```typescript
import { ValidationUtils, EcommerceValidationRules } from '../utils/validation';

// Validate required fields
ValidationUtils.validateRequired(data, ['title', 'price']);

// Validate string length
ValidationUtils.validateStringLength(title, 3, 100, 'title');

// Validate number range
ValidationUtils.validateNumberRange(price, 0.01, 999999.99, 'price');

// Use predefined rules
const productRules = EcommerceValidationRules.product;
```

## 🚀 Implementation Benefits

### **1. Data Integrity**
- ✅ Prevents invalid data entry
- ✅ Ensures data consistency
- ✅ Validates business rules

### **2. Security**
- ✅ Input sanitization
- ✅ XSS prevention
- ✅ SQL injection protection

### **3. User Experience**
- ✅ Clear error messages
- ✅ Real-time validation
- ✅ Consistent validation rules

### **4. Developer Experience**
- ✅ Reusable validation functions
- ✅ Centralized validation logic
- ✅ Easy to maintain and extend

## 📝 Usage Examples

### **Creating a Product with Validation**
```typescript
// POST /api/products
{
  "data": {
    "title": "Amazing Product",
    "description": "This is an amazing product with great features",
    "price": 99.99,
    "discount": 10,
    "stock": 50,
    "sizes": "l",
    "gender": "unisex",
    "images": [1, 2, 3]
  }
}
```

### **Creating an Order with Validation**
```typescript
// POST /api/orders
{
  "data": {
    "orderNumber": "ORD-12345678",
    "totalAmount": 199.98,
    "orderStatus": "pending",
    "paymentStatus": "pending",
    "items": [
      {
        "quantity": 2,
        "size": "L",
        "color": "Blue"
      }
    ]
  }
}
```

### **Adding Items to Cart with Validation**
```typescript
// POST /api/carts
{
  "data": {
    "sessionId": "CART-ABC123",
    "items": [
      {
        "quantity": 1,
        "size": "M",
        "color": "Red"
      }
    ]
  }
}
```

## 🔧 Configuration

### **Middleware Configuration** (`config/middlewares.ts`)
```typescript
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
  {
    name: 'global::validation',
    config: {
      // Global validation settings
    },
  },
];
```

## 🎯 Best Practices

### **1. Validation Order**
1. Schema validation (automatic)
2. Custom service validation
3. Business rule validation
4. Data sanitization

### **2. Error Handling**
- Use descriptive error messages
- Include field names in errors
- Log validation warnings
- Return appropriate HTTP status codes

### **3. Performance**
- Validate early in the request cycle
- Cache validation results when possible
- Use efficient validation algorithms

### **4. Security**
- Always sanitize user input
- Validate file uploads
- Prevent XSS attacks
- Validate file types and sizes

## 🚨 Common Validation Scenarios

### **Product Validation**
- ✅ Title: 3-100 characters
- ✅ Price: $0.01 - $999,999.99
- ✅ Stock: 0-99,999 units
- ✅ Discount: 0-100%
- ✅ Images: 1-10 images per product

### **Order Validation**
- ✅ Order number: 8-20 characters, unique
- ✅ Total amount: $0.01 - $999,999.99
- ✅ Status transitions: pending → confirmed → processing → shipped → delivered
- ✅ Items: 1-50 items per order

### **Cart Validation**
- ✅ Session ID: 10-100 characters
- ✅ Items: 1-20 items per cart
- ✅ Quantity: 1-99 per item
- ✅ No duplicate items (same product, size, color)

### **Address Validation**
- ✅ Street: 5-200 characters
- ✅ City: 2-100 characters
- ✅ Postal code: 5-10 characters
- ✅ Country: 2-50 characters

### **Review Validation**
- ✅ Rating: 1-5 stars
- ✅ Comment: 10-1000 characters
- ✅ User must be authenticated

## 🔄 Extending Validation

### **Adding New Validation Rules**
1. Update schema with validation rules
2. Add custom validation logic to service
3. Update validation utilities if needed
4. Test validation thoroughly

### **Custom Business Rules**
```typescript
// Add to validation service
const customRules = [
  {
    condition: (data) => data.price < 10 && data.discount > 50,
    message: 'High discount on low-priced item detected'
  }
];

const warnings = ValidationUtils.validateBusinessRules(data, customRules);
```

## 📊 Monitoring and Logging

### **Validation Logging**
- ✅ Log validation errors
- ✅ Log business rule warnings
- ✅ Monitor validation performance
- ✅ Track validation failure rates

### **Error Tracking**
```typescript
// In validation service
if (errors.length > 0) {
  strapi.log.error('Validation failed:', { errors, data });
  throw new Error(`Validation failed: ${errors.join(', ')}`);
}
```

## 🎉 Conclusion

Your Strapi e-commerce project now has a comprehensive validation system that ensures:

- **Data Integrity**: All data is validated before storage
- **Security**: Input sanitization and XSS prevention
- **User Experience**: Clear error messages and validation feedback
- **Developer Experience**: Reusable validation utilities and clear documentation

The validation system is modular, extensible, and follows Strapi best practices. You can easily add new validation rules or modify existing ones as your business requirements evolve.
