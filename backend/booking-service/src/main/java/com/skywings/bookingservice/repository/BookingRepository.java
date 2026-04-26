package com.skywings.bookingservice.repository;

import com.skywings.bookingservice.entity.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Booking> findByPnr(String pnr);
    Optional<Booking> findByPnrAndUserId(String pnr, String userId);
}