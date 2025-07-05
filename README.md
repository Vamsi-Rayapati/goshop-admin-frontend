# 🧑‍💼 GoShop Admin Dashboard

The **GoShop Admin Dashboard** is a web-based interface built with **React** and **Ant Design (AntD)**. It allows administrators to manage users, orders, categories, products, and product images for the GoShop e-commerce platform.



## 📦 Features

- 👤 **Profile Management**  
  View and update admin profile details.

- 👥 **User Management**  
  Manage customer accounts and user roles.

- 📦 **Product Management**  
  Create, update, and delete products with support for image uploads.

- 🏷️ **Category Management**  
  Organize and manage product categories.

- 🧾 **Order Management**  
  View and manage customer orders.

- 🖼️ **Image Upload**  
  Upload and preview product images via pre-signed S3 URLs.



## 🧰 Tech Stack

| Component     | Technology     |
|---------------|----------------|
| Language      | JavaScript (ES6+) |
| Framework     | React           |
| UI Library    | Ant Design (AntD) |
| State Management | React Context / Redux (if used) |
| HTTP Client   | Axios           |
| Auth          | JWT-based authentication |
| File Upload   | AWS S3 (Pre-signed URLs) |
| Routing       | React Router    |



## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
# or
yarn install
```

### 2. Run the development server

```bash
npm start
# or
yarn start
```

The app will run at: `http://localhost:3000`



## 🔐 Authentication

The dashboard uses **JWT-based login**. After logging in, the JWT is stored securely (e.g. in memory or local storage) and used for authenticated API requests to GoShop services.


## ✨ Author

Made with ❤️ by **Vamsi Rayapati**
