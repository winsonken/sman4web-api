const express = require('express');
const {
  getGuru,
  createGuru,
  updateGuru,
  deleteGuru,
  getJumlahGuruAktif,
} = require('../controllers/guru');

const { uploadImage } = require('../middleware/upload');
const app = express();

app.get('/guru', getGuru);
app.post('/guru', uploadImage, createGuru);
app.put('/guru', uploadImage, updateGuru);
app.delete('/guru/:id', deleteGuru);
app.get('/guru/jumlah-guru-aktif', getJumlahGuruAktif);

module.exports = app;
