const express = require('express');
const {
  getProfileSiswa,
  getProfileGuru,
  getProfileTendik,
} = require('../controllers/profile');

const app = express();

app.get('/profile-siswa', getProfileSiswa);
app.get('/profile-guru', getProfileGuru);
app.get('/profile-tendik', getProfileTendik);

module.exports = app;
