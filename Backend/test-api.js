const express = require('express');

const app = express();
app.use(express.json());

// Simple test endpoint
app.post('/test', (req, res) => {
  console.log('Received data:', req.body);
  res.json({ success: true, data: req.body });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Ready to test...');
});