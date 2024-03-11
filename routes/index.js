const express = require('express');
const app = express();

const angkatan = require('./angkatan');
const jurusan = require('./jurusan');

const api = '/api/v1';
app.use(api, angkatan);
app.use(api, jurusan);

module.exports = app;
