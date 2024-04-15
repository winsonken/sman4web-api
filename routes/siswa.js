const express = require('express');
const {
  getSiswa,
  getSiswaBaru,
  getSiswaLulus,
  getSiswaAlumni,
  getSiswaBelumAdaKelas,
  createSiswa,
  updateSiswa,
  deleteSiswa,
  updateSetAktif,
  updateSetJurusan,
  updateSetAlumni,
} = require('../controllers/siswa');

const { uploadImage } = require('../middleware/upload');
const app = express();

app.get('/siswa', getSiswa);
app.get('/siswa/baru', getSiswaBaru);
app.get('/siswa/lulus', getSiswaLulus);
app.get('/siswa/alumni', getSiswaAlumni);
app.get('/siswa/belum-ada-kelas', getSiswaBelumAdaKelas);
app.post('/siswa', uploadImage, createSiswa);
app.put('/siswa', uploadImage, updateSiswa);
app.delete('/siswa/:id', deleteSiswa);
app.patch('/siswa/set-aktif', updateSetAktif);
app.patch('/siswa/set-jurusan', updateSetJurusan);
app.patch('/siswa/set-alumni', updateSetAlumni);

module.exports = app;
