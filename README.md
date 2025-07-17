# Landlord-Tenant Management System

A comprehensive full-stack application for managing landlord-tenant relationships, property management, rent collection, and maintenance requests.

## Features

### For Landlords
- **Dashboard Overview**: Real-time statistics on properties, tenants, revenue, and maintenance
- **Property Management**: Add, edit, and manage rental properties
- **Tenant Management**: Register tenants, manage lease agreements
- **Rent Payment Confirmation**: Review and confirm tenant payments
- **Maintenance Request Management**: Track and update maintenance requests
- **Monthly Revenue Charts**: Visual analytics of rental income

### For Tenants
- **Property Information**: View rental property details
- **Rent Payment Submission**: Submit monthly rent payments
- **Maintenance Requests**: Submit and track maintenance requests
- **Payment History**: View payment records and status

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **SQLite** database for data persistence
- **JWT** authentication with bcrypt password hashing
- **CORS** enabled for cross-origin requests
- **Modular architecture** with separate models, controllers, routes, and middleware

### Frontend
- **React** with Vite for fast development
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for icons
- **Recharts** for data visualization
- **Responsive design** for mobile and desktop

## Project Structure

```
akobb/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Authentication & validation
│   │   ├── utils/          # Database utilities
│   │   └── server.js       # Main server file
│   ├── .env                # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   ├── utils/          # Utilities
│   │   └── App.jsx         # Main app component
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Properties
- `GET /api/properties` - Get properties
- `POST /api/properties` - Create property (landlord only)
- `PUT /api/properties/:id` - Update property (landlord only)
- `DELETE /api/properties/:id` - Delete property (landlord only)

### Tenants
- `GET /api/tenants` - Get tenants (landlord only)
- `POST /api/tenants` - Add tenant (landlord only)
- `PUT /api/tenants/:id/status` - Update tenant status (landlord only)

### Payments
- `GET /api/rent-payments` - Get payments
- `POST /api/rent-payments` - Submit payment (tenant only)
- `PUT /api/rent-payments/:id/confirm` - Confirm payment (landlord only)

### Maintenance
- `GET /api/maintenance-requests` - Get maintenance requests
- `POST /api/maintenance-requests` - Create request (tenant only)
- `PUT /api/maintenance-requests/:id/status` - Update status (landlord only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (landlord only)
- `GET /api/dashboard/monthly-summary` - Get monthly revenue data (landlord only)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd akobb
   ```

2. **Install All Dependencies (Recommended)**
   ```bash
   npm run install:all
   ```

   Or manually:

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

#### Quick Start (Both servers simultaneously)
```bash
npm run dev
```
This will start both the backend (http://localhost:5000) and frontend (http://localhost:5173) servers concurrently.

#### Individual Server Commands

1. **Start the Backend Server Only**
   ```bash
   npm run server
   # or
   cd backend
   npm run dev
   ```
   Server runs on http://localhost:5000

2. **Start the Frontend Development Server Only**
   ```bash
   npm run client
   # or
   cd frontend
   npm run dev
   ```
   Frontend runs on http://localhost:5173

#### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start backend server only
- `npm run client` - Start frontend server only
- `npm run build` - Build frontend for production
- `npm run start` - Start both servers in production mode
- `npm run install:all` - Install dependencies for both frontend and backend

### Environment Variables

Create a `.env` file in the backend directory:
```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

## Database Schema

The application uses SQLite with the following main tables:

- **users**: User accounts (landlords and tenants)
- **properties**: Rental properties
- **tenants**: Rental agreements linking users to properties
- **rent_payments**: Payment records
- **maintenance_requests**: Maintenance issue tracking

## Authentication & Authorization

- JWT-based authentication system
- Role-based access control (landlord/tenant)
- Protected routes with middleware validation
- Password hashing with bcrypt

## Development

### Backend Development
- Follow MVC architecture pattern
- Use proper error handling and validation
- Implement database transactions where needed
- Follow RESTful API conventions

### Frontend Development
- Use React hooks and functional components
- Implement responsive design
- Use proper state management
- Follow component composition patterns

## License

This project is licensed under the ISC License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
