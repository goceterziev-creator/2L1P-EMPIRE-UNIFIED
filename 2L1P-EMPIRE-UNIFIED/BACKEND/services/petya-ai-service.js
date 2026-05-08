class PetyaAIService {
    constructor() {
        // Разширен речник на градове и IATA кодове
        this.cities = {
            'софия': 'SOF', 'sofia': 'SOF',
            'рим': 'FCO', 'rome': 'FCO', 'roma': 'FCO',
            'лондон': 'LON', 'london': 'LON',
            'париж': 'PAR', 'paris': 'PAR',
            'берлин': 'BER', 'berlin': 'BER',
            'токио': 'HND', 'tokyo': 'HND', 'tokio': 'HND',
            'ню йорк': 'JFK', 'new york': 'JFK',
            'дубай': 'DXB', 'dubai': 'DXB',
            'истанбул': 'IST', 'istanbul': 'IST',
            'варна': 'VAR', 'varna': 'VAR',
            'бургас': 'BOJ', 'burgas': 'BOJ'
        };
    }

    async ask(question) {
        const lowerQuestion = question.toLowerCase();
        
        console.log('🤖 PETYA получава:', question);
        
        // Проверка за различни формати на заявки
        const hasFrom = lowerQuestion.includes('от') || lowerQuestion.includes('sofi') || lowerQuestion.match(/^[a-z]{3}/i);
        const hasTo = lowerQuestion.includes('до');
        const hasCityPair = this.containsTwoCities(lowerQuestion);
        
        // Ако има два града в заявката
        if (hasCityPair || (hasFrom && hasTo)) {
            return this.extractFlightRequest(question);
        }
        
        // Проверка за IATA кодове (3 букви)
        const iataMatch = question.match(/\b([A-Z]{3})\b/g);
        if (iataMatch && iataMatch.length >= 2) {
            return {
                type: 'flight_search',
                origin: iataMatch[0],
                destination: iataMatch[1],
                message: `🔍 Търся полети от ${iataMatch[0]} до ${iataMatch[1]}...`
            };
        }
        
        // Проверка за въпроси за IATA кодове
        if (lowerQuestion.includes('iata') || lowerQuestion.includes('код') || lowerQuestion.includes('какво означава')) {
            return {
                type: 'message',
                message: '📖 IATA кодове - трибуквени кодове на летища:\n• SOF = София\n• FCO = Рим\n• LON = Лондон\n• PAR = Париж\n• BER = Берлин\n• VAR = Варна\n• BOJ = Бургас\n\nПитайте ме: "от SOF до FCO" или "от София до Рим"'
            };
        }
        
        // Общ отговор
        return {
            type: 'message',
            message: '👋 Здравейте! Аз съм ПЕТЯ - вашият AI асистент.\n\n✈️ Начини да ме питате:\n• "от София до Рим"\n• "SOF до FCO"\n• "полети за Рим на 25 май"\n• "за 2ма от София до Лондон"\n\n🎯 Какъв полет търсите?'
        };
    }

    containsTwoCities(text) {
        let foundCities = [];
        for (const [city, code] of Object.entries(this.cities)) {
            if (text.includes(city)) {
                foundCities.push({ city, code });
            }
        }
        return foundCities.length >= 2;
    }

    extractFlightRequest(question) {
        const lowerQuestion = question.toLowerCase();
        
        // Намиране на градове в текста
        let origin = null;
        let destination = null;
        let passengers = 1;
        let date = null;
        
        // Търсене на градове
        for (const [city, code] of Object.entries(this.cities)) {
            if (lowerQuestion.includes(city)) {
                if (!origin) {
                    origin = code;
                } else if (!destination && origin !== code) {
                    destination = code;
                }
            }
        }
        
        // Търсене на брой пътници
        const passengersMatch = lowerQuestion.match(/(\d+)\s*(?:човека?|души?|пътника?|възрастни?)/i);
        if (passengersMatch) {
            passengers = parseInt(passengersMatch[1]);
        }
        
        // Търсене на дата
        const dateMatch = lowerQuestion.match(/(\d{1,2})\s*(?:май|юни|юли|август|септември)/i);
        if (dateMatch) {
            const day = dateMatch[1].padStart(2, '0');
            const month = this.getMonthNumber(lowerQuestion);
            const year = 2026;
            if (month) {
                date = `${year}-${month}-${day}`;
            }
        }
        
        // Ако няма намерени градове, опитай с IATA кодове
        if (!origin || !destination) {
            const iataCodes = question.match(/\b([A-Z]{3})\b/g);
            if (iataCodes && iataCodes.length >= 2) {
                origin = iataCodes[0];
                destination = iataCodes[1];
            }
        }
        
        if (origin && destination) {
            let message = `🔍 Търся полети от ${origin} до ${destination}`;
            if (passengers > 1) message += ` за ${passengers} пътника`;
            if (date) message += ` на ${date}`;
            message += `...`;
            
            return {
                type: 'flight_search',
                origin: origin,
                destination: destination,
                passengers: passengers,
                date: date,
                message: message
            };
        }
        
        // Ако не разпознае дестинации
        return {
            type: 'message',
            message: '🤔 Не разпознах дестинациите. Моля, опитайте:\n• "от София до Рим"\n• "SOF до FCO"\n• "полети до Лондон"\n\n✈️ Каква дестинация ви интересува?'
        };
    }

    getMonthNumber(text) {
        const months = {
            'януари': '01', 'февруари': '02', 'март': '03', 'април': '04',
            'май': '05', 'юни': '06', 'юли': '07', 'август': '08',
            'септември': '09', 'октомври': '10', 'ноември': '11', 'декември': '12'
        };
        
        for (const [month, num] of Object.entries(months)) {
            if (text.includes(month)) {
                return num;
            }
        }
        return null;
    }
}

module.exports = new PetyaAIService();