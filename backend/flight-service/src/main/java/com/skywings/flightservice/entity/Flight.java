package com.skywings.flightservice.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "flights")
public class Flight {
    @Id
    private String id;
    private String flightNumber;
    private String origin;
    private String destination;
    private String departureTime;
    private String arrivalTime;
    private int duration;
    private double price;
    private int seats;
    private String cabin;
    private String aircraft;
    private String airline;
}