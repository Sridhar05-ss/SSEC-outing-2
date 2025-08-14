const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for frontend requests
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://localhost:4173', 
    'http://127.0.0.1:5173', 
    'http://127.0.0.1:3000', 
    'http://127.0.0.1:4173',
    'http://192.168.1.2:5173',
    'http://192.168.1.2:3000',
    'http://192.168.1.2:4173'
  ],
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Test server is running...');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Press Ctrl+C to stop');
});
