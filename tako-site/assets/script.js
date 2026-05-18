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

const fetchTickerPrices = async () => {
  const track = document.getElementById('ticker-track');
  if (!track) return;

  // CoinGecko IDs (free, no key needed)
  const ids = 'bitcoin,ethereum,solana,hyperliquid,arbitrum,optimism,sui,dogecoin,avalanche-2,chainlink';
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const coins = [
      { id: 'bitcoin', symbol: 'BTC' },
      { id: 'ethereum', symbol: 'ETH' },
      { id: 'solana', symbol: 'SOL' },
      { id: 'hyperliquid', symbol: 'HYPE' },
      { id: 'arbitrum', symbol: 'ARB' },
      { id: 'optimism', symbol: 'OP' },
      { id: 'sui', symbol: 'SUI' },
      { id: 'dogecoin', symbol: 'DOGE' },
      { id: 'avalanche-2', symbol: 'AVAX' },
      { id: 'chainlink', symbol: 'LINK' }
    ];

    track.innerHTML = ''; // clear static content

    coins.forEach(coin => {
      const priceData = data[coin.id];
      if (!priceData) return;

      const price = priceData.usd;
      const change = priceData.usd_24h_change || 0;
      const isUp = change >= 0;

      const item = document.createElement('span');
      item.className = 'ticker__item';
      item.innerHTML = `
        <span class="ticker__symbol">${coin.symbol}</span>
        <span class="ticker__price">$${price.toLocaleString()}</span>
        <span class="${isUp ? 'ticker__delta-up' : 'ticker__delta-down'}">${isUp ? '+' : ''}${change.toFixed(2)}%</span>
      `;
      track.appendChild(item);
    });

    // Duplicate for seamless infinite scroll
    track.innerHTML += track.innerHTML;

  } catch (e) {
    console.error('Ticker fetch failed, using fallback', e);
    // Fallback to static if API fails
    track.innerHTML = `
      <span class="ticker__item"><span class="ticker__symbol">BTC</span><span class="ticker__price">$104,820</span><span class="ticker__delta-up">+2.41%</span></span>
      <span class="ticker__item"><span class="ticker__symbol">ETH</span><span class="ticker__price">$3,942</span><span class="ticker__delta-up">+1.86%</span></span>
      <span class="ticker__item"><span class="ticker__symbol">SOL</span><span class="ticker__price">$224.10</span><span class="ticker__delta-down">−0.74%</span></span>
      <span class="ticker__item"><span class="ticker__symbol">HYPE</span><span class="ticker__price">$32.41</span><span class="ticker__delta-up">+5.12%</span></span>
      <span class="ticker__item"><span class="ticker__symbol">ARB</span><span class="ticker__price">$0.842</span><span class="ticker__delta-up">+3.21%</span></span>
      <span class="ticker__item"><span class="ticker__symbol">OP</span><span class="ticker__price">$2.18</span><span class="ticker__delta-down">−1.05%</span></span>
      <span class="ticker__item"><span class="ticker__symbol">SUI</span><span class="ticker__price">$4.42</span><span class="ticker__delta-up">+6.81%</span></span>
      <span class="ticker__item"><span class="ticker__symbol">DOGE</span><span class="ticker__price">$0.391</span><span class="ticker__delta-down">−0.92%</span></span>
      <span class="ticker__item"><span class="ticker__symbol">AVAX</span><span class="ticker__price">$48.21</span><span class="ticker__delta-up">+2.15%</span></span>
      <span class="ticker__item"><span class="ticker__symbol">LINK</span><span class="ticker__price">$24.10</span><span class="ticker__delta-up">+1.92%</span></span>
    `;
    track.innerHTML += track.innerHTML;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  reveal();
  pillarHover();
  mobileNav();
  fetchTickerPrices();
  
  // Refresh prices every 60 seconds
  setInterval(fetchTickerPrices, 60000);
});
