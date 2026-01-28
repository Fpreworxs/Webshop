// ========================================
// Preworxs Webshop - JavaScript
// Product Configurator & Order System (B2B)
// ========================================

// ========================================
// EmailJS Configuration
// To set up EmailJS:
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Add an email service (Gmail, Outlook, etc.)
// 3. Create an email template with these variables:
//    - {{order_details}}
//    - {{total_price}}
//    - {{customer_email}}
//    - {{company_name}}
//    - {{contact_person}}
//    - {{phone}}
//    - {{order_date}}
// 4. Replace the values below with your own
// ========================================
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';  // Replace with your EmailJS public key
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';  // Replace with your EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Replace with your EmailJS template ID
const RECIPIENT_EMAIL = 'fabian8d@gmail.com';

// Initialize EmailJS
(function() {
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
})();

// Product Images Array
const productImages = [
    'PNG/01.IMG_3107.png',
    'PNG/02.IMG_3108.png',
    'PNG/03.IMG_3109.png',
    'PNG/04.IMG_3113.png',
    'PNG/05.IMG_3116.png',
    'PNG/06.IMG_3117.png',
    'PNG/07.IMG_3119.png',
    'PNG/08.IMG_3106.png'
];

// Current State
let currentImageIndex = 0;
let configuration = {
    model: 'greencomfort',
    liters: '100',
    side: 'rechts',
    quantity: 1
};

// Shopping Cart - tracks quantities per type
let cart = [];

// Pricing
const pricing = {
    standard: 12000,
    greencomfort: 14000,
    liters150Addon: 500 // Extra cost for 150L option
};

// ========================================
// Image Carousel Functions
// ========================================

function updateImage() {
    const img = document.getElementById('productImage');
    img.style.opacity = '0';
    
    setTimeout(() => {
        img.src = productImages[currentImageIndex];
        img.style.opacity = '1';
    }, 150);
    
    // Update dots
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentImageIndex);
    });
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % productImages.length;
    updateImage();
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
    updateImage();
}

function goToImage(index) {
    currentImageIndex = index;
    updateImage();
}

// ========================================
// Configuration Functions
// ========================================

function selectOption(optionType, value, buttonElement) {
    // Update configuration
    configuration[optionType] = value;
    
    // Update UI for option buttons and toggle buttons
    const parent = buttonElement.parentElement;
    const siblings = parent.querySelectorAll('.option-btn, .toggle-btn');
    siblings.forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
    
    // Update specs display if liters changed
    if (optionType === 'liters') {
        document.getElementById('specDrinkwater').textContent = value;
    }
}

function updateQuantity(value) {
    const qty = parseInt(value) || 1;
    configuration.quantity = Math.max(1, Math.min(999, qty));
    document.getElementById('quantityInput').value = configuration.quantity;
}

// ========================================
// Cart Functions
// ========================================

function getConfigKey(config) {
    return `${config.model}-${config.liters}-${config.side}`;
}

function getModelName(model) {
    return model === 'greencomfort' ? 'Modul-AIR & Green Comfort' : 'Modul-AIR';
}

function getItemPrice(item) {
    let basePrice = item.model === 'greencomfort' ? pricing.greencomfort : pricing.standard;
    if (item.liters === '150') {
        basePrice += pricing.liters150Addon;
    }
    return basePrice;
}

function addToCart() {
    const configKey = getConfigKey(configuration);
    
    // Check if this configuration already exists in cart
    const existingIndex = cart.findIndex(item => getConfigKey(item) === configKey);
    
    if (existingIndex >= 0) {
        // Add to existing quantity
        cart[existingIndex].quantity += configuration.quantity;
    } else {
        // Add new item
        cart.push({
            model: configuration.model,
            liters: configuration.liters,
            side: configuration.side,
            quantity: configuration.quantity
        });
    }
    
    // Reset quantity input
    configuration.quantity = 1;
    document.getElementById('quantityInput').value = 1;
    
    // Update UI
    updateCartDisplay();
    updateTotalPrice();
    
    // Visual feedback
    const btn = document.querySelector('.add-to-cart-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Toegevoegd! ✓';
    btn.style.backgroundColor = '#22c55e';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = '';
    }, 1500);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
    updateTotalPrice();
}

function updateCartDisplay() {
    const cartItemsEl = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p class="empty-cart">Nog geen producten toegevoegd</p>';
        return;
    }
    
    let html = '';
    cart.forEach((item, index) => {
        const itemPrice = getItemPrice(item) * item.quantity;
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <span class="cart-item-name">${getModelName(item.model)}</span>
                    <span class="cart-item-details">${item.liters}L | ${item.side}</span>
                </div>
                <span class="cart-item-qty">×${item.quantity}</span>
                <span class="cart-item-price">${formatPrice(itemPrice)}</span>
                <button class="cart-item-remove" onclick="removeFromCart(${index})" title="Verwijderen">×</button>
            </div>
        `;
    });
    
    cartItemsEl.innerHTML = html;
}

function updateTotalPrice() {
    let total = 0;
    cart.forEach(item => {
        total += getItemPrice(item) * item.quantity;
    });
    
    document.getElementById('totalPrice').textContent = formatPrice(total);
    
    // Enable/disable purchase button
    const purchaseBtn = document.querySelector('.purchase-btn');
    purchaseBtn.disabled = cart.length === 0;
}

function formatPrice(amount) {
    return '€' + amount.toLocaleString('nl-NL') + '.-';
}

// ========================================
// Modal Functions
// ========================================

function openOrderModal() {
    if (cart.length === 0) {
        alert('Voeg eerst producten toe aan uw bestelling.');
        return;
    }
    
    // Update modal cart display
    const modalCartEl = document.getElementById('modalCartItems');
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemPrice = getItemPrice(item) * item.quantity;
        total += itemPrice;
        html += `
            <div class="modal-cart-item">
                <span>${getModelName(item.model)} (${item.liters}L, ${item.side}) ×${item.quantity}</span>
                <span>${formatPrice(itemPrice)}</span>
            </div>
        `;
    });
    
    modalCartEl.innerHTML = html;
    document.getElementById('summaryTotal').textContent = `Totaal: ${formatPrice(total)}`;
    
    // Show modal
    document.getElementById('orderModal').classList.add('active');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
}

// ========================================
// Order Submission
// ========================================

async function submitOrder(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    // Get form data
    const email = document.getElementById('email').value;
    const company = document.getElementById('company').value || 'Niet opgegeven';
    const name = document.getElementById('name').value || 'Niet opgegeven';
    const phone = document.getElementById('phone').value || 'Niet opgegeven';
    
    // Calculate total
    let total = 0;
    cart.forEach(item => {
        total += getItemPrice(item) * item.quantity;
    });
    
    // Build order details string
    let orderDetails = cart.map(item => {
        const itemPrice = getItemPrice(item) * item.quantity;
        return `${getModelName(item.model)} (${item.liters}L, ${item.side}) ×${item.quantity} = ${formatPrice(itemPrice)}`;
    }).join('\n');
    
    // Prepare order data
    const orderData = {
        product: 'Inventum Modul-AIR Green Comfort',
        orderDetails: orderDetails,
        totalPrice: formatPrice(total),
        customerEmail: email,
        companyName: company,
        contactPerson: name,
        customerPhone: phone,
        orderDate: new Date().toLocaleString('nl-NL')
    };
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verzenden...';
    
    let emailSent = false;
    
    // Try EmailJS first (if configured)
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
        try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                to_email: RECIPIENT_EMAIL,
                order_details: orderDetails,
                total_price: orderData.totalPrice,
                customer_email: orderData.customerEmail,
                company_name: orderData.companyName,
                contact_person: orderData.contactPerson,
                phone: orderData.customerPhone,
                order_date: orderData.orderDate
            });
            emailSent = true;
        } catch (error) {
            console.error('EmailJS error:', error);
        }
    }
    
    // Try FormSubmit.co as fallback
    if (!emailSent) {
        try {
            const response = await fetch('https://formsubmit.co/ajax/fabian8d@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    _subject: `Nieuwe B2B bestelling: Inventum Modul-AIR (${formatPrice(total)})`,
                    _template: 'table',
                    'Bestelling': orderDetails.replace(/\n/g, '<br>'),
                    'Totaalprijs': orderData.totalPrice,
                    'Klant e-mail': orderData.customerEmail,
                    'Bedrijfsnaam': orderData.companyName,
                    'Contactpersoon': orderData.contactPerson,
                    'Telefoon': orderData.customerPhone,
                    'Besteldatum': orderData.orderDate
                })
            });
            
            if (response.ok) {
                emailSent = true;
            }
        } catch (error) {
            console.error('FormSubmit error:', error);
        }
    }
    
    // If all else fails, use mailto as last resort
    if (!emailSent) {
        const mailtoBody = `
Nieuwe B2B bestelling Preworxs Webshop

BESTELLING:
${orderDetails}

Totaalprijs: ${orderData.totalPrice}

KLANTGEGEVENS:
E-mail: ${orderData.customerEmail}
Bedrijfsnaam: ${orderData.companyName}
Contactpersoon: ${orderData.contactPerson}
Telefoon: ${orderData.customerPhone}

Besteldatum: ${orderData.orderDate}
        `.trim();
        
        const mailtoLink = `mailto:fabian8d@gmail.com?subject=${encodeURIComponent('Nieuwe B2B bestelling: Inventum Modul-AIR (' + orderData.totalPrice + ')')}&body=${encodeURIComponent(mailtoBody)}`;
        window.location.href = mailtoLink;
    }
    
    // Show success and reset
    closeOrderModal();
    document.getElementById('successModal').classList.add('active');
    form.reset();
    cart = [];
    updateCartDisplay();
    updateTotalPrice();
    
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
}

// ========================================
// Event Listeners
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart display
    updateCartDisplay();
    updateTotalPrice();
    
    // Close modal on background click
    document.getElementById('orderModal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeOrderModal();
        }
    });
    
    document.getElementById('successModal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeSuccessModal();
        }
    });
    
    // Keyboard navigation for carousel
    document.addEventListener('keydown', (e) => {
        if (document.querySelector('.modal.active')) return; // Don't navigate when modal is open
        
        if (e.key === 'ArrowLeft') {
            prevImage();
        } else if (e.key === 'ArrowRight') {
            nextImage();
        }
    });
    
    // Quantity input - enter key to add to cart
    document.getElementById('quantityInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addToCart();
        }
    });
});

// Preload images for smoother transitions
function preloadImages() {
    productImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Call preload on page load
window.addEventListener('load', preloadImages);
