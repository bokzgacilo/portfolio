document.getElementById('year').textContent = new Date().getFullYear();

const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${(i % 4) * 0.08}s`;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

reveals.forEach(el => observer.observe(el));

const carousel = document.querySelector('.service-carousel');

if (carousel) {
  const viewport = carousel.querySelector('.service-carousel-viewport');
  const slides = [...carousel.querySelectorAll('.service-slide')];
  const prev = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');
  const current = carousel.querySelector('[data-carousel-current]');
  const total = carousel.querySelector('[data-carousel-total]');

  const format = (value) => String(value).padStart(2, '0');
  total.textContent = format(slides.length);

  const getStep = () => {
    if (slides.length < 2) return slides[0]?.offsetWidth || viewport.clientWidth;
    return slides[1].offsetLeft - slides[0].offsetLeft;
  };

  const updateCarousel = () => {
    const step = getStep();
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const index = step ? Math.round(viewport.scrollLeft / step) : 0;

    current.textContent = format(Math.min(index + 1, slides.length));
    prev.disabled = viewport.scrollLeft <= 2;
    next.disabled = viewport.scrollLeft >= maxScroll - 2;
  };

  prev.addEventListener('click', () => {
    viewport.scrollBy({ left: -getStep(), behavior: 'smooth' });
  });

  next.addEventListener('click', () => {
    viewport.scrollBy({ left: getStep(), behavior: 'smooth' });
  });

  viewport.addEventListener('scroll', updateCarousel, { passive: true });
  window.addEventListener('resize', updateCarousel);
  updateCarousel();
}

const sections = document.querySelectorAll('main > [id], main > .section-wrap[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 140) current = sec.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--text)' : '';
  });
});
