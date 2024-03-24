const express = require('express');
const {
  getTahunAjaran,
  createTahunAjaran,
  updateTahunAjaran,
  deleteTahunAjaran,
  updateMulaiTahunAjaran,
  updateSelesaiTahunAjaran,
} = require('../controllers/tahun-ajaran');

const app = express();

app.get('/tahun-ajaran', getTahunAjaran);
app.post('/tahun-ajaran', createTahunAjaran);
app.put('/tahun-ajaran', updateTahunAjaran);
app.delete('/tahun-ajaran/:id', deleteTahunAjaran);
app.patch('/tahun-ajaran/mulai-ajaran', updateMulaiTahunAjaran);
app.patch('/tahun-ajaran/selesai-ajaran', updateSelesaiTahunAjaran);

module.exports = app;
