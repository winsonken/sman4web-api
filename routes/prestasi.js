const express = require('express');
const {
  getPrestasi,
  createPrestasi,
  updatePrestasi,
  deletePrestasi,
} = require('../controllers/prestasi');

const app = express();

app.get('/prestasi', getPrestasi);
app.post('/prestasi', createPrestasi);
app.put('/prestasi', updatePrestasi);
app.delete('/prestasi/:id', deletePrestasi);

module.exports = app;
