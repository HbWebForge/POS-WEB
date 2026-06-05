// Manager Dashboard JS
class ManagerDashboard {
    constructor() {
        this.user = Auth.getCurrentUser();
        this.editingType = null;
        this.editingId = null;
        this.editingOrderData = null;
        this.currentCategory = 1;
        this.currentOrderType = 'dine-in';

        if (!this.user) {
            window.location.href = 'index.html';
            return;
        }

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderDashboard();
        this.updateUserInfo();
        this.updateClock();
        setInterval(() => this.updateClock(), 2000);
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

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            Auth.logout();
            window.location.href = 'index.html';
        });

        // Modal Close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) modal.classList.add('hidden');
            });
        });

        // Manager Order Edit Modal Save
        const managerSaveEditBtn = document.getElementById('managerSaveEditBtn');
        if (managerSaveEditBtn) {
            managerSaveEditBtn.addEventListener('click', () => this.saveManagerOrderEdits());
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
        if (page === 'dashboard') {
            document.getElementById('dashboardPage').classList.remove('hidden');
            document.getElementById('pageTitle').textContent = 'Dashboard';
            document.querySelector('[data-page="dashboard"]').classList.add('active');
            this.renderDashboard();
        } else if (page === 'orders') {
            document.getElementById('ordersPage').classList.remove('hidden');
            document.getElementById('pageTitle').textContent = 'Manage Orders';
            document.querySelector('[data-page="orders"]').classList.add('active');
            this.renderManagerOrders();
        } else if (page === 'new-order') {
            document.getElementById('managerNewOrderPage').classList.remove('hidden');
            document.getElementById('pageTitle').textContent = 'Create Order';
            document.querySelector('[data-page="new-order"]').classList.add('active');
            this.initializeManagerNewOrderPage();
        } else if (page === 'reports') {
            document.getElementById('reportsPage').classList.remove('hidden');
            document.getElementById('pageTitle').textContent = 'Reports';
            document.querySelector('[data-page="reports"]').classList.add('active');
            this.generateReport();
        } else if (page === 'deals') {
            document.getElementById('dealsPage').classList.remove('hidden');
            document.getElementById('pageTitle').textContent = 'Deals';
            document.querySelector('[data-page="deals"]').classList.add('active');
            this.renderDealsPage();
        } else if (page === 'categories') {
            document.getElementById('categoriesPage').classList.remove('hidden');
            document.getElementById('pageTitle').textContent = 'Manage Categories';
            document.querySelector('[data-page="categories"]').classList.add('active');
            this.renderCategories();
        } else if (page === 'products') {
            document.getElementById('productsPage').classList.remove('hidden');
            document.getElementById('pageTitle').textContent = 'Manage Products';
            document.querySelector('[data-page="products"]').classList.add('active');
            this.renderProducts();
        }
    }

    renderManagerOrders() {
        const container = document.getElementById('managerOrdersList');
        container.innerHTML = '';

        const orders = getAllOrders();

        if (orders.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 30px;">No orders</p>';
            return;
        }

        const ordersHtml = orders.map(order => {
            // Create items display with names and numbers
            const itemsDisplay = order.items.map(item => `${item.name} x${item.quantity}`).join(', ');
            
            return `
            <div class="order-card ${order.status}">
                <div class="order-card-header">
                    <span class="order-card-id">${order.id}</span>
                    <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
                </div>
                <div class="order-card-details">
                    <p><strong>Customer:</strong> ${order.customer}</p>
                    <p><strong>Type:</strong> ${order.type}</p>
                    <p><strong>Waiter:</strong> ${order.waiter}</p>
                    <p><strong>Items:</strong> ${itemsDisplay}</p>
                </div>
                <div class="order-total">Total: Rs. ${order.total.toFixed(0)}</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 10px;">
                    <button class="btn btn-secondary"  onclick="event.stopPropagation(); managerDashboard.openManagerOrderEditModal('${order.id}'); return false;">✏️ Edit Order</button>
                    <button class="btn btn-primary"  onclick="event.stopPropagation(); managerDashboard.showManagerPrintModal('${order.id}'); return false;">🖨️ Print Slip</button>
                    ${order.status === 'pending' ? `
                        <button class="btn btn-warning" onclick="event.stopPropagation(); managerDashboard.openPaymentModal('${order.id}'); return false;">💰 Paid</button>
                    ` : `
                        <button class="btn btn-success" disabled style="background-color: #27AE60; cursor: default;">✅ Paid & Completed</button>
                    `}
                </div>
            </div>
            `;
        }).join('');

        container.innerHTML = ordersHtml;
    }

    initializeManagerNewOrderPage() {
        // Render categories and menu for creating new order
        this.renderManagerCategories();
        this.renderManagerMenuItems();
        this.setupManagerNewOrderListeners();
    }

    renderManagerCategories() {
        const container = document.getElementById('managerCategoryTabs');
        if (!container) return;
        container.innerHTML = '';

        // Add Deals tab first if there are deals
        if (AuthDB.deals.length > 0) {
            const dealTab = document.createElement('div');
            dealTab.className = 'category-tab';
            if (this.currentCategory === 0) {
                dealTab.classList.add('active');
            }
            dealTab.textContent = '🎁 Deals';
            dealTab.dataset.categoryId = 0;
            dealTab.addEventListener('click', () => this.selectManagerCategory(dealTab));
            container.appendChild(dealTab);
        }

        AuthDB.categories.forEach(category => {
            const tab = document.createElement('div');
            tab.className = 'category-tab';
            if (category.id === this.currentCategory) {
                tab.classList.add('active');
            }
            tab.textContent = `${category.icon} ${category.name}`;
            tab.dataset.categoryId = category.id;
            tab.addEventListener('click', () => this.selectManagerCategory(tab));
            container.appendChild(tab);
        });
    }

    selectManagerCategory(element) {
        const container = document.getElementById('managerCategoryTabs');
        if (container) {
            container.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        }
        element.classList.add('active');
        this.currentCategory = parseInt(element.dataset.categoryId);
        this.renderManagerMenuItems();
    }

    renderManagerMenuItems() {
        const container = document.getElementById('managerMenuItems');
        if (!container) return;
        container.innerHTML = '';

        // Add deals if category 0 is selected
        if (this.currentCategory === 0) {
            AuthDB.deals.forEach(deal => {
                const item = document.createElement('div');
                item.className = 'menu-item';
                item.innerHTML = `
                    <div class="menu-item-icon">${deal.icon}</div>
                    <div class="menu-item-name">${deal.name}</div>
                    <div class="menu-item-price">Rs. ${deal.price}</div>
                `;
                item.addEventListener('click', () => this.addManagerDealToOrder(deal));
                container.appendChild(item);
            });
            return;
        }

        const items = AuthDB.products.filter(p => p.category === this.currentCategory);

        items.forEach(product => {
            const item = document.createElement('div');
            item.className = 'menu-item';
            item.innerHTML = `
                <div class="menu-item-icon">${product.icon}</div>
                <div class="menu-item-name">${product.name}</div>
                <div class="menu-item-price">Rs. ${product.price}</div>
            `;
            item.addEventListener('click', () => this.addManagerOrderItem(product));
            container.appendChild(item);
        });
    }

    setupManagerNewOrderListeners() {
        // Order Type Buttons
        const typeSelector = document.getElementById('managerOrderTypeSelector');
        if (typeSelector) {
            typeSelector.querySelectorAll('.order-type-btn').forEach(btn => {
                btn.addEventListener('click', () => this.selectManagerOrderType(btn));
            });
        }

        // Cart Actions
        const clearBtn = document.getElementById('managerClearCartBtn');
        if (clearBtn) {
            clearBtn.removeEventListener('click', null);
            clearBtn.addEventListener('click', () => this.clearManagerCart());
        }

        const submitBtn = document.getElementById('managerSubmitOrderBtn');
        if (submitBtn) {
            submitBtn.removeEventListener('click', null);
            submitBtn.addEventListener('click', () => this.submitManagerOrder());
        }
    }

    selectManagerOrderType(btn) {
        const selector = document.getElementById('managerOrderTypeSelector');
        if (selector) {
            selector.querySelectorAll('.order-type-btn').forEach(b => b.classList.remove('active'));
        }
        btn.classList.add('active');
        this.currentOrderType = btn.dataset.type;

        const tableField = document.getElementById('managerTableNumber');
        const deliveryFields = document.getElementById('managerDeliveryFields');

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

    addManagerOrderItem(product) {
        // This will be handled by the new order class similar to waiter/cashier
        // For now, we'll use a simplified approach
        const cart = this.getManagerCart();
        const existingItem = cart.find(item => item.productId === product.id);

        if (existingItem) {
            existingItem.quantity++;
            existingItem.total = existingItem.quantity * existingItem.price;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                total: product.price
            });
        }

        this.updateManagerCartDisplay(cart);
    }

    addManagerDealToOrder(deal) {
        const cart = this.getManagerCart();
        const existingDeal = cart.find(item => item.dealId === deal.id);

        if (existingDeal) {
            existingDeal.quantity++;
            existingDeal.total = existingDeal.quantity * existingDeal.price;
        } else {
            cart.push({
                dealId: deal.id,
                name: deal.name,
                price: deal.price,
                quantity: 1,
                total: deal.price,
                isDeal: true,
                items: deal.items
            });
        }

        this.updateManagerCartDisplay(cart);
    }

    getManagerCart() {
        if (!window.managerCart) window.managerCart = [];
        return window.managerCart;
    }

    updateManagerCartDisplay(cart = null) {
        if (!cart) cart = this.getManagerCart();

        const container = document.getElementById('managerCartItems');
        if (!container) return;
        container.innerHTML = '';

        if (cart.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">Cart is empty</p>';
        } else {
            cart.forEach((item, index) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <div class="cart-item-header">
                        <span>${item.name}</span>
                        <span>Rs. ${item.total}</span>
                    </div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="managerDashboard.updateManagerQty(${index}, -1)">−</button>
                        <span class="qty-input">${item.quantity}</span>
                        <button class="qty-btn" onclick="managerDashboard.updateManagerQty(${index}, 1)">+</button>
                        <button class="remove-item" onclick="managerDashboard.removeManagerItem(${index})">Remove</button>
                    </div>
                `;
                container.appendChild(itemEl);
            });
        }

        this.updateManagerTotals(cart);
    }

    updateManagerQty(index, change) {
        const cart = this.getManagerCart();
        const item = cart[index];
        item.quantity += change;

        if (item.quantity <= 0) {
            this.removeManagerItem(index);
        } else {
            item.total = item.quantity * item.price;
            this.updateManagerCartDisplay(cart);
        }
    }

    removeManagerItem(index) {
        const cart = this.getManagerCart();
        cart.splice(index, 1);
        this.updateManagerCartDisplay(cart);
    }

    updateManagerTotals(cart = null) {
        if (!cart) cart = this.getManagerCart();

        const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.05;
        const total = subtotal + tax;

        const subtotalEl = document.getElementById('managerSubtotal');
        const taxEl = document.getElementById('managerTaxAmount');
        const totalEl = document.getElementById('managerTotalAmount');

        if (subtotalEl) subtotalEl.textContent = `Rs. ${subtotal.toFixed(0)}`;
        if (taxEl) taxEl.textContent = `Rs. ${tax.toFixed(0)}`;
        if (totalEl) totalEl.textContent = `Rs. ${total.toFixed(0)}`;
    }

    clearManagerCart() {
        if (confirm('Clear cart?')) {
            window.managerCart = [];
            this.updateManagerCartDisplay();
        }
    }

    submitManagerOrder() {
        const cart = this.getManagerCart();
        if (cart.length === 0) {
            alert('Cart is empty!');
            return;
        }

        const customerName = document.getElementById('managerCustomerName').value || 'Guest';
        const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.05;
        let total = subtotal + tax;

        const orderData = {
            waiter: this.user.name,
            type: this.currentOrderType,
            customer: customerName,
            items: JSON.parse(JSON.stringify(cart)),
            subtotal: subtotal,
            tax: tax,
            total: total
        };

        if (this.currentOrderType === 'dine-in') {
            const tableNo = document.getElementById('managerTableNumber').value;
            if (!tableNo) {
                alert('Please enter table number');
                return;
            }
            orderData.tableNumber = tableNo;
        } else if (this.currentOrderType === 'delivery') {
            const name = document.getElementById('managerDeliveryName').value;
            const address = document.getElementById('managerDeliveryAddress').value;
            const phone = document.getElementById('managerDeliveryPhone').value;
            const charge = parseFloat(document.getElementById('managerDeliveryCharge').value) || 0;

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
        
        window.managerCart = [];
        this.updateManagerCartDisplay();
        document.getElementById('managerCustomerName').value = '';
        document.getElementById('managerTableNumber').value = '';
        document.getElementById('managerDeliveryName').value = '';
        document.getElementById('managerDeliveryAddress').value = '';
        document.getElementById('managerDeliveryPhone').value = '';
        document.getElementById('managerDeliveryCharge').value = '100';

        this.changePage('orders');
    }

    openManagerOrderEditModal(orderId) {
        const order = getAllOrders().find(o => o.id === orderId);
        if (!order || order.status !== 'pending') {
            alert('Can only edit pending orders');
            return;
        }

        this.editingOrderData = JSON.parse(JSON.stringify(order));

        document.getElementById('managerEditOrderId').textContent = `Edit Order ${order.id}`;
        
        // Render categories and menu
        this.renderManagerEditCategories();
        this.renderManagerEditMenuItems();

        // Set current order type
        document.querySelectorAll('#managerEditOrderTypeSelector .order-type-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === order.type) {
                btn.classList.add('active');
            }
        });

        // Setup event listeners
        document.querySelectorAll('#managerEditOrderTypeSelector .order-type-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectManagerEditOrderType(btn));
        });

        // Render current items
        this.renderManagerEditCartItems();

        document.getElementById('managerOrderEditModal').classList.remove('hidden');
    }

    renderManagerEditCategories() {
        const container = document.getElementById('managerEditCategoryTabs');
        if (!container) return;
        container.innerHTML = '';

        // Add Deals tab first if there are deals
        if (AuthDB.deals.length > 0) {
            const dealTab = document.createElement('div');
            dealTab.className = 'category-tab';
            if (this.currentCategory === 0) {
                dealTab.classList.add('active');
            }
            dealTab.textContent = '🎁 Deals';
            dealTab.dataset.categoryId = 0;
            dealTab.addEventListener('click', () => this.selectManagerEditCategory(dealTab));
            container.appendChild(dealTab);
        }

        AuthDB.categories.forEach(category => {
            const tab = document.createElement('div');
            tab.className = 'category-tab';
            if (category.id === this.currentCategory) {
                tab.classList.add('active');
            }
            tab.textContent = `${category.icon} ${category.name}`;
            tab.dataset.categoryId = category.id;
            tab.addEventListener('click', () => this.selectManagerEditCategory(tab));
            container.appendChild(tab);
        });
    }

    renderManagerEditMenuItems() {
        const container = document.getElementById('managerEditMenuItems');
        if (!container) return;
        container.innerHTML = '';

        // Add deals if category 0 is selected
        if (this.currentCategory === 0) {
            AuthDB.deals.forEach(deal => {
                const item = document.createElement('div');
                item.className = 'menu-item';
                item.innerHTML = `
                    <div class="menu-item-icon">${deal.icon}</div>
                    <div class="menu-item-name">${deal.name}</div>
                    <div class="menu-item-price">Rs. ${deal.price}</div>
                `;
                item.addEventListener('click', () => this.addDealToManagerEditingOrder(deal));
                container.appendChild(item);
            });
            return;
        }

        const items = AuthDB.products.filter(p => p.category === this.currentCategory);

        items.forEach(product => {
            const item = document.createElement('div');
            item.className = 'menu-item';
            item.innerHTML = `
                <div class="menu-item-icon">${product.icon}</div>
                <div class="menu-item-name">${product.name}</div>
                <div class="menu-item-price">Rs. ${product.price}</div>
            `;
            item.addEventListener('click', () => this.addItemToManagerEditingOrder(product));
            container.appendChild(item);
        });
    }

    selectManagerEditCategory(element) {
        const container = document.getElementById('managerEditCategoryTabs');
        if (container) {
            container.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        }
        element.classList.add('active');
        this.currentCategory = parseInt(element.dataset.categoryId);
        this.renderManagerEditMenuItems();
    }

    selectManagerEditOrderType(btn) {
        const selector = document.getElementById('managerEditOrderTypeSelector');
        if (selector) {
            selector.querySelectorAll('.order-type-btn').forEach(b => b.classList.remove('active'));
        }
        btn.classList.add('active');
        this.editingOrderData.type = btn.dataset.type;
    }

    addItemToManagerEditingOrder(product) {
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

        this.renderManagerEditCartItems();
        this.showNotification(`${product.name} added to order`);
    }

    addDealToManagerEditingOrder(deal) {
        const existingDeal = this.editingOrderData.items.find(item => item.dealId === deal.id);

        if (existingDeal) {
            existingDeal.quantity++;
            existingDeal.total = existingDeal.quantity * existingDeal.price;
        } else {
            this.editingOrderData.items.push({
                dealId: deal.id,
                name: deal.name,
                price: deal.price,
                quantity: 1,
                total: deal.price,
                isDeal: true,
                items: deal.items
            });
        }

        this.renderManagerEditCartItems();
        this.showNotification(`${deal.name} added to order`);
    }

    renderManagerEditCartItems() {
        const container = document.getElementById('managerEditCartItems');
        if (!container) return;
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
                        <button class="qty-btn" onclick="managerDashboard.updateManagerEditItemQty(${index}, -1)">−</button>
                        <span class="qty-input">${item.quantity}</span>
                        <button class="qty-btn" onclick="managerDashboard.updateManagerEditItemQty(${index}, 1)">+</button>
                        <button class="remove-item" onclick="managerDashboard.removeManagerEditItem(${index})">Remove</button>
                    </div>
                `;
                container.appendChild(itemEl);
            });
        }
    }

    updateManagerEditItemQty(index, change) {
        const item = this.editingOrderData.items[index];
        item.quantity += change;

        if (item.quantity <= 0) {
            this.removeManagerEditItem(index);
        } else {
            item.total = item.quantity * item.price;
            this.renderManagerEditCartItems();
        }
    }

    removeManagerEditItem(index) {
        this.editingOrderData.items.splice(index, 1);
        this.renderManagerEditCartItems();
    }

    saveManagerOrderEdits() {
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
        document.getElementById('managerOrderEditModal').classList.add('hidden');

        this.showNotification('Order updated successfully');
        this.renderManagerOrders();
    }

    completeOrder(orderId) {
        const order = getAllOrders().find(o => o.id === orderId);
        if (!order) return;

        if (order.status !== 'pending') {
            alert('Only pending orders can be completed');
            return;
        }

        updateOrderStatus(orderId, 'completed');
        this.showNotification('Order marked as completed');
        this.renderManagerOrders();
    }

    markAsPaid(orderId) {
        const order = getAllOrders().find(o => o.id === orderId);
        if (!order) return;

        if (order.status !== 'pending' && order.status !== 'completed') {
            alert('Only pending or completed orders can be marked as paid');
            return;
        }

        updateOrderStatus(orderId, 'paid');
        this.showNotification('Order marked as paid');
        this.renderManagerOrders();
    }

    openPaymentModal(orderId) {
        const order = getAllOrders().find(o => o.id === orderId);
        if (!order || order.status !== 'pending') {
            alert('Can only process payment for pending orders');
            return;
        }

        // Store current order for payment processing
        this.currentPaymentOrder = order;

        // Update modal with order information
        document.getElementById('paymentOrderId').textContent = order.id;

        // Display order items in summary
        const itemsHtml = order.items.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                <span>${item.name} x${item.quantity}</span>
                <span>Rs. ${item.total.toFixed(0)}</span>
            </div>
        `).join('');

        document.getElementById('paymentOrderSummary').innerHTML = itemsHtml;
        document.getElementById('paymentSubtotal').textContent = `Rs. ${order.subtotal.toFixed(0)}`;
        document.getElementById('paymentTax').textContent = `Rs. ${order.tax.toFixed(0)}`;
        document.getElementById('paymentTotal').textContent = `Rs. ${order.total.toFixed(0)}`;

        // Update payment method information
        document.getElementById('easyPaisaInfo').textContent = `Account: ${AuthDB.restaurant.easypaisa.number} (${AuthDB.restaurant.easypaisa.name})`;
        document.getElementById('jazzCashInfo').textContent = `Account: ${AuthDB.restaurant.jazzcash.number} (${AuthDB.restaurant.jazzcash.name})`;
        document.getElementById('bankInfo').textContent = `Account: ${AuthDB.restaurant.bankAccount.number} (${AuthDB.restaurant.bankAccount.name})`;

        // Reset payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.style.borderColor = '#ddd';
            method.style.backgroundColor = 'transparent';
        });
        document.getElementById('paymentPrintBtn').disabled = true;
        this.selectedPaymentMethod = null;

        document.getElementById('paymentModal').classList.remove('hidden');
    }

    renderDealsPage() {
        this.renderDealProductSelector();
        this.renderDealsList();
    }

    renderDealProductSelector() {
        const container = document.getElementById('dealProductSelector');
        if (!container) return;
        container.innerHTML = '';

        // Create a checklist of products with prices
        AuthDB.products.forEach(product => {
            const label = document.createElement('label');
            label.style.cssText = `
                display: flex;
                align-items: center;
                padding: 8px;
                background: white;
                border-radius: 4px;
                cursor: pointer;
                border: 1px solid #ddd;
            `;
            label.innerHTML = `
                <input type="checkbox" class="dealProductCheckbox" data-product-id="${product.id}" value="${product.id}">
                <span style="margin-left: 8px;">${product.icon} ${product.name} (Rs. ${product.price})</span>
            `;
            container.appendChild(label);
        });
    }

    createDeal() {
        const dealName = document.getElementById('dealNameInput').value.trim();
        const dealIcon = document.getElementById('dealIconInput').value.trim();
        const dealPrice = parseFloat(document.getElementById('dealPriceInput').value);

        if (!dealName || !dealIcon || !dealPrice) {
            alert('Please fill all fields');
            return;
        }

        // Get selected products
        const selectedCheckboxes = document.querySelectorAll('.dealProductCheckbox:checked');
        if (selectedCheckboxes.length === 0) {
            alert('Please select at least one product for the deal');
            return;
        }

        const dealItems = Array.from(selectedCheckboxes).map(checkbox => {
            const productId = parseInt(checkbox.value);
            const product = AuthDB.products.find(p => p.id === productId);
            return {
                productId: product.id,
                name: product.name,
                price: product.price,
                icon: product.icon
            };
        });

        const newDealId = Math.max(...AuthDB.deals.map(d => d.id), 0) + 1;
        const deal = {
            id: newDealId,
            name: dealName,
            icon: dealIcon,
            price: dealPrice,
            items: dealItems,
            createdAt: new Date().toLocaleString()
        };

        AuthDB.deals.push(deal);
        AuthDB.saveToLocalStorage();

        // Clear form
        document.getElementById('dealNameInput').value = '';
        document.getElementById('dealIconInput').value = '🎁';
        document.getElementById('dealPriceInput').value = '';
        document.querySelectorAll('.dealProductCheckbox').forEach(cb => cb.checked = false);

        this.renderDealsList();
        this.showNotification('Deal created successfully');
    }

    renderDealsList() {
        const container = document.getElementById('dealsList');
        if (!container) return;
        container.innerHTML = '';

        if (AuthDB.deals.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 30px; color: #999;">No deals created yet</p>';
            return;
        }

        AuthDB.deals.forEach(deal => {
            const dealCard = document.createElement('div');
            dealCard.style.cssText = `
                padding: 15px;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 8px;
                margin-bottom: 15px;
            `;
            
            const itemsList = deal.items.map(item => `${item.icon} ${item.name}`).join(', ');
            
            dealCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <h4 style="margin: 0 0 5px 0;">${deal.icon} ${deal.name}</h4>
                        <p style="margin: 5px 0; font-size: 12px; color: #666;">Contains: ${itemsList}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #27AE60;">Rs. ${deal.price}</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <button class="btn btn-secondary" onclick="managerDashboard.editDeal(${deal.id})">✏️ Edit</button>
                    <button class="btn btn-danger" onclick="managerDashboard.deleteDeal(${deal.id})">🗑️ Delete</button>
                </div>
            `;
            container.appendChild(dealCard);
        });
    }

    editDeal(dealId) {
        const deal = AuthDB.deals.find(d => d.id === dealId);
        if (!deal) return;

        document.getElementById('dealNameInput').value = deal.name;
        document.getElementById('dealIconInput').value = deal.icon;
        document.getElementById('dealPriceInput').value = deal.price;

        // Check the products in this deal
        document.querySelectorAll('.dealProductCheckbox').forEach(checkbox => {
            checkbox.checked = deal.items.some(item => item.productId === parseInt(checkbox.value));
        });

        // Store the deal ID for updating
        window.editingDealId = dealId;
        this.showNotification('Update deal details and click Create Deal to save changes');
    }

    deleteDeal(dealId) {
        if (confirm('Are you sure you want to delete this deal?')) {
            AuthDB.deals = AuthDB.deals.filter(d => d.id !== dealId);
            AuthDB.saveToLocalStorage();
            this.renderDealsList();
            this.showNotification('Deal deleted successfully');
        }
    }

    showManagerPrintModal(orderId) {
        const order = getAllOrders().find(o => o.id === orderId);
        if (!order) return;

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
                <p>Status: ${order.status.toUpperCase()}</p>
                
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

        document.getElementById('managerOrderSlip').innerHTML = slipHtml;
        document.getElementById('managerPrintModal').classList.remove('hidden');
    }

    renderDashboard() {
        const today = new Date();
        const todayStr = today.toLocaleDateString();

        // Get today's orders
        const todayOrders = getAllOrders().filter(o => 
            new Date(o.createdAt).toLocaleDateString() === todayStr
        );

        const completedTodayOrders = todayOrders.filter(o => o.status === 'completed' || o.status === 'paid');
        const todayRevenue = completedTodayOrders.reduce((sum, o) => sum + o.total, 0);
        const pendingOrders = getOrdersByStatus('pending').length;

        // Revenue calculations
        const dailyRev = calculateDailyRevenue();
        
        const weekStartDate = new Date(today);
        weekStartDate.setDate(today.getDate() - today.getDay());
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekStartDate.getDate() + 6);
        const weeklyRev = getRevenueBetween(weekStartDate, weekEndDate);

        const monthStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const monthlyRev = getRevenueBetween(monthStartDate, monthEndDate);

        // Update stats
        document.getElementById('todayRevenue').textContent = `Rs. ${todayRevenue.toFixed(0)}`;
        document.getElementById('todayOrders').textContent = completedTodayOrders.length;
        document.getElementById('pendingCount').textContent = pendingOrders;
        document.getElementById('productCount').textContent = AuthDB.products.length;

        document.getElementById('dailyRev').textContent = `Rs. ${dailyRev.toFixed(0)}`;
        document.getElementById('weeklyRev').textContent = `Rs. ${weeklyRev.toFixed(0)}`;
        document.getElementById('monthlyRev').textContent = `Rs. ${monthlyRev.toFixed(0)}`;

        // Top Products
        this.renderTopProducts();
    }

    renderTopProducts() {
        const container = document.getElementById('topProducts');
        container.innerHTML = '';

        const topProducts = getTopSellingProducts(30); // Last 30 days

        if (topProducts.length === 0) {

            container.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">No sales data available</p>';
            return;
        }
if(!item.product) return; // Skip if product data is missing
        topProducts.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'product-item';
            li.innerHTML = `
                <div class="product-info">
                    <div class="product-name">${index + 1}. ${item.product.icon} ${item.product.name}</div>
                    <div class="product-sold">${item.quantity} units sold</div>
                </div>
                <div class=\"product-revenue\">Rs. ${item.revenue.toFixed(0)}</div>
            `;
            container.appendChild(li);
        });
    }

    generateReport() {
        const reportType = document.getElementById('reportType').value;
        const reportDate = new Date(document.getElementById('reportDate').value);
        
        let startDate, endDate;

        if (reportType === 'daily') {
            startDate = new Date(reportDate);
            endDate = new Date(reportDate);
            endDate.setDate(endDate.getDate() + 1);
        } else if (reportType === 'weekly') {
            startDate = new Date(reportDate);
            startDate.setDate(reportDate.getDate() - reportDate.getDay());
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7);
        } else if (reportType === 'monthly') {
            startDate = new Date(reportDate.getFullYear(), reportDate.getMonth(), 1);
            endDate = new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 0);
        }

        const orders = getAllOrders().filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= startDate && orderDate <= endDate && (o.status === 'completed' || o.status === 'paid');
        });

        const tbody = document.getElementById('reportTableBody');
        tbody.innerHTML = '';

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px;">No orders found</td></tr>';
            return;
        }

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.customer}</td>
                <td>${order.type}</td>
                <td>${order.waiter}</td>
                <td>${order.items.length}</td>
                <td>Rs. ${order.total.toFixed(0)}</td>
                <td><span class="order-status status-completed">COMPLETED</span></td>
                <td>${order.createdAt}</td>
            `;
            tbody.appendChild(row);
        });
    }

    renderCategories() {
        const container = document.getElementById('categoryList');
        container.innerHTML = '';

        AuthDB.categories.forEach(category => {
            const item = document.createElement('div');
            item.className = 'category-item';
            item.innerHTML = `
                <span class="category-name">${category.icon} ${category.name}</span>
                <div class="category-actions">
                    <button class="btn-edit" onclick="managerDashboard.editCategory(${category.id}, '${category.name}', '${category.icon}')">Edit</button>
                    <button class="btn-delete" onclick="managerDashboard.deleteCategory(${category.id})">Delete</button>
                </div>
            `;
            container.appendChild(item);
        });
    }

    addCategory() {
        const name = document.getElementById('categoryNameInput').value.trim();
        const icon = document.getElementById('categoryIconInput').value.trim();

        if (!name || !icon) {
            alert('Please enter both name and icon');
            return;
        }

        const newId = Math.max(...AuthDB.categories.map(c => c.id), 0) + 1;
        AuthDB.categories.push({ id: newId, name, icon });
        AuthDB.saveToLocalStorage();

        document.getElementById('categoryNameInput').value = '';
        document.getElementById('categoryIconInput').value = '';

        this.renderCategories();
        this.updateProductCategorySelect();
        this.showNotification('Category added successfully');
    }

    editCategory(id, name, icon) {
        this.editingType = 'category';
        this.editingId = id;

        document.getElementById('editTitle').textContent = 'Edit Category';
        document.getElementById('editNameInput').value = name;
        document.getElementById('editValueInput').value = icon;
        document.getElementById('editModal').classList.add('active');
    }

    deleteCategory(id) {
        if (confirm('Are you sure you want to delete this category?')) {
            AuthDB.categories = AuthDB.categories.filter(c => c.id !== id);
            AuthDB.saveToLocalStorage();
            this.renderCategories();
            this.updateProductCategorySelect();
            this.showNotification('Category deleted');
        }
    }

    renderProducts() {
        this.updateProductCategorySelect();
        const tbody = document.getElementById('productList');
        tbody.innerHTML = '';

        AuthDB.products.forEach(product => {
            const category = getCategoryById(product.category);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.icon}</td>
                <td>${product.name}</td>
                <td>${category ? category.name : 'N/A'}</td>
                <td>Rs.${product.price}</td>
                <td>
                    <button class="btn-edit" onclick="managerDashboard.editProduct(${product.id}, '${product.name}', ${product.price}, '${product.icon}')">Edit</button>
                    <button class="btn-delete" onclick="managerDashboard.deleteProduct(${product.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateProductCategorySelect() {
        const select = document.getElementById('productCategorySelect');
        select.innerHTML = '';

        AuthDB.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `${category.icon} ${category.name}`;
            select.appendChild(option);
        });
    }

    addProduct() {
        const name = document.getElementById('productNameInput').value.trim();
        const price = parseFloat(document.getElementById('productPriceInput').value);
        const categoryId = parseInt(document.getElementById('productCategorySelect').value);
        const icon = document.getElementById('productIconInput').value.trim();

        if (!name || !price || !categoryId || !icon) {
            alert('Please fill all fields');
            return;
        }

        const newId = Math.max(...AuthDB.products.map(p => p.id), 0) + 1;
        AuthDB.products.push({ id: newId, name, price, category: categoryId, icon });
        AuthDB.saveToLocalStorage();

        document.getElementById('productNameInput').value = '';
        document.getElementById('productPriceInput').value = '';
        document.getElementById('productIconInput').value = '';

        this.renderProducts();
        this.showNotification('Product added successfully');
    }

    editProduct(id, name, price, icon) {
        this.editingType = 'product';
        this.editingId = id;

        document.getElementById('editTitle').textContent = 'Edit Product';
        document.getElementById('editNameInput').value = name;
        document.getElementById('editValueInput').value = price;
        document.getElementById('editModal').classList.add('active');
    }

    deleteProduct(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            AuthDB.products = AuthDB.products.filter(p => p.id !== id);
            AuthDB.saveToLocalStorage();
            this.renderProducts();
            this.showNotification('Product deleted');
        }
    }

    saveEdit() {
        const name = document.getElementById('editNameInput').value.trim();
        const value = document.getElementById('editValueInput').value.trim();

        if (this.editingType === 'category') {
            const category = AuthDB.categories.find(c => c.id === this.editingId);
            if (category) {
                category.name = name;
                category.icon = value;
                AuthDB.saveToLocalStorage();
                this.renderCategories();
                this.updateProductCategorySelect();
            }
        } else if (this.editingType === 'product') {
            const product = AuthDB.products.find(p => p.id === this.editingId);
            if (product) {
                product.name = name;
                product.price = parseFloat(value);
                AuthDB.saveToLocalStorage();
                this.renderProducts();
            }
        }

        document.getElementById('editModal').classList.remove('active');
        this.showNotification('Updated successfully');
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
let managerDashboard;
document.addEventListener('DOMContentLoaded', () => {
    Auth.redirect();
    managerDashboard = new ManagerDashboard();
});

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.add('hidden');
    managerDashboard.selectedPaymentMethod = null;
}

function selectPaymentMethod(element) {
    // Remove previous selection
    document.querySelectorAll('.payment-method').forEach(method => {
        method.style.borderColor = '#ddd';
        method.style.backgroundColor = 'transparent';
    });

    // Highlight selected method
    element.style.borderColor = '#27AE60';
    element.style.backgroundColor = '#f0f8f0';

    // Store selected method
    managerDashboard.selectedPaymentMethod = element.dataset.method;

    // Enable print button
    document.getElementById('paymentPrintBtn').disabled = false;
}

function completePaymentProcess() {
    if (!managerDashboard.selectedPaymentMethod) {
        alert('Please select a payment method');
        return;
    }

    if (!managerDashboard.currentPaymentOrder) {
        alert('No order selected');
        return;
    }

    const order = managerDashboard.currentPaymentOrder;

    // Update order status to "paid and completed"
    order.paymentMethod = managerDashboard.selectedPaymentMethod;
    order.status = 'paid';
    order.paidAt = new Date().toLocaleString();

    AuthDB.saveToLocalStorage();

    // Show print slip
    managerDashboard.showManagerPrintModal(order.id);

    // Close payment modal
    closePaymentModal();

    // Show notification
    managerDashboard.showNotification('Payment processed successfully! Order marked as Paid & Completed');

    // Refresh orders display after a short delay
    setTimeout(() => {
        managerDashboard.renderManagerOrders();
    }, 1000);
}
