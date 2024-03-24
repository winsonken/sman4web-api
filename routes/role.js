const express = require('express');
const {
  getRole,
  createRole,
  updateRole,
  deleteRole,
} = require('../controllers/role');

const app = express();

app.get('/role', getRole);
app.post('/role', createRole);
app.put('/role', updateRole);
app.delete('/role/:id', deleteRole);

module.exports = app;
