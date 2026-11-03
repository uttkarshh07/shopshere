
                    package com.shopsphere.controller;

                    import com.shopsphere.entity.Product;
                    import com.shopsphere.repository.ProductRepository;
                    import org.springframework.http.ResponseEntity;
                    import org.springframework.web.bind.annotation.*;

                    import java.util.List;

                    @RestController
                    @RequestMapping("/api/products")
                    @CrossOrigin(origins = "http://localhost:5173")
                    public class ProductController {

                        private final ProductRepository productRepository;

                        public ProductController(ProductRepository productRepository) {
                            this.productRepository = productRepository;
                        }

                        // Get all products
                        @GetMapping
                        public List<Product> getAllProducts() {
                            return productRepository.findAll();
                        }

                        // Get product by ID
                        @GetMapping("/{id}")
                        public ResponseEntity<Product> getProductById(@PathVariable Long id) {
                            return productRepository.findById(id)
                                    .map(ResponseEntity::ok)
                                    .orElse(ResponseEntity.notFound().build());
                        }

                        // Add product
                        @PostMapping
                        public Product addProduct(@RequestBody Product product) {
                            return productRepository.save(product);
                        }

                        // Update product
                        @PutMapping("/{id}")
                        public ResponseEntity<Product> updateProduct(
                                @PathVariable Long id,
                                @RequestBody Product updatedProduct) {

                            return productRepository.findById(id)
                                    .map(product -> {
                                        product.setName(updatedProduct.getName());
                                        product.setDescription(updatedProduct.getDescription());
                                        product.setPrice(updatedProduct.getPrice());
                                        product.setCategory(updatedProduct.getCategory());
                                        product.setStock(updatedProduct.getStock());

                                        return ResponseEntity.ok(productRepository.save(product));
                                    })
                                    .orElse(ResponseEntity.notFound().build());
                        }

                        // Delete product
                        @DeleteMapping("/{id}")
                        public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
                            if (!productRepository.existsById(id)) {
                                return ResponseEntity.notFound().build();
                            }

                            productRepository.deleteById(id);
                            return ResponseEntity.noContent().build();
                        }
                    }
