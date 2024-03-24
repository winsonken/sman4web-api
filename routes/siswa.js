const express = require('express');
const {
  getSiswa,
  createSiswa,
  updateSiswa,
  deleteSiswa,
  updateSetAktif,
  updateSetJurusan,
} = require('../controllers/siswa');

const { uploadImage } = require('../middleware/upload');
const app = express();

app.get('/siswa', getSiswa);
app.post('/siswa', uploadImage, createSiswa);
app.put('/siswa', uploadImage, updateSiswa);
app.delete('/siswa/:id', deleteSiswa);
app.post('/siswa/set-aktif', updateSetAktif);
app.post('/siswa/set-jurusan', updateSetJurusan);

module.exports = app;
