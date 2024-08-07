const express = require('express');
const {
  getSiswa,
  getSiswaBaru,
  getSiswaLulus,
  getSiswaAlumni,
  getSiswaDropout,
  getSiswaBelumAdaKelas,
  createSiswa,
  updateSiswa,
  deleteSiswa,
  updateSetAktif,
  updateSetJurusan,
  updateSetAlumni,
  getJumlahSiswaAktif,
  getJumlahAlumni,
} = require('../controllers/siswa');

const { uploadImage } = require('../middleware/upload');
const app = express();

app.get('/siswa', getSiswa);
app.get('/siswa/baru', getSiswaBaru);
app.get('/siswa/lulus', getSiswaLulus);
app.get('/siswa/alumni', getSiswaAlumni);
app.get('/siswa/belum-ada-kelas', getSiswaBelumAdaKelas);
app.get('/siswa/dropout', getSiswaDropout);
app.post('/siswa', uploadImage, createSiswa);
app.put('/siswa', uploadImage, updateSiswa);
app.delete('/siswa/:id', deleteSiswa);
app.patch('/siswa/set-aktif', updateSetAktif);
app.patch('/siswa/set-jurusan', updateSetJurusan);
app.patch('/siswa/set-alumni', updateSetAlumni);
app.get('/siswa/jumlah-siswa-aktif', getJumlahSiswaAktif);
app.get('/siswa/jumlah-alumni', getJumlahAlumni);

module.exports = app;
