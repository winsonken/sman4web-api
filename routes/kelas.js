const express = require('express');
const {
  getKelas,
  createKelas,
  updateKelas,
  deleteKelas,
} = require('../controllers/kelas');

const app = express();

app.get('/kelas', getKelas);
app.post('/kelas', createKelas);
app.put('/kelas', updateKelas);
app.delete('/kelas/:id', deleteKelas);

module.exports = app;
