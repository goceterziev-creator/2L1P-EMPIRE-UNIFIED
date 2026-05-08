// amadeus-service.js
const Amadeus = require('amadeus');

class AmadeusService {
  constructor() {
    // Ще инициализираме като имаме ключове
    this.amadeus = null;
    this.isReady = false;
  }

  // Инициализация с API ключове
  init(clientId, clientSecret) {
    try {
      this.amadeus = new Amadeus({
        clientId: clientId,
        clientSecret: clientSecret
      });
      this.isReady = true;
      console.log('✅ Amadeus инициализиран успешно');
    } catch (error) {
      console.log('❌ Amadeus грешка при инициализация:', error.message);
      this.isReady = false;
    }
  }

  async searchFlights(from, to, date) {
    console.log(`🔍 Amadeus търсене: ${from} → ${to} за ${date}`);
    
    // Ако няма ключове или грешка, връщаме мок данни
    if (!this.isReady) {
      console.log('⚠️ Amadeus не е конфигуриран, връщам мок данни');
      return this.getMockFlights(from, to, date);
    }
    
    try {
      const response = await this.amadeus.shopping.flightOffersSearch.get({
        originLocationCode: from,
        destinationLocationCode: to,
        departureDate: date,
        adults: 1,
        currencyCode: 'EUR',
        max: 5
      });
      
      return this.transformFlights(response.data);
    } catch (error) {
      console.error('❌ Amadeus API грешка:', error.message);
      return this.getMockFlights(from, to, date);
    }
  }

  transformFlights(data) {
    // Трансформира Amadeus отговор в наш формат
    return data.map(flight => {
      const segment = flight.itineraries[0].segments[0];
      return {
        airline: segment.carrierCode,
        flightNumber: segment.carrierCode + segment.number,
        from: segment.departure.iataCode,
        to: segment.arrival.iataCode,
        date: segment.departure.at.split('T')[0],
        departureTime: segment.departure.at.split('T')[1].substring(0,5),
        arrivalTime: segment.arrival.at.split('T')[1].substring(0,5),
        duration: flight.itineraries[0].duration,
        price: flight.price.total,
        currency: flight.price.currency,
        baggage: flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags?.quantity || 0
      };
    });
  }

  getMockFlights(from, to, date) {
    // Мок данни за тест
    return [
      {
        airline: "British Airways",
        flightNumber: "BA889",
        from, to, date,
        departureTime: "10:30",
        arrivalTime: "12:45",
        duration: "PT3H15M",
        price: 245.50,
        currency: "EUR",
        baggage: 1
      },
      {
        airline: "Bulgaria Air",
        flightNumber: "FB871",
        from, to, date,
        departureTime: "14:20",
        arrivalTime: "16:35",
        duration: "PT3H15M",
        price: 189.90,
        currency: "EUR",
        baggage: 1
      },
      {
        airline: "Turkish Airlines",
        flightNumber: "TK1037",
        from, to, date,
        departureTime: "07:15",
        arrivalTime: "09:30",
        duration: "PT3H15M",
        price: 210.00,
        currency: "EUR",
        baggage: 2
      }
    ];
  }
}

// Експортираме инстанция
const amadeusService = new AmadeusService();

// Опит за инициализация с ключове от .env
if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
  amadeusService.init(process.env.AMADEUS_CLIENT_ID, process.env.AMADEUS_CLIENT_SECRET);
}

module.exports = amadeusService;