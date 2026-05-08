const router = require('express').Router();
const amadeusService = require('../services/amadeus-service');
const petyaAI = require('../services/petya-ai-service');

// Търсене на полети
router.post('/flights/search', async (req, res) => {
    try {
        const { origin, destination, date, adults = 1 } = req.body;
        
        console.log(`📡 Заявка за полети: ${origin} → ${destination} на ${date}`);
        
        const flights = await amadeusService.searchFlights({
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
            departureDate: date,
            adults: adults
        });
        
        res.json({
            success: true,
            flights: flights,
            count: flights.length,
            mode: 'MOCK'
        });
    } catch (error) {
        console.error('Грешка:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PETYA AI чат
router.post('/petya/ask', async (req, res) => {
    try {
        const { question } = req.body;
        const response = await petyaAI.ask(question);
        
        // Ако ПЕТЯ иска да търси полети
        if (response.type === 'flight_search') {
    const flights = await amadeusService.searchFlights({
        origin: response.origin,
        destination: response.destination,
        departureDate: response.date || new Date().toISOString().split('T')[0],
        adults: response.passengers || 1
    });
            
            let flightList = '\n✈️ Намерени полети:\n';
            flights.forEach(f => {
                flightList += `• ${f.airline} ${f.flightNumber}: ${f.price}€ (${f.departureTime} → ${f.arrivalTime})\n`;
            });
            
            return res.json({
                type: 'message',
                message: response.message + flightList
            });
        }
        
        res.json(response);
    } catch (error) {
        res.json({ type: 'message', message: 'Извинявай, имам технически проблем. Опитай пак!' });
    }
});

// Популярни дестинации
router.get('/destinations', async (req, res) => {
    res.json([
        { code: 'FCO', name: 'Рим', price: 79 },
        { code: 'LON', name: 'Лондон', price: 69 },
        { code: 'PAR', name: 'Париж', price: 89 },
        { code: 'BER', name: 'Берлин', price: 59 }
    ]);
});

module.exports = router;