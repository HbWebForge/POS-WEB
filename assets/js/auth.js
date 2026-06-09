// Authentication & Database Module
const AuthDB = {
  // Restaurant Details
  restaurant: {
    name: "  FastFood Restaurant",
    address: "123 Main Street, Narowal, Pakistan",
    phone: "+92-300-1234567",
    bankAccount: { name: "Bank Account", number: "12345-67890123-4" },
    easypaisa: { name: "EasyPaisa Account", number: "0300-1234567" },
    jazzcash: { name: "JazzCash Account", number: "0310-1234567" },
  },

  // Demo users
  users: {
    waiter: {
      username: "waiter",
      password: "1234",
      role: "waiter",
      name: "Waiter",
    },
    cashier: {
      username: "cashier",
      password: "1234",
      role: "cashier",
      name: "Cashier",
    },
    admin: {
      username: "admin",
      password: "1234",
      role: "manager",
      name: "Manager",
    },
  },

  categories: [
    { id: 1, name: "Burgers", icon: "🍔" },
    { id: 2, name: "Shawarma", icon: "🌯" },
    { id: 3, name: "Chicken PCS", icon: "🍗" },
    { id: 4, name: "Nuggets", icon: "🧽" },
    { id: 5, name: "Hot wings", icon: "🪽" },
    { id: 6, name: "Fries", icon: "🍟" },
    { id: 7, name: "Drinks", icon: "🥤" },
    { id: 8, name: "Pizza", icon: "🍕" },
    { id: 9, name: "Extra Pizza topping", icon: "➕" },
    { id: 10, name: "Chicken Biryani ", icon: "🥘" },
    { id: 11, name: "Pasta  ", icon: "🍝" },
  ],

  products: [
    { id: 1, name: "Jumbo zinger burger", category: 1, price: 400, icon: "🍔" },
    {  id: 2, name: "Student zinger burger",     category: 1,      price: 350,  icon: "🍔",},
    {  id: 3,  name: "Sizzler zinger burger",  category: 1,  price: 380,  icon: "🍔", },
    { id: 4, name: " special burger", category: 1, price: 500, icon: "🍔" },
    {  id: 5,  name: "Double decker burger",  category: 1, price: 550, icon: "🍔", },
     {   id: 6,  name: "Chicken patty burger",  category: 1,  price: 250,  icon: "🍔",  },
    {  id: 7,name: "Chicken grill burger",category: 1,  price: 550, icon: "🍔",    },
    { id: 8, name: "Chicken shawarman", category: 2, price: 220, icon: "🌯" },
    { id: 9, name: "Zinger shawarman", category: 2, price: 300, icon: "🌯" },
    {   id: 10,  name: "Chicken pratha roll", category: 2,  price: 300,  icon: "🌯",  },
    { id: 11, name: "Zinger pratha roll", category: 2, price: 350, icon: "🌯" },
    { id: 12, name: "01 chicken pcs", category: 3, price: 230, icon: "🍗" },
    { id: 13, name: "03 chicken pcs", category: 3, price: 650, icon: "🍗" },
    { id: 14, name: "05 chicken pcs", category: 3, price: 1100, icon: "🍗" },
    { id: 15, name: "05 nuggets pcs", category: 4, price: 300, icon: "🧽" },
    { id: 16, name: "10 nuggets pcs", category: 4, price: 600, icon: "🧽" },
    { id: 17, name: "20 nuggets pcs", category: 4, price: 1150, icon: "🧽" },
    { id: 18, name: "05 wings pcs", category: 5, price: 300, icon: "🪽" },
    { id: 19, name: "10 wings pcs", category: 5, price: 580, icon: "🪽" },
    { id: 20, name: "20 wings pcs", category: 5, price: 1150, icon: "🪽" },
    { id: 21, name: "10 oven wings pcs", category: 5, price: 630, icon: "🪽" },
    { id: 22, name: "Loaded fries", category: 6, price: 600, icon: "🍟" },
    { id: 23, name: "Masala fries", category: 6, price: 320, icon: "🍟" },
    { id: 24, name: "Regular fries", category: 6, price: 300, icon: "🍟" },
    { id: 25, name: "Family fries", category: 6, price: 600, icon: "🍟" },
    { id: 25, name: "Garlic mayo Regular fries", category: 6, price: 320, icon: "🍟" },
    { id: 26, name: "small water", category: 7, price: 60, icon: "🥤" },
    { id: 27, name: "1.5 Ltr water", category: 7, price: 120, icon: "🥤" },
    { id: 28, name: "1 Ltr Drink", category: 7, price: 170, icon: "🥤" },
    { id: 29, name: "1.5 Ltr Drink", category: 7, price: 220, icon: "🥤" },
    { id: 30, name: "M-kabab special pizza", category: 8, price: 1350, icon: "🍕" },
    { id: 31, name: "L-kabab special pizza", category: 8, price: 1850, icon: "🍕" },
    { id: 32, name: "XL-kabab special pizza", category: 8, price: 2450, icon: "🍕" },
    { id: 33, name: "M-Donner special pizza", category: 8, price: 1350, icon: "🍕" },
    { id: 34, name: "L-Donner special pizza", category: 8, price: 1850, icon: "🍕" },
    { id: 35, name: "XL-Donner special pizza", category: 8, price: 2450, icon: "🍕" },
    { id: 36, name: "M-malai Donner special pizza", category: 8, price: 1350, icon: "🍕" },
    { id: 37, name: "L-malai Donner special pizza", category: 8, price: 1850, icon: "🍕" },
    { id: 38, name: "XL-malai Donner special pizza", category: 8, price: 2450, icon: "🍕" },
    { id: 39, name: "M-Crown crust pizza", category: 8, price: 1350, icon: "🍕" },
    { id: 40, name: "L-Crown crust pizza", category: 8, price: 1850, icon: "🍕" },
    { id: 41, name: "XL-Crown crust pizza", category: 8, price: 2450, icon: "🍕" },
    { id: 42, name: "S-white  special pizza", category: 8, price: 650, icon: "🍕" },
    { id: 43, name: "M-white  special pizza", category: 8, price: 1250, icon: "🍕" },
    { id: 44, name: "L-white  special pizza", category: 8, price: 1650, icon: "🍕" },
    { id: 45, name: "XL-white  special pizza", category: 8, price: 2250, icon: "🍕" },
    { id: 46, name: "S-malai boti special pizza", category: 8, price: 650, icon: "🍕" },
    { id: 47, name: "M-malai boti special pizza", category: 8, price: 1250, icon: "🍕" },
    { id: 48, name: "L-malai boti special pizza", category: 8, price: 1650, icon: "🍕" },
    { id: 49, name: "XL-malai boti special pizza", category: 8, price: 2250, icon: "🍕" },
    { id: 50, name: "S-Chicken Tikka pizza", category: 8, price: 650, icon: "🍕" },
    { id: 51, name: "M-Chicken Tikka pizza", category: 8, price: 1250, icon: "🍕" },
    { id: 52, name: "L-Chicken Tikka pizza", category: 8, price: 1650, icon: "🍕" },
    { id: 53, name: "XL-Chicken Tikka pizza", category: 8, price: 2250, icon: "🍕" },
    { id: 54, name: "M-Cheeze lover pizza", category: 8, price: 1300, icon: "🍕" },
    { id: 55, name: "L-Cheeze lover pizza", category: 8, price: 1850, icon: "🍕" },
    { id: 56, name: "XL-Cheeze lover pizza", category: 8, price: 2450, icon: "🍕" },
    { id: 57, name: "S-Hot & spicy pizza", category: 8, price: 650, icon: "🍕" },
    { id: 58, name: "M-Hot & spicy pizza", category: 8, price: 1250, icon: "🍕" },
    { id: 59, name: "L-Hot & spicy pizza", category: 8, price: 1650, icon: "🍕" },
    { id: 60, name: "XL-Hot & spicy pizza", category: 8, price: 2250, icon: "🍕" },
    { id: 61, name: "S-fajita pizza", category: 8, price: 650, icon: "🍕" },
    { id: 62, name: "M-fajita pizza", category: 8, price: 1250, icon: "🍕" },
    { id: 63, name: "L-fajita pizza", category: 8, price: 1650, icon: "🍕" },
    { id: 64, name: "XL-fajita pizza", category: 8, price: 2250, icon: "🍕" },
    { id: 65, name: "S-pizza pratha", category: 8, price: 500, icon: "🍕" },
    { id: 66, name: "M-pizza topping", category: 9, price: 150, icon: "➕" },
    { id: 67, name: "L-pizza topping", category: 9, price: 200, icon: "➕" },
    { id: 68, name: "XL-pizza topping", category: 9, price: 200, icon: "➕" },
    { id: 69, name: "F-chicken biryani", category: 10, price: 300, icon: "🥘" },
    { id: 70, name: "H-chicken biryani", category: 10, price: 150, icon: "🥘" },
    { id: 71, name: "H-pasta", category: 11, price: 300, icon: "🍝" },
    { id: 72, name: "F-pasta", category: 11, price: 600, icon: "🍝" },
  ],

  deals: [],

  orders: [],
  orderCounter: 1000,

  init() {
    this.loadFromLocalStorage();
  },

  loadFromLocalStorage() {
    const stored = localStorage.getItem("posDatabase");
    if (stored) {
      const data = JSON.parse(stored);
      this.categories = data.categories || this.categories;
      this.products = data.products || this.products;
      this.deals = data.deals || [];
      this.orders = data.orders || [];
      this.orderCounter = data.orderCounter || 1000;
    }
  },

  saveToLocalStorage() {
    const data = {
      categories: this.categories,
      products: this.products,
      deals: this.deals,
      orders: this.orders,
      orderCounter: this.orderCounter,
    };
    localStorage.setItem("posDatabase", JSON.stringify(data));
  },
};

// Authentication Handler
class Auth {
  static login(username, password, role) {
    const user = AuthDB.users[username];

    if (user && user.password === password && user.role === role) {
      const userData = {
        username: user.username,
        role: user.role,
        name: user.name,
        loginTime: new Date().toLocaleString(),
      };

      sessionStorage.setItem("currentUser", JSON.stringify(userData));
      return { success: true, user: userData };
    }

    return { success: false, message: "Invalid credentials" };
  }

  static logout() {
    sessionStorage.removeItem("currentUser");
  }

  static getCurrentUser() {
    const user = sessionStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  }

  static isAuthenticated() {
    return this.getCurrentUser() !== null;
  }

  static redirect() {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = "index.html";
      return false;
    }

    const role = user.role;
    const path = window.location.pathname;

    if (role === "waiter" && !path.includes("waiter.html")) {
      window.location.href = "waiter.html";
    } else if (role === "cashier" && !path.includes("cashier.html")) {
      window.location.href = "cashier.html";
    } else if (role === "manager" && !path.includes("manager.html")) {
      window.location.href = "manager.html";
    }

    return true;
  }
}

// Currency Formatting Function
function formatCurrency(amount) {
  return new Intl.NumberFormat("ur-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Initialize Database
AuthDB.init();

// Handle Login Form
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const role = document.getElementById("role").value;

      const result = Auth.login(username, password, role);

      if (result.success) {
        if (role === "waiter") {
          window.location.href = "waiter.html";
        } else if (role === "cashier") {
          window.location.href = "cashier.html";
        } else if (role === "manager") {
          window.location.href = "manager.html";
        }
      } else {
        alert("Invalid username, password, or role!");
      }
    });
  }

  // Check if user is already logged in
  if (Auth.isAuthenticated() && document.getElementById("loginForm")) {
    Auth.redirect();
  }
});

// Utility Functions for Orders
function generateOrderId() {
  AuthDB.orderCounter++;
  AuthDB.saveToLocalStorage();
  return `ORD-${AuthDB.orderCounter}`;
}

function getProductById(id) {
  return AuthDB.products.find((p) => p.id === id);
}

function getCategoryById(id) {
  return AuthDB.categories.find((c) => c.id === id);
}

function addOrder(orderData) {
  const order = {
    id: generateOrderId(),
    ...orderData,
    createdAt: new Date().toLocaleString(),
    submittedAt: new Date().toLocaleString(),
    editHistory: [],
    status: "pending",
  };
  AuthDB.orders.push(order);
  AuthDB.saveToLocalStorage();
  return order;
}

function updateOrderStatus(orderId, status) {
  const order = AuthDB.orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    if (status === "completed") {
      order.completedAt = new Date().toLocaleString();
    }
    AuthDB.saveToLocalStorage();
    return order;
  }
  return null;
}

// Update order items (add/edit/delete)
function updateOrderItems(orderId, items) {
  const order = AuthDB.orders.find((o) => o.id === orderId);
  if (order && order.status === "pending") {
    const oldItems = JSON.stringify(order.items);
    order.items = items;
    order.editHistory = order.editHistory || [];
    order.editHistory.push({
      editedAt: new Date().toLocaleString(),
      oldItems: oldItems,
    });
    // Recalculate totals
    order.subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    order.tax = order.subtotal * 0.05;
    order.total = order.subtotal + order.tax;
    AuthDB.saveToLocalStorage();
    return order;
  }
  return null;
}

// Add single item to order
function addItemToOrder(orderId, item) {
  const order = AuthDB.orders.find((o) => o.id === orderId);
  if (order && order.status === "pending") {
    order.items.push(item);
    order.subtotal = order.items.reduce(
      (sum, item) => sum + (item.total || 0),
      0,
    );
    order.tax = order.subtotal * 0.05;
    order.total = order.subtotal + order.tax;
    AuthDB.saveToLocalStorage();
    return order;
  }
  return null;
}

// Remove item from order
function removeItemFromOrder(orderId, itemIndex) {
  const order = AuthDB.orders.find((o) => o.id === orderId);
  if (order && order.status === "pending") {
    order.items.splice(itemIndex, 1);
    order.subtotal = order.items.reduce(
      (sum, item) => sum + (item.total || 0),
      0,
    );
    order.tax = order.subtotal * 0.05;
    order.total = order.subtotal - order.tax;
    AuthDB.saveToLocalStorage();
    return order;
  }
  return null;
}

function getAllOrders() {
  return AuthDB.orders;
}

function getOrdersByStatus(status) {
  return AuthDB.orders.filter((o) => o.status === status);
}

function calculateDailyRevenue(date = new Date()) {
  const dateStr = date.toLocaleDateString();
  return AuthDB.orders
    .filter(
      (o) =>
        new Date(o.createdAt).toLocaleDateString() === dateStr &&
        o.status === "completed",
    )
    .reduce((sum, o) => sum + o.total, 0);
}

function getTopSellingProducts(days = 1) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const productSales = {};

  AuthDB.orders
    .filter(
      (o) => new Date(o.createdAt) >= cutoffDate && o.status === "completed",
    )
    .forEach((order) => {
      order.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.total;
      });
    });

  return Object.entries(productSales)
    .map(([productId, data]) => ({
      product: getProductById(parseInt(productId)),
      ...data,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
}

function getRevenueBetween(startDate, endDate) {
  return AuthDB.orders
    .filter((o) => {
      const orderDate = new Date(o.createdAt);
      return (
        orderDate >= startDate &&
        orderDate <= endDate &&
        o.status === "completed"
      );
    })
    .reduce((sum, o) => sum + o.total, 0);
}
