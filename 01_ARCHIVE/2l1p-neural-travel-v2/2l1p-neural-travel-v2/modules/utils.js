function generateOfferId() {
  return `OFF-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function addDaysIso(days = 1) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function computeStats(offers = []) {
  const now = new Date();
  const active = offers.filter((o) => new Date(o.validUntil) >= now);
  const expired = offers.filter((o) => new Date(o.validUntil) < now);
  const revenuePotential = offers.reduce((sum, offer) => sum + Number(offer.price || 0), 0);

  return {
    totalOffers: offers.length,
    activeOffers: active.length,
    expiredOffers: expired.length,
    revenuePotential,
    currency: offers[0]?.currency || 'EUR'
  };
}

module.exports = { generateOfferId, addDaysIso, computeStats };
