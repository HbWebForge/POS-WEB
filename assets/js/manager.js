// Manager Dashboard JS
class ManagerDashboard {
    constructor() {
        this.user = Auth.getCurrentUser();
        this.editingType = null;
        this.editingId = null;

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

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            Auth.logout();
            window.location.href = 'index.html';
        });

        // Modal Close
        document.querySelector('.modal-close').addEventListener('click', () => {
            document.getElementById('editModal').classList.remove('active');
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
        if (page === 'dashboard') {
            document.getElementById('dashboardPage').classList.remove('hidden');
            document.getElementById('pageTitle').textContent = 'Dashboard';
            document.querySelector('[data-page="dashboard"]').classList.add('active');
            this.renderDashboard();
        } else if (page === 'reports') {
            document.getElementById('reportsPage').classList.remove('hidden');
            document.getElementById('pageTitle').textContent = 'Reports';
            document.querySelector('[data-page="reports"]').classList.add('active');
            this.generateReport();
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
        document.getElementById('todayRevenue').textContent = `₹${todayRevenue.toFixed(2)}`;
        document.getElementById('todayOrders').textContent = completedTodayOrders.length;
        document.getElementById('pendingCount').textContent = pendingOrders;
        document.getElementById('productCount').textContent = AuthDB.products.length;

        document.getElementById('dailyRev').textContent = `₹${dailyRev.toFixed(2)}`;
        document.getElementById('weeklyRev').textContent = `₹${weeklyRev.toFixed(2)}`;
        document.getElementById('monthlyRev').textContent = `₹${monthlyRev.toFixed(2)}`;

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

        topProducts.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'product-item';
            li.innerHTML = `
                <div class="product-info">
                    <div class="product-name">${index + 1}. ${item.product.icon} ${item.product.name}</div>
                    <div class="product-sold">${item.quantity} units sold</div>
                </div>
                <div class="product-revenue">₹${item.revenue.toFixed(2)}</div>
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
                <td>₹${order.total.toFixed(2)}</td>
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
                <td>₹${product.price}</td>
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
