const express = require('express');
const {
  getJurusan,
  createJurusan,
  updateJurusan,
  deleteJurusan,
} = require('../controllers/jurusan');

const app = express();

app.get('/jurusan', getJurusan);
app.post('/jurusan', createJurusan);
app.put('/jurusan', updateJurusan);
app.delete('/jurusan/:id', deleteJurusan);

module.exports = app;
