const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const router = require('./routes');

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api', router);

app.get('/', (req, res) => {
  res.send('Backend is running...');
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
