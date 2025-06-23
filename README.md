# 🥘 Wasfa - Recipe Finder Website

## IS231 – Web Technology | Project #1 | Group A - S1  
**Faculty of Computers and Artificial Intelligence – Cairo University (FCAI-CU)**

---

## 👥 Team Members

| Name                    | ID       |
|-------------------------|----------|
| George Ezat Hosni       | 20231041 |
| Jasmine Mohamed Elsayed | 20230103 |
| Maria Atef Edward       | 20231229 |
| Mary Magdy Kamal        | 20230302 |
| Shrouk Sayed Ahmed      | 20231085 |
| Verina Antounios Atya   | 20230288 |

---

## 📖 Project Overview

**Wasfa** is a dynamic Recipe Finder Website built using **Django** (Python backend), featuring user authentication and role-based access control.

### 🔐 Admin Features
- Add, edit, and delete recipes
- Manage recipe categories (Appetizers, Main Course, Dessert)
- View all recipes in the system

### 👤 User Features
- Search recipes by name or ingredients
- View detailed recipe pages
- Save recipes to a list of favorites

### ⚙️ Core Functionalities
- Dynamic navigation bar (changes based on user role: Admin/User)
- Full authentication system (Sign up, Login, Logout)
- RESTful API endpoints for recipe management

---

## 🛠 Technologies Used

| Component | Technologies             |
|-----------|--------------------------|
| Frontend  | HTML5, CSS3, JavaScript  |
| Backend   | Python, Django           |
| Database  | SQLite (default Django DB) |

---

## 🚀 Run the Website Locally

Follow these steps to run the website on your machine:

1. **Clone the repository**
   ```bash
   git clone <your-repo-link>
   ```

2. **Navigate to the project folder**
   ```bash
   cd your-project-folder
   ```

3. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate       # On Windows: venv\Scripts\activate
   ```

4. **Install required dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the development server**
   ```bash
   python manage.py runserver
   ```

6. **Visit the website in your browser**
   ```
   http://127.0.0.1:8000/
   ```

---
 **[GitHub Repository for Backend](https://github.com/maria2162004/Wasfa-Website-Backend)** <img src="https://simpleicons.org/icons/github.svg" width="16">
 **[GitHub Repository for Frontend](https://github.com/Shrouk-Sharaf/Wasfa-Front)** <img src="https://simpleicons.org/icons/github.svg" width="16">
## 📌 Notes
- Make sure Django is installed and your environment is properly configured.
- For production, consider replacing SQLite with PostgreSQL or MySQL.
