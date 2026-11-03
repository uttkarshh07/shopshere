
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminDashboard from "./AdminDashboard";
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  UserRound,
  Plus,
  Minus,
  Trash2,
  X,
  Menu,
  ArrowRight,
  Package,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import "./App.css";

const API = "http://localhost:8080";

const demoProducts = [
  { id: "demo-1", name: "Essential Wireless Headphones", description: "Immersive sound for every day", price: 2499, category: "Electronics", stock: 15 },
  { id: "demo-2", name: "Minimal Everyday Backpack", description: "Designed for work and travel", price: 1899, category: "Fashion", stock: 12 },
  { id: "demo-3", name: "Smart Fitness Watch", description: "Track your activity in style", price: 3499, category: "Electronics", stock: 9 },
  { id: "demo-4", name: "Classic Running Shoes", description: "Comfort for every kilometre", price: 2999, category: "Fashion", stock: 20 },
  { id: "demo-5", name: "Ceramic Coffee Mug", description: "Your new morning favourite", price: 499, category: "Home", stock: 30 },
  { id: "demo-6", name: "Desk Lamp", description: "A little more light for big ideas", price: 1299, category: "Home", stock: 18 },
  { id: "demo-7", name: "Portable Bluetooth Speaker", description: "Bring your playlist anywhere", price: 1599, category: "Electronics", stock: 14 },
  { id: "demo-8", name: "Everyday Cotton T-Shirt", description: "Soft fabric, relaxed fit", price: 799, category: "Fashion", stock: 25 },
];

const categories = ["All", "Electronics", "Fashion", "Home"];

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function readToken() {
  return localStorage.getItem("shopshere_token");
}

export default function App() {
  const [products, setProducts] = useState(demoProducts);
  const [apiStatus, setApiStatus] = useState("loading");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [userRole, setUserRole] = useState(
    localStorage.getItem("shopshere_role") || ""
  );

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("shopshere_cart") || "[]");
    } catch {
      return [];
    }
  });

  const [panel, setPanel] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [token, setToken] = useState(readToken);
  const [userEmail, setUserEmail] = useState("");
  const [isAdminView, setIsAdminView] = useState(false);

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const [orderBusy, setOrderBusy] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");

  const [orderForm, setOrderForm] = useState({
    customerName: "",
    phone: "",
    shippingAddress: "",
  });

  const [orders, setOrders] = useState([]);
  const [ordersBusy, setOrdersBusy] = useState(false);
  const [ordersMessage, setOrdersMessage] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/api/products`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setProducts(response.data);
          setApiStatus("connected");
        } else {
          setApiStatus("demo");
        }
      })
      .catch(() => setApiStatus("demo"));
  }, []);

  useEffect(() => {
    localStorage.setItem("shopshere_cart", JSON.stringify(cart));
  }, [cart]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = `${product.name} ${product.description || ""} ${product.category || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function addToCart(product) {
    if (product.stock === 0) return;

    setCart((current) => {
      const found = current.find((item) => item.id === product.id);

      if (found) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  Number(product.stock) || 99
                ),
              }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    setPanel("cart");
  }

  function changeQuantity(id, amount) {
  setCart((current) =>
    current
      .map((item) => {
        if (item.id !== id) return item;

        const newQuantity = item.quantity + amount;
        const maxStock = Number(item.stock) || 0;

        return {
          ...item,
          quantity: Math.max(
            0,
            Math.min(newQuantity, maxStock)
          ),
        };
      })
      .filter((item) => item.quantity > 0)
  );
}

  function removeFromCart(id) {
    setCart((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  async function submitAuth(event) {
    event.preventDefault();
    setAuthMessage("");
    setAuthBusy(true);

    try {
      const endpoint =
        authMode === "login"
          ? "/api/auth/login"
          : "/api/auth/register";

      const payload =
        authMode === "login"
          ? {
              email: authForm.email,
              password: authForm.password,
            }
          : authForm;

      const response = await axios.post(
        `${API}${endpoint}`,
        payload
      );

      if (authMode === "login") {
        const receivedToken = response.data.token;
        const receivedRole = response.data.role;

        if (!receivedToken) {
          throw new Error(
            "The server did not return an authentication token."
          );
        }

        if (!receivedRole) {
          throw new Error(
            "The server did not return a user role."
          );
        }

        localStorage.setItem("shopshere_token", receivedToken);
        localStorage.setItem("shopshere_role", receivedRole);

        setToken(receivedToken);
        setUserRole(receivedRole);
        setUserEmail(authForm.email);
        setAuthMessage("Login successful!");
        setIsAdminView(false);
        setPanel("");
      } else {
        setAuthMessage(
          "Registration successful. You can now log in."
        );
        setAuthMode("login");
      }
    } catch (error) {
      const message = error.response?.data?.message;

      setAuthMessage(
        message ||
          error.message ||
          (error.response?.status === 401
            ? "Invalid email or password."
            : "Could not reach the backend. Check that Spring Boot is running.")
      );
    } finally {
      setAuthBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem("shopshere_token");
    localStorage.removeItem("shopshere_role");

    setToken(null);
    setUserRole("");
    setUserEmail("");
    setPanel("");
    setOrders([]);
    setIsAdminView(false);
  }

  function checkout() {
    if (!token) {
      setAuthMode("login");
      setAuthMessage(
        "Please log in before continuing to checkout."
      );
      setPanel("auth");
      return;
    }

    if (cart.length === 0) {
      setOrderMessage("Your cart is empty.");
      return;
    }

    setOrderMessage("");
    setPanel("checkout");
  }

  async function submitOrder(event) {
    event.preventDefault();
    setOrderMessage("");

    if (!token) {
      setOrderMessage(
        "Please log in again before placing your order."
      );
      return;
    }

    if (cart.length === 0) {
      setOrderMessage("Your cart is empty.");
      return;
    }

    if (
      cart.some(
        (item) =>
          !Number.isInteger(Number(item.id)) ||
          Number(item.id) <= 0 ||
          String(item.id).startsWith("demo-")
      )
    ) {
      setOrderMessage(
        "Your cart contains sample products. Start the backend and add products from the database before placing an order."
      );
      return;
    }

    setOrderBusy(true);

    try {
      const response = await axios.post(
        `${API}/api/orders`,
        {
          customerName: orderForm.customerName.trim(),
          phone: orderForm.phone.trim(),
          shippingAddress: orderForm.shippingAddress.trim(),
          items: cart.map((item) => ({
            productId: Number(item.id),
            quantity: item.quantity,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setCart([]);

      setOrderMessage(
        `Order placed successfully! Order ID: ${response.data?.id ?? "Confirmed"}`
      );
    } catch (error) {
      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setOrderMessage(
          "Your login may have expired. Please log in again and retry."
        );
      } else {
        const data = error.response?.data;

        setOrderMessage(
          typeof data === "string"
            ? data
            : data?.message ||
                "Could not place your order. Please check the backend and try again."
        );
      }
    } finally {
      setOrderBusy(false);
    }
  }

  async function loadMyOrders() {
    if (!token) {
      setAuthMode("login");
      setAuthMessage(
        "Please log in to view your orders."
      );
      setPanel("auth");
      return;
    }

    setOrdersBusy(true);
    setOrdersMessage("");
    setPanel("orders");

    try {
      const response = await axios.get(
        `${API}/api/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setOrdersMessage(
          "Your login may have expired. Please log in again."
        );
      } else {
        setOrdersMessage(
          "Could not load your orders. Please try again."
        );
      }
    } finally {
      setOrdersBusy(false);
    }
  }

  return (
    <>
      {isAdminView && userRole === "ROLE_ADMIN" ? (
        <AdminDashboard />
      ) : (
        <div className="shop-app">
          <div className="announcement">
            Thoughtful finds. Everyday prices. Free delivery on orders over ₹999.
          </div>

          <header className="site-header">
            <button
              className="icon-button mobile-toggle"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Toggle menu"
            >
              {mobileMenu ? <X size={21} /> : <Menu size={21} />}
            </button>

            <a
              className="brand"
              href="#home"
              onClick={() => {
                setPanel("");
                setMobileMenu(false);
              }}
            >
              <span className="brand-mark">
                <ShoppingBag size={22} />
              </span>
              <span>
                shopshere<span className="brand-dot">.</span>
              </span>
            </a>

            <nav
              className={
                mobileMenu ? "main-nav nav-open" : "main-nav"
              }
            >
              <a href="#shop" onClick={() => setMobileMenu(false)}>
                Shop
              </a>
              <a
                href="#benefits"
                onClick={() => setMobileMenu(false)}
              >
                Why Shopshere
              </a>
              <a
                href="#footer"
                onClick={() => setMobileMenu(false)}
              >
                About
              </a>
            </nav>

            <label className="search-box">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
              />

              {search && (
                <button
                  className="search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </label>

            <div className="header-actions">
              {token && (
                <button
                  className="secondary-button"
                  onClick={loadMyOrders}
                  disabled={ordersBusy}
                >
                  {ordersBusy ? "Loading..." : "My Orders"}
                </button>
              )}

              {token && userRole === "ROLE_ADMIN" && (
                <button
                  className="secondary-button"
                  onClick={() => setIsAdminView(!isAdminView)}
                >
                  {isAdminView ? "Back to Shop" : "Admin Dashboard"}
                </button>
              )}

              <button
                className="icon-button account-button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthMessage("");
                  setPanel("auth");
                }}
                aria-label="Account"
              >
                <UserRound size={21} />
              </button>

              <button
                className="cart-button"
                onClick={() => setPanel("cart")}
              >
                <ShoppingCart size={20} />
                <span className="cart-label">Cart</span>
                <span className="cart-count">{cartCount}</span>
              </button>
            </div>
          </header>

          <main id="home">
            <section className="hero">
              <div className="hero-content">
                <span className="eyebrow">
                  <span className="eyebrow-line" />
                  THE EVERYDAY EDIT
                </span>

                <h1>
                  Good finds.
                  <br />
                  <span>Better living.</span>
                </h1>

                <p>
                  Discover useful, thoughtfully selected essentials
                  for your home, your style, and everything in between.
                </p>

                <a className="primary-button hero-button" href="#shop">
                  Explore the collection <ArrowRight size={18} />
                </a>

                <div className="hero-proof">
                  <span className="proof-stars">★★★★★</span>
                  <span>Made for your everyday</span>
                </div>
              </div>

              <div
                className="hero-visual"
                aria-label="Featured product collection"
              >
                <div className="hero-orbit orbit-one" />
                <div className="hero-orbit orbit-two" />

                <div className="hero-product-card hero-card-back">
                  <div className="product-art art-watch">
                    <span className="watch-strap" />
                    <span className="watch-face">10:09</span>
                  </div>
                  <span className="hero-card-label">SMART TECH</span>
                </div>

                <div className="hero-product-card hero-card-front">
                  <div className="product-art art-headphones">
                    <span className="headphone-band" />
                    <span className="headphone-left" />
                    <span className="headphone-right" />
                  </div>
                  <span className="hero-card-label">
                    AUDIO ESSENTIALS
                  </span>
                </div>

                <div className="floating-note">
                  <span className="note-icon">
                    <Truck size={19} />
                  </span>
                  <span>
                    <strong>Free delivery</strong>
                    <small>On orders over ₹999</small>
                  </span>
                </div>

                <div className="hero-stamp">
                  MADE FOR
                  <br />
                  EVERYDAY <span>✳</span>
                </div>
              </div>
            </section>

            <section className="trust-strip" id="benefits">
              <div>
                <Truck size={22} />
                <span>
                  <strong>Delivery made easy</strong>
                  <small>Convenient shopping</small>
                </span>
              </div>

              <div>
                <ShieldCheck size={22} />
                <span>
                  <strong>Secure by design</strong>
                  <small>Your account matters</small>
                </span>
              </div>

              <div>
                <RotateCcw size={22} />
                <span>
                  <strong>Shopping, simplified</strong>
                  <small>Less fuss, more finds</small>
                </span>
              </div>

              <div>
                <Package size={22} />
                <span>
                  <strong>Everyday essentials</strong>
                  <small>Picked for your routine</small>
                </span>
              </div>
            </section>

            <section className="shop-section" id="shop">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">THE COLLECTION</span>
                  <h2>Find your next favourite.</h2>
                  <p>Useful things, good prices, no fuss.</p>
                </div>

                <span className="product-count">
                  {filteredProducts.length} products
                </span>
              </div>

              <div className="category-row">
                {categories.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    className={
                      category === item
                        ? "category-chip active"
                        : "category-chip"
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>

              {apiStatus === "connected" && (
                <div className="api-status">
                  <span />
                  Live products from your Shopshere backend
                </div>
              )}

              {apiStatus === "demo" && (
                <div className="api-status demo-status">
                  <span />
                  Showing sample products — start your Spring Boot
                  backend to load database products.
                </div>
              )}

              <div className="product-grid">
                {filteredProducts.map((product, index) => (
                  <article
                    className="product-card"
                    key={product.id}
                  >
                    <div
                      className={`product-image product-image-${index % 8}`}
                    >
                      <span className="product-category">
                        {product.category || "Essentials"}
                      </span>

                      <span className="product-illustration">
                        {index % 4 === 0 ? (
                          <ShoppingBag size={66} strokeWidth={1.1} />
                        ) : index % 4 === 1 ? (
                          <Package size={66} strokeWidth={1.1} />
                        ) : index % 4 === 2 ? (
                          <Truck size={66} strokeWidth={1.1} />
                        ) : (
                          <ShieldCheck size={66} strokeWidth={1.1} />
                        )}
                      </span>

                      {Number(product.stock) === 0 && (
                        <span className="out-of-stock">
                          Sold out
                        </span>
                      )}
                    </div>

                    <div className="product-info">
                      <span className="product-subtitle">
                        {product.category || "Everyday essentials"}
                      </span>

                      <h3>{product.name}</h3>

                      <p>
                        {product.description ||
                          "A thoughtful pick for everyday living."}
                      </p>

                      <div className="product-bottom">
                        <strong>
                          {money(Number(product.price) || 0)}
                        </strong>

                        <button
                          className="add-button"
                          onClick={() => addToCart(product)}
                          disabled={Number(product.stock) === 0}
                          aria-label={`Add ${product.name} to cart`}
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="empty-products">
                  <Search size={32} />
                  <h3>No products found</h3>
                  <p>Try a different search or category.</p>

                  <button
                    className="secondary-button"
                    onClick={() => {
                      setSearch("");
                      setCategory("All");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </section>

            <section className="newsletter">
              <div>
                <span className="eyebrow">
                  A LITTLE SOMETHING GOOD
                </span>
                <h2>Make room for better finds.</h2>
                <p>
                  Explore everyday essentials picked to make life
                  a little easier.
                </p>
              </div>

              <a href="#shop" className="newsletter-button">
                Explore the shop <ArrowRight size={17} />
              </a>
            </section>
          </main>

          <footer className="site-footer" id="footer">
            <a className="brand footer-brand" href="#home">
              <span className="brand-mark">
                <ShoppingBag size={21} />
              </span>
              <span>
                shopshere<span className="brand-dot">.</span>
              </span>
            </a>

            <p>Good finds for everyday living.</p>

            <span>
              © {new Date().getFullYear()} Shopshere. Built with care.
            </span>
          </footer>

          {panel && (
            <div
              className="overlay"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setPanel("");
                }
              }}
            >
              <aside
                className={
                  panel === "cart" || panel === "orders"
                    ? "side-panel"
                    : "auth-panel"
                }
              >
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">
                      {panel === "cart"
                        ? "YOUR SELECTION"
                        : panel === "checkout"
                          ? "SECURE CHECKOUT"
                          : panel === "orders"
                            ? "ORDER HISTORY"
                            : "YOUR ACCOUNT"}
                    </span>

                    <h2>
                      {panel === "cart"
                        ? "Shopping cart"
                        : panel === "checkout"
                          ? "Delivery details"
                          : panel === "orders"
                            ? "My orders"
                            : authMode === "login"
                              ? "Welcome back."
                              : "Join Shopshere."}
                    </h2>
                  </div>

                  <button
                    className="icon-button"
                    onClick={() => setPanel("")}
                    aria-label="Close panel"
                  >
                    <X size={21} />
                  </button>
                </div>

                {panel === "cart" ? (
                  <>
                    {cart.length === 0 ? (
                      <div className="empty-cart">
                        <span>
                          <ShoppingCart size={34} />
                        </span>

                        <h3>Your cart is taking a break.</h3>
                        <p>
                          Find something you love and add it here.
                        </p>

                        <button
                          className="primary-button"
                          onClick={() => {
                            setPanel("");
                            document
                              .getElementById("shop")
                              ?.scrollIntoView({
                                behavior: "smooth",
                              });
                          }}
                        >
                          Explore products <ArrowRight size={17} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="cart-items">
                          {cart.map((item) => (
                            <div
                              className="cart-item"
                              key={item.id}
                            >
                              <div className="cart-item-art">
                                <Package size={28} />
                              </div>

                              <div className="cart-item-details">
                                <h3>{item.name}</h3>
                                <strong>{money(item.price)}</strong>

                                <div className="quantity-control">
                                  <button
                                    onClick={() =>
                                      changeQuantity(item.id, -1)
                                    }
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus size={14} />
                                  </button>

                                  <span>{item.quantity}</span>

                                  <button
                                    onClick={() =>
                                      changeQuantity(item.id, 1)
                                    }
                                    aria-label="Increase quantity"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>

                              <button
                                className="remove-button"
                                onClick={() =>
                                  removeFromCart(item.id)
                                }
                                aria-label="Remove product"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="cart-summary">
                          <div>
                            <span>Subtotal</span>
                            <strong>{money(cartTotal)}</strong>
                          </div>

                          <p>
                            Shipping and any applicable taxes are
                            calculated at checkout.
                          </p>

                          <button
                            className="primary-button checkout-button"
                            onClick={checkout}
                          >
                            Continue to checkout
                            <ArrowRight size={17} />
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : panel === "checkout" ? (
                  <>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => {
                        setOrderMessage("");
                        setPanel("cart");
                      }}
                    >
                      Back to cart
                    </button>

                    {orderMessage && (
                      <div
                        className={`auth-message ${
                          orderMessage.includes("successfully")
                            ? "success"
                            : ""
                        }`}
                        role="status"
                      >
                        {orderMessage}
                      </div>
                    )}

                    {!orderMessage.includes("successfully") && (
                      <>
                        <div className="cart-summary">
                          <div>
                            <span>Order subtotal</span>
                            <strong>{money(cartTotal)}</strong>
                          </div>

                          <p>
                            Final price is calculated by the server
                            from current product prices.
                          </p>
                        </div>

                        <form
                          className="auth-form"
                          onSubmit={submitOrder}
                        >
                          <label>
                            Full name
                            <input
                              required
                              maxLength={100}
                              value={orderForm.customerName}
                              onChange={(e) =>
                                setOrderForm({
                                  ...orderForm,
                                  customerName: e.target.value,
                                })
                              }
                              placeholder="Your full name"
                            />
                          </label>

                          <label>
                            Phone number
                            <input
                              required
                              type="tel"
                              maxLength={20}
                              value={orderForm.phone}
                              onChange={(e) =>
                                setOrderForm({
                                  ...orderForm,
                                  phone: e.target.value,
                                })
                              }
                              placeholder="Your phone number"
                            />
                          </label>

                          <label>
                            Shipping address
                            <textarea
                              required
                              maxLength={500}
                              value={orderForm.shippingAddress}
                              onChange={(e) =>
                                setOrderForm({
                                  ...orderForm,
                                  shippingAddress: e.target.value,
                                })
                              }
                              placeholder="House number, street, city, state and PIN code"
                              rows={4}
                            />
                          </label>

                          <button
                            className="primary-button auth-submit"
                            type="submit"
                            disabled={
                              orderBusy || cart.length === 0
                            }
                          >
                            {orderBusy
                              ? "Placing order..."
                              : `Place order · ${money(cartTotal)}`}
                            <ArrowRight size={17} />
                          </button>
                        </form>
                      </>
                    )}

                    {orderMessage.includes("successfully") && (
                      <button
                        className="primary-button auth-submit"
                        onClick={() => {
                          setOrderMessage("");
                          setPanel("");
                        }}
                      >
                        Continue shopping
                        <ArrowRight size={17} />
                      </button>
                    )}
                  </>
                ) : panel === "orders" ? (
                  <div className="orders-section">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => setPanel("")}
                    >
                      Continue shopping
                    </button>

                    {ordersBusy && (
                      <p>Loading your orders...</p>
                    )}

                    {ordersMessage && (
                      <div className="auth-message">
                        {ordersMessage}
                      </div>
                    )}

                    {!ordersBusy &&
                      !ordersMessage &&
                      orders.length === 0 && (
                        <div className="empty-cart">
                          <span>
                            <Package size={34} />
                          </span>

                          <h3>No orders yet</h3>
                          <p>
                            Your placed orders will appear here.
                          </p>
                        </div>
                      )}

                    {!ordersBusy &&
                      !ordersMessage &&
                      orders.length > 0 && (
                        <div className="orders-list">
                          {orders.map((order) => (
                            <article
                              className="order-card"
                              key={order.orderId}
                            >
                              <div className="order-card-heading">
                                <div>
                                  <span className="eyebrow">
                                    ORDER #{order.orderId}
                                  </span>

                                  <h3>
                                    {order.createdAt
                                      ? new Date(
                                          order.createdAt
                                        ).toLocaleDateString("en-IN")
                                      : "Date unavailable"}
                                  </h3>
                                </div>

                                <span className="order-status">
                                  {order.status}
                                </span>
                              </div>

                              <div className="order-products">
                                {order.items?.map(
                                  (item, index) => (
                                    <div
                                      className="order-product"
                                      key={`${order.orderId}-${item.productId}-${index}`}
                                    >
                                      <div>
                                        <strong>
                                          {item.productName}
                                        </strong>
                                        <small>
                                          Qty: {item.quantity}
                                        </small>
                                      </div>

                                      <span>
                                        {money(
                                          Number(item.price) *
                                            Number(item.quantity)
                                        )}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>

                              <div className="order-total">
                                <span>Total</span>
                                <strong>
                                  {money(
                                    Number(order.totalAmount)
                                  )}
                                </strong>
                              </div>

                              <div className="order-shipping">
                                <strong>Delivery details</strong>
                                <p>{order.customerName}</p>
                                <p>{order.phone}</p>
                                <p>{order.shippingAddress}</p>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                  </div>
                ) : (
                  <>
                    <div className="auth-switch">
                      <button
                        className={
                          authMode === "login" ? "selected" : ""
                        }
                        onClick={() => {
                          setAuthMode("login");
                          setAuthMessage("");
                        }}
                      >
                        Login
                      </button>

                      <button
                        className={
                          authMode === "register" ? "selected" : ""
                        }
                        onClick={() => {
                          setAuthMode("register");
                          setAuthMessage("");
                        }}
                      >
                        Create account
                      </button>
                    </div>

                    <form
                      className="auth-form"
                      onSubmit={submitAuth}
                    >
                      {authMode === "register" && (
                        <label>
                          Full name
                          <input
                            required
                            value={authForm.name}
                            onChange={(e) =>
                              setAuthForm({
                                ...authForm,
                                name: e.target.value,
                              })
                            }
                            placeholder="Your name"
                          />
                        </label>
                      )}

                      <label>
                        Email address
                        <input
                          required
                          type="email"
                          value={authForm.email}
                          onChange={(e) =>
                            setAuthForm({
                              ...authForm,
                              email: e.target.value,
                            })
                          }
                          placeholder="you@example.com"
                        />
                      </label>

                      <label>
                        Password
                        <input
                          required
                          minLength={8}
                          type="password"
                          value={authForm.password}
                          onChange={(e) =>
                            setAuthForm({
                              ...authForm,
                              password: e.target.value,
                            })
                          }
                          placeholder="At least 8 characters"
                        />
                      </label>

                      <button
                        className="primary-button auth-submit"
                        type="submit"
                        disabled={authBusy}
                      >
                        {authBusy
                          ? "Please wait..."
                          : authMode === "login"
                            ? "Login"
                            : "Create account"}
                        <ArrowRight size={17} />
                      </button>
                    </form>

                    {authMessage && (
                      <div
                        className={
                          authMessage
                            .toLowerCase()
                            .includes("success")
                            ? "auth-message success"
                            : "auth-message"
                        }
                      >
                        {authMessage}
                      </div>
                    )}

                    {token && (
                      <button
                        className="secondary-button logout-button"
                        onClick={logout}
                      >
                        Log out
                      </button>
                    )}

                    <p className="auth-note">
                      <ShieldCheck size={16} />
                      Passwords are securely hashed by the backend.
                    </p>
                  </>
                )}
              </aside>
            </div>
          )}
        </div>
      )}
    </>
  );
}
