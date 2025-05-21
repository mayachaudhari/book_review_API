# Book Review API

A RESTful API built with Node.js and Express for managing books and reviews, complete with user authentication, CRUD operations, search, and pagination. This guide will help you install, configure, run, and test the project seamlessly.

---

## Tech Stack

* Backend: Node.js, Express.js
* Database: MongoDB (via Mongoose)
* Authentication: JWT (JSON Web Tokens)
* Validation: express-validator
* Environment: dotenv

---

## Features

* User signup, login, and profile retrieval
* JWT-based authentication with token expiration
* CRUD operations for books and reviews
* Search books by title or author
* Pagination and filtering for list endpoints
* Input validation and centralized error handling

---

## Prerequisites

Make sure you have the following installed on your system:

* [Node.js](https://nodejs.org/) (v14+)
* [npm](https://www.npmjs.com/) or Yarn
* [MongoDB](https://www.mongodb.com/) (local or Atlas)
* Postman (for API testing)

---

## Installation & Setup

1. Clone the repository

      git clone <repository-url>
   cd book-review-api
   

2. Install dependencies

      npm install
   # or
   yarn install
   

3. Configure environment variables

   * Create a file named .env in the project root
   * Add the following variables:

     MONGO_URI=mongodb://localhost:27017/book-review-api
     JWT_SECRET=your_super_secure_jwt_secret_key
     PORT=5000
     JWT_EXPIRE=30d
     

4. Start MongoDB

   * If running locally:

          mongod --config /usr/local/etc/mongod.conf
     
   * Or configure MongoDB Atlas URI in MONGO_URI

5. Run the server

   * Development (with nodemon):

          npm run dev
     
   * Production:

          npm start
     

The server will start on http://localhost:5000 by default.

---

## 🔗 API Endpoints Overview

### Authentication

* POST /api/signup — Register a new user
* POST /api/login — Login and receive a JWT
* GET /api/me — Retrieve current user profile (requires Bearer token)

### Books

*All book routes (except GET) require a valid JWT in Authorization header.*

* POST /api/books — Create a new book
* GET /api/books — List books (supports pagination, filtering, sorting)
* GET /api/books/:id — Get a single book with its reviews
* PUT /api/books/:id — Update a book (owner only)
* DELETE /api/books/:id — Delete a book (owner only)

### Reviews

*All review routes require a valid JWT.*

* POST /api/books/:id/reviews — Add review to a book
* GET /api/books/:id/reviews — List reviews for a book
* PUT /api/reviews/:id — Update a review (author only)
* DELETE /api/reviews/:id — Delete a review (author only)

### Search

* GET /api/search?query=keyword — Search books by title or author

---

## Example Requests

### 1. User Registration

curl -X POST http://localhost:5000/api/signup \
     -H 'Content-Type: application/json' \
     -d '{
       "name": "Advik Bavisker",
       "email": "advik@example.com",
       "password": "advik123"
     }'

### 2. User Login

curl -X POST http://localhost:5000/api/login \
     -H 'Content-Type: application/json' \
     -d '{
       "email": "advik@example.com",
       "password": "password123"
     }'

> Tip: Copy the returned JWT and set it in your Postman environment as {{token}}.

### 3. Create a Book

curl -X POST http://localhost:5000/api/books \
     -H 'Content-Type: application/json' \
     -H 'Authorization: Bearer {{token}}' \
     -d '{
       "title": "The Great Book",
       "author": "Vishal Patil",
       "genre": "Thriller",
       "description": "A wonderful novel about life and love.",
       "publishedYear": 2021,
       "isbn": "0471958697",
       "createdBy": "682ca77e849426fe2407c518"    //UserId
}
'

### 4. Get Books (with pagination)

curl -X GET 'http://localhost:5000/api/books?page=1&limit=10&genre=Fiction&sort=title'

### 5. Add a Review

curl -X POST http://localhost:5000/api/books/<BOOK_ID>/reviews \
     -H 'Content-Type: application/json' \
     -H 'Authorization: Bearer {{token}}' \
     -d '{
       "rating": 5,
       "comment": "An amazing read!"
     }'

---

### 6. Get a Review

curl -X GET http://localhost:5000/api/reviews/<REVIEW_ID>


### 7. Update a Review

curl -X PUT http://localhost:5000/api/reviews/<REVIEW_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "title": "Updated title",
    "comment": "Great book! I updated my opinion."
  }'


### 8. Delete a Review

curl -X DELETE http://localhost:5000/api/reviews/<REVIEW_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>"




## Testing with Postman

 
1. Import the provided Postman collection (Book_Review_API_Postman_Collection.json).
2. Set base_url to http://localhost:5000.
3. Run the requests in order:

   1. Signup
   2. Login (copy token)
   3. Create, Read, Update, Delete operations for Books & Reviews

---

## Security & Best Practices

* Store secrets in .env, never commit it to version control.
* Use HTTPS in production.
* Implement rate limiting to mitigate abuse.
* Add refresh tokens for improved auth UX.
* Write unit and integration tests (e.g., Jest, Supertest).

---

## Future Improvements

* File upload support for book covers.
* Role-based access control (admin, user, moderator).
* Caching with Redis for high-read endpoints.
* Email notifications for new reviews.

---

## License & Contributions

This project is open-source. Feel free to submit issues or pull requests.

---

 