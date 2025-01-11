# Advanced NestJS Tutorial Project

A comprehensive NestJS application showcasing enterprise-level architecture and best practices. This project was intentionally over-engineered to demonstrate various advanced features and patterns in NestJS.

## 🚀 Features

### Architecture & Design

- **Modular Architecture**: Properly segregated modules for better code organization
- **Microservices**: TCP-based microservice architecture for user management
- **GraphQL Integration**: Apollo Server setup with custom error handling and schema configuration
- **WebSocket Support**: Real-time notifications system using Socket.io
- **Event-Driven Architecture**: Using NestJS event emitter for loose coupling
- **Queue System**: Background job processing with Bull
- **Caching Layer**: Advanced caching system with compression and statistics

### Authentication & Security

- **JWT Authentication**: Complete JWT-based auth system
- **Role-Based Access Control**: Custom decorators and guards for authorization
- **Rate Limiting**: Request throttling for API protection
- **Security Headers**: Helmet integration for enhanced security
- **CORS Configuration**: Configurable CORS settings

### Database & Data Handling

- **MongoDB Integration**: Using Mongoose with proper schemas and DTOs
- **Data Validation**: Class-validator integration with custom validation pipe
- **Data Transformation**: Class-transformer for object serialization
- **Type Safety**: Strong typing throughout the application

### API Documentation & Testing

- **Swagger Integration**: Comprehensive API documentation
- **E2E Testing**: End-to-end test setup
- **Unit Testing**: Extensive unit tests with Jest
- **Test Coverage**: Configuration for test coverage reporting

### Monitoring & Maintenance

- **Health Checks**: Endpoint for application health monitoring
- **Logging System**: Advanced logging with custom interceptor
- **Error Handling**: Global exception filter
- **Configuration Management**: Environment-based configuration system

### Development Tools

- **ESLint**: Strict TypeScript linting rules
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit hooks for code quality
- **Debug Configuration**: VS Code debug setup

## 🛠️ Technical Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Caching**: Redis
- **Message Queue**: Bull
- **WebSocket**: Socket.io
- **GraphQL**: Apollo Server
- **Authentication**: Passport, JWT
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Process Manager**: PM2
- **Containerization**: Docker support

## 📦 Project Structure

```
src/
├── common/                  # Shared utilities, decorators, filters etc.
│   ├── decorators/         # Custom decorators (roles, public, etc.)
│   ├── filters/            # Exception filters
│   ├── guards/             # Authentication & authorization guards
│   ├── interceptors/       # Logging & transformation interceptors
│   ├── pipes/              # Validation pipes
│   └── services/           # Shared services (cache, etc.)
├── config/                 # Configuration modules
│   ├── config.module.ts
│   └── config.service.ts
├── microservices/         # Microservice implementations
│   ├── auth/              # Authentication microservice
│   ├── notification/      # Notification microservice
│   └── user/              # User management microservice
├── modules/               # Feature modules
│   ├── auth/             # Authentication module
│   └── users/            # User module
└── main.ts               # Application entry point
```

## 🚀 Getting Started

1. Prerequisites:

```
# Install Node.js (v18 or later recommended)
# Install pnpm
npm install -g pnpm

# Install NestJS CLI
pnpm install -g @nestjs/cli
```

2. Clone and Install:

```
# Clone the repository
git clone <repository-url>

# Install dependencies
pnpm install
```

3. Environment Setup:

```
# Copy example environment file
cp .env.example .env

# Configure your environment variables
# Edit .env file with your settings
```

4. Start Services:

```
# Start MongoDB
# Start Redis

# Start development server
pnpm run start:dev

# Start microservices (in separate terminals)
pnpm run start:auth
pnpm run start:user
pnpm run start:notification
```

## 🧪 Testing

```
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## 📚 API Documentation

Once the application is running, you can access:

- REST API documentation: `http://localhost:3000/docs`
- GraphQL Playground: `http://localhost:3000/graphql`

## 🔧 Available Scripts

```
pnpm start        # Start the application
pnpm start:dev    # Start in watch mode
pnpm start:debug  # Start in debug mode
pnpm start:prod   # Start in production mode
pnpm build        # Build the application
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
```

## 🌟 Key Features Implementation

### Microservices

- User Service: Handles user management
- Auth Service: Manages authentication and authorization
- Notification Service: Handles real-time notifications

### Caching Strategy

- Implements compression for large cached items
- Cache statistics and monitoring
- Automatic cache invalidation

### Event System

- Domain events for user actions
- Integration events between microservices
- Event-driven notifications

### Security Implementation

- JWT-based authentication
- Role-based access control
- Request rate limiting
- Security headers

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
