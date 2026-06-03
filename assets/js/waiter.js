// Waiter Dashboard JS
class WaiterDashboard {
    constructor() {
        this.currentOrderType = 'dine-in';
        this.currentCategory = 1;
        this.cart = [];
        this.editingOrderId = null;
        this.editingOrderData = null;
        this.isEditingMode = false;
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
            this.closeOrderDetailsModal();
            console.log("hello");
        });

        // Edit Order Button
        const editBtn = document.getElementById('editOrderBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.enterEditMode());
        }

        const saveBtn = document.getElementById('saveEditBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveOrderEdits());
        }
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
            this.editingOrderId = null;
            this.cart = [];
            this.updateCartDisplay();
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
                <div class="menu-item-price">Rs. ${product.price}</div>
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
                        <span>Rs. ${item.total}</span>
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

        document.getElementById('subtotal').textContent = `Rs. ${subtotal.toFixed(0)}`;
        document.getElementById('taxAmount').textContent = `Rs. ${tax.toFixed(0)}`;
        document.getElementById('totalAmount').textContent = `Rs. ${total.toFixed(0)}`;
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
        const subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.05;
        let total = subtotal + tax;

        const orderData = {
            waiter: this.user.name,
            type: this.currentOrderType,
            customer: customerName,
            items: JSON.parse(JSON.stringify(this.cart)),
            subtotal: subtotal,
            tax: tax,
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
            const name = document.getElementById('deliveryName').value;
            const address = document.getElementById('deliveryAddress').value;
            const phone = document.getElementById('deliveryPhone').value;
            const charge = parseFloat(document.getElementById('deliveryCharge').value) || 0;

            if (!name || !address || !phone) {
                alert('Please fill all delivery details (Name, Address, Phone)');
                return;
            }

            orderData.deliveryName = name;
            orderData.deliveryAddress = address;
            orderData.deliveryPhone = phone;
            orderData.deliveryCharge = charge;
            orderData.total = total + charge;
        }

        const order = addOrder(orderData);

        alert(`Order ${order.id} created successfully!`);
        this.cart = [];
        this.updateCartDisplay();
        document.getElementById('customerName').value = '';
        document.getElementById('tableNumber').value = '';
        document.getElementById('deliveryName').value = '';
        document.getElementById('deliveryAddress').value = '';
        document.getElementById('deliveryPhone').value = '';
        document.getElementById('deliveryCharge').value = '100';

        this.changePage('active-orders');
    }

    selectOrderType(btn) {
        document.querySelectorAll('.order-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentOrderType = btn.dataset.type;

        // Show/hide table number and delivery fields
        const tableField = document.getElementById('tableNumber');
        const deliveryFields = document.getElementById('deliveryFields');

        if (this.currentOrderType === 'dine-in') {
            tableField.style.display = 'block';
            deliveryFields.style.display = 'none';
        } else if (this.currentOrderType === 'delivery') {
            tableField.style.display = 'none';
            deliveryFields.style.display = 'block';
        } else { // takeaway
            tableField.style.display = 'none';
            deliveryFields.style.display = 'none';
        }
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
                    <p><strong>Submitted:</strong> ${order.submittedAt}</p>
                    ${order.tableNumber ? `<p><strong>Table:</strong> ${order.tableNumber}</p>` : ''}
                    ${order.deliveryAddress ? `<p><strong>Address:</strong> ${order.deliveryAddress}</p>` : ''}
                    <p><strong>Items:</strong> ${order.items.length}</p>
                </div>
                <div class="order-total">Total: Rs. ${order.total.toFixed(0)}</div>
                <button class="btn btn-secondary" onclick="waiterDashboard.viewOrderDetails('${order.id}')">View & Edit</button>
            </div>
        `).join('');

        container.innerHTML += ordersHtml;
    }

    viewOrderDetails(orderId) {
        const order = getAllOrders().find(o => o.id === orderId);
        if (!order) return;

        this.editingOrderId = orderId;
        this.editingOrderData = JSON.parse(JSON.stringify(order));
        this.isEditingMode = false;

        const itemsHtml = order.items.map((item, idx) => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>Rs. ${item.price}</td>
                <td>Rs. ${item.total.toFixed(0)}</td>
                <td><button class="btn btn-danger btn-small" onclick="waiterDashboard.deleteOrderItem('${orderId}', ${idx})" ${order.status !== 'pending' ? 'disabled' : ''}>Delete</button></td>
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
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <div style="margin-top: 20px; border-top: 2px solid #ddd; padding-top: 15px;">
                <p><strong>Order Type:</strong> ${order.type}</p>
                ${order.tableNumber ? `<p><strong>Table:</strong> ${order.tableNumber}</p>` : ''}
                ${order.deliveryAddress ? `<p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>` : ''}
                <p><strong>Subtotal:</strong> Rs. ${order.subtotal.toFixed(0)}</p>
                <p><strong>Tax (5%):</strong> Rs. ${order.tax.toFixed(0)}</p>
                ${order.deliveryCharge ? `<p><strong>Delivery Charge:</strong> Rs. ${order.deliveryCharge.toFixed(0)}</p>` : ''}
                <p style="font-size: 1.2em; font-weight: 700; color: #FF6B35;">
                    <strong>Total:</strong> Rs. ${order.total.toFixed(0)}
                </p>
            </div>
        `;

        document.getElementById('modalOrderId').textContent = order.id;
        document.getElementById('orderDetailsBody').innerHTML = detailsHtml;
        document.getElementById('orderEditBody').classList.add('hidden');
        
        // Show/hide edit buttons
        const editBtn = document.getElementById('editOrderBtn');
        const saveBtn = document.getElementById('saveEditBtn');
        
        if (order.status === 'pending') {
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
        } else {
            editBtn.style.display = 'none';
            saveBtn.style.display = 'none';
        }
        
        document.getElementById('orderDetailsModal').classList.add('active');
    }

    deleteOrderItem(orderId, itemIndex) {
        if (confirm('Are you sure you want to delete this item?')) {
            removeItemFromOrder(orderId, itemIndex);
            this.viewOrderDetails(orderId);
            this.showNotification('Item removed from order');
        }
    }

    enterEditMode() {
        if (!this.editingOrderId) return;
        const order = getAllOrders().find(o => o.id === this.editingOrderId);
        if (!order) return;

        this.isEditingMode = true;

        // Hide details body and show edit body
        document.getElementById('orderDetailsBody').classList.add('hidden');
        document.getElementById('orderEditBody').classList.remove('hidden');

        // Render categories and menu for adding items
        this.renderEditCategories();
        this.renderEditMenuItems();

        // Set current order type
        this.editingOrderData.type = order.type;
        document.querySelectorAll('#editOrderTypeSelector .order-type-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === order.type) {
                btn.classList.add('active');
            }
        });

        // Setup event listeners for edit mode
        document.querySelectorAll('#editOrderTypeSelector .order-type-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectEditOrderType(btn));
        });

        // Render current items in edit view
        this.renderEditCartItems();

        // Update button states
        document.getElementById('editOrderBtn').style.display = 'none';
        document.getElementById('saveEditBtn').style.display = 'inline-block';

        this.showNotification('Edit mode enabled. Make changes and click Save.');
    }

    renderEditCategories() {
        const container = document.getElementById('editCategoryTabs');
        container.innerHTML = '';

        AuthDB.categories.forEach(category => {
            const tab = document.createElement('div');
            tab.className = 'category-tab';
            if (category.id === this.currentCategory) {
                tab.classList.add('active');
            }
            tab.textContent = `${category.icon} ${category.name}`;
            tab.dataset.categoryId = category.id;
            tab.addEventListener('click', () => this.selectEditCategory(tab));
            container.appendChild(tab);
        });
    }

    renderEditMenuItems() {
        const container = document.getElementById('editMenuItems');
        container.innerHTML = '';

        const items = AuthDB.products.filter(p => p.category === this.currentCategory);

        items.forEach(product => {
            const item = document.createElement('div');
            item.className = 'menu-item';
            item.innerHTML = `
                <div class="menu-item-icon">${product.icon}</div>
                <div class="menu-item-name">${product.name}</div>
                <div class="menu-item-price">Rs. ${product.price}</div>
            `;
            item.addEventListener('click', () => this.addItemToEditingOrder(product));
            container.appendChild(item);
        });
    }

    selectEditCategory(element) {
        document.querySelectorAll('#editCategoryTabs .category-tab').forEach(t => t.classList.remove('active'));
        element.classList.add('active');
        this.currentCategory = parseInt(element.dataset.categoryId);
        this.renderEditMenuItems();
    }

    selectEditOrderType(btn) {
        document.querySelectorAll('#editOrderTypeSelector .order-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.editingOrderData.type = btn.dataset.type;
    }

    addItemToEditingOrder(product) {
        const existingItem = this.editingOrderData.items.find(item => item.productId === product.id);

        if (existingItem) {
            existingItem.quantity++;
            existingItem.total = existingItem.quantity * existingItem.price;
        } else {
            this.editingOrderData.items.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                total: product.price
            });
        }

        this.renderEditCartItems();
        this.showNotification(`${product.name} added to order`);
    }

    renderEditCartItems() {
        const container = document.getElementById('editCartItems');
        container.innerHTML = '';

        if (this.editingOrderData.items.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">No items in this order</p>';
        } else {
            this.editingOrderData.items.forEach((item, index) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <div class="cart-item-header">
                        <span>${item.name}</span>
                        <span>Rs. ${item.total}</span>
                    </div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="waiterDashboard.updateEditItemQty(${index}, -1)">−</button>
                        <span class="qty-input">${item.quantity}</span>
                        <button class="qty-btn" onclick="waiterDashboard.updateEditItemQty(${index}, 1)">+</button>
                        <button class="remove-item" onclick="waiterDashboard.removeEditItem(${index})">Remove</button>
                    </div>
                `;
                container.appendChild(itemEl);
            });
        }
    }

    updateEditItemQty(index, change) {
        const item = this.editingOrderData.items[index];
        item.quantity += change;

        if (item.quantity <= 0) {
            this.removeEditItem(index);
        } else {
            item.total = item.quantity * item.price;
            this.renderEditCartItems();
        }
    }

    removeEditItem(index) {
        this.editingOrderData.items.splice(index, 1);
        this.renderEditCartItems();
    }

    saveOrderEdits() {
        if (!this.editingOrderId || !this.editingOrderData) return;

        const order = getAllOrders().find(o => o.id === this.editingOrderId);
        if (!order || order.status !== 'pending') {
            alert('Cannot edit completed orders');
            return;
        }

        // Update order with new data
        order.type = this.editingOrderData.type;
        order.items = this.editingOrderData.items;

        // Recalculate totals
        order.subtotal = order.items.reduce((sum, item) => sum + (item.total || 0), 0);
        order.tax = order.subtotal * 0.05;
        order.total = order.subtotal + order.tax;

        AuthDB.saveToLocalStorage();

        // Reset edit mode
        this.isEditingMode = false;
        this.editingOrderData = null;

        // Show details view
        document.getElementById('orderDetailsBody').classList.remove('hidden');
        document.getElementById('orderEditBody').classList.add('hidden');

        // Update view
        this.viewOrderDetails(this.editingOrderId);
        this.showNotification('Order updated successfully');
    }

    closeOrderDetailsModal() {
        document.getElementById('orderDetailsModal').classList.remove('active');
        console.log("Closing order details modal");
        this.editingOrderId = null;
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
    waiterDashboard.closeOrderDetailsModal();
}

function backToNewOrder() {
    waiterDashboard.changePage('orders');
}
