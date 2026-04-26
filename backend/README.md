# SkyWings Backend — Spring Boot Microservices

This is a **scaffold** for the backend you'll implement yourself.
The frontend (in `/src`) currently uses mock data and localStorage; once these
services are running, swap the mock data layer for HTTP calls to the API gateway.

## Architecture

```
[ React Frontend ]
        ↓
[ API Gateway :8080 ]  ──────────────┐
        ↓                            │
        ├── User Service     :8081 → PostgreSQL (users, profiles)
        ├── Flight Service   :8082 → PostgreSQL + Elasticsearch (flights, search)
        ├── Booking Service  :8083 → PostgreSQL + Redis (bookings, PNR, seat locks)
        ├── Payment Service  :8084 → MongoDB (payment records) + Stripe API
        └── Notification Svc :8085 → MongoDB (templates) + Kafka consumer
                                     ↑
                  Kafka topics: booking.created, payment.confirmed, etc.
```

## Tech stack
- Java 21 + Spring Boot 3.x
- Spring Cloud Gateway, Spring Security (JWT), Spring Data JPA / MongoDB
- PostgreSQL · MongoDB · Redis · Kafka · Elasticsearch
- Stripe Java SDK
- Docker · Kubernetes · GitHub Actions
- AWS (EC2 / S3 / RDS)

## Service responsibilities

| Service       | Owns                                          | DB             |
|---------------|-----------------------------------------------|----------------|
| api-gateway   | Routing, JWT validation, rate limiting        | -              |
| user-service  | Auth, signup, profile, JWT issuance           | PostgreSQL     |
| flight-service| Flight inventory, search (ES), pricing rules  | PostgreSQL+ES  |
| booking-service| PNR generation, seat lock (Redis), booking CRUD, cancel/reschedule | PostgreSQL+Redis |
| payment-service| Stripe checkout, webhooks, refunds           | MongoDB        |
| notification-svc| Email/SMS via Kafka events (e-tickets, alerts)| MongoDB       |

## Kafka topics
- `booking.created`     → notification-svc sends e-ticket
- `payment.confirmed`   → booking-svc marks booking paid
- `booking.cancelled`   → payment-svc issues refund
- `flight.updated`      → notification-svc alerts passengers

Every service folder has its own README and starter `pom.xml` /
`Application.java` / `Dockerfile`. Fill in controllers, services,
repositories, and entities yourself.
