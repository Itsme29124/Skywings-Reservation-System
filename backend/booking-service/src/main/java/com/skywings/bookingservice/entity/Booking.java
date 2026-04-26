package com.skywings.bookingservice.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document("bookings")
public class Booking {
    @Id
    private String id;
    private String pnr;
    private String userId;
    private String flightId;
    private List<Passenger> passengers;
    private List<String> seats;
    private double totalPrice;
    private String status = "CONFIRMED";
    private String contactEmail;
    private String contactPhone;
    private boolean checkedIn = false;
    private String createdAt;

    @Data
    public static class Passenger {
        private String firstName;
        private String lastName;
        private String dob;
        private String gender;
    }
}