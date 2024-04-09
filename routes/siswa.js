const express = require('express');
const {
  getSiswa,
  getSiswaBaru,
  createSiswa,
  updateSiswa,
  deleteSiswa,
  updateSetAktif,
  updateSetJurusan,
} = require('../controllers/siswa');

const { uploadImage } = require('../middleware/upload');
const app = express();

app.get('/siswa', getSiswa);
app.get('/siswa/baru', getSiswaBaru);
app.post('/siswa', uploadImage, createSiswa);
app.put('/siswa', uploadImage, updateSiswa);
app.delete('/siswa/:id', deleteSiswa);
app.post('/siswa/set-aktif', updateSetAktif);
app.post('/siswa/set-jurusan', updateSetJurusan);

module.exports = app;
