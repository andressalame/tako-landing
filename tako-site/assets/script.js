/* Tako — interactions */

const reveal = () => {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  els.forEach(el => io.observe(el));
};

const pillarHover = () => {
  document.querySelectorAll('.pillar').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });
};

const mobileNav = () => {
  const btn = document.querySelector('.nav__burger');
  const links = document.querySelector('.nav__links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    if (open) {
      links.style.cssText = `
        display: flex;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        flex-direction: column;
        background: rgba(0, 0, 0, 0.98);
        padding: 24px 32px;
        border-top: 1px solid var(--white-line);
        gap: 16px;
      `;
      btn.textContent = 'Close';
    } else {
      links.style.cssText = '';
      btn.textContent = 'Menu';
    }
  });
};

const ticker = () => {
  const track = document.querySelector('.ticker__track');
  if (!track) return;
  track.innerHTML += track.innerHTML;
};

document.addEventListener('DOMContentLoaded', () => {
  reveal();
  pillarHover();
  mobileNav();
  ticker();
});
