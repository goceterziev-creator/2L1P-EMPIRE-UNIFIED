const express = require('express');
const cors = require('cors');
const path = require('path');

const offersRouter = require('./routes/offers');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: '2L1P Neural Travel V2',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.use('/api', offersRouter);

app.get('/offer/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'offer.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 2L1P Neural Travel V2 running on http://localhost:${PORT}`);
});
