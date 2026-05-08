const router = require('express').Router();

// Статистика на плащанията
router.get('/stats', (req, res) => {
    res.json({
        total: 14,
        amount: 357,
        currency: 'EUR',
        recent: [
            { amount: 50, date: '2026-03-06' },
            { amount: 75, date: '2026-03-05' },
            { amount: 100, date: '2026-03-04' }
        ]
    });
});

// Създаване на плащане (mock)
router.post('/create-payment-intent', (req, res) => {
    const { amount } = req.body;
    res.json({
        clientSecret: 'mock_secret_' + Date.now(),
        amount: amount
    });
});

// Запазване на плащане
router.post('/save-payment', (req, res) => {
    const payment = req.body;
    console.log('💳 Ново плащане:', payment);
    res.json({ success: true });
});

module.exports = router;