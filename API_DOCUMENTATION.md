# 🚀 E-Commerce API Documentation

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Product Management](#product-management)
4. [Order Management](#order-management)
5. [Cart Management](#cart-management)
6. [User Management](#user-management)
7. [Error Handling](#error-handling)

---

## 🔐 Authentication

### **Base URL**
```
http://localhost:1337/api
```

### **Authentication Methods**

#### **1. JWT Token Authentication**
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **2. API Token Authentication**
```http
Authorization: Bearer YOUR_API_TOKEN
```

---

## 👥 User Roles & Permissions

### **Get All Roles**
```http
GET /api/users/roles
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Public",
      "description": "Default role for public users",
      "type": "public"
    },
    {
      "id": 2,
      "name": "Authenticated",
      "description": "Default role for authenticated users",
      "type": "authenticated"
    },
    {
      "id": 3,
      "name": "Admin",
      "description": "Administrator role with full access",
      "type": "authenticated"
    }
  ],
  "meta": {
    "count": 3
  }
}
```

### **Get Role by ID**
```http
GET /api/users/roles/:id
```

### **Get Users by Role**
```http
GET /api/users/by-role/:roleId
```

### **Get User Permissions**
```http
GET /api/users/:id/permissions
```

---

## 🛍️ Product Management

### **Create Product**

#### **Endpoint**
```http
POST /api/products
```

#### **Headers**
```http
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **Request Body**
```json
{
  "data": {
    "title": "Amazing Product",
    "description": "This is an amazing product with great features and quality materials.",
    "price": 99.99,
    "discount": 10,
    "stock": 50,
    "sizes": "l",
    "isPlusSize": false,
    "gender": "unisex",
    "images": [1, 2, 3],
    "category": 1,
    "brands": [1],
    "aiTags": {
      "colors": ["red", "blue"],
      "materials": ["cotton", "polyester"],
      "styles": ["casual", "modern"]
    },
    "aiDescription": "AI-generated enhanced description",
    "aiRecommendations": {
      "similarProducts": [2, 3, 4],
      "complementaryItems": [5, 6]
    },
    "vectorEmbedding": [0.1, 0.2, 0.3, 0.4, 0.5]
  }
}
```

#### **Field Validation Rules**
| Field | Type | Required | Min | Max | Description |
|-------|------|----------|-----|-----|-------------|
| `title` | string | ✅ | 3 | 100 | Product title |
| `description` | text | ✅ | 10 | 2000 | Product description |
| `price` | decimal | ✅ | 0.01 | 999999.99 | Product price |
| `discount` | decimal | ❌ | 0 | 100 | Discount percentage |
| `stock` | integer | ✅ | 0 | 99999 | Available stock |
| `sizes` | enum | ❌ | - | - | s, m, l, xl, xxl |
| `gender` | enum | ❌ | - | - | men, women, unisex |
| `images` | media | ❌ | 1 | 10 | Product images |
| `category` | relation | ❌ | - | - | Category ID |
| `brands` | relation | ❌ | - | - | Brand IDs array |

#### **Success Response (201)**
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "title": "Amazing Product",
      "description": "This is an amazing product with great features and quality materials.",
      "price": 99.99,
      "discount": 10,
      "stock": 50,
      "sizes": "l",
      "isPlusSize": false,
      "gender": "unisex",
      "discountedPrice": 89.99,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "publishedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "meta": {}
}
```

#### **Error Response (400)**
```json
{
  "error": {
    "status": 400,
    "name": "ValidationError",
    "message": "Validation failed: Title must be at least 3 characters long, Price must be at least $0.01"
  }
}
```

### **Get All Products**
```http
GET /api/products
```

#### **Query Parameters**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `filters[title][$containsi]` | string | Search by title | `?filters[title][$containsi]=amazing` |
| `filters[price][$gte]` | number | Min price | `?filters[price][$gte]=50` |
| `filters[price][$lte]` | number | Max price | `?filters[price][$lte]=200` |
| `filters[category][id][$eq]` | number | Filter by category | `?filters[category][id][$eq]=1` |
| `filters[gender][$eq]` | string | Filter by gender | `?filters[gender][$eq]=men` |
| `filters[stock][$gt]` | number | In stock only | `?filters[stock][$gt]=0` |
| `sort` | string | Sort order | `?sort=price:asc` |
| `pagination[page]` | number | Page number | `?pagination[page]=1` |
| `pagination[pageSize]` | number | Items per page | `?pagination[pageSize]=10` |

#### **Example Request**
```http
GET /api/products?filters[price][$gte]=50&filters[price][$lte]=200&filters[stock][$gt]=0&sort=price:asc&pagination[page]=1&pagination[pageSize]=10
```

### **Get Product by ID**
```http
GET /api/products/:id
```

### **Update Product**
```http
PUT /api/products/:id
```

#### **Request Body**
```json
{
  "data": {
    "title": "Updated Product Title",
    "price": 129.99,
    "stock": 25
  }
}
```

### **Delete Product**
```http
DELETE /api/products/:id
```

---

## 🛒 Cart Management

### **Create Cart**
```http
POST /api/carts
```

#### **Request Body**
```json
{
  "data": {
    "sessionId": "CART-ABC123XYZ",
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

### **Get Cart by Session ID**
```http
GET /api/carts?filters[sessionId][$eq]=CART-ABC123XYZ
```

### **Update Cart**
```http
PUT /api/carts/:id
```

---

## 📦 Order Management

### **Create Order**
```http
POST /api/orders
```

#### **Request Body**
```json
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
    ],
    "address": 1
  }
}
```

---

## 👤 User Management

### **Register User**
```http
POST /api/auth/local/register
```

#### **Request Body**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

### **Login User**
```http
POST /api/auth/local
```

#### **Request Body**
```json
{
  "identifier": "john@example.com",
  "password": "SecurePassword123!"
}
```

#### **Response**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "confirmed": true,
    "blocked": false,
    "role": {
      "id": 2,
      "name": "Authenticated",
      "type": "authenticated"
    }
  }
}
```

---

## 🔧 Using APIDog App

### **Step-by-Step Guide for Adding Products**

#### **1. Setup APIDog**
1. Download and install APIDog
2. Create a new project
3. Set base URL: `http://localhost:1337/api`

#### **2. Authentication Setup**
1. **Login to get JWT token:**
   - Method: `POST`
   - URL: `http://localhost:1337/api/auth/local`
   - Body:
     ```json
     {
       "identifier": "your-admin-email@example.com",
       "password": "your-password"
     }
     ```
   - Copy the `jwt` token from response

2. **Set Authorization Header:**
   - Go to Headers tab
   - Add: `Authorization: Bearer YOUR_JWT_TOKEN`

#### **3. Create Product**
1. **Method:** `POST`
2. **URL:** `http://localhost:1337/api/products`
3. **Headers:**
   ```
   Content-Type: application/json
   Authorization: Bearer YOUR_JWT_TOKEN
   ```
4. **Body (JSON):**
   ```json
   {
     "data": {
       "title": "Test Product",
       "description": "This is a test product created via APIDog",
       "price": 99.99,
       "discount": 10,
       "stock": 50,
       "sizes": "l",
       "gender": "unisex"
     }
   }
   ```

#### **4. Test Different Scenarios**

**Valid Product:**
```json
{
  "data": {
    "title": "Premium T-Shirt",
    "description": "High-quality cotton t-shirt with modern design",
    "price": 29.99,
    "stock": 100,
    "sizes": "m",
    "gender": "unisex"
  }
}
```

**Invalid Product (will show validation errors):**
```json
{
  "data": {
    "title": "AB",  // Too short (min 3 chars)
    "description": "Short",  // Too short (min 10 chars)
    "price": -10,  // Invalid (min 0.01)
    "stock": -5  // Invalid (min 0)
  }
}
```

#### **5. Upload Images (Optional)**
1. **Upload image first:**
   - Method: `POST`
   - URL: `http://localhost:1337/api/upload`
   - Body: Form-data with image file
   - Note the file ID from response

2. **Use image ID in product:**
   ```json
   {
     "data": {
       "title": "Product with Image",
       "description": "Product description",
       "price": 49.99,
       "stock": 25,
       "images": [1]  // Use the file ID from upload
     }
   }
   ```

---

## ❌ Error Handling

### **Common Error Responses**

#### **401 Unauthorized**
```json
{
  "error": {
    "status": 401,
    "name": "UnauthorizedError",
    "message": "Missing or invalid token"
  }
}
```

#### **403 Forbidden**
```json
{
  "error": {
    "status": 403,
    "name": "ForbiddenError",
    "message": "Access denied"
  }
}
```

#### **404 Not Found**
```json
{
  "error": {
    "status": 404,
    "name": "NotFoundError",
    "message": "Not found"
  }
}
```

#### **422 Validation Error**
```json
{
  "error": {
    "status": 422,
    "name": "ValidationError",
    "message": "Validation failed: Title must be at least 3 characters long"
  }
}
```

---

## 🚀 Quick Start Commands

### **Setup Permissions**
```bash
npm run setup:permissions
```

### **Start Development Server**
```bash
npm run develop
```

### **Access Admin Panel**
```
http://localhost:1337/admin
```

### **Access API Documentation**
```
http://localhost:1337/documentation
```

---

## 📝 Notes

1. **Authentication Required:** Most endpoints require authentication
2. **Validation:** All data is validated according to schema rules
3. **Error Messages:** Detailed error messages for debugging
4. **Pagination:** Use pagination for large datasets
5. **Filtering:** Use Strapi's filtering syntax for complex queries

---

## 🔗 Useful Links

- [Strapi Documentation](https://docs.strapi.io/)
- [Strapi REST API](https://docs.strapi.io/dev-docs/api/rest)
- [Strapi Query Engine](https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication)
