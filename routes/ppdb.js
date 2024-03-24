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

const app = express();

app.get('/ppdb', getPpdb);
app.post('/ppdb', createPpdb);
app.put('/ppdb', updatePpdb);
app.delete('/ppdb/:id', deletePpdb);
app.post('/ppdb/terima-ppdb', updateTerimaPpdb);
app.post('/ppdb/tolak-ppdb', updateTolakPpdb);
app.post('/ppdb/terima-semua', updateTerimaSemuaPpdb);
app.post('/ppdb/pindah-siswa', updatePindahSiswa);

module.exports = app;
