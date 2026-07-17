const header = document.querySelector('.header');

// =========================
// Sticky Header
// =========================

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// =========================
// Hero Animation
// =========================

window.addEventListener('load', () => {
  const hero = document.querySelector('.hero-content');

  if (hero) {
    hero.classList.add('show');
  }
});

// =========================
// Mobile Navigation
// =========================

const hamburger = document.querySelector('.hamburger');

const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('show');

    hamburger.classList.toggle('active');
  });
}

// Close menu when link clicked

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('show');
  });
});
