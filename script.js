// --- Product Data ---
// Typically, this would come from a server/API
const productsData = [
    { id: 'p1', name: 'Stylish Backpack', price: 45.00, image: 'https://via.placeholder.com/150/92c952' },
    { id: 'p2', name: 'Wireless Earbuds', price: 75.50, image: 'https://via.placeholder.com/150/771796' },
    { id: 'p3', name: 'Reusable Water Bottle', price: 15.99, image: 'https://via.placeholder.com/150/24f355' },
    { id: 'p4', name: 'Notebook & Pen Set', price: 12.00, image: 'https://via.placeholder.com/150/d32776' },
    { id: 'p5', name: 'Portable Charger', price: 35.00, image: 'https://via.placeholder.com/150/f66b97' },
    { id: 'p6', name: 'Travel Coffee Mug', price: 22.75, image: 'https://via.placeholder.com/150/56a8c2' }
];


// --- DOMContentLoaded Listener ---
// Ensures the script runs after the HTML is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Update cart count display on every page load
    updateCartCountDisplay();

    // Page-specific initializations
    if (document.getElementById('product-list')) {
        displayProducts();
    }
    if (document.getElementById('cart-table-body')) {
        displayCartPage();
    }
    if (document.getElementById('checkout-form')) {
        setupCheckoutForm();
    }
    if (document.getElementById('contact-form')) {
        setupContactForm();
    }
});


// --- Cart Management Functions (using localStorage) ---

// Get cart from localStorage or return empty array
function getCart() {
    return JSON.parse(localStorage.getItem('shoppingCart') || '[]');
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

// Add item to cart
function addToCart(productId) {
    const cart = getCart();
    const product = productsData.find(p => p.id === productId);
    if (!product) return; // Product not found

    const existingItemIndex = cart.findIndex(item => item.id === productId);

    if (existingItemIndex > -1) {
        // Item exists, increment quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // Item doesn't exist, add new item
        cart.push({ ...product, quantity: 1 }); // Spread product details and add quantity
    }

    saveCart(cart);
    updateCartCountDisplay();
    alert(`${product.name} added to cart!`); // Simple feedback
}

// Remove item from cart
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId); // Keep items NOT matching the id
    saveCart(cart);
    updateCartCountDisplay();
    displayCartPage(); // Re-render the cart page content
}

// Update item quantity in cart
function updateCartItemQuantity(productId, quantity) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        // Ensure quantity is at least 1
        const newQuantity = Math.max(1, parseInt(quantity, 10));
        if (!isNaN(newQuantity)) {
            cart[itemIndex].quantity = newQuantity;
        } else {
            // Handle invalid input if necessary, here we just reset or ignore
            // For simplicity, we'll let displayCartPage correct display if NaN happens
        }
    }

    saveCart(cart);
    updateCartCountDisplay();
    displayCartPage(); // Re-render the cart page content
}

// Clear the entire cart
function clearCart() {
    localStorage.removeItem('shoppingCart');
    updateCartCountDisplay();
}

// Calculate total price of items in cart
function calculateCartTotal(cart) {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}


// --- UI Update Functions ---

// Update the cart count indicator in the navigation
function updateCartCountDisplay() {
    const cart = getCart();
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        // Sum quantities of all items
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}


// --- Page Specific Functions ---

// Display products on the index.html page
function displayProducts() {
    const productListDiv = document.getElementById('product-list');
    if (!productListDiv) return; // Exit if not on the correct page

    productListDiv.innerHTML = ''; // Clear existing content

    productsData.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">$${product.price.toFixed(2)}</p>
            <button class="btn add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
        `;
        productListDiv.appendChild(productCard);
    });

    // Add event listeners to the newly created buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.getAttribute('data-product-id');
            addToCart(productId);
        });
    });
}

// Display cart items and summary on the cart.html page
function displayCartPage() {
    const cartTableBody = document.getElementById('cart-table-body');
    const cartTotalElement = document.getElementById('cart-total');
    const cartActionsDiv = document.getElementById('cart-actions'); // Div containing checkout button

    if (!cartTableBody || !cartTotalElement || !cartActionsDiv) return; // Exit if not on cart page

    const cart = getCart();
    cartTableBody.innerHTML = ''; // Clear existing cart items

    if (cart.length === 0) {
        cartTableBody.innerHTML = '<tr><td colspan="6">Your cart is empty.</td></tr>';
        cartTotalElement.textContent = '0.00';
        cartActionsDiv.style.display = 'none'; // Hide checkout if cart is empty
        return;
    }

     cartActionsDiv.style.display = 'block'; // Show checkout if cart has items

    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${item.image}" alt="${item.name}"> ${item.name}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>
                <input type="number" class="item-quantity" value="${item.quantity}" min="1" data-product-id="${item.id}" style="width: 60px;">
            </td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
            <td>
                <button class="btn btn-danger remove-item-btn" data-product-id="${item.id}">Remove</button>
            </td>
        `;
        cartTableBody.appendChild(row);
    });

    // Add event listeners for remove buttons and quantity inputs
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.getAttribute('data-product-id');
            removeFromCart(productId);
        });
    });

    document.querySelectorAll('.item-quantity').forEach(input => {
        input.addEventListener('change', (event) => { // 'change' event is better than 'input' for number fields typically
            const productId = event.target.getAttribute('data-product-id');
            const quantity = parseInt(event.target.value, 10);
            updateCartItemQuantity(productId, quantity);
        });
    });

    // Calculate and display total
    const total = calculateCartTotal(cart);
    cartTotalElement.textContent = total.toFixed(2);
}

// Setup event listener for the checkout form
function setupCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent actual form submission

            // Basic Validation (Example)
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            if (!name || !email) {
                alert('Please fill in all required fields.');
                return;
            }

            // Simulate order placement
            alert('Order placed successfully! (Simulation)');

            // Clear the cart
            clearCart();

            // Redirect to confirmation page
            window.location.href = 'order-confirmation.html';
        });
    }
}

// Setup event listener for the contact form
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent actual form submission

             // Basic Validation (Example)
            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const message = document.getElementById('contact-message').value.trim();
            if (!name || !email || !message) {
                alert('Please fill in all fields.');
                return;
            }

            // Simulate form submission (in real app, send data to server)
            console.log('Feedback Submitted:', { name, email, message });

            // Redirect to feedback submitted page
            window.location.href = 'feedback-submitted.html';
        });
    }
}
