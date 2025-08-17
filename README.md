# 🎉 Event Service

This project is a part of a semester assignment and implements a microservice architecture for event management. Event Service works together with other services (e.g., Ticket Sale Service, Ticket Validation Service) using HTTP API and Consul for service discovery.

## 🚀 Features
- Event management (CRUD operations)
- Get all events, available events, event details, capacity, and validated ticket count
- Integration with Consul for service discovery
- Communication with other services via HTTP (axios)
- OpenAPI specification for endpoint documentation

## 📦 Dependencies
- Node.js
- Express
- Prisma (database ORM)
- Consul (service discovery)
- Axios (HTTP client)

## 🛠️ Getting Started
1. Set environment variables:
   - `PORT` (default 8383)
   - `CONSUL_URL` (Consul server address)
   - `HOST` (host address, optional)
2. Start your database and Consul server.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the service:
   ```bash
   npm start
   ```

## 📚 API Endpoints
All endpoints are prefixed with `/api/v1/`.

- `GET /api/v1/info/all` — Get all events
- `GET /api/v1/info/all/available` — Get events with available places (integrates with Ticket Sale Service)
- `GET /api/v1/info/:id` — Get event details
- `GET /api/v1/info/:id/validatedCount` — Get validated ticket count (integrates with Ticket Validation Service)
- `GET /api/v1/info/:id/capacity` — Get event capacity
- `POST /api/v1/` — Create a new event
- `PUT /api/v1/:id` — Update an event
- `DELETE /api/v1/:id` — Delete an event
- `GET /health` — Health check

Detailed OpenAPI specification is available in `open-api-spec.yaml`.

## 🧩 Microservice Architecture
- Event Service registers itself in Consul and discovers other services (e.g., Ticket Sale Service, Ticket Validation Service) to fetch ticket information.
- Communication between services is done via HTTP API.

## 🧪 Testing
Tests are located in the `tests/` directory.

## 🗂️ Diagrams
Sequence and class diagrams are available in the `diagrams/` directory.

## 👨‍💻 Author
This project was developed as a semester assignment at CTU by Vladyslav Babyč (babycvla).
