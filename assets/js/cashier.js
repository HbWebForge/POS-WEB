// Cashier Dashboard JS
class CashierDashboard {
    constructor() {
        this.selectedOrder = null;
        this.editingOrderData = null;
        this.currentCategory = 1;
        this.user = Auth.getCurrentUser();

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

        // Payment and Print Buttons
        const printBtn = document.getElementById('printBtn');
        const completeBtn = document.getElementById('completePaymentBtn');
        
        if (printBtn) {
            printBtn.addEventListener('click', () => this.showPrintModal());
        }
        
        if (completeBtn) {
            completeBtn.addEventListener('click', () => this.processPayment());
        }

        // Edit Modal Close
        const editModalClose = document.querySelectorAll('.modal-close');
        editModalClose.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) modal.classList.remove('active');
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            Auth.logout();
            window.location.href = 'index.html';
        });

        // Modal Close for print
        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                document.getElementById('printModal').classList.remove('active');
            });
        }

        // Save Edit Button
        const saveEditBtn = document.getElementById('cashierSaveEditBtn');
        if (saveEditBtn) {
            saveEditBtn.addEventListener('click', () => this.saveCashierOrderEdits());
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
        } else if (page === 'new-order') {
            document.getElementById('newOrderPage').classList.remove('hidden');
            document.getElementById('pageTitle').textContent = 'Create Order';
            document.querySelector('[data-page="new-order"]').classList.add('active');
            this.initializeNewOrderPage();
        }
    }

    renderPendingOrders() {
        const container = document.getElementById('pendingOrdersList');
        container.innerHTML = '';

        const orders = getOrdersByStatus('pending');

        if (orders.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 30px;">No pending orders</p>';
            return;
        }

        const ordersHtml = orders.map(order => `
            <div class="order-card ${this.selectedOrder?.id === order.id ? 'selected' : ''}" onclick="cashierDashboard.selectOrder('${order.id}')">
                <div class="order-card-header">
                    <span class="order-card-id">${order.id}</span>
                    <span class="order-status status-pending">PENDING</span>
                </div>
                <div class="order-card-details">
                    <p><strong>Customer:</strong> ${order.customer}</p>
                    <p><strong>Type:</strong> ${order.type}</p>
                    <p><strong>Waiter:</strong> ${order.waiter}</p>
                    <p><strong>Items:</strong> ${order.items.length}</p>
                </div>
                <div class="order-total">Total: Rs. ${order.total.toFixed(0)}</div>
                <button class="btn btn-secondary" onclick="event.stopPropagation(); cashierDashboard.openEditModal('${order.id}'); return false;" style="width: 100%; margin-top: 10px;">✏️ Edit Order</button>
            </div>
        `).join('');

        container.innerHTML = ordersHtml;
    }

    renderCompletedOrders() {
        const container = document.getElementById('completedOrdersList');
        container.innerHTML = '';

        const completedOrders = getAllOrders().filter(o => o.status === 'completed' || o.status === 'paid');

        if (completedOrders.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 30px;">No completed orders</p>';
            return;
        }

        const ordersHtml = completedOrders.map(order => `
            <div class="order-card ${order.status}">
                <div class="order-card-header">
                    <span class="order-card-id">${order.id}</span>
                    <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
                </div>
                <div class="order-card-details">
                    <p><strong>Customer:</strong> ${order.customer}</p>
                    <p><strong>Type:</strong> ${order.type}</p>
                    <p><strong>Waiter:</strong> ${order.waiter}</p>
                    <p><strong>Items:</strong> ${order.items.length}</p>
                </div>
                <div class="order-total">Total: Rs. ${order.total.toFixed(0)}</div>
            </div>
        `).join('');

        container.innerHTML = ordersHtml;
    }

    selectOrder(orderId) {
        const order = getAllOrders().find(o => o.id === orderId);
        if (!order) return;

        this.selectedOrder = order;

        // Update UI
        document.getElementById('orderSummary').style.display = 'block';
        document.getElementById('selectedOrderId').textContent = order.id;
        document.getElementById('selectedCustomer').textContent = order.customer;
        document.getElementById('selectedTotal').textContent = `Rs. ${order.total.toFixed(0)}`;

        // Show action buttons
        document.getElementById('printBtn').style.display = 'inline-block';
        document.getElementById('completePaymentBtn').style.display = 'inline-block';

        // Highlight selected order
        document.querySelectorAll('.order-card').forEach(card => {
            card.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');

        this.renderPendingOrders();
    }

    processPayment() {
        if (!this.selectedOrder) {
            alert('Please select an order first');
            return;
        }

        const paymentMethod = document.getElementById('paymentMethod').value;
        const amount = this.selectedOrder.total;

        const confirmation = confirm(`Process payment of Rs. ${amount.toFixed(0)} via ${paymentMethod}?\n\nOrder ID: ${this.selectedOrder.id}`);

        if (confirmation) {
            updateOrderStatus(this.selectedOrder.id, 'completed');
            
            const order = getAllOrders().find(o => o.id === this.selectedOrder.id);
            if (order) {
                order.paymentMethod = paymentMethod;
                order.paidAt = new Date().toLocaleString();
                order.status = 'paid';
                AuthDB.saveToLocalStorage();
            }

            this.selectedOrder = null;
            document.getElementById('orderSummary').style.display = 'none';
            document.getElementById('printBtn').style.display = 'none';
            document.getElementById('completePaymentBtn').style.display = 'none';

            this.showNotification('Payment processed successfully!');
            this.renderPendingOrders();
        }
    }

    showPrintModal() {
        if (!this.selectedOrder) {
            alert('Please select an order first');
            return;
        }

        const order = this.selectedOrder;
        const itemsHtml = order.items.map(item => `
            ${item.name} x${item.quantity} = Rs. ${item.total.toFixed(0)}
        `).join('\n');

        const deliveryInfo = order.type === 'delivery' ? `
Customer Name: ${order.deliveryName}
Address: ${order.deliveryAddress}
Phone: ${order.deliveryPhone}
Delivery Charge: Rs. ${order.deliveryCharge || 0}
` : '';

        const paymentMethods = {
            cash: 'Cash Payment',
            bank: `Bank Transfer\nAccount: ${AuthDB.restaurant.bankAccount.number}\nName: ${AuthDB.restaurant.bankAccount.name}`,
            easypaisa: `EasyPaisa\nAccount: ${AuthDB.restaurant.easypaisa.number}\nName: ${AuthDB.restaurant.easypaisa.name}`,
            jazzcash: `JazzCash\nAccount: ${AuthDB.restaurant.jazzcash.number}\nName: ${AuthDB.restaurant.jazzcash.name}`
        };

        const slipHtml = `
            <div style="font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.6; text-align: center;">
                <h3>${AuthDB.restaurant.name}</h3>
                <p>${AuthDB.restaurant.address}</p>
                <p>Phone: ${AuthDB.restaurant.phone}</p>
                <div style="border-top: 2px dashed #333; margin: 10px 0;"></div>
                
                <p><strong>Order ID: ${order.id}</strong></p>
                <p>Date: ${order.submittedAt}</p>
                <p>Type: ${order.type}</p>
                
                ${deliveryInfo ? `<div style="text-align: left; margin: 10px 0; padding: 10px; background: #f0f0f0;">
                    <strong>Delivery Details:</strong><br/>
                    ${deliveryInfo}
                </div>` : ''}
                
                <div style="border-top: 1px dashed #333; margin: 10px 0; text-align: left;">
                    <strong>Items:</strong>
                    <pre>${itemsHtml}</pre>
                </div>
                
                <div style="border-top: 2px dashed #333; margin: 10px 0;">
                    <p>Subtotal: Rs. ${order.subtotal.toFixed(0)}</p>
                    <p>Tax (5%): Rs. ${order.tax.toFixed(0)}</p>
                    ${order.deliveryCharge ? `<p>Delivery: Rs. ${order.deliveryCharge.toFixed(0)}</p>` : ''}
                    <p><strong>Total: Rs. ${order.total.toFixed(0)}</strong></p>
                </div>
                
                <div style="border-top: 1px dashed #333; margin: 10px 0; text-align: left; font-size: 11px;">
                    <strong>Payment Methods Available:</strong>
                    <pre>${paymentMethods[order.paymentMethod || 'cash']}</pre>
                </div>
                
                <p style="margin-top: 20px; font-size: 10px;">Thank you for your order!</p>
            </div>
        `;

        document.getElementById('orderSlip').innerHTML = slipHtml;
        document.getElementById('printModal').classList.add('active');
    }

    initializeNewOrderPage() {
        // Initialize cashier order creation interface
        if (!window.cashierNewOrder) {
            window.cashierNewOrder = new CashierNewOrder();
        }
    }

    openEditModal(orderId) {
        const order = getAllOrders().find(o => o.id === orderId);
        if (!order || order.status !== 'pending') {
            alert('Can only edit pending orders');
            return;
        }

        this.editingOrderData = JSON.parse(JSON.stringify(order));

        document.getElementById('editModalOrderId').textContent = `Edit Order ${order.id}`;
        
        // Render categories and menu
        this.renderEditCategories();
        this.renderEditMenuItems();

        // Set current order type
        document.querySelectorAll('#editCashierOrderTypeSelector .order-type-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === order.type) {
                btn.classList.add('active');
            }
        });

        // Setup event listeners for edit mode
        document.querySelectorAll('#editCashierOrderTypeSelector .order-type-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectEditOrderType(btn));
        });

        // Render current items
        this.renderEditCartItems();

        document.getElementById('orderEditModal').classList.add('active');
    }

    renderEditCategories() {
        const container = document.getElementById('editCashierCategoryTabs');
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
        const container = document.getElementById('editCashierMenuItems');
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
        document.querySelectorAll('#editCashierCategoryTabs .category-tab').forEach(t => t.classList.remove('active'));
        element.classList.add('active');
        this.currentCategory = parseInt(element.dataset.categoryId);
        this.renderEditMenuItems();
    }

    selectEditOrderType(btn) {
        document.querySelectorAll('#editCashierOrderTypeSelector .order-type-btn').forEach(b => b.classList.remove('active'));
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
        const container = document.getElementById('editCashierCartItems');
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
                        <button class="qty-btn" onclick="cashierDashboard.updateEditItemQty(${index}, -1)">−</button>
                        <span class="qty-input">${item.quantity}</span>
                        <button class="qty-btn" onclick="cashierDashboard.updateEditItemQty(${index}, 1)">+</button>
                        <button class="remove-item" onclick="cashierDashboard.removeEditItem(${index})">Remove</button>
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

    saveCashierOrderEdits() {
        if (!this.editingOrderData) return;

        const order = getAllOrders().find(o => o.id === this.editingOrderData.id);
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

        // Reset and close modal
        this.editingOrderData = null;
        document.getElementById('orderEditModal').classList.remove('active');

        this.showNotification('Order updated successfully');
        this.renderPendingOrders();
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

// Cashier New Order Class - Similar to Waiter Dashboard
class CashierNewOrder {
    constructor() {
        this.currentOrderType = 'dine-in';
        this.currentCategory = 1;
        this.cart = [];
        this.user = Auth.getCurrentUser();

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCategories();
        this.renderMenuItems();
        this.updateCartDisplay();
    }

    setupEventListeners() {
        const typeSelector = document.getElementById('cashierOrderTypeSelector');
        if (typeSelector) {
            typeSelector.querySelectorAll('.order-type-btn').forEach(btn => {
                btn.addEventListener('click', () => this.selectOrderType(btn));
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-tab') && e.target.closest('#cashierCategoryTabs')) {
                this.selectCategory(e.target);
            }
        });

        const clearBtn = document.getElementById('cashierClearCartBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCart());
        }

        const submitBtn = document.getElementById('cashierSubmitOrderBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitOrder());
        }
    }

    renderCategories() {
        const container = document.getElementById('cashierCategoryTabs');
        if (!container) return;
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
        const container = document.getElementById('cashierCategoryTabs');
        if (container) {
            container.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        }
        element.classList.add('active');
        this.currentCategory = parseInt(element.dataset.categoryId);
        this.renderMenuItems();
    }

    renderMenuItems() {
        const container = document.getElementById('cashierMenuItems');
        if (!container) return;
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
    }

    updateCartDisplay() {
        const container = document.getElementById('cashierCartItems');
        if (!container) return;
        container.innerHTML = '';

        if (this.cart.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">Cart is empty</p>';
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
                        <button class="qty-btn" onclick="cashierNewOrder.updateQty(${index}, -1)">−</button>
                        <span class="qty-input">${item.quantity}</span>
                        <button class="qty-btn" onclick="cashierNewOrder.updateQty(${index}, 1)">+</button>
                        <button class="remove-item" onclick="cashierNewOrder.removeFromCart(${index})">Remove</button>
                    </div>
                `;
                container.appendChild(itemEl);
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

        document.getElementById('cashierSubtotal').textContent = `Rs. ${subtotal.toFixed(0)}`;
        document.getElementById('cashierTaxAmount').textContent = `Rs. ${tax.toFixed(0)}`;
        document.getElementById('cashierTotalAmount').textContent = `Rs. ${total.toFixed(0)}`;
    }

    clearCart() {
        if (confirm('Clear cart?')) {
            this.cart = [];
            this.updateCartDisplay();
        }
    }

    submitOrder() {
        if (this.cart.length === 0) {
            alert('Cart is empty!');
            return;
        }

        const customerName = document.getElementById('cashierCustomerName').value || 'Guest';
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
            const tableNo = document.getElementById('cashierTableNumber').value;
            if (!tableNo) {
                alert('Please enter table number');
                return;
            }
            orderData.tableNumber = tableNo;
        } else if (this.currentOrderType === 'delivery') {
            const name = document.getElementById('cashierDeliveryName').value;
            const address = document.getElementById('cashierDeliveryAddress').value;
            const phone = document.getElementById('cashierDeliveryPhone').value;
            const charge = parseFloat(document.getElementById('cashierDeliveryCharge').value) || 0;

            if (!name || !address || !phone) {
                alert('Please fill all delivery details');
                return;
            }

            orderData.deliveryName = name;
            orderData.deliveryAddress = address;
            orderData.deliveryPhone = phone;
            orderData.deliveryCharge = charge;
            orderData.total = total + charge;
        }

        addOrder(orderData);
        alert('Order created successfully!');
        
        this.cart = [];
        this.updateCartDisplay();
        document.getElementById('cashierCustomerName').value = '';
        document.getElementById('cashierTableNumber').value = '';
        document.getElementById('cashierDeliveryName').value = '';
        document.getElementById('cashierDeliveryAddress').value = '';
        document.getElementById('cashierDeliveryPhone').value = '';
        document.getElementById('cashierDeliveryCharge').value = '100';

        cashierDashboard.changePage('pending');
    }

    selectOrderType(btn) {
        const selector = document.getElementById('cashierOrderTypeSelector');
        if (selector) {
            selector.querySelectorAll('.order-type-btn').forEach(b => b.classList.remove('active'));
        }
        btn.classList.add('active');
        this.currentOrderType = btn.dataset.type;

        const tableField = document.getElementById('cashierTableNumber');
        const deliveryFields = document.getElementById('cashierDeliveryFields');

        if (this.currentOrderType === 'dine-in') {
            tableField.style.display = 'block';
            deliveryFields.style.display = 'none';
        } else if (this.currentOrderType === 'delivery') {
            tableField.style.display = 'none';
            deliveryFields.style.display = 'block';
        } else {
            tableField.style.display = 'none';
            deliveryFields.style.display = 'none';
        }
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

function closeCashierEditModal() {
    document.getElementById('orderEditModal').classList.remove('active');
}

function printOrderSlip() {
    window.print();
}

function backToPending() {
    cashierDashboard.changePage('pending');
}
