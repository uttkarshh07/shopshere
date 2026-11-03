
package com.shopsphere.controller;

import com.shopsphere.dto.OrderResponse;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.OrderItem;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.User;
import com.shopsphere.repository.UserRepository;
import com.shopsphere.service.OrderService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(
            OrderService orderService,
            UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    public record OrderRequest(
            String customerName,
            String phone,
            String shippingAddress,
            List<OrderItemRequest> items
    ) {}

    public record OrderItemRequest(
            Long productId,
            Integer quantity
    ) {}

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof
                org.springframework.security.core.userdetails.UserDetails userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required");
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User account not found");
        }

        List<OrderResponse> orders =
                orderService.getOrdersForUser(user.getId());

        return ResponseEntity.ok(orders);
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(
            @RequestBody OrderRequest request,
            Authentication authentication) {

        try {
            if (request == null
                    || request.customerName() == null
                    || request.phone() == null
                    || request.shippingAddress() == null
                    || request.items() == null) {
                return ResponseEntity.badRequest()
                        .body("Missing required order information");
            }

            if (authentication == null
                    || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            Object principal = authentication.getPrincipal();

            if (!(principal instanceof
                    org.springframework.security.core.userdetails.UserDetails userDetails)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid authenticated user");
            }

            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElse(null);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User account not found");
            }

            List<OrderItem> items = request.items().stream()
                    .map(item -> {
                        if (item.productId() == null
                                || item.quantity() == null) {
                            throw new IllegalArgumentException(
                                    "Product ID and quantity are required");
                        }

                        OrderItem orderItem = new OrderItem();

                        Product product = new Product();
                        product.setId(item.productId());

                        orderItem.setProduct(product);
                        orderItem.setQuantity(item.quantity());

                        return orderItem;
                    })
                    .toList();

            Order order = orderService.placeOrder(
                    user.getId(),
                    request.customerName(),
                    request.phone(),
                    request.shippingAddress(),
                    items
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(order);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
