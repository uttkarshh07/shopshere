
package com.shopsphere.service;

import com.shopsphere.dto.OrderItemResponse;
import com.shopsphere.dto.OrderResponse;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.OrderItem;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.User;
import com.shopsphere.repository.OrderItemRepository;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Order placeOrder(
            Long userId,
            String customerName,
            String phone,
            String shippingAddress,
            List<OrderItem> items) {

        if (customerName == null || customerName.isBlank()) {
            throw new IllegalArgumentException("Customer name is required");
        }

        if (phone == null || phone.isBlank()) {
            throw new IllegalArgumentException("Phone number is required");
        }

        if (shippingAddress == null || shippingAddress.isBlank()) {
            throw new IllegalArgumentException("Shipping address is required");
        }

        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Your cart is empty");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        Order order = new Order();
        order.setUser(user);
        order.setCustomerName(customerName.trim());
        order.setPhone(phone.trim());
        order.setShippingAddress(shippingAddress.trim());
        order.setStatus("PENDING");

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> validatedItems = new ArrayList<>();
        List<Product> productsToUpdate = new ArrayList<>();

        // First validate every item before changing stock.
        for (OrderItem item : items) {

            if (item == null) {
                throw new IllegalArgumentException("Invalid order item");
            }

            if (item.getProduct() == null
                    || item.getProduct().getId() == null) {
                throw new IllegalArgumentException("Product ID is required");
            }

            Integer quantity = item.getQuantity();

            if (quantity == null || quantity < 1 || quantity > 100) {
                throw new IllegalArgumentException(
                        "Quantity must be between 1 and 100");
            }

            Long productId = item.getProduct().getId();

            Product product = productRepository.findById(productId)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Product not found: " + productId));

            if (product.getPrice() < 0) {
                throw new IllegalArgumentException(
                        "Invalid product price: " + productId);
            }

            if (product.getStock() < quantity) {
                throw new IllegalArgumentException(
                        "Insufficient stock for " + product.getName()
                                + ". Available stock: " + product.getStock());
            }

            BigDecimal price = BigDecimal.valueOf(product.getPrice());

            item.setOrder(order);
            item.setProduct(product);
            item.setPrice(price);

            BigDecimal itemTotal = price.multiply(
                    BigDecimal.valueOf(quantity));

            totalAmount = totalAmount.add(itemTotal);

            validatedItems.add(item);
            productsToUpdate.add(product);
        }

        // Check combined quantities if the same product appears twice.
        Map<Long, Integer> requestedQuantities = validatedItems.stream()
                .collect(Collectors.groupingBy(
                        item -> item.getProduct().getId(),
                        Collectors.summingInt(OrderItem::getQuantity)
                ));

        for (Product product : productsToUpdate) {
            Integer requested = requestedQuantities.get(product.getId());

            if (requested != null && product.getStock() < requested) {
                throw new IllegalArgumentException(
                        "Insufficient stock for " + product.getName()
                                + ". Available stock: " + product.getStock());
            }
        }

        order.setTotalAmount(totalAmount);

        // Reduce stock only after all validations pass.
        for (Product product : productsToUpdate) {
            int requested = requestedQuantities.get(product.getId());
            product.setStock(product.getStock() - requested);
        }

        productRepository.saveAll(productsToUpdate);

        Order savedOrder = orderRepository.save(order);

        for (OrderItem item : validatedItems) {
            item.setOrder(savedOrder);
        }

        orderItemRepository.saveAll(validatedItems);

        return savedOrder;
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersForUser(Long userId) {

        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        List<Order> orders =
                orderRepository.findByUserIdOrderByCreatedAtDesc(userId);

        if (orders.isEmpty()) {
            return List.of();
        }

        List<Long> orderIds = orders.stream()
                .map(Order::getId)
                .toList();

        List<OrderItem> orderItems =
                orderItemRepository.findByOrder_IdIn(orderIds);

        Map<Long, List<OrderItemResponse>> itemsByOrderId =
                orderItems.stream().collect(
                        Collectors.groupingBy(
                                item -> item.getOrder().getId(),
                                Collectors.mapping(
                                        item -> new OrderItemResponse(
                                                item.getProduct().getId(),
                                                item.getProduct().getName(),
                                                item.getQuantity(),
                                                item.getPrice()
                                        ),
                                        Collectors.toList()
                                )
                        )
                );

        return orders.stream()
                .map(order -> new OrderResponse(
                        order.getId(),
                        order.getCustomerName(),
                        order.getPhone(),
                        order.getShippingAddress(),
                        order.getTotalAmount(),
                        order.getStatus(),
                        order.getCreatedAt(),
                        itemsByOrderId.getOrDefault(
                                order.getId(), List.of())
                ))
                .toList();
    }
}
