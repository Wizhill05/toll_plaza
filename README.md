# Smart Parking Management System

A modern parking management solution built with React and Node.js that helps track and manage parking spaces in real-time.

## Features

- **Real-time Parking Space Management**

  - Track available and occupied spots
  - Visual representation of parking zones
  - Dynamic updates of parking status

- **Vehicle Management**

  - Record vehicle entry and exit
  - Track parking duration
  - Store vehicle information (plate number, type)

- **Payment Processing**

  - Automatic fee calculation based on duration
  - Different rates for various vehicle types
  - Payment status tracking

- **Reporting and Analytics**
  - View parking history
  - Track revenue
  - Monitor space utilization

## ER Diagram

![image](https://github.com/user-attachments/assets/db4f947b-650c-49ef-8ae6-8de205a9915c)

## Tech Stack

- Frontend: React
- Backend: Node.js with Express
- Database: SQLite
- Styling: CSS with modern design principles

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

## Installation

1. Clone the repository

```bash
git clone https://github.com/Wizhill05/smart_parking.git
cd smart_parking
```

2. Install dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ..
npm install
```

3. Set up the database

```bash
# The database will be automatically initialized when you start the server
```

4. Start the application

Start both frontend and backend

```bash
npm run dev:all
```

Or start them separately:

```bash
# Frontend
npm run dev

# Backend
npm run server
```

5. Access the application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## API Endpoints

- `GET /api/records` - Get all parking records
- `POST /api/records` - Create new parking record
- `PUT /api/records/:id/exit` - Record vehicle exit
- `PUT /api/records/:id/pay` - Mark record as paid
- `DELETE /api/records/:id` - Delete parking record

## Environment Setup

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
