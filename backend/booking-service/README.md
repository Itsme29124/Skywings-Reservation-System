# booking-service

PNR generation, seat selection with Redis locks, cancellation, rescheduling. PostgreSQL + Redis. Publishes to Kafka.

**Port:** 8083

## Run locally
```bash
./mvnw spring-boot:run
```

## TODO
- Define entities / documents
- Implement repositories
- Add REST controllers
- Wire Kafka producers/consumers (where applicable)
- Add integration tests
