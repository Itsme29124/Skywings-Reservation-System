package com.skywings.flightservice.controller;

import com.skywings.flightservice.entity.Flight;
import com.skywings.flightservice.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
public class FlightController {

    private final FlightRepository flightRepository;

    @GetMapping
    public List<Flight> search(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam String date) {
        return flightRepository.search(origin, destination, date);
    }

    @GetMapping("/{id}")
    public Flight getById(@PathVariable String id) {
        return flightRepository.findById(id).orElseThrow();
    }

    @PostMapping
    public Flight create(@RequestBody Flight flight) {
        return flightRepository.save(flight);
    }
}