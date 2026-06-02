// Authentication & Database Module
const AuthDB = {
    // Restaurant Details
    restaurant: {
        name: 'FastFood Restaurant',
        address: '123 Main Street, Karachi, Pakistan',
        phone: '+92-300-1234567',
        bankAccount: { name: 'Bank Account', number: '12345-67890123-4' },
        easypaisa: { name: 'EasyPaisa Account', number: '0300-1234567' },
        jazzcash: { name: 'JazzCash Account', number: '0310-1234567' }
    },

    // Demo users
    users: {
        waiter: { username: 'waiter', password: '1234', role: 'waiter', name: 'Waiter' },
        cashier: { username: 'cashier', password: '1234', role: 'cashier', name: 'Cashier' },
        admin: { username: 'admin', password: '1234', role: 'manager', name: 'Manager' }
    },

    categories: [
        { id: 1, name: 'Burgers', icon: '🍔' },
        { id: 2, name: 'Pizza', icon: '🍕' },
        { id: 3, name: 'Drinks', icon: '🥤' },
        { id: 4, name: 'Sides', icon: '🍟' },
        { id: 5, name: 'Desserts', icon: '🍰' }
    ],

    products: [
        { id: 1, name: 'Burger', category: 1, price: 500, icon: '🍔' },
        { id: 2, name: 'Cheese Burger', category: 1, price: 600, icon: '🍔' },
        { id: 3, name: 'Double Burger', category: 1, price: 800, icon: '🍔' },
        { id: 4, name: 'Margarita Pizza', category: 2, price: 800, icon: '🍕' },
        { id: 5, name: 'Pepperoni Pizza', category: 2, price: 900, icon: '🍕' },
        { id: 6, name: 'Coke', category: 3, price: 150, icon: '🥤' },
        { id: 7, name: 'Sprite', category: 3, price: 150, icon: '🥤' },
        { id: 8, name: 'Juice', category: 3, price: 200, icon: '🥤' },
        { id: 9, name: 'French Fries', category: 4, price: 300, icon: '🍟' },
        { id: 10, name: 'Chicken Nuggets', category: 4, price: 400, icon: '🍗' },
        { id: 11, name: 'Cake', category: 5, price: 350, icon: '🍰' },
        { id: 12, name: 'Ice Cream', category: 5, price: 300, icon: '🍦' }
    ],

    deals: [],

    orders: [],
    orderCounter: 1000,

    init() {
        this.loadFromLocalStorage();
    },

    loadFromLocalStorage() {
        const stored = localStorage.getItem('posDatabase');
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
            orderCounter: this.orderCounter
        };
        localStorage.setItem('posDatabase', JSON.stringify(data));
    }
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
                loginTime: new Date().toLocaleString()
            };
            
            sessionStorage.setItem('currentUser', JSON.stringify(userData));
            return { success: true, user: userData };
        }
        
        return { success: false, message: 'Invalid credentials' };
    }

    static logout() {
        sessionStorage.removeItem('currentUser');
    }

    static getCurrentUser() {
        const user = sessionStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    static isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    static redirect() {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = 'index.html';
            return false;
        }
        
        const role = user.role;
        const path = window.location.pathname;

        if (role === 'waiter' && !path.includes('waiter.html')) {
            window.location.href = 'waiter.html';
        } else if (role === 'cashier' && !path.includes('cashier.html')) {
            window.location.href = 'cashier.html';
        } else if (role === 'manager' && !path.includes('manager.html')) {
            window.location.href = 'manager.html';
        }

        return true;
    }
}

// Currency Formatting Function
function formatCurrency(amount) {
    return new Intl.NumberFormat('ur-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Initialize Database
AuthDB.init();

// Handle Login Form
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            const result = Auth.login(username, password, role);
            
            if (result.success) {
                if (role === 'waiter') {
                    window.location.href = 'waiter.html';
                } else if (role === 'cashier') {
                    window.location.href = 'cashier.html';
                } else if (role === 'manager') {
                    window.location.href = 'manager.html';
                }
            } else {
                alert('Invalid username, password, or role!');
            }
        });
    }

    // Check if user is already logged in
    if (Auth.isAuthenticated() && document.getElementById('loginForm')) {
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
    return AuthDB.products.find(p => p.id === id);
}

function getCategoryById(id) {
    return AuthDB.categories.find(c => c.id === id);
}

function addOrder(orderData) {
    const order = {
        id: generateOrderId(),
        ...orderData,
        createdAt: new Date().toLocaleString(),
        submittedAt: new Date().toLocaleString(),
        editHistory: [],
        status: 'pending'
    };
    AuthDB.orders.push(order);
    AuthDB.saveToLocalStorage();
    return order;
}

function updateOrderStatus(orderId, status) {
    const order = AuthDB.orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        if (status === 'completed') {
            order.completedAt = new Date().toLocaleString();
        }
        AuthDB.saveToLocalStorage();
        return order;
    }
    return null;
}

// Update order items (add/edit/delete)
function updateOrderItems(orderId, items) {
    const order = AuthDB.orders.find(o => o.id === orderId);
    if (order && order.status === 'pending') {
        const oldItems = JSON.stringify(order.items);
        order.items = items;
        order.editHistory = order.editHistory || [];
        order.editHistory.push({
            editedAt: new Date().toLocaleString(),
            oldItems: oldItems
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
    const order = AuthDB.orders.find(o => o.id === orderId);
    if (order && order.status === 'pending') {
        order.items.push(item);
        order.subtotal = order.items.reduce((sum, item) => sum + (item.total || 0), 0);
        order.tax = order.subtotal * 0.05;
        order.total = order.subtotal + order.tax;
        AuthDB.saveToLocalStorage();
        return order;
    }
    return null;
}

// Remove item from order
function removeItemFromOrder(orderId, itemIndex) {
    const order = AuthDB.orders.find(o => o.id === orderId);
    if (order && order.status === 'pending') {
        order.items.splice(itemIndex, 1);
        order.subtotal = order.items.reduce((sum, item) => sum + (item.total || 0), 0);
        order.tax = order.subtotal * 0.05;
        order.total = order.subtotal + order.tax;
        AuthDB.saveToLocalStorage();
        return order;
    }
    return null;
}

function getAllOrders() {
    return AuthDB.orders;
}

function getOrdersByStatus(status) {
    return AuthDB.orders.filter(o => o.status === status);
}

function calculateDailyRevenue(date = new Date()) {
    const dateStr = date.toLocaleDateString();
    return AuthDB.orders
        .filter(o => new Date(o.createdAt).toLocaleDateString() === dateStr && o.status === 'completed')
        .reduce((sum, o) => sum + o.total, 0);
}

function getTopSellingProducts(days = 1) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const productSales = {};

    AuthDB.orders
        .filter(o => new Date(o.createdAt) >= cutoffDate && o.status === 'completed')
        .forEach(order => {
            order.items.forEach(item => {
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
            ...data
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
}

function getRevenueBetween(startDate, endDate) {
    return AuthDB.orders
        .filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= startDate && orderDate <= endDate && o.status === 'completed';
        })
        .reduce((sum, o) => sum + o.total, 0);
}
