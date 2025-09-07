// Smooth scroll with header offset (fallback for browsers ignoring CSS)
(function () {
  const headerOffset = 72;
  function smoothTo(hash) {
    const el = document.querySelector(hash);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
  document.querySelectorAll('.nav a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const hash = a.getAttribute('href');
      smoothTo(hash);
      history.pushState(null, '', hash);
    });
  });
})();

// Footer info
(function () {
  const y = document.getElementById('year');
  const u = document.getElementById('last-updated');
  if (y) y.textContent = new Date().getFullYear();
  if (u) u.textContent = "Last updated: " + new Date(document.lastModified).toLocaleDateString();
})();

// News list
(async function () {
  const el = document.getElementById('news-list');
  if (!el) return;
  try {
    const res = await fetch('data/news.json', { cache: 'no-store' });
    const items = await res.json();
    items.sort((a,b) => new Date(b.date) - new Date(a.date));
    el.innerHTML = items.map(n =>
      `<li><time datetime="${n.date}">${new Date(n.date).toLocaleDateString()}</time>${n.text}</li>`
    ).join('');
  } catch {
    el.innerHTML = '<li class="muted">News will appear here.</li>';
  }
})();

// Publications
(async function () {
  const list = document.getElementById('pub-list');
  const yearSel = document.getElementById('pub-year');
  const search = document.getElementById('pub-search');
  if (!list) return;

  let pubs = [];
  try {
    const res = await fetch('data/publications.json', { cache: 'no-store' });
    pubs = await res.json();
  } catch {
    list.innerHTML = '<li class="muted">Publications will appear here.</li>';
    return;
  }

  const years = Array.from(new Set(pubs.map(p => p.year))).sort((a,b)=>b-a);
  years.forEach(y => { const o = document.createElement('option'); o.value = y; o.textContent = y; yearSel.appendChild(o); });

  function render() {
    const q = (search.value || '').toLowerCase();
    const y = yearSel.value;
    const filtered = pubs.filter(p =>
      (!y || String(p.year) === y) &&
      (!q || [p.title, p.venue, (p.authors||[]).join(' ')].join(' ').toLowerCase().includes(q))
    );
    list.innerHTML = filtered
      .sort((a,b) => (b.year - a.year) || (b.order || 0) - (a.order || 0))
      .map(p => {
        const links = [];
        if (p.pdf) links.push(`<a href="${p.pdf}" target="_blank" rel="noopener">PDF</a>`);
        if (p.code) links.push(`<a href="${p.code}" target="_blank" rel="noopener">Code</a>`);
        if (p.doi) links.push(`<a href="${p.doi}" target="_blank" rel="noopener">DOI</a>`);
        return `<li>
          <span class="authors">${(p.authors||[]).join(', ')}</span>.
          <span class="title">${p.title}</span>.
          <span class="venue">${p.venue} (${p.year})</span>.
          <span class="links">${links.join(' ')}</span>
        </li>`;
      }).join('') || '<li class="muted">No results.</li>';
  }

  search.addEventListener('input', render);
  yearSel.addEventListener('change', render);
  render();
})();
