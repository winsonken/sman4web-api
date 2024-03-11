const express = require('express');
const {
  getAngkatan,
  createAngkatan,
  updateAngkatan,
  deleteAngkatan,
  updateJumlahSiswa,
  updateSiswaLulus,
} = require('../controllers/angkatan');

const app = express();

app.get('/angkatan', getAngkatan);
app.post('/angkatan', createAngkatan);
app.patch('/angkatan', updateAngkatan);
app.delete('/angkatan/:id', deleteAngkatan);
app.patch('/angkatan/jumlah-siswa', updateJumlahSiswa);
app.patch('/angkatan/siswa-lulus', updateSiswaLulus);

module.exports = app;
