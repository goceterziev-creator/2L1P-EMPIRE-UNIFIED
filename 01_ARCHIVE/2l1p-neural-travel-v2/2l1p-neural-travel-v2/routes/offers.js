const express = require('express');
const { readDb, writeDb } = require('../modules/db');
const { generateOfferId, addDaysIso, computeStats } = require('../modules/utils');
const { generateOfferPdf } = require('../modules/pdfGenerator');

const router = express.Router();

router.get('/offers', (req, res) => {
  const db = readDb();
  res.json({ offers: db.offers || [] });
});

router.get('/offers/:id', (req, res) => {
  const db = readDb();
  const offer = (db.offers || []).find((item) => item.id === req.params.id);

  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  res.json({ offer });
});

router.post('/offers', (req, res) => {
  const db = readDb();
  const body = req.body || {};

  const price = Number(body.price || 0);
  if (!body.destination || !price) {
    return res.status(400).json({ error: 'Destination and price are required.' });
  }

  const offer = {
    id: generateOfferId(),
    createdAt: new Date().toISOString(),
    validUntil: body.validUntil || addDaysIso(Number(body.validForDays || 1)),
    clientName: body.clientName || '',
    clientPhone: body.clientPhone || '',
    destination: body.destination,
    flightRoute: body.flightRoute || '',
    hotelName: body.hotelName || '',
    travelDates: body.travelDates || '',
    guests: body.guests || '',
    price,
    currency: body.currency || 'EUR',
    notes: body.notes || ''
  };

  db.offers = Array.isArray(db.offers) ? db.offers : [];
  db.offers.unshift(offer);
  writeDb(db);

  res.status(201).json({ success: true, offer });
});

router.get('/offers/:id/pdf', (req, res) => {
  const db = readDb();
  const offer = (db.offers || []).find((item) => item.id === req.params.id);

  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  generateOfferPdf(res, offer);
});

router.get('/stats', (req, res) => {
  const db = readDb();
  const stats = computeStats(db.offers || []);
  res.json({ stats });
});

module.exports = router;
