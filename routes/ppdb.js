const express = require('express');
const {
  getPpdb,
  createPpdb,
  updatePpdb,
  deletePpdb,
  updateTerimaPpdb,
  updateTolakPpdb,
  updateTerimaSemuaPpdb,
  updatePindahSiswa,
} = require('../controllers/ppdb');

const { uploadImage } = require('../middleware/upload');
const app = express();

app.get('/ppdb', getPpdb);
app.post('/ppdb', uploadImage, createPpdb);
app.put('/ppdb', uploadImage, updatePpdb);
app.delete('/ppdb/:id', deletePpdb);
app.post('/ppdb/terima-ppdb', updateTerimaPpdb);
app.post('/ppdb/tolak-ppdb', updateTolakPpdb);
app.post('/ppdb/terima-semua', updateTerimaSemuaPpdb);
app.post('/ppdb/pindah-siswa', updatePindahSiswa);

module.exports = app;
