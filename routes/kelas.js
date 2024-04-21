const express = require('express');
const {
  getKelas,
  createKelas,
  updateKelas,
  deleteKelas,
  updateKelasMulai,
  updateKelasBerakhir,
} = require('../controllers/kelas');

const app = express();

app.get('/kelas', getKelas);
app.post('/kelas', createKelas);
app.put('/kelas', updateKelas);
app.delete('/kelas/:id', deleteKelas);
app.patch('/kelas/mulai', updateKelasMulai);
app.patch('/kelas/berakhir', updateKelasBerakhir);

module.exports = app;
