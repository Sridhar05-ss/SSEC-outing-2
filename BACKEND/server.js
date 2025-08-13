const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const router = require('./routes');
const cors = require('cors');

dotenv.config();

const app = express();

// Enable CORS for frontend requests
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:4173'],
  credentials: true
}));

app.use(express.json());

app.use('/api', router);

app.get('/', (req, res) => {
  res.send('Backend is running...');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
