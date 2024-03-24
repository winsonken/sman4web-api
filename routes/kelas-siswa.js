const express = require('express');
const {
  getKelasSiswa,
  createKelasSiswa,
  updateKelasSiswa,
  deleteKelasSiswa,
} = require('../controllers/kelas-siswa');

const app = express();

app.get('/kelas-siswa', getKelasSiswa);
app.post('/kelas-siswa', createKelasSiswa);
app.patch('/kelas-siswa', updateKelasSiswa);
app.delete('/kelas-siswa/:id', deleteKelasSiswa);

module.exports = app;
