# 🔧 Error Handling Guide

## 📋 Overview

This guide documents the comprehensive error handling system implemented in your Strapi e-commerce project. The system provides meaningful error messages, proper HTTP status codes, and helpful suggestions for developers and users.

---

## 🎯 **Error Handling Features**

### **✅ What's Implemented**
- ✅ Custom error classes for different error types
- ✅ Structured error responses with helpful details
- ✅ Request ID tracking for debugging
- ✅ Validation error parsing and suggestions
- ✅ Database error handling
- ✅ Authentication and authorization error handling
- ✅ Business logic error handling
- ✅ Error logging and monitoring integration
- ✅ Development vs production error details

---

## 🏗️ **Error Architecture**

### **Error Classes Hierarchy**
```
AppError (Base Class)
├── ValidationError (400)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── NotFoundError (404)
├── ConflictError (409)
├── RateLimitError (429)
├── BusinessLogicError (422)
├── DatabaseError (500)
└── ExternalServiceError (502)
```

### **Error Response Structure**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {
      "field": "specific error details"
    },
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_1642234567_abc123def",
    "path": "/api/products",
    "method": "POST"
  },
  "meta": {
    "suggestions": [
      "Helpful suggestion 1",
      "Helpful suggestion 2"
    ],
    "documentation": "/docs/error-codes"
  }
}
```

---

## 🔍 **Error Types & Examples**

### **1. Validation Errors (400)**

#### **Example: Missing Required Field**
```http
POST /api/products
{
  "data": {
    "description": "Valid description",
    "price": 29.99,
    "stock": 10
  }
}
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "title": [
        {
          "message": "Title is required",
          "code": "REQUIRED_FIELD",
          "value": null
        }
      ]
    },
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_1642234567_abc123def",
    "path": "/api/products",
    "method": "POST"
  },
  "meta": {
    "suggestions": [
      "Title must be 3-100 characters long"
    ],
    "documentation": "/docs/validation"
  }
}
```

#### **Example: Invalid Field Value**
```http
POST /api/products
{
  "data": {
    "title": "AB",
    "description": "Valid description",
    "price": -10,
    "stock": 10
  }
}
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "title": [
        {
          "message": "Title must be at least 3 characters long",
          "code": "MIN_LENGTH",
          "value": "AB"
        }
      ],
      "price": [
        {
          "message": "Price must be at least $0.01",
          "code": "MIN_VALUE",
          "value": -10
        }
      ]
    },
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_1642234567_abc123def",
    "path": "/api/products",
    "method": "POST"
  },
  "meta": {
    "suggestions": [
      "Title must be 3-100 characters long",
      "Price must be between $0.01 and $999,999.99"
    ],
    "documentation": "/docs/validation"
  }
}
```

### **2. Authentication Errors (401)**

#### **Example: Missing Token**
```http
POST /api/products
{
  "data": {
    "title": "Test Product",
    "description": "Valid description",
    "price": 29.99,
    "stock": 10
  }
}
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Authentication required to create products",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_1642234567_abc123def",
    "path": "/api/products",
    "method": "POST"
  },
  "meta": {
    "suggestions": [
      "Check your credentials",
      "Verify your token is valid",
      "Try logging in again"
    ],
    "documentation": "/docs/authentication"
  }
}
```

#### **Example: Invalid Token**
```http
POST /api/products
Authorization: Bearer invalid-token
{
  "data": {
    "title": "Test Product",
    "description": "Valid description",
    "price": 29.99,
    "stock": 10
  }
}
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid or expired token",
    "details": {
      "jwtError": "jwt malformed"
    },
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_1642234567_abc123def",
    "path": "/api/products",
    "method": "POST"
  },
  "meta": {
    "suggestions": [
      "Check if your token is valid",
      "Try logging in again",
      "Verify token expiration"
    ],
    "documentation": "/docs/authentication"
  }
}
```

### **3. Authorization Errors (403)**

#### **Example: Insufficient Permissions**
```http
POST /api/products
Authorization: Bearer valid-token-for-limited-user
{
  "data": {
    "title": "Test Product",
    "description": "Valid description",
    "price": 29.99,
    "stock": 10
  }
}
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "Insufficient permissions to create products",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_1642234567_abc123def",
    "path": "/api/products",
    "method": "POST"
  },
  "meta": {
    "suggestions": [
      "Check your permissions",
      "Verify your user role",
      "Contact administrator"
    ],
    "documentation": "/docs/authentication"
  }
}
```

### **4. Not Found Errors (404)**

#### **Example: Product Not Found**
```http
GET /api/products/99999
Authorization: Bearer valid-token
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND_ERROR",
    "message": "Resource not found",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_1642234567_abc123def",
    "path": "/api/products/99999",
    "method": "GET"
  },
  "meta": {
    "suggestions": [
      "Check if the resource ID is correct",
      "Verify the resource exists",
      "Check if you have access to this resource"
    ],
    "documentation": "/docs/api-reference"
  }
}
```

### **5. Business Logic Errors (422)**

#### **Example: Invalid Business Rule**
```http
POST /api/products
Authorization: Bearer valid-token
{
  "data": {
    "title": "Test Product",
    "description": "Valid description",
    "price": 1.00,
    "stock": 10,
    "discount": 99
  }
}
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_LOGIC_ERROR",
    "message": "Discounted price cannot be less than $0.01",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_1642234567_abc123def",
    "path": "/api/products",
    "method": "POST"
  },
  "meta": {
    "suggestions": [
      "Check business rules",
      "Verify data constraints",
      "Review operation requirements"
    ],
    "documentation": "/docs/error-codes"
  }
}
```

### **6. Database Errors (500)**

#### **Example: Duplicate Entry**
```http
POST /api/products
Authorization: Bearer valid-token
{
  "data": {
    "title": "Existing Product Title",
    "description": "Valid description",
    "price": 29.99,
    "stock": 10
  }
}
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Database operation failed",
    "details": {
      "code": "ER_DUP_ENTRY",
      "sqlMessage": "Duplicate entry 'existing-product-title' for key 'title'"
    },
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_1642234567_abc123def",
    "path": "/api/products",
    "method": "POST"
  },
  "meta": {
    "suggestions": [
      "The record already exists",
      "Check for duplicate data",
      "Use unique identifiers"
    ],
    "documentation": "/docs/database"
  }
}
```

---

## 🛠️ **Using Custom Errors in Your Code**

### **In Controllers**
```typescript
import { ValidationError, AuthenticationError, AuthorizationError } from '../utils/errors';

export default {
  async create(ctx) {
    // Check authentication
    if (!ctx.state.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Check permissions
    if (!hasPermission(ctx.state.user, 'create_product')) {
      throw new AuthorizationError('Insufficient permissions');
    }

    // Validate data
    if (!ctx.request.body.data) {
      throw new ValidationError('Request data is required', {
        field: 'data',
        message: 'Request body must contain data object'
      });
    }

    // Continue with business logic...
  }
};
```

### **In Services**
```typescript
import { ValidationError, DatabaseError, BusinessLogicError } from '../utils/errors';

export default {
  async create(params) {
    try {
      // Validate data
      if (!params.data.title) {
        throw new ValidationError('Title is required', {
          field: 'title',
          message: 'Product title must be provided'
        });
      }

      // Database operation
      const result = await strapi.query('api::product.product').create(params);
      return result;
    } catch (error) {
      // Handle database errors
      if (error.code && error.code.startsWith('ER_')) {
        throw new DatabaseError('Failed to create product', {
          databaseError: error.code,
          message: error.sqlMessage
        });
      }

      // Re-throw custom errors
      if (error instanceof ValidationError) {
        throw error;
      }

      // Handle other errors
      throw new BusinessLogicError('Failed to create product', {
        originalError: error.message
      });
    }
  }
};
```

---

## 📊 **Error Monitoring & Logging**

### **Error Logging**
All errors are automatically logged with:
- Error message and stack trace
- Request context (URL, method, user)
- Timestamp
- Request ID for tracking

### **Error Tracking Headers**
```http
X-Request-ID: req_1642234567_abc123def
X-Error-Code: VALIDATION_ERROR
```

### **Monitoring Integration**
In production, errors are sent to monitoring services with:
- Request ID for correlation
- Error context and details
- User information (if available)
- Request metadata

---

## 🧪 **Testing Error Handling**

### **Test Cases for APIDog**

#### **1. Validation Error Test**
```http
POST /api/products
Authorization: Bearer valid-token
{
  "data": {
    "title": "AB",
    "description": "Short",
    "price": -10,
    "stock": -5
  }
}
```
**Expected:** `400 Bad Request` with detailed validation errors

#### **2. Authentication Error Test**
```http
POST /api/products
{
  "data": {
    "title": "Test Product",
    "description": "Valid description",
    "price": 29.99,
    "stock": 10
  }
}
```
**Expected:** `401 Unauthorized` with authentication error

#### **3. Authorization Error Test**
```http
POST /api/products
Authorization: Bearer token-for-limited-user
{
  "data": {
    "title": "Test Product",
    "description": "Valid description",
    "price": 29.99,
    "stock": 10
  }
}
```
**Expected:** `403 Forbidden` with authorization error

#### **4. Not Found Error Test**
```http
GET /api/products/99999
Authorization: Bearer valid-token
```
**Expected:** `404 Not Found` with not found error

---

## 🎯 **Best Practices**

### **1. Error Message Guidelines**
- ✅ Use clear, actionable language
- ✅ Include specific field names
- ✅ Provide helpful suggestions
- ✅ Avoid technical jargon for user-facing errors
- ✅ Include request ID for support

### **2. HTTP Status Code Usage**
- ✅ `400` - Client validation errors
- ✅ `401` - Authentication required
- ✅ `403` - Authorization/permission denied
- ✅ `404` - Resource not found
- ✅ `409` - Resource conflict
- ✅ `422` - Business logic validation
- ✅ `429` - Rate limit exceeded
- ✅ `500` - Server/database errors
- ✅ `502` - External service errors

### **3. Error Response Structure**
- ✅ Always include error code
- ✅ Provide human-readable message
- ✅ Include helpful suggestions
- ✅ Add request ID for tracking
- ✅ Include timestamp
- ✅ Provide documentation links

---

## 🚀 **Benefits**

### **For Developers**
- ✅ Clear error messages for debugging
- ✅ Request ID for tracking issues
- ✅ Structured error responses
- ✅ Helpful suggestions for fixes

### **For Users**
- ✅ Meaningful error messages
- ✅ Actionable suggestions
- ✅ Consistent error format
- ✅ Documentation links

### **For Support**
- ✅ Request ID for issue tracking
- ✅ Detailed error context
- ✅ Error categorization
- ✅ Monitoring integration

---

## 📝 **Summary**

Your Strapi project now has a comprehensive error handling system that:

- ✅ **Provides meaningful error messages** instead of generic errors
- ✅ **Includes helpful suggestions** for fixing issues
- ✅ **Tracks requests** with unique request IDs
- ✅ **Categorizes errors** by type and severity
- ✅ **Logs errors** for debugging and monitoring
- ✅ **Handles all error scenarios** gracefully
- ✅ **Provides consistent error format** across all endpoints

The error handling system makes debugging easier, provides better user experience, and helps with issue tracking and resolution! 🎉
