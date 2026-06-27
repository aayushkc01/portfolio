// ===========================================================
// Aayush KC — Portfolio script.js
// ===========================================================

document.addEventListener('DOMContentLoaded', function () {

  // ---- Mobile nav toggle ----
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      navLinks.classList.toggle('active');
    });

    // Close menu when a link is clicked (mobile)
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('active');
      });
    });
  }

  // ---- Animate skill bars when they enter the viewport ----
  const skillLevels = document.querySelectorAll('.skill-level');

  if ('IntersectionObserver' in window && skillLevels.length) {
    skillLevels.forEach(function (bar) {
      bar.dataset.targetWidth = bar.style.width;
      bar.style.width = '0%';
    });

    const skillObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.targetWidth;
          skillObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    skillLevels.forEach(function (bar) {
      skillObserver.observe(bar);
    });
  }

  // ---- Contact form handling (EmailJS) ----
  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      // NOTE: Replace these with your actual EmailJS service/template/public key.
      // Sign up at https://www.emailjs.com/ to get these values.
      const SERVICE_ID = 'YOUR_SERVICE_ID';
      const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
      const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

      if (typeof emailjs !== 'undefined' && SERVICE_ID !== 'YOUR_SERVICE_ID') {
        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, contactForm, PUBLIC_KEY)
          .then(function () {
            formMessage.textContent = 'Message sent — thanks for reaching out!';
            formMessage.style.color = 'var(--success)';
            contactForm.reset();
          })
          .catch(function () {
            formMessage.textContent = 'Something went wrong. Please email me directly.';
            formMessage.style.color = '#e8744d';
          })
          .finally(function () {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
          });
      } else {
        // Fallback when EmailJS isn't configured yet
        setTimeout(function () {
          formMessage.textContent = 'Thanks for reaching out — I\'ll get back to you soon.';
          formMessage.style.color = 'var(--success)';
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          contactForm.reset();
        }, 600);
      }
    });
  }

  // ---- Smooth-scroll active nav highlight ----
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  if ('IntersectionObserver' in window && sections.length) {
    const navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(function (a) {
            a.classList.toggle('active-link', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

});
