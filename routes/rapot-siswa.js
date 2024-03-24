const express = require('express');
const {
  getRapotSiswa,
  // createRapotSiswa,
  updateRapotSiswa,
  // deleteRapotSiswa,
  uploadRapotGanjilAwal,
  uploadRapotGanjilAkhir,
  uploadRapotGenapAwal,
  uploadRapotGenapAkhir,
} = require('../controllers/rapot-siswa');

const { uploadFile } = require('../middleware/upload');
const app = express();

app.get('/rapot-siswa', getRapotSiswa);
// app.post('/rapot-siswa', createRapotSiswa);
app.patch('/rapot-siswa', updateRapotSiswa);
// app.delete('/rapot-siswa/:id', deleteRapotSiswa);
app.patch('/rapot-siswa/upload-ganjil-awal', uploadFile, uploadRapotGanjilAwal);
app.patch(
  '/rapot-siswa/upload-ganjil-akhir',
  uploadFile,
  uploadRapotGanjilAkhir
);
app.patch('/rapot-siswa/upload-genap-awal', uploadFile, uploadRapotGenapAwal);
app.patch('/rapot-siswa/upload-genap-akhir', uploadFile, uploadRapotGenapAkhir);

module.exports = app;
