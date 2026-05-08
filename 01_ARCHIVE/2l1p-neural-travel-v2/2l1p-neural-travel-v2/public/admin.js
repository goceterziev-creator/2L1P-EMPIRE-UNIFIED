function fmtDate(value) {
  return value ? new Date(value).toLocaleString() : '-';
}

async function loadDashboard() {
  const [statsRes, offersRes] = await Promise.all([
    fetch('/api/stats'),
    fetch('/api/offers')
  ]);

  const { stats } = await statsRes.json();
  const { offers } = await offersRes.json();

  document.getElementById('stats').innerHTML = `
    <div class="stat-card"><div class="label">Total offers</div><div class="value">${stats.totalOffers}</div></div>
    <div class="stat-card"><div class="label">Active offers</div><div class="value">${stats.activeOffers}</div></div>
    <div class="stat-card"><div class="label">Expired offers</div><div class="value">${stats.expiredOffers}</div></div>
    <div class="stat-card"><div class="label">Revenue potential</div><div class="value">${stats.revenuePotential} ${stats.currency}</div></div>
  `;

  const rows = offers.map((offer) => {
    const active = new Date(offer.validUntil) >= new Date();
    return `
      <tr>
        <td><a href="/offer/${offer.id}" target="_blank">${offer.id}</a></td>
        <td>${offer.destination}</td>
        <td>${offer.clientName || '-'}</td>
        <td>${offer.price} ${offer.currency}</td>
        <td>${fmtDate(offer.validUntil)}</td>
        <td><span class="badge ${active ? 'active' : 'expired'}">${active ? 'ACTIVE' : 'EXPIRED'}</span></td>
      </tr>
    `;
  }).join('');

  document.getElementById('offersTable').innerHTML = rows || '<tr><td colspan="6">No offers found.</td></tr>';
}

loadDashboard();
