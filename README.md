# 🍔 Restaurant Fast Food POS System

A modern, fully-featured Point of Sale (POS) system built with HTML, CSS, and JavaScript for managing restaurant fast food operations. The system includes role-based access control, order management, and comprehensive reporting features.

## 🎯 Features

### ✨ Core Features
- **Role-Based Authentication**
  - Waiter: Takes orders and manages customer requests
  - Cashier: Processes payments and prints order slips
  - Manager: Analytics, reporting, and product management

- **Order Management**
  - 🪑 **Dine-In**: Table-based ordering
  - 🛍️ **Takeaway**: Quick order fulfillment
  - 🚚 **Delivery**: Address-based orders

- **Payment Processing**
  - Multiple payment methods (Cash, Card, UPI, Wallet)
  - Order slip printing
  - Payment tracking

- **Manager Dashboard**
  - 📊 Real-time analytics
  - Daily, Weekly, and Monthly reports
  - Top selling products analysis
  - Revenue tracking

- **Product Management**
  - Add/Edit/Delete products
  - Category management
  - Dynamic menu updates

## 🚀 Getting Started

### Installation
1. Extract the files to a folder
2. Open `index.html` in a web browser
3. No server or installation required!

### Demo Credentials

**Waiter Login:**
- Username: `waiter`
- Password: `1234`
- Role: `Waiter`

**Cashier Login:**
- Username: `cashier`
- Password: `1234`
- Role: `Cashier`

**Manager Login:**
- Username: `admin`
- Password: `1234`
- Role: `Manager`

## 📁 Project Structure

```
RESU-POS-WEB/
├── index.html              # Login page
├── waiter.html             # Waiter dashboard
├── cashier.html            # Cashier dashboard
├── manager.html            # Manager dashboard
├── assets/
│   ├── css/
│   │   └── style.css       # All styles for the application
│   └── js/
│       ├── auth.js         # Authentication & database
│       ├── waiter.js       # Waiter functionality
│       ├── cashier.js      # Cashier functionality
│       └── manager.js      # Manager functionality
└── README.md               # This file
```

## 👨‍💼 User Roles & Permissions

### 🚶 Waiter
- Create new orders (Dine-in, Takeaway, Delivery)
- Add/remove items from cart
- View order status
- Manage customer information
- View personal orders

### 💳 Cashier
- View pending orders
- Process payments
- Print order slips
- View completed orders
- Select payment method

### 👔 Manager
- View dashboard analytics
- Generate reports (Daily/Weekly/Monthly)
- View top-selling products
- Manage product categories
- Add/Edit/Delete products
- View revenue statistics

## 💾 Data Storage

The application uses **LocalStorage** to persist data:
- All orders are saved locally
- Categories and products are stored
- Data persists across browser sessions

## 🎨 UI/UX Features

- **Modern Design**: Gradient backgrounds and smooth animations
- **Responsive Layout**: Works on desktop and tablet
- **Real-time Clock**: Shows current time on all dashboards
- **Notifications**: Toast notifications for user actions
- **Print Functionality**: Print order slips directly
- **Sticky Navigation**: Easy access to different sections

## 🔒 Security Features

- Session-based authentication
- Role-based access control
- Secure logout functionality
- Password verification

## 📊 Default Menu

### Categories
- 🍔 Burgers
- 🍕 Pizza
- 🥤 Drinks
- 🍟 Sides
- 🍰 Desserts

### Sample Products
- Burger (₹150)
- Cheese Burger (₹180)
- Double Burger (₹250)
- Margarita Pizza (₹200)
- Pepperoni Pizza (₹220)
- Coke, Sprite, Juice (₹50-60)
- French Fries (₹80)
- Chicken Nuggets (₹120)
- Cake, Ice Cream (₹80-100)

## 🎯 How to Use

### For Waiters
1. Login with waiter credentials
2. Select order type (Dine-in/Takeaway/Delivery)
3. Select category and add items to cart
4. Fill customer details
5. Submit order
6. Track orders in "My Orders" section

### For Cashiers
1. Login with cashier credentials
2. View pending orders
3. Select an order for payment
4. Choose payment method
5. Print order slip
6. Complete payment
7. View completed orders

### For Managers
1. Login with manager credentials
2. View dashboard for quick statistics
3. Check top-selling products
4. Generate reports for specific periods
5. Manage categories and products
6. Add new items to menu

## 💡 Tips & Tricks

- **Quick Orders**: Click on products to add to cart instantly
- **Bulk Edit**: Use manager panel to update categories and products
- **Print Slip**: Print order slips for kitchen or customer records
- **Revenue Tracking**: Monitor daily, weekly, and monthly revenue
- **Tax Calculation**: Automatic 5% tax is applied to all orders

## 🔧 Technical Details

- **Languages**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: LocalStorage API
- **Compatibility**: Works on all modern browsers
- **No Dependencies**: Vanilla JavaScript, no frameworks needed

## 🌟 Features Highlights

✅ No setup required - Just open in browser
✅ All data stored locally - No server needed
✅ Fully responsive - Works on mobile and desktop
✅ Real-world styling - Professional restaurant POS look
✅ Complete order management - From creation to payment
✅ Comprehensive reporting - Analytics for business decisions
✅ Role-based access - Different views for different users
✅ Print functionality - Order slips and receipts

## 🎓 Learning & Customization

You can easily customize:
- Restaurant name and logo
- Colors (CSS variables in style.css)
- Product categories and items
- Tax percentage
- Payment methods
- Report types

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Future Enhancements

Potential features to add:
- Database backend integration
- Kitchen display system
- Customer loyalty program
- Advanced inventory management
- Multi-branch support
- Mobile app version

## 📄 License

This project is free to use and modify for personal or commercial purposes.

## 👨‍💻 Author

Created as a comprehensive POS solution for fast food restaurants.

---

**Enjoy using FastFood POS! 🍔🚀**

For support or feature requests, feel free to customize the code as needed!
# POS-WEB
