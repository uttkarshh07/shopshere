Shopshere – Full-Stack E-Commerce Application
Shopshere is a full-stack e-commerce web application built with React and Spring Boot. It supports customer shopping workflows, JWT-based authentication, order placement, and an admin dashboard for managing products and customer orders.
Features
Customer
- Browse, search, and filter products by category
- Add products to a shopping cart and update quantities within available stock
- Register and log in
- Place orders and view personal order history
Admin
- Access a role-protected admin dashboard
- Add, view, edit, and delete products
- View customer orders and update their status
- Supported statuses: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
Security and data
- JWT-based authentication
- Password hashing with BCrypt
- Role-based authorization for admin endpoints
- Orders are associated with the authenticated user
- Product stock is reduced when an order is placed
Tech Stack
Area	Technologies
Frontend	React, Vite, JavaScript, Axios, CSS
Backend	Java 21, Spring Boot, Spring Security
Authentication	JWT, BCrypt
Database	MySQL 8.4
API testing	Postman
Version control	Git, GitHub


Project Structure
project/
├── shopshere-Backend/
│   ├── src/
│   ├── pom.xml
│   └── mvnw
├── shopshere-frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── .gitignore
└── README.md
Run Locally
Prerequisites
- Java 21
- Node.js and npm
- MySQL 8.x
- Git
1. Clone the repository
git clone https://github.com/uttkarshh07/shopshere.git
cd shopshere
2. Configure MySQL
Create the database:
CREATE DATABASE shopsphere;
Configure your local database connection in shopshere-Backend/src/main/resources/application.properties.

Example configuration (replace the placeholders with your own local values):
spring.datasource.url=jdbc:mysql://localhost:3307/shopsphere
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
Configure your JWT secret locally as required by the backend.

Security: Never commit real database passwords, JWT secrets, API keys, or other credentials to GitHub.
3. Start the backend
Open a terminal in shopshere-Backend.

On Windows:
.\mvnw.cmd spring-boot:run
On macOS/Linux:
./mvnw spring-boot:run
The backend runs at http://localhost:8080.
4. Start the frontend
Open a second terminal in shopshere-frontend:
npm install
npm run dev
Open the Vite URL shown in the terminal (typically http://localhost:5173).
Main API Routes
Method	Endpoint	Purpose
POST	/api/auth/register	Register a customer
POST	/api/auth/login	Authenticate and receive a JWT
GET	/api/products	View products
POST	/api/orders	Place an order
GET	/api/orders/my-orders	View the authenticated user's orders
GET	/api/admin/products	Admin: list products
POST	/api/admin/products	Admin: add a product
PUT	/api/admin/products/{id}	Admin: update a product
DELETE	/api/admin/products/{id}	Admin: delete a product
GET	/api/admin/orders	Admin: view orders
PUT	/api/admin/orders/{id}/status	Admin: update order status


Protected routes require a valid JWT. Admin routes require the ROLE_ADMIN authority.
Testing Checklist
- [ ] Register a customer account
- [ ] Log in and browse products
- [ ] Add products to the cart and change quantities
- [ ] Place an order
- [ ] Confirm the order appears in My Orders
- [ ] Confirm product stock is updated in MySQL
- [ ] Log in with an admin account
- [ ] Add, edit, and delete a product
- [ ] View orders in the admin dashboard
- [ ] Update an order status
Future Improvements
- Add automated backend and frontend tests
- Add product image upload
- Add payment gateway integration
- Improve validation and error handling
- Deploy the frontend and backend
Author
Utkarsh Choudhary

GitHub: @uttkarshh07
This project was developed as a learning and portfolio project to practise full-stack application development, REST APIs, database integration, authentication, and role-based access control.
