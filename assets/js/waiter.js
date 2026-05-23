// Waiter Dashboard JS
class WaiterDashboard {
    constructor() {
        this.currentOrderType = 'dine-in';
        this.currentCategory = 1;
        this.cart = [];
        this.user = Auth.getCurrentUser();

        if (!this.user) {
            window.location.href = 'index.html';
            return;
        }

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCategories();
        this.renderMenuItems();
        this.updateCartDisplay();
        this.updateUserInfo();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    setupEventListeners() {
        // Sidebar Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.changePage(page);
            });
        });

        // Order Type Buttons
        document.querySelectorAll('.order-type-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectOrderType(btn));
        });

        // Category Tabs
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-tab')) {
                this.selectCategory(e.target);
            }
        });

        // Cart Actions
        document.getElementById('clearCartBtn').addEventListener('click', () => this.clearCart());
        document.getElementById('submitOrderBtn').addEventListener('click', () => this.submitOrder());

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            Auth.logout();
            window.location.href = 'index.html';
        });

        // Modal Close
        document.querySelector('.modal-close').addEventListener('click', () => {
            document.getElementById('orderDetailsModal').classList.remove('active');
        });
    }

    updateUserInfo() {
        document.getElementById('userRole').textContent = `${this.user.name} - ${this.user.role}`;
        document.getElementById('userInfo').textContent = `User: ${this.user.name}`;
    }

    updateClock() {
        const now = new Date();
        document.getElementById('currentTime').textContent = now.toLocaleTimeString();
    }

    changePage(page) {
        // Hide all pages
        document.querySelectorAll('.page-content').forEach(p => {
            p.classList.add('hidden');
        });

        // Update active nav
        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.remove('active');
        });

        // Show selected page
        if (page === 'orders') {
            document.getElementById('ordersPage').classList.remove('hidden');
            document.getElementById('pageTitle').textContent = 'New Order';
            document.querySelector('[data-page="orders"]').classList.add('active');
        } else if (page === 'active-orders') {
            document.getElementById('activeOrdersPage').classList.remove('hidden');
            document.getElementById('pageTitle').textContent = 'My Orders';
            document.querySelector('[data-page="active-orders"]').classList.add('active');
            this.renderActiveOrders();
        }
    }

    renderCategories() {
        const container = document.getElementById('categoryTabs');
        container.innerHTML = '';

        AuthDB.categories.forEach(category => {
            const tab = document.createElement('div');
            tab.className = 'category-tab';
            if (category.id === this.currentCategory) {
                tab.classList.add('active');
            }
            tab.textContent = `${category.icon} ${category.name}`;
            tab.dataset.categoryId = category.id;
            container.appendChild(tab);
        });
    }

    selectCategory(element) {
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        element.classList.add('active');
        this.currentCategory = parseInt(element.dataset.categoryId);
        this.renderMenuItems();
    }

    renderMenuItems() {
        const container = document.getElementById('menuItems');
        container.innerHTML = '';

        const items = AuthDB.products.filter(p => p.category === this.currentCategory);

        items.forEach(product => {
            const item = document.createElement('div');
            item.className = 'menu-item';
            item.innerHTML = `
                <div class="menu-item-icon">${product.icon}</div>
                <div class="menu-item-name">${product.name}</div>
                <div class="menu-item-price">₹${product.price}</div>
            `;
            item.addEventListener('click', () => this.addToCart(product));
            container.appendChild(item);
        });
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => item.productId === product.id);

        if (existingItem) {
            existingItem.quantity++;
            existingItem.total = existingItem.quantity * existingItem.price;
        } else {
            this.cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                total: product.price
            });
        }

        this.updateCartDisplay();
        this.showNotification(`${product.name} added to cart`);
    }

    updateCartDisplay() {
        const cartContainer = document.getElementById('cartItems');
        cartContainer.innerHTML = '';

        if (this.cart.length === 0) {
            cartContainer.innerHTML = '<p style="text-align: center; color: #999;">Cart is empty</p>';
        } else {
            this.cart.forEach((item, index) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <div class="cart-item-header">
                        <span>${item.name}</span>
                        <span>₹${item.total}</span>
                    </div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="waiterDashboard.updateQty(${index}, -1)">−</button>
                        <span class="qty-input">${item.quantity}</span>
                        <button class="qty-btn" onclick="waiterDashboard.updateQty(${index}, 1)">+</button>
                        <button class="remove-item" onclick="waiterDashboard.removeFromCart(${index})">Remove</button>
                    </div>
                `;
                cartContainer.appendChild(itemEl);
            });
        }

        this.updateTotals();
    }

    updateQty(index, change) {
        const item = this.cart[index];
        item.quantity += change;

        if (item.quantity <= 0) {
            this.removeFromCart(index);
        } else {
            item.total = item.quantity * item.price;
            this.updateCartDisplay();
        }
    }

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.updateCartDisplay();
    }

    updateTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.05;
        const total = subtotal + tax;

        document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('taxAmount').textContent = `₹${tax.toFixed(2)}`;
        document.getElementById('totalAmount').textContent = `₹${total.toFixed(2)}`;
    }

    clearCart() {
        if (confirm('Are you sure you want to clear the cart?')) {
            this.cart = [];
            this.updateCartDisplay();
            this.showNotification('Cart cleared');
        }
    }

    submitOrder() {
        if (this.cart.length === 0) {
            alert('Cart is empty!');
            return;
        }

        const customerName = document.getElementById('customerName').value || 'Guest';
        const total = this.cart.reduce((sum, item) => sum + item.total, 0) * 1.05;

        const orderData = {
            waiter: this.user.name,
            type: this.currentOrderType,
            customer: customerName,
            items: this.cart,
            subtotal: this.cart.reduce((sum, item) => sum + item.total, 0),
            tax: this.cart.reduce((sum, item) => sum + item.total, 0) * 0.05,
            total: total
        };

        if (this.currentOrderType === 'dine-in') {
            const tableNo = document.getElementById('tableNumber').value;
            if (!tableNo) {
                alert('Please enter table number for dine-in order');
                return;
            }
            orderData.tableNumber = tableNo;
        } else if (this.currentOrderType === 'delivery') {
            const address = document.getElementById('deliveryAddress').value;
            if (!address) {
                alert('Please enter delivery address');
                return;
            }
            orderData.deliveryAddress = address;
        }

        const order = addOrder(orderData);

        alert(`Order ${order.id} created successfully!`);
        this.cart = [];
        this.updateCartDisplay();
        document.getElementById('customerName').value = '';
        document.getElementById('tableNumber').value = '';
        document.getElementById('deliveryAddress').value = '';

        this.changePage('active-orders');
    }

    selectOrderType(btn) {
        document.querySelectorAll('.order-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentOrderType = btn.dataset.type;

        // Show/hide relevant fields
        document.querySelectorAll('[data-type]').forEach(field => {
            if (field.dataset.type === this.currentOrderType) {
                field.style.display = 'block';
            } else {
                field.style.display = 'none';
            }
        });
    }

    renderActiveOrders() {
        const container = document.getElementById('activeOrdersList');
        container.innerHTML = '<h2>My Orders</h2>';

        const orders = getAllOrders().filter(o => o.waiter === this.user.name && o.status !== 'paid');

        if (orders.length === 0) {
            container.innerHTML += '<p style="text-align: center; padding: 30px;">No active orders</p>';
            return;
        }

        const ordersHtml = orders.map(order => `
            <div class="order-card ${order.status}">
                <div class="order-card-header">
                    <span class="order-card-id">${order.id}</span>
                    <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
                </div>
                <div class="order-card-details">
                    <p><strong>Customer:</strong> ${order.customer}</p>
                    <p><strong>Type:</strong> ${order.type}</p>
                    ${order.tableNumber ? `<p><strong>Table:</strong> ${order.tableNumber}</p>` : ''}
                    ${order.deliveryAddress ? `<p><strong>Address:</strong> ${order.deliveryAddress}</p>` : ''}
                    <p><strong>Items:</strong> ${order.items.length}</p>
                </div>
                <div class="order-total">Total: ₹${order.total.toFixed(2)}</div>
                <button class="btn btn-secondary" onclick="waiterDashboard.viewOrderDetails('${order.id}')">View Details</button>
            </div>
        `).join('');

        container.innerHTML += ordersHtml;
    }

    viewOrderDetails(orderId) {
        const order = getAllOrders().find(o => o.id === orderId);
        if (!order) return;

        const itemsHtml = order.items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price}</td>
                <td>₹${item.total.toFixed(2)}</td>
            </tr>
        `).join('');

        const detailsHtml = `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <div style="margin-top: 20px; border-top: 2px solid #ddd; padding-top: 15px;">
                <p><strong>Subtotal:</strong> ₹${order.subtotal.toFixed(2)}</p>
                <p><strong>Tax (5%):</strong> ₹${order.tax.toFixed(2)}</p>
                <p style="font-size: 1.2em; font-weight: 700; color: #FF6B35;">
                    <strong>Total:</strong> ₹${order.total.toFixed(2)}
                </p>
            </div>
        `;

        document.getElementById('modalOrderId').textContent = order.id;
        document.getElementById('orderDetailsBody').innerHTML = detailsHtml;
        document.getElementById('orderDetailsModal').classList.add('active');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #27AE60;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 9999;
            animation: slideUp 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize on page load
let waiterDashboard;
document.addEventListener('DOMContentLoaded', () => {
    Auth.redirect();
    waiterDashboard = new WaiterDashboard();
});

function closeOrderDetailsModal() {
    document.getElementById('orderDetailsModal').classList.remove('active');
}
