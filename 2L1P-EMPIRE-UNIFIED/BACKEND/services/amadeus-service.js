class AmadeusService {
    constructor() {
        this.mockMode = true;
        console.log('📊 Amadeus Service: MOCK MODE');
    }

    async searchFlights(params) {
        console.log(`🔍 Търсене на полети: ${params.origin} → ${params.destination}`);
        console.log(`👥 Пътници: ${params.adults || 1}`);
        console.log(`📅 Дата: ${params.departureDate || 'всеки ден'}`);
        
        // Mock данни за различни дестинации
        const flights = {
            'SOF-FCO': [
                { airline: 'Bulgaria Air', flightNumber: 'FB451', departureTime: '08:30', arrivalTime: '09:45', price: 189, currency: 'EUR' },
                { airline: 'Ryanair', flightNumber: 'FR1234', departureTime: '14:20', arrivalTime: '15:35', price: 79, currency: 'EUR' },
                { airline: 'Wizz Air', flightNumber: 'W64321', departureTime: '19:15', arrivalTime: '20:30', price: 99, currency: 'EUR' }
            ],
            'SOF-LON': [
                { airline: 'British Airways', flightNumber: 'BA891', departureTime: '09:00', arrivalTime: '10:30', price: 159, currency: 'EUR' },
                { airline: 'Ryanair', flightNumber: 'FR5678', departureTime: '16:45', arrivalTime: '18:15', price: 69, currency: 'EUR' },
                { airline: 'Wizz Air', flightNumber: 'W64444', departureTime: '21:30', arrivalTime: '23:00', price: 89, currency: 'EUR' }
            ],
            'SOF-PAR': [
                { airline: 'Air France', flightNumber: 'AF1793', departureTime: '07:15', arrivalTime: '09:30', price: 199, currency: 'EUR' },
                { airline: 'Wizz Air', flightNumber: 'W64444', departureTime: '12:30', arrivalTime: '14:45', price: 89, currency: 'EUR' },
                { airline: 'Ryanair', flightNumber: 'FR1234', departureTime: '18:00', arrivalTime: '20:15', price: 79, currency: 'EUR' }
            ],
            'SOF-HND': [
                { airline: 'Turkish Airlines', flightNumber: 'TK1024', departureTime: '09:30', arrivalTime: '12:00', price: 450, currency: 'EUR', stopover: 'IST' },
                { airline: 'Emirates', flightNumber: 'EK2222', departureTime: '15:00', arrivalTime: '07:30+1', price: 680, currency: 'EUR', stopover: 'DXB' }
            ],
            'FCO-SOF': [
                { airline: 'Bulgaria Air', flightNumber: 'FB452', departureTime: '10:30', arrivalTime: '11:45', price: 175, currency: 'EUR' },
                { airline: 'Ryanair', flightNumber: 'FR4321', departureTime: '16:00', arrivalTime: '17:15', price: 69, currency: 'EUR' }
            ]
        };

        // Проверка за директен полет
        const key = `${params.origin}-${params.destination}`;
        const reverseKey = `${params.destination}-${params.origin}`;
        
        if (flights[key]) {
            // Калкулиране на обща цена за всички пътници
            const basePrice = flights[key][0].price;
            const totalPrice = basePrice * (params.adults || 1);
            
            return flights[key].map(flight => ({
                ...flight,
                price: flight.price * (params.adults || 1),
                totalPassengers: params.adults || 1,
                pricePerPerson: flight.price
            }));
        }
        
        if (flights[reverseKey]) {
            return flights[reverseKey].map(flight => ({
                ...flight,
                price: flight.price * (params.adults || 1),
                totalPassengers: params.adults || 1
            }));
        }
        
        // Ако няма директен полет
        return [
            { airline: 'Полет с прекачване', flightNumber: 'VIA1', departureTime: '08:00', arrivalTime: '16:00', price: 299 * (params.adults || 1), currency: 'EUR', note: '1 прекачване' },
            { airline: 'Полет с прекачване', flightNumber: 'VIA2', departureTime: '12:00', arrivalTime: '20:00', price: 259 * (params.adults || 1), currency: 'EUR', note: '1 прекачване' }
        ];
    }

    isRealMode() {
        return false;
    }
}

module.exports = new AmadeusService();