// ── NAV GLOBALE ──

(function() {
  const nav   = document.querySelector('.site-nav');
  const burger = document.querySelector('.site-nav__burger');

  if (!nav || !burger) return;

  // Scroll → fond opaque
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Burger → ouvrir / fermer
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('site-nav--open');
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Fermer en cliquant sur un lien
  document.querySelectorAll('.site-nav__link, .site-nav__sub-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('site-nav--open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Fermer avec Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('site-nav--open')) {
      nav.classList.remove('site-nav--open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();
