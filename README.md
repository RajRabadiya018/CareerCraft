# CareerCraft

A modern web application built with Next.js that helps users create resumes, cover letters, and prepare for interviews.

## Features

- 📝 Resume Builder
- ✉️ Cover Letter Generator
- 🎯 Interview Preparation
- 👤 User Dashboard
- 🔒 Secure Authentication

## Tech Stack

- **Frontend:** Next.js
- **Styling:** Tailwind CSS
- **Database:** Prisma
- **Authentication:** Clerk
- **Components:** Customizable UI components

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn
- Docker (for development database)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the development database:
```bash
docker-compose up -d
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── actions/         # Server actions for data mutations
├── app/            # Next.js app directory
├── components/     # Reusable UI components
├── data/          # Static data and constants
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and configurations
├── prisma/        # Database schema and migrations
└── public/        # Static assets
```

## Development

### Commands

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GEMINI_API_KEY="your-key"
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
