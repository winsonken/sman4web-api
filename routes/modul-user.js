const express = require('express');
const {
  getModulUser,
  createModulUser,
  updateModulUser,
  deleteModulUser,
} = require('../controllers/modul-user');

const app = express();

app.get('/modul-user', getModulUser);
app.post('/modul-user', createModulUser);
app.patch('/modul-user', updateModulUser);
app.delete('/modul-user/:id', deleteModulUser);

module.exports = app;
