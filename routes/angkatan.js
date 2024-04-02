const express = require('express');
const {
  getAngkatan,
  getAngkatanLulus,
  createAngkatan,
  updateAngkatan,
  deleteAngkatan,
  updateMulaiAngkatan,
  updateLulusAngkatan,
  updateJumlahSiswa,
  updateSiswaLulus,
} = require('../controllers/angkatan');

const app = express();
const { verifyRole } = require('../middleware/verifyRole');

app.get('/angkatan', getAngkatan);
app.get('/angkatan/lulus', getAngkatanLulus);
app.post('/angkatan', createAngkatan);
app.patch('/angkatan', updateAngkatan);
app.delete('/angkatan/:id', deleteAngkatan);
app.patch('/angkatan/mulai-angkatan', updateMulaiAngkatan);
app.patch('/angkatan/lulus-angkatan', updateLulusAngkatan);
app.patch('/angkatan/jumlah-siswa', updateJumlahSiswa);
app.patch('/angkatan/siswa-lulus', updateSiswaLulus);

module.exports = app;
