package com.skywings.bookingservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skywings.bookingservice.entity.Booking;
import com.skywings.bookingservice.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingRepository bookingRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @GetMapping
    public List<Booking> myBookings(@RequestHeader("Authorization") String authHeader) {
        String userId = extractUserId(authHeader);
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @GetMapping("/all")
    public List<Booking> allBookings(@RequestHeader("Authorization") String authHeader) {
        return bookingRepository.findAll();
    }

    @PostMapping
    public Booking create(@RequestBody Booking booking,
                          @RequestHeader("Authorization") String authHeader) {
        String userId = extractUserId(authHeader);
        booking.setUserId(userId);
        booking.setStatus("CONFIRMED");
        booking.setCheckedIn(false);
        Booking saved = bookingRepository.save(booking);
        kafkaTemplate.send("booking-created", saved);
        return saved;
    }

    @PatchMapping("/{pnr}/cancel")
    public Booking cancel(@PathVariable String pnr,
                          @RequestHeader("Authorization") String authHeader) {
        String userId = extractUserId(authHeader);
        Booking b = bookingRepository.findByPnrAndUserId(pnr, userId).orElseThrow();
        b.setStatus("CANCELLED");
        return bookingRepository.save(b);
    }

    @PatchMapping("/{pnr}/reschedule")
    public Booking reschedule(@PathVariable String pnr,
                              @RequestHeader("Authorization") String authHeader,
                              @RequestBody Map<String, String> body) {
        String userId = extractUserId(authHeader);
        Booking b = bookingRepository.findByPnrAndUserId(pnr, userId).orElseThrow();
        b.setFlightId(body.get("flightId"));
        b.setStatus("RESCHEDULED");
        return bookingRepository.save(b);
    }

    @PatchMapping("/{pnr}/check-in")
    public Booking checkIn(@PathVariable String pnr,
                           @RequestHeader("Authorization") String authHeader) {
        String userId = extractUserId(authHeader);
        Booking b = bookingRepository.findByPnrAndUserId(pnr, userId).orElseThrow();
        b.setCheckedIn(true);
        return bookingRepository.save(b);
    }

    private String extractUserId(String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String[] parts = token.split("\\.");
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readTree(payload).get("sub").asText();
        } catch (Exception e) {
            throw new RuntimeException("Invalid or missing token");
        }
    }
}