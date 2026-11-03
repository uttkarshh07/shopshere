
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api/admin/products";
const ORDER_API = "http://localhost:8080/api/admin/orders";

const STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderError, setOrderError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });

  const [editingId, setEditingId] = useState(null);
  const token = localStorage.getItem("shopshere_token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const loadProducts = async () => {
    try {
      const response = await axios.get(API, { headers });
      setProducts(response.data);
      setError("");
    } catch (err) {
      setError("Could not load products. Please log in with an admin account.");
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await axios.get(ORDER_API, { headers });
      setOrders(response.data);
      setOrderError("");
    } catch (err) {
      setOrderError("Could not load orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
    });
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addProduct = async (e) => {
    e.preventDefault();

    const productData = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    };

    try {
      if (editingId !== null) {
        await axios.put(`${API}/${editingId}`, productData, { headers });
        alert("Product updated successfully!");
      } else {
        await axios.post(API, productData, { headers });
        alert("Product added successfully!");
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      alert("Could not save product. Please check your details.");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await axios.delete(`${API}/${id}`, { headers });
      await loadProducts();
      alert("Product deleted successfully!");
    } catch (err) {
      alert("Could not delete product.");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(
        `${ORDER_API}/${orderId}/status`,
        { status },
        { headers }
      );

      await loadOrders();
      alert("Order status updated successfully!");
    } catch (err) {
      alert("Could not update order status.");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Shopshere Admin Dashboard</h1>
      <p>Manage your store products and customer orders here.</p>

      <hr />

      <h2>{editingId !== null ? "Edit Product" : "Add New Product"}</h2>

      <form
        onSubmit={addProduct}
        style={{
          display: "grid",
          gap: "12px",
          maxWidth: "500px",
          marginBottom: "35px",
        }}
      >
        <input
          name="name"
          placeholder="Product name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Product description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <input
          name="price"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
        />

        <input
          name="stock"
          type="number"
          min="0"
          step="1"
          placeholder="Stock quantity"
          value={form.stock}
          onChange={handleChange}
          required
        />

        <button type="submit">
          {editingId !== null ? "Update Product" : "Add Product"}
        </button>

        {editingId !== null && (
          <button type="button" onClick={resetForm}>
            Cancel Edit
          </button>
        )}
      </form>

      <h2>Existing Products</h2>

      {loading && <p>Loading products...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p>No products found.</p>
      )}

      <div style={{ overflowX: "auto", marginBottom: "50px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>₹{Number(product.price).toFixed(2)}</td>
                <td>{product.stock}</td>
                <td>
                  <button onClick={() => editProduct(product)}>Edit</button>
                  <button onClick={() => deleteProduct(product.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr />

      <h2>Customer Orders</h2>

      {ordersLoading && <p>Loading orders...</p>}
      {orderError && <p style={{ color: "red" }}>{orderError}</p>}

      {!ordersLoading && !orderError && orders.length === 0 && (
        <p>No customer orders found.</p>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customerName}</td>
                <td>{order.phone}</td>
                <td>{order.shippingAddress}</td>
                <td>₹{Number(order.totalAmount).toFixed(2)}</td>
                <td>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(order.id, e.target.value)
                    }
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
