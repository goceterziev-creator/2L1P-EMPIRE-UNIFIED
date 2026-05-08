const form = document.getElementById('offerForm');
const offersEl = document.getElementById('offers');

function fmtDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function isActive(validUntil) {
  return new Date(validUntil) >= new Date();
}

function whatsappLink(offer) {
  const offerUrl = `${window.location.origin}/offer/${offer.id}`;
  const text = [
    'Hello 👋',
    '',
    'Your travel offer is ready.',
    `Offer ID: ${offer.id}`,
    `Destination: ${offer.destination}`,
    `Total price: ${offer.price} ${offer.currency}`,
    `Valid until: ${fmtDate(offer.validUntil)}`,
    '',
    `View offer: ${offerUrl}`,
    '',
    '2L1P Neural Travel'
  ].join('\n');

  return `https://wa.me/${offer.clientPhone || ''}?text=${encodeURIComponent(text)}`;
}

function offerCard(offer) {
  const active = isActive(offer.validUntil);
  const link = `${window.location.origin}/offer/${offer.id}`;

  return `
    <article class="offer-card">
      <div class="badge ${active ? 'active' : 'expired'}">${active ? 'ACTIVE' : 'EXPIRED'}</div>
      <h3>${offer.destination}</h3>
      <div class="offer-meta">${offer.flightRoute || 'No route'} · ${offer.hotelName || 'No hotel'} · ${offer.guests || 'No guests'}</div>
      <div class="offer-price">${offer.price} ${offer.currency}</div>
      <div class="offer-meta">Offer ID: ${offer.id}<br>Valid until: ${fmtDate(offer.validUntil)}</div>
      <div class="actions">
        <a class="btn secondary" href="/offer/${offer.id}" target="_blank">Client Page</a>
        <a class="btn secondary" href="/api/offers/${offer.id}/pdf" target="_blank">PDF</a>
        <a class="btn" href="${whatsappLink(offer)}" target="_blank">WhatsApp</a>
        <button class="secondary" type="button" onclick="navigator.clipboard.writeText('${link}')">Copy Link</button>
      </div>
    </article>
  `;
}

async function loadOffers() {
  const res = await fetch('/api/offers');
  const data = await res.json();
  const offers = data.offers || [];

  if (!offers.length) {
    offersEl.innerHTML = '<div class="empty">No offers yet.</div>';
    return;
  }

  offersEl.innerHTML = offers.map(offerCard).join('');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  if (payload.validUntil) {
    payload.validUntil = new Date(payload.validUntil).toISOString();
  } else {
    delete payload.validUntil;
  }

  const res = await fetch('/api/offers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.error || 'Failed to create offer.');
    return;
  }

  form.reset();
  await loadOffers();
  window.open(`/offer/${data.offer.id}`, '_blank');
});

loadOffers();
