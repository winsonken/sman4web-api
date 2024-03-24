const express = require('express');
const {
  getTendik,
  createTendik,
  updateTendik,
  deleteTendik,
} = require('../controllers/tendik');

const { uploadImage } = require('../middleware/upload');
const app = express();

app.get('/tendik', getTendik);
app.post('/tendik', uploadImage, createTendik);
app.put('/tendik', uploadImage, updateTendik);
app.delete('/tendik/:id', deleteTendik);

module.exports = app;
