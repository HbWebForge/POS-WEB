// Cashier Dashboard JS
class CashierDashboard {
    constructor() {
        this.user = Auth.getCurrentUser();
        this.selectedOrder = null;

        if (!this.user) {
            window.location.href = 'index.html';
            return;
        }

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderPendingOrders();
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

        // Payment Button
        document.getElementById('completePaymentBtn').addEventListener('click', () => this.processPayment());
        document.getElementById('printBtn').addEventListener('click', () => this.showPrintModal());

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            Auth.logout();
            window.location.href = 'index.html';
        });

        // Modal Close
        document.querySelector('.modal-close').addEventListener('click', () => {
            document.getElementById('printModal').classList.remove('active');
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
        if (page === 'pending') {
            document.getElementById('pendingPage').classList.remove('hidden');
            document.getElementById('pageTitle').textContent = 'Pending Orders';
            document.querySelector('[data-page="pending"]').classList.add('active');
            this.renderPendingOrders();
        } else if (page === 'completed') {
            document.getElementById('completedPage').classList.remove('hidden');
            document.getElementById('pageTitle').textContent = 'Completed Orders';
            document.querySelector('[data-page="completed"]').classList.add('active');
            this.renderCompletedOrders();
        }
    }

    renderPendingOrders() {
        const container = document.getElementById('pendingOrdersList');
        container.innerHTML = '<h2>Pending Orders (To be Completed)</h2>';

        const orders = getOrdersByStatus('pending');

        if (orders.length === 0) {
            container.innerHTML += '<p style="text-align: center; padding: 30px; color: #999;">No pending orders</p>';
            return;
        }

        const ordersHtml = orders.map(order => `
            <div class="order-card" onclick="cashierDashboard.selectOrder('${order.id}')">
                <div class="order-card-header">
                    <span class="order-card-id">${order.id}</span>
                    <span class="order-status status-pending">PENDING</span>
                </div>
                <div class="order-card-details">
                    <p><strong>Customer:</strong> ${order.customer}</p>
                    <p><strong>Type:</strong> ${order.type}</p>
                    ${order.tableNumber ? `<p><strong>Table:</strong> ${order.tableNumber}</p>` : ''}
                    ${order.deliveryAddress ? `<p><strong>Address:</strong> ${order.deliveryAddress}</p>` : ''}
                    <p><strong>Items:</strong> ${order.items.length}</p>
                    <p><strong>Waiter:</strong> ${order.waiter}</p>
                </div>
                <div class="order-total">Total: ₹${order.total.toFixed(2)}</div>
            </div>
        `).join('');

        container.innerHTML += ordersHtml;
    }

    renderCompletedOrders() {
        const container = document.getElementById('completedOrdersList');
        container.innerHTML = '<h2>Completed Orders</h2>';

        const orders = getAllOrders().filter(o => o.status === 'completed' || o.status === 'paid');

        if (orders.length === 0) {
            container.innerHTML += '<p style="text-align: center; padding: 30px;">No completed orders</p>';
            return;
        }

        const ordersHtml = orders.map(order => `
            <div class="order-card completed">
                <div class="order-card-header">
                    <span class="order-card-id">${order.id}</span>
                    <span class="order-status status-completed">COMPLETED</span>
                </div>
                <div class="order-card-details">
                    <p><strong>Customer:</strong> ${order.customer}</p>
                    <p><strong>Type:</strong> ${order.type}</p>
                    ${order.tableNumber ? `<p><strong>Table:</strong> ${order.tableNumber}</p>` : ''}
                    <p><strong>Items:</strong> ${order.items.length}</p>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod || 'N/A'}</p>
                </div>
                <div class="order-total">Total: ₹${order.total.toFixed(2)}</div>
            </div>
        `).join('');

        container.innerHTML += ordersHtml;
    }

    selectOrder(orderId) {
        const order = getAllOrders().find(o => o.id === orderId);
        if (!order || order.status === 'paid') {
            alert('This order cannot be processed');
            return;
        }

        this.selectedOrder = order;

        // Update payment summary
        document.getElementById('orderSummary').style.display = 'block';
        document.getElementById('selectedOrderId').textContent = order.id;
        document.getElementById('selectedCustomer').textContent = order.customer;
        document.getElementById('selectedTotal').textContent = `₹${order.total.toFixed(2)}`;

        // Show action buttons
        document.getElementById('completePaymentBtn').style.display = 'block';
        document.getElementById('printBtn').style.display = 'block';

        this.showNotification(`Order ${order.id} selected`);
    }

    processPayment() {
        if (!this.selectedOrder) {
            alert('Please select an order first');
            return;
        }

        const paymentMethod = document.getElementById('paymentMethod').value;
        
        if (confirm(`Complete payment of ₹${this.selectedOrder.total.toFixed(2)} via ${paymentMethod}?`)) {
            this.selectedOrder.status = 'paid';
            this.selectedOrder.paymentMethod = paymentMethod;
            this.selectedOrder.paidAt = new Date().toLocaleString();
            
            AuthDB.saveToLocalStorage();

            alert(`Payment successful! Order ${this.selectedOrder.id} has been marked as paid.`);
            
            // Reset
            this.selectedOrder = null;
            document.getElementById('orderSummary').style.display = 'none';
            document.getElementById('completePaymentBtn').style.display = 'none';
            document.getElementById('printBtn').style.display = 'none';

            this.renderPendingOrders();
            this.changePage('pending');
        }
    }

    showPrintModal() {
        if (!this.selectedOrder) {
            alert('Please select an order first');
            return;
        }

        const order = this.selectedOrder;
        const itemsHtml = order.items.map(item => `
            <div class="slip-item-row">
                <span>${item.name} x${item.quantity}</span>
                <span>₹${item.total.toFixed(2)}</span>
            </div>
        `).join('');

        const slipHtml = `
            <div class="slip-header">
                <div class="slip-title">🍔 FastFood POS</div>
                <div class="slip-info">Order Slip</div>
            </div>
            
            <div style="margin-bottom: 15px; font-size: 0.9em;">
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Customer:</strong> ${order.customer}</p>
                <p><strong>Type:</strong> ${order.type}</p>
                ${order.tableNumber ? `<p><strong>Table:</strong> ${order.tableNumber}</p>` : ''}
                ${order.deliveryAddress ? `<p><strong>Address:</strong> ${order.deliveryAddress}</p>` : ''}
                <p><strong>Waiter:</strong> ${order.waiter}</p>
                <p><strong>Date:</strong> ${order.createdAt}</p>
            </div>

            <div class="slip-items">
                ${itemsHtml}
            </div>

            <div class="slip-total">
                <span>Subtotal:</span>
                <span>₹${order.subtotal.toFixed(2)}</span>
            </div>
            <div class="slip-total">
                <span>Tax (5%):</span>
                <span>₹${order.tax.toFixed(2)}</span>
            </div>
            <div class="slip-total" style="border-top: 2px solid var(--border-color); padding-top: 10px;">
                <span>TOTAL:</span>
                <span>₹${order.total.toFixed(2)}</span>
            </div>

            <div class="slip-footer">
                <p>Thank you for your order!</p>
                <p>Please come again.</p>
            </div>
        `;

        document.getElementById('orderSlip').innerHTML = slipHtml;
        document.getElementById('printModal').classList.add('active');
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
let cashierDashboard;
document.addEventListener('DOMContentLoaded', () => {
    Auth.redirect();
    cashierDashboard = new CashierDashboard();
});

function closePrintModal() {
    document.getElementById('printModal').classList.remove('active');
}

function printOrderSlip() {
    window.print();
}
