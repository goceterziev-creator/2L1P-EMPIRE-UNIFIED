const PDFDocument = require('pdfkit');

function generateOfferPdf(res, offer) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${offer.id}.pdf"`);

  doc.pipe(res);

  doc.fontSize(22).text('2L1P Neural Travel Offer', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(1.5);

  const rows = [
    ['Offer ID', offer.id],
    ['Client Name', offer.clientName || '-'],
    ['Client Phone', offer.clientPhone || '-'],
    ['Destination', offer.destination || '-'],
    ['Flight Route', offer.flightRoute || '-'],
    ['Hotel', offer.hotelName || '-'],
    ['Travel Dates', offer.travelDates || '-'],
    ['Guests', offer.guests || '-'],
    ['Price', `${offer.price || 0} ${offer.currency || 'EUR'}`],
    ['Valid Until', offer.validUntil ? new Date(offer.validUntil).toLocaleString() : '-'],
    ['Status', new Date(offer.validUntil) >= new Date() ? 'ACTIVE' : 'EXPIRED']
  ];

  rows.forEach(([label, value]) => {
    doc.fontSize(11).font('Helvetica-Bold').text(`${label}: `, { continued: true });
    doc.font('Helvetica').text(String(value));
    doc.moveDown(0.35);
  });

  doc.moveDown(0.7);
  doc.font('Helvetica-Bold').text('Notes');
  doc.font('Helvetica').text(offer.notes || 'Custom travel offer prepared by 2L1P Neural Travel.');

  doc.moveDown(1);
  doc.fontSize(10).text('This offer is informational and subject to availability at the time of booking.', {
    align: 'left'
  });

  doc.end();
}

module.exports = { generateOfferPdf };
