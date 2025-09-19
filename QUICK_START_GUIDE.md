# 🚀 Quick Start Guide - E-Commerce API Setup

## 📋 Complete Solution for All Three Issues

### **Issue 1: Get All User Roles** ✅
### **Issue 2: Fix Admin Product Creation Permissions** ✅  
### **Issue 3: Add Products Using APIDog** ✅

---

## 🔧 **Step 1: Setup Permissions**

### **Run Permission Setup Script**
```bash
npm run setup:permissions
```

This will:
- ✅ Create all necessary roles (Public, Authenticated, Admin)
- ✅ Set up permissions for all APIs
- ✅ Allow authenticated users to create products
- ✅ Fix the "Forbidden" error

---

## 🔐 **Step 2: Get All User Roles**

### **API Endpoint**
```http
GET http://localhost:1337/api/users/roles
```

### **Response**
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

---

## 🛍️ **Step 3: Add Products Using APIDog**

### **3.1 Setup APIDog**

1. **Download APIDog** from [apidog.com](https://apidog.com)
2. **Create new project**
3. **Set base URL:** `http://localhost:1337/api`

### **3.2 Authentication**

#### **Login to Get JWT Token**
- **Method:** `POST`
- **URL:** `http://localhost:1337/api/auth/local`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body:**
  ```json
  {
    "identifier": "your-admin-email@example.com",
    "password": "your-password"
  }
  ```

#### **Copy JWT Token**
From the response, copy the `jwt` token:
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### **3.3 Set Authorization Header**

In APIDog:
1. Go to **Headers** tab
2. Add: `Authorization: Bearer YOUR_JWT_TOKEN`

### **3.4 Create Product**

#### **Basic Product**
- **Method:** `POST`
- **URL:** `http://localhost:1337/api/products`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_JWT_TOKEN
  ```
- **Body:**
  ```json
  {
    "data": {
      "title": "Amazing Product",
      "description": "This is an amazing product with great features and quality materials.",
      "price": 99.99,
      "discount": 10,
      "stock": 50,
      "sizes": "l",
      "gender": "unisex"
    }
  }
  ```

#### **Advanced Product with AI Fields**
```json
{
  "data": {
    "title": "AI-Enhanced Product",
    "description": "This product uses AI for enhanced descriptions and recommendations.",
    "price": 149.99,
    "discount": 15,
    "stock": 25,
    "sizes": "xl",
    "gender": "men",
    "aiTags": {
      "colors": ["red", "blue", "green"],
      "materials": ["cotton", "polyester"],
      "styles": ["casual", "modern", "sporty"]
    },
    "aiDescription": "AI-generated enhanced description for better SEO and user experience.",
    "aiRecommendations": {
      "similarProducts": [2, 3, 4],
      "complementaryItems": [5, 6, 7]
    },
    "vectorEmbedding": [0.1, 0.2, 0.3, 0.4, 0.5]
  }
}
```

---

## ✅ **Expected Results**

### **Success Response (201)**
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
      "gender": "unisex",
      "discountedPrice": 89.99,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "publishedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "meta": {
    "message": "Product created successfully"
  }
}
```

### **Validation Error Response (400)**
```json
{
  "error": {
    "status": 400,
    "name": "ValidationError",
    "message": "Validation failed: Title must be at least 3 characters long, Price must be at least $0.01"
  }
}
```

---

## 🔧 **Troubleshooting**

### **If You Still Get "Forbidden" Error:**

1. **Check User Role:**
   ```http
   GET http://localhost:1337/api/users/:userId/permissions
   ```

2. **Assign Admin Role:**
   ```http
   PUT http://localhost:1337/api/users/:userId/assign-role
   ```
   ```json
   {
     "roleId": 3
   }
   ```

3. **Re-run Permission Setup:**
   ```bash
   npm run setup:permissions
   ```

### **If Authentication Fails:**

1. **Check if user exists:**
   ```http
   GET http://localhost:1337/api/users
   ```

2. **Create new admin user via Strapi Admin Panel:**
   - Go to `http://localhost:1337/admin`
   - Create new user
   - Assign Admin role

### **If Validation Errors Occur:**

Check the validation rules in `VALIDATION_GUIDE.md`:
- Title: 3-100 characters
- Description: 10-2000 characters  
- Price: $0.01 - $999,999.99
- Stock: 0-99,999 units
- Discount: 0-100%

---

## 📚 **Additional API Endpoints**

### **Get All Products**
```http
GET http://localhost:1337/api/products
```

### **Get Product by ID**
```http
GET http://localhost:1337/api/products/:id
```

### **Update Product**
```http
PUT http://localhost:1337/api/products/:id
```

### **Delete Product**
```http
DELETE http://localhost:1337/api/products/:id
```

### **Filter Products**
```http
GET http://localhost:1337/api/products?filters[price][$gte]=50&filters[price][$lte]=200&filters[stock][$gt]=0
```

---

## 🎯 **Quick Test Commands**

### **1. Start Server**
```bash
npm run develop
```

### **2. Setup Permissions**
```bash
npm run setup:permissions
```

### **3. Test Product Creation**
```bash
curl -X POST http://localhost:1337/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "data": {
      "title": "Test Product",
      "description": "This is a test product",
      "price": 29.99,
      "stock": 10
    }
  }'
```

---

## 🎉 **Success!**

You should now be able to:
- ✅ Get all user roles via API
- ✅ Create products with admin account (no more "Forbidden" error)
- ✅ Add products using APIDog with proper authentication
- ✅ Use comprehensive validation and error handling

Your e-commerce API is now fully functional with proper role-based access control! 🚀
