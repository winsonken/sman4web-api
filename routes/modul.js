const express = require('express');
const {
  getModul,
  createModul,
  updateModul,
  deleteModul,
} = require('../controllers/modul');

const app = express();

app.get('/modul', getModul);
app.post('/modul', createModul);
app.put('/modul', updateModul);
app.delete('/modul/:id', deleteModul);

module.exports = app;
