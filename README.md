# E-Commerce Application

A full-stack e-commerce application built with Express.js backend and React frontend.

## Features

- 🛍️ Product browsing and searching
- 🛒 Shopping cart management
- 👤 User authentication and authorization
- 💳 Order processing and checkout
- 🔒 Secure session handling
- 📱 Responsive design with Tailwind CSS
- 🎨 Modern UI with Shadcn components

## Tech Stack

### Backend
- Node.js & Express.js
- PostgreSQL with node-postgres
- Express Session for authentication
- Passport.js for authentication strategies
- Swagger for API documentation

### Frontend
- React 18 with TypeScript
- Redux Toolkit for state management
- React Router for navigation
- Axios for API requests
- Tailwind CSS for styling
- Vite for development and building

## Project Structure

```
ecommerce_api/
├── src/                  # Backend code
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── routes/         # API routes
│   └── server.js       # Server entry point
│
├── frontend/           # Frontend code
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/     # Page components
│   │   ├── services/  # API services
│   │   ├── store/     # Redux store and slices
│   │   └── types/     # TypeScript types
│   └── index.html
│
└── .env               # Environment variables
```

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/YFolla/ecommerce_app.git
   cd ecommerce_app
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   API_URL=http://localhost:3000
   FRONTEND_URL=http://localhost:5173

   # Database Configuration
   DB_USER=your_db_user
   DB_HOST=localhost
   DB_NAME=ecommerce_db
   DB_PASSWORD=your_db_password
   DB_PORT=5432

   # Session Configuration
   SESSION_SECRET=your-super-secret-key-change-this-in-production
   ```

4. Set up the database:
   ```bash
   # Create database and tables
   psql -U your_db_user -d postgres -f src/config/database-schema.sql
   ```

5. Start the development servers:
   ```bash
   # From the root directory
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs

## Available Scripts

In the root directory:
- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:server` - Start only the backend server
- `npm run dev:client` - Start only the frontend server
- `npm test` - Run tests

## API Documentation

The API documentation is available at `/api-docs` when the server is running. It provides detailed information about all available endpoints, request/response formats, and authentication requirements.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 