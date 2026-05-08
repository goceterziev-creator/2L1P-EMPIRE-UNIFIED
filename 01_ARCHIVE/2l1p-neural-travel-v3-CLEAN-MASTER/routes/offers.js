const express = require("express");
const { getAllOffers, getOfferById, saveOffer, updateOffer } = require("../modules/db");
const { createOfferId, calculateValidUntil, buildPricing, effectiveStatus, sanitizeText } = require("../modules/utils");
const { createOfferPdf } = require("../modules/pdfGenerator");
const router = express.Router();

router.get("/", (req, res) => {
  const { q = "", status = "all", sort = "newest", destination = "", from = "", to = "" } = req.query;
  const query = String(q).trim().toLowerCase(); const destinationQuery = String(destination).trim().toLowerCase();
  let offers = getAllOffers().map((offer) => ({ ...offer, effectiveStatus: effectiveStatus(offer) }));
  if (query) offers = offers.filter((offer) => [offer.id, offer.clientName, offer.clientPhone, offer.destination, offer.flightRoute, offer.hotel, offer.notes].join(" ").toLowerCase().includes(query));
  if (destinationQuery) offers = offers.filter((offer) => (offer.destination || "").toLowerCase().includes(destinationQuery));
  if (status !== "all") offers = offers.filter((offer) => offer.effectiveStatus === status);
  if (from) offers = offers.filter((offer) => new Date(offer.createdAt).getTime() >= new Date(from).getTime());
  if (to) offers = offers.filter((offer) => new Date(offer.createdAt).getTime() <= (new Date(to).getTime() + 86400000 - 1));
  offers.sort((a, b) => sort === "oldest" ? new Date(a.createdAt) - new Date(b.createdAt) : sort === "price-high" ? Number(b.price) - Number(a.price) : sort === "price-low" ? Number(a.price) - Number(b.price) : new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, offers });
});

router.get("/stats", (req, res) => {
  const offers = getAllOffers().map((offer) => ({ ...offer, effectiveStatus: effectiveStatus(offer) }));
  const totalRevenuePotential = offers.reduce((sum, offer) => sum + Number(offer.price || 0), 0);
  const totalMarginPotential = offers.reduce((sum, offer) => sum + Number((offer.price || 0) - (offer.basePrice || 0)), 0);
  const byStatus = ["draft", "sent", "viewed", "booked", "cancelled", "expired"].reduce((acc, status) => { acc[status] = offers.filter((offer) => offer.effectiveStatus === status).length; return acc; }, {});
  res.json({ success: true, totalOffers: offers.length, totalRevenuePotential, totalMarginPotential: Number(totalMarginPotential.toFixed(2)), activeOffers: offers.filter((offer) => !["booked", "cancelled", "expired"].includes(offer.effectiveStatus)).length, byStatus });
});

router.get("/:id", (req, res) => {
  const offer = getOfferById(req.params.id); if (!offer) return res.status(404).json({ success: false, message: "Offer not found." });
  const viewedOffer = !offer.clientViewed ? updateOffer(req.params.id, { clientViewed: true, status: offer.status === "sent" ? "viewed" : offer.status }) : offer;
  res.json({ success: true, offer: { ...(viewedOffer || offer), effectiveStatus: effectiveStatus(viewedOffer || offer) } });
});

router.post("/", (req, res) => {
  const { clientName, clientPhone, destination, flightRoute, hotel, travelDates, guests, basePrice, markupPercent, price, currency, validForDays, customValidUntil, notes, status } = req.body;
  if (!sanitizeText(destination) || (!basePrice && !price)) return res.status(400).json({ success: false, message: "Destination and price are required." });
  const pricing = buildPricing({ basePrice, markupPercent, finalPrice: price });
  const offer = { id: createOfferId(), clientName: sanitizeText(clientName), clientPhone: sanitizeText(clientPhone), destination: sanitizeText(destination), flightRoute: sanitizeText(flightRoute), hotel: sanitizeText(hotel), travelDates: sanitizeText(travelDates), guests: sanitizeText(guests), ...pricing, currency: sanitizeText(currency || "EUR") || "EUR", status: sanitizeText(status || "draft") || "draft", createdAt: new Date().toISOString(), validUntil: calculateValidUntil(validForDays, customValidUntil), notes: sanitizeText(notes), clientViewed: false };
  saveOffer(offer); res.json({ success: true, offer: { ...offer, effectiveStatus: effectiveStatus(offer) } });
});

router.patch("/:id/status", (req, res) => {
  const allowed = ["draft", "sent", "viewed", "booked", "cancelled"]; const status = String(req.body.status || "").trim();
  if (!allowed.includes(status)) return res.status(400).json({ success: false, message: "Invalid status." });
  const updated = updateOffer(req.params.id, { status }); if (!updated) return res.status(404).json({ success: false, message: "Offer not found." });
  res.json({ success: true, offer: { ...updated, effectiveStatus: effectiveStatus(updated) } });
});

router.get("/:id/pdf", (req, res) => {
  const offer = getOfferById(req.params.id); if (!offer) return res.status(404).send("Offer not found.");
  createOfferPdf(res, { ...offer, effectiveStatus: effectiveStatus(offer) });
});
module.exports = router;
