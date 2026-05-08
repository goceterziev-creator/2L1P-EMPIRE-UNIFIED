const router = require('express').Router();
const amadeusService = require('../services/amadeus-service');
const petyaAI = require('../services/petya-ai-service');

// ========== ПОЛЕТИ (AYA) ==========
router.post('/flights/search', async (req, res) => {
    try {
        const { origin, destination, date, adults = 1 } = req.body;
        
        console.log(`📡 Търсене на полети: ${origin} → ${destination}`);
        
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

// ========== ХОТЕЛИ (EBA) ==========
router.post('/hotels/search', async (req, res) => {
    try {
        const { destination, checkIn, checkOut, guests = 2 } = req.body;
        
        console.log(`🏨 Търсене на хотели: ${destination}, от ${checkIn} до ${checkOut}`);
        
        // Изчисляване на брой нощувки
        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);
        const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        // Карта на дестинациите с хотели
        const hotelsDatabase = {
            'FCO': [  // Рим
                { name: 'Grand Palace Hotel', stars: 4, area: 'Центъра', pricePerNight: 180, breakfast: true, wifi: true, pool: false },
                { name: 'City Comfort Inn', stars: 3, area: 'Близо до метрото', pricePerNight: 95, breakfast: false, wifi: true, pool: false },
                { name: 'Budget Stay', stars: 2, area: 'Градски квартал', pricePerNight: 55, breakfast: false, wifi: true, pool: false },
                { name: 'Boutique Garden Hotel', stars: 4, area: 'Историческия квартал', pricePerNight: 130, breakfast: true, wifi: true, pool: true },
                { name: 'Luxury Rome Palace', stars: 5, area: 'Виа Венето', pricePerNight: 320, breakfast: true, wifi: true, pool: true, spa: true }
            ],
            'LON': [  // Лондон
                { name: 'The Londoner', stars: 5, area: 'Лестър Скуеър', pricePerNight: 280, breakfast: true, wifi: true, pool: true },
                { name: 'Premier Inn', stars: 3, area: 'Кингс Крос', pricePerNight: 120, breakfast: true, wifi: true, pool: false },
                { name: 'Travelodge', stars: 2, area: 'Бейкър Стрийт', pricePerNight: 75, breakfast: false, wifi: true, pool: false }
            ],
            'PAR': [  // Париж
                { name: 'Hotel Eiffel Seine', stars: 4, area: 'До Айфеловата кула', pricePerNight: 210, breakfast: true, wifi: true, pool: false },
                { name: 'Ibis Budget', stars: 2, area: 'Монмартър', pricePerNight: 65, breakfast: false, wifi: true, pool: false },
                { name: 'Le Meurice', stars: 5, area: 'Тюйлери', pricePerNight: 450, breakfast: true, wifi: true, pool: true, spa: true }
            ],
            'BER': [  // Берлин
                { name: 'Adlon Kempinski', stars: 5, area: 'Бранденбургска врата', pricePerNight: 350, breakfast: true, wifi: true, pool: true },
                { name: 'Motel One', stars: 3, area: 'Хауптбанхоф', pricePerNight: 89, breakfast: true, wifi: true, pool: false }
            ]
        };
        
        // Определяне на IATA код на дестинацията
        const cityMap = {
            'рим': 'FCO', 'rome': 'FCO', 'roma': 'FCO',
            'лондон': 'LON', 'london': 'LON',
            'париж': 'PAR', 'paris': 'PAR',
            'берлин': 'BER', 'berlin': 'BER'
        };
        
        let destCode = destination.toLowerCase();
        destCode = cityMap[destCode] || destCode.toUpperCase();
        
        const hotels = hotelsDatabase[destCode] || hotelsDatabase['FCO'];
        
        // Обогатяване на данните с калкулации
        const enrichedHotels = hotels.map(hotel => ({
            ...hotel,
            nights: nights,
            totalPrice: hotel.pricePerNight * nights,
            pricePerNight: hotel.pricePerNight,
            currency: 'EUR'
        }));
        
        res.json({
            success: true,
            hotels: enrichedHotels,
            destination: destCode,
            checkIn: checkIn,
            checkOut: checkOut,
            nights: nights,
            guests: guests
        });
        
    } catch (error) {
        console.error('Грешка при търсене на хотели:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== МАРШРУТИ (СОФИ) ==========
router.post('/itinerary/generate', async (req, res) => {
    try {
        const { destination, arrivalDate, days, interests = '' } = req.body;
        
        console.log(`🗺️ Генериране на маршрут за ${destination}, ${days} дни`);
        
        // Карта на дестинациите със забележителности
        const attractionsDatabase = {
            'FCO': {  // Рим
                name: 'Рим',
                attractions: [
                    { name: 'Колизей', duration: '2-3 часа', type: 'history', tip: 'Купете билет онлайн предварително' },
                    { name: 'Римски форум', duration: '1-2 часа', type: 'history', tip: 'Комбиниран билет с Колизея' },
                    { name: 'Ватикан', duration: '3-4 часа', type: 'culture', tip: 'Спазвайте dress code' },
                    { name: 'Фонтана ди Треви', duration: '30 минути', type: 'landmark', tip: 'Хвърлете монета за късмет' },
                    { name: 'Пантеон', duration: '1 час', type: 'architecture', tip: 'Входът е безплатен' }
                ],
                restaurants: [
                    { name: 'Trattoria da Enzo', cuisine: 'Italian', priceRange: '€€', tip: 'Резервация задължителна' },
                    { name: 'Pizzeria La Montecarlo', cuisine: 'Pizza', priceRange: '€', tip: 'Автентична римска пица' }
                ]
            },
            'LON': {  // Лондон
                name: 'Лондон',
                attractions: [
                    { name: 'Бъкингамски дворец', duration: '1-2 часа', type: 'royal', tip: 'Гледайте смяната на караула' },
                    { name: 'Лондонско око', duration: '1 час', type: 'view', tip: 'Вечерна гледка е най-красива' }
                ],
                restaurants: []
            }
        };
        
        const cityMap = {
            'рим': 'FCO', 'rome': 'FCO', 'roma': 'FCO',
            'лондон': 'LON', 'london': 'LON',
            'париж': 'PAR', 'paris': 'PAR',
            'берлин': 'BER', 'berlin': 'BER'
        };
        
        let destCode = destination.toLowerCase();
        destCode = cityMap[destCode] || 'FCO';
        
        const cityData = attractionsDatabase[destCode] || attractionsDatabase['FCO'];
        const attractions = cityData.attractions;
        
        // Генериране на дневен маршрут
        const itinerary = [];
        const arrivalDateObj = new Date(arrivalDate);
        
        // Шаблони за дейности по интереси
        const interestActivities = {
            'музеи': 'Посетете музеи и галерии. ',
            'храна': 'Опитайте местната кухня и посетете традиционни ресторанти. ',
            'природа': 'Разходка в парковете и градините. ',
            'шопинг': 'Пазаруване в моловете и магазините. '
        };
        
        let interestText = '';
        const interestsLower = interests.toLowerCase();
        for (const [key, value] of Object.entries(interestActivities)) {
            if (interestsLower.includes(key)) {
                interestText += value;
            }
        }
        
        for (let i = 0; i < days; i++) {
            const currentDate = new Date(arrivalDateObj);
            currentDate.setDate(arrivalDateObj.getDate() + i);
            const weekday = currentDate.toLocaleDateString('bg-BG', { weekday: 'short' });
            
            let description = '';
            let activities = [];
            
            if (i === 0) {
                description = `🏨 Пристигане в ${cityData.name}. Настаняване в хотела. Разходка за ориентиране.`;
                activities = [`Пристигане и настаняване`, `Разходка в центъра`];
            } else if (i < attractions.length) {
                const attraction = attractions[i - 1];
                description = `${interestText}Посетете ${attraction.name}. ${attraction.tip || ''}`;
                activities = [`${attraction.name} (${attraction.duration})`];
            } else {
                description = `${interestText}Свободно време за разглеждане, шопинг или релакс.`;
                activities = [`Свободно време`];
            }
            
            itinerary.push({
                day: i + 1,
                date: currentDate.toISOString().split('T')[0],
                weekday: weekday,
                description: description,
                activities: activities
            });
        }
        
        res.json({
            success: true,
            destination: cityData.name,
            arrivalDate: arrivalDate,
            days: days,
            interests: interests || 'не са посочени',
            itinerary: itinerary,
            recommendations: {
                restaurants: cityData.restaurants,
                tips: [
                    'Резервирайте хотели предварително',
                    'Проверете времето преди пътуване',
                    'Носете удобни обувки за разходки'
                ]
            }
        });
        
    } catch (error) {
        console.error('Грешка при генериране на маршрут:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== PETYA AI ЧАТ ==========
router.post('/petya/ask', async (req, res) => {
    try {
        const { question } = req.body;
        const response = await petyaAI.ask(question);
        
        if (response.type === 'flight_search') {
            const flights = await amadeusService.searchFlights({
                origin: response.origin,
                destination: response.destination,
                departureDate: response.date || new Date().toISOString().split('T')[0],
                adults: response.passengers || 1
            });
            
            let flightList = `\n✈️ Намерени полети за ${response.passengers || 1} човека:\n`;
            flightList += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            
            flights.forEach(f => {
                const pricePerPerson = f.pricePerPerson || Math.round(f.price / (response.passengers || 1));
                flightList += `✈️ ${f.airline} ${f.flightNumber}\n`;
                flightList += `   🕐 ${f.departureTime} → ${f.arrivalTime}\n`;
                flightList += `   💰 ${pricePerPerson}€/човек = ${f.price}€ (общо)\n`;
                flightList += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            });
            
            return res.json({
                type: 'message',
                message: response.message + flightList
            });
        }
        
        res.json(response);
    } catch (error) {
        console.error('❌ PETYA AI грешка:', error);
        res.json({ 
            type: 'error',
            message: 'Извинявай, имам технически проблем. Моля, опитай пак! 🔧'
        });
    }
});

// ========== ПОПУЛЯРНИ ДЕСТИНАЦИИ ==========
router.get('/destinations', async (req, res) => {
    res.json([
        { code: 'FCO', name: 'Рим', price: 79, image: 'rome.jpg' },
        { code: 'LON', name: 'Лондон', price: 69, image: 'london.jpg' },
        { code: 'PAR', name: 'Париж', price: 89, image: 'paris.jpg' },
        { code: 'BER', name: 'Берлин', price: 59, image: 'berlin.jpg' }
    ]);
});

module.exports = router;