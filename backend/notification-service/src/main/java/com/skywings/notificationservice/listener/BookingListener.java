package com.skywings.notificationservice.listener;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class BookingListener {

    @KafkaListener(topics = "booking-created", groupId = "notification-group")
    public void onBookingCreated(Map<String, Object> booking) {
        // In production: send email via SendGrid/SES here
        System.out.println("📧 Booking confirmation for PNR: " + booking.get("pnr"));
        System.out.println("   Contact: " + booking.get("contactEmail"));
    }
}