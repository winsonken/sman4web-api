const express = require('express');
const {
  getPelanggaran,
  createPelanggaran,
  updatePelanggaran,
  deletePelanggaran,
} = require('../controllers/pelanggaran');

const app = express();

app.get('/pelanggaran', getPelanggaran);
app.post('/pelanggaran', createPelanggaran);
app.put('/pelanggaran', updatePelanggaran);
app.delete('/pelanggaran/:id', deletePelanggaran);

module.exports = app;
