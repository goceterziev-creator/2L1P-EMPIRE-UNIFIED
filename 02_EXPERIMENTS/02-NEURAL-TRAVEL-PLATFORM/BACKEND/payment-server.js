// 💳 NEURAL PAYMENT SYSTEM - ОСНОВЕН СЪРВЪР

const express = require('express');
const stripe = require('stripe')('sk_test_...'); // ТУК СЛОЖИ ТВОЯ STRIPE KEY
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📊 БАЗА ДАННИ (in-memory за сега)
const database = {
    payments: [],
    customers: [],
    transactions: [],
    refunds: []
};

// ==================== PAYMENT ENDPOINTS ====================

// ✅ 1. CREATE PAYMENT INTENT
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'bgn', description = 'Плащане', customerId = null } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Невалидна сума'
            });
        }

        // Създаване на payment intent в Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Конвертиране в стотинки
            currency: currency.toLowerCase(),
            description: description,
            metadata: {
                customerId: customerId || 'guest'
            }
        });

        // Запазване в локална база
        const payment = {
            id: paymentIntent.id,
            amount: amount,
            currency: currency,
            status: paymentIntent.status,
            description: description,
            customerId: customerId || 'guest',
            clientSecret: paymentIntent.client_secret,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        database.payments.push(payment);

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentId: paymentIntent.id,
            status: paymentIntent.status
        });

    } catch (error) {
        console.error('❌ Грешка при създаване на payment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ✅ 2. CHECK PAYMENT STATUS
app.get('/api/payment-status/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        
        // Първо търсим в локална база
        let payment = database.payments.find(p => p.id === paymentId);
        
        if (!payment) {
            // Ако не е в базата, питаме Stripe
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
            payment = {
                id: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                customerId: paymentIntent.metadata.customerId
            };
        }

        res.json({
            success: true,
            paymentId: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            customerId: payment.customerId
        });

    } catch (error) {
        console.error('❌ Грешка при проверка на статус:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ✅ 3. PROCESS REFUND
app.post('/api/refund-payment/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { amount = null, reason = '' } = req.body;
        
        // Създаване на refund в Stripe
        const refund = await stripe.refunds.create({
            payment_intent: paymentId,
            amount: amount ? Math.round(amount * 100) : null,
            reason: reason || 'requested_by_customer'
        });

        // Запазване в локална база
        const refundRecord = {
            id: refund.id,
            paymentId: paymentId,
            amount: refund.amount / 100,
            status: refund.status,
            reason: reason,
            createdAt: new Date()
        };
        
        database.refunds.push(refundRecord);
        
        // Обновяване на payment статус
        const payment = database.payments.find(p => p.id === paymentId);
        if (payment) {
            payment.status = 'refunded';
            payment.updatedAt = new Date();
        }

        res.json({
            success: true,
            refundId: refund.id,
            amount: refund.amount / 100,
            status: refund.status
        });

    } catch (error) {
        console.error('❌ Грешка при refund:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ✅ 4. WEBHOOK HANDLER (за Stripe събития)
app.post('/api/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Валидация на webhook (сложи твоя secret)
        // event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        
        // За тест - директно парсване
        event = JSON.parse(req.body);
    } catch (err) {
        console.error('❌ Webhook грешка:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Обработка на различни типове събития
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log(`✅ Плащане ${paymentIntent.id} успешно!`);
            
            // Актуализиране на локална база
            const payment = database.payments.find(p => p.id === paymentIntent.id);
            if (payment) {
                payment.status = 'succeeded';
                payment.updatedAt = new Date();
            }
            break;
            
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log(`❌ Плащане ${failedPayment.id} неуспешно!`);
            break;
            
        case 'refund.created':
            const refund = event.data.object;
            console.log(`↩️ Refund ${refund.id} създаден`);
            break;
            
        default:
            console.log(`📋 Необработено събитие: ${event.type}`);
    }

    res.json({received: true});
});

// ✅ 5. GET PAYMENT HISTORY
app.get('/api/payment-history/:customerId', (req, res) => {
    try {
        const { customerId } = req.params;
        
        const payments = database.payments
            .filter(p => p.customerId === customerId)
            .sort((a, b) => b.createdAt - a.createdAt);
        
        res.json({
            success: true,
            customerId: customerId,
            payments: payments
        });

    } catch (error) {
        console.error('❌ Грешка при история:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ✅ 6. CREATE CUSTOMER
app.post('/api/create-customer', async (req, res) => {
    try {
        const { email, name, phone } = req.body;
        
        // Създаване на customer в Stripe
        const customer = await stripe.customers.create({
            email: email,
            name: name,
            phone: phone
        });

        // Запазване в локална база
        const localCustomer = {
            id: customer.id,
            email: email,
            name: name,
            phone: phone,
            createdAt: new Date()
        };
        
        database.customers.push(localCustomer);

        res.json({
            success: true,
            customerId: customer.id
        });

    } catch (error) {
        console.error('❌ Грешка при създаване на customer:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ✅ 7. HEALTH CHECK
app.get('/api/health', (req, res) => {
    res.json({
        status: '🟢 OPERATIONAL',
        timestamp: new Date(),
        payments: database.payments.length,
        customers: database.customers.length,
        refunds: database.refunds.length,
        version: '1.0.0'
    });
});

// ==================== СТАРТИРАНЕ НА СЪРВЪРА ====================

app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════╗
    ║  💳 NEURAL PAYMENT SYSTEM            ║
    ║  🚀 СЪРВЪРЪТ РАБОТИ!                 ║
    ╠══════════════════════════════════════╣
    ║  📍 Порт: ${PORT}                          ║
    ║  ⏰ Старт: ${new Date().toLocaleString()} ║
    ║  📊 Payments: 0                       ║
    ╚══════════════════════════════════════╝
    `);
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('❌ Неочаквана грешка:', error);
});

module.exports = app;