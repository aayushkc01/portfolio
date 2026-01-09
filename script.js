// Mobile Menu Toggle
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Initialize EmailJS with your public key
// Replace 'YOUR_PUBLIC_KEY' with your actual EmailJS public key
(function() {
    emailjs.init("m0Jjuwii-udzQfnJD");
})();

// Form submission with EmailJS
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    const submitBtn = contactForm.querySelector('.btn[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Show loading message
    showMessage('Sending your message...', 'info');
    
    try {
        // Send email using EmailJS
        // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your actual IDs
        const response = await emailjs.sendForm(
            'service_h3m54r9',  // Replace with your Service ID
            'template_ilqhqdh', // Replace with your Template ID
            contactForm
        );
        
        // Success message
        showMessage('Message sent successfully! I will get back to you soon.', 'success');
        
        // Reset form
        contactForm.reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            hideMessage();
        }, 5000);
        
    } catch (error) {
        console.error('Error sending message:', error);
        
        // Error message
        let errorMsg = 'Failed to send message. ';
        if (error.text) {
            errorMsg += 'Error: ' + error.text;
        } else {
            errorMsg += 'Please try again later or contact me directly at ayushkc25@gmail.com';
        }
        
        showMessage(errorMsg, 'error');
        
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Function to show messages
function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';
    formMessage.style.opacity = '1';
    
    // Scroll to message
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Function to hide message
function hideMessage() {
    formMessage.style.opacity = '0';
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 300);
}

// Add smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if(window.scrollY > 50) {
        nav.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
        nav.style.padding = '1rem 5%';
        nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
    } else {
        nav.style.backgroundColor = 'rgba(10, 10, 10, 0.9)';
        nav.style.padding = '1.5rem 5%';
        nav.style.boxShadow = 'none';
    }
});

// Set current year in footer (if you add year dynamically)
const currentYear = new Date().getFullYear();
const footerYear = document.querySelector('footer p');
if (footerYear) {
    footerYear.textContent = `© ${currentYear} Aayush KC. All rights reserved.`;
}