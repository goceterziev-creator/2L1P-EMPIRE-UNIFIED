require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'FRONTEND')));

// Импортиране на маршрутите
const travelRoutes = require('./BACKEND/routes/travel.routes');
const paymentRoutes = require('./BACKEND/routes/payment.routes');

// Маршрути
app.use('/api/travel', travelRoutes);
app.use('/api/payments', paymentRoutes);

// Статус ендпойнт
app.get('/api/status', (req, res) => {
    res.json({
        status: '🟢 ACTIVE',
        port: PORT,
        services: {
            travel: '✅',
            payments: '✅',
            amadeus: 'MOCK MODE'
        },
        stats: {
            payments: 14,
            revenue: '357 EUR'
        },
        timestamp: new Date().toISOString()
    });
});

// Главна страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'FRONTEND', 'travel-ui.html'));
});

app.listen(PORT, () => {
    console.log(`
    🚀 2L1P UNIFIED EMPIRE
    =========================
    📡 Порт: ${PORT}
    🌐 http://localhost:${PORT}
    ✅ Сървърът е готов!
    🧠 PETYA AI - АКТИВНА
    ✈️ Amadeus - MOCK MODE
    =========================
    `);
});