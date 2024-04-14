const express = require('express');
const {
  getKelasSiswa,
  createKelasSiswa,
  updateKelasSiswa,
  deleteKelasSiswa,
  updateNaikKelas,
  updateTinggalKelas,
  updateLulus,
  updateTidakLulus,
} = require('../controllers/kelas-siswa');

const app = express();

app.get('/kelas-siswa', getKelasSiswa);
app.post('/kelas-siswa', createKelasSiswa);
app.patch('/kelas-siswa', updateKelasSiswa);
app.delete('/kelas-siswa/:id', deleteKelasSiswa);
app.patch('/kelas-siswa/naik-kelas', updateNaikKelas);
app.patch('/kelas-siswa/tinggal-kelas', updateTinggalKelas);
app.patch('/kelas-siswa/lulus', updateLulus);
app.patch('/kelas-siswa/tidak-lulus', updateTidakLulus);

module.exports = app;
