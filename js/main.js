/**
 * Main JavaScript — Navigation, smooth scroll, form, animations, admin data integration.
 */
document.addEventListener('DOMContentLoaded', () => {
  // ---- Load admin data ----
  let adminData = null;
  try {
    const raw = localStorage.getItem('admin_data');
    if (raw) adminData = JSON.parse(raw);
  } catch { /* ignore */ }

  // ---- Apply admin images ----
  if (adminData && adminData.images) {
    const imgs = adminData.images;

    // Hero photo
    if (imgs.hero_photo) {
      const heroPlaceholder = document.querySelector('.hero-photo-placeholder');
      if (heroPlaceholder) {
        heroPlaceholder.innerHTML = '';
        heroPlaceholder.style.backgroundImage = `url(${imgs.hero_photo})`;
        heroPlaceholder.style.backgroundSize = 'cover';
        heroPlaceholder.style.backgroundPosition = 'center';
        heroPlaceholder.style.border = 'none';
      }
    }

    // About photo
    if (imgs.about_photo) {
      const aboutPlaceholder = document.querySelector('.about-photo-placeholder');
      if (aboutPlaceholder) {
        aboutPlaceholder.innerHTML = '';
        aboutPlaceholder.style.backgroundImage = `url(${imgs.about_photo})`;
        aboutPlaceholder.style.backgroundSize = 'cover';
        aboutPlaceholder.style.backgroundPosition = 'center';
        aboutPlaceholder.style.border = 'none';
      }
    }

    // Before/After photos
    if (adminData.results) {
      const resultCards = document.querySelectorAll('.result-card');
      adminData.results.forEach((res, idx) => {
        const card = resultCards[idx];
        if (!card) return;

        const beforeKey = `result_${res.id}_before`;
        const afterKey = `result_${res.id}_after`;

        if (imgs[beforeKey]) {
          const beforeDiv = card.querySelector('.result-img.before .result-placeholder');
          if (beforeDiv) {
            beforeDiv.innerHTML = '';
            beforeDiv.style.backgroundImage = `url(${imgs[beforeKey]})`;
            beforeDiv.style.backgroundSize = 'cover';
            beforeDiv.style.backgroundPosition = 'center';
          }
        }

        if (imgs[afterKey]) {
          const afterDiv = card.querySelector('.result-img.after .result-placeholder');
          if (afterDiv) {
            afterDiv.innerHTML = '';
            afterDiv.style.backgroundImage = `url(${imgs[afterKey]})`;
            afterDiv.style.backgroundSize = 'cover';
            afterDiv.style.backgroundPosition = 'center';
          }
        }
      });
    }
  }

  // ---- Apply admin stats ----
  if (adminData && adminData.stats) {
    const statNumbers = document.querySelectorAll('.stat-number');
    const keys = ['stat1_number', 'stat2_number', 'stat3_number', 'stat4_number'];
    keys.forEach((key, idx) => {
      if (adminData.stats[key] && statNumbers[idx]) {
        statNumbers[idx].textContent = adminData.stats[key];
      }
    });
  }

  // ---- Apply admin social links ----
  if (adminData && adminData.social) {
    const socialMap = {
      social_instagram: '.social-icon.instagram',
      social_facebook: '.social-icon.facebook',
      social_telegram: '.social-icon.telegram',
      social_whatsapp: '.social-icon.whatsapp',
      social_viber: '.social-icon.viber',
      social_tiktok: '.social-icon.tiktok',
      social_youtube: '.social-icon.youtube',
    };

    Object.entries(socialMap).forEach(([key, selector]) => {
      const url = adminData.social[key];
      document.querySelectorAll(selector).forEach(el => {
        if (url) {
          el.href = url;
          el.style.display = '';
        }
      });
    });

    // Also update footer social links by matching aria-label
    const footerSocialMap = {
      social_instagram: 'Instagram',
      social_facebook: 'Facebook',
      social_telegram: 'Telegram',
      social_whatsapp: 'WhatsApp',
      social_viber: 'Viber',
      social_tiktok: 'TikTok',
      social_youtube: 'YouTube',
    };
    Object.entries(footerSocialMap).forEach(([key, label]) => {
      const url = adminData.social[key];
      if (url) {
        document.querySelectorAll(`.footer-social a[aria-label="${label}"]`).forEach(el => {
          el.href = url;
        });
      }
    });
  }

  // ---- Apply admin contact info ----
  if (adminData && adminData.contact) {
    if (adminData.contact.contact_phone) {
      const phoneLink = document.querySelector('.contact-item a[href^="tel:"]');
      if (phoneLink) {
        const cleanPhone = adminData.contact.contact_phone.replace(/\s/g, '');
        phoneLink.href = `tel:${cleanPhone}`;
        phoneLink.textContent = adminData.contact.contact_phone;
      }
    }
    if (adminData.contact.contact_email) {
      const emailLink = document.querySelector('.contact-item a[href^="mailto:"]');
      if (emailLink) {
        emailLink.href = `mailto:${adminData.contact.contact_email}`;
        emailLink.textContent = adminData.contact.contact_email;
      }
    }
  }

  // ---- Navbar scroll effect ----
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Mobile nav toggle ----
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  // ---- Active nav link highlighting ----
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a');

  const observerOptions = {
    rootMargin: '-20% 0px -60% 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navItems.forEach((item) => {
          item.classList.toggle('active', item.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));

  // ---- Scroll-triggered animations ----
  const animateElements = document.querySelectorAll(
    '.service-card, .result-card, .about-text, .about-image, .contact-info, .contact-form, .stat'
  );

  const animObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          animObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  animateElements.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    animObserver.observe(el);
  });

  // CSS class for animation
  const style = document.createElement('style');
  style.textContent = `.animate-in { opacity: 1 !important; transform: translateY(0) !important; }`;
  document.head.appendChild(style);

  // ---- Contact form handling ----
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const formEntries = Object.fromEntries(formData.entries());
      console.log('Form submitted:', formEntries);

      // Show success feedback
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = '\u2713';
      btn.style.background = '#00c9a7';
      btn.style.borderColor = '#00c9a7';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.disabled = false;
        form.reset();
      }, 2500);
    });
  }
});
