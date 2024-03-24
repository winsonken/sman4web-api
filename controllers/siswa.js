const query = require('../config/database');
const pagination = require('../middleware/pagination');
const crypto = require('crypto');
const idGenerator = () => {
  return crypto.randomBytes(16).toString('hex');
};
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const getSiswa = async (req, res) => {
  const angkatan = req.query.angkatan || '';
  const nipd = req.query.nipd || '';
  const nama = req.query.nama || '';
  const search = req.query.q || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const payload = {
    nama: nama,
    angkatan: angkatan,
    nipd: nipd,
  };

  const statement = await query(
    'SELECT id_siswa, no_pendaftaran, nama, jenis_kelamin, nipd, nik, no_telepon_siswa, alamat, email, tempat_lahir, DATE_FORMAT(tanggal_lahir, "%Y-%m-%d") AS tanggal_lahir, agama, nama_ortu, no_telepon_ortu, foto, status_siswa, angkatan, jurusan, username, password, nama_role AS role FROM siswa LEFT JOIN role ON siswa.role = role.id_role',
    []
  );

  const filterParameter = statement.filter((object) =>
    Object.keys(payload).every((key) =>
      payload[key] == ''
        ? object
        : object[key].toLowerCase() == payload[key].toLowerCase()
    )
  );

  const filterSearch = filterParameter.filter((object) =>
    search == ''
      ? object
      : object.nama.toLowerCase().startsWith(search) ||
        object.angkatan.toLowerCase().startsWith(search) ||
        object.nipd.toString().startsWith(search)
  );

  try {
    const result = Object.keys(payload).length < 1 ? statement : filterSearch;
    const message =
      result.length >= 0 ? 'Siswa berhasil ditemukan' : 'Siswa tidak ditemukan';
    const status = result.length >= 0 ? 200 : 400;

    const paginationResult = pagination(result, page, limit);

    return res.status(status).json({
      message: message,
      status: status,
      data: paginationResult?.data,
      pagination: paginationResult?.pagination,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const createSiswa = async (req, res) => {
  const {
    no_pendaftaran,
    nama,
    jenis_kelamin,
    nipd,
    nik,
    no_telepon_siswa,
    alamat,
    email,
    tempat_lahir,
    tanggal_lahir,
    agama,
    nama_ortu,
    no_telepon_ortu,
    angkatan,
    jurusan,
  } = req.body;

  if (
    no_pendaftaran === '' ||
    nama === '' ||
    jenis_kelamin === '' ||
    nipd === '' ||
    nik === '' ||
    no_telepon_siswa === '' ||
    alamat === '' ||
    email === '' ||
    tempat_lahir === '' ||
    tanggal_lahir === '' ||
    agama === '' ||
    nama_ortu === '' ||
    no_telepon_ortu === '' ||
    angkatan === ''
  ) {
    const message =
      no_pendaftaran === ''
        ? 'No pendaftaran harus diisi'
        : nama === ''
        ? 'Nama harus diisi'
        : jenis_kelamin === ''
        ? 'Jenis kelamin harus diisi'
        : nipd === ''
        ? 'NIPD harus diisi'
        : nik === ''
        ? 'NIK harus diisi'
        : no_telepon_siswa === ''
        ? 'No telepon siswa harus diisi'
        : alamat === ''
        ? 'Alamat harus diisi'
        : email === ''
        ? 'Email harus diisi'
        : tempat_lahir === ''
        ? 'Tempat_lahir harus diisi'
        : tanggal_lahir === ''
        ? 'Tanggal lahir harus diisi'
        : agama === ''
        ? 'Agama harus diisi'
        : nama_ortu === ''
        ? 'Nama ortu harus diisi'
        : no_telepon_ortu === ''
        ? 'No telepon ortu harus diisi'
        : angkatan === ''
        ? 'Angkatan harus diisi'
        : '';
    return res.status(400).json({ message: message, status: 400 });
  }

  if (req.fileValidationError) {
    return res
      .status(400)
      .json({ message: req.fileValidationError.message, status: 400 });
  }

  const filePath = req.file && req.file.path;
  const foto =
    req.file && path.relative('public', filePath).replace(/\\/g, '/');

  const id_siswa = idGenerator();
  const username = nipd;
  const password = tanggal_lahir.split('-').join('');
  const role = '45cc3b0962e46586971c66b152a8a293';
  const status_siswa = 0;

  const salt = await bcryptjs.genSalt(12);
  const hash = await bcryptjs.hash(password.toString(), salt);

  const checkNikExist = await query(
    'SELECT id_siswa FROM siswa WHERE nik = ?',
    [nik]
  );

  if (checkNikExist.length > 0) {
    req.file && fs.unlinkSync(req.file.path);

    return res
      .status(400)
      .json({ message: 'NIK sudah terdaftar', status: 400 });
  }

  const checkNipdExist = await query(
    'SELECT id_siswa FROM siswa WHERE nipd = ?',
    [nipd]
  );

  if (checkNipdExist.length > 0) {
    req.file && fs.unlinkSync(req.file.path);
    return res
      .status(400)
      .json({ message: 'NIPD sudah terdaftar', status: 400 });
  }
  const checkEmailExist = await query(
    'SELECT id_siswa FROM siswa WHERE email = ?',
    [email]
  );

  if (checkEmailExist.length > 0) {
    req.file && fs.unlinkSync(req.file.path);
    return res
      .status(400)
      .json({ message: 'Email sudah terdaftar', status: 400 });
  }

  if (req.fileValidationError) {
    return res
      .status(400)
      .json({ message: req.fileValidationError.message, status: 400 });
  }

  const statement = await query(
    'INSERT INTO siswa (id_siswa, no_pendaftaran, nama, jenis_kelamin, nipd, nik, no_telepon_siswa, alamat, email, tempat_lahir, tanggal_lahir, agama, nama_ortu, no_telepon_ortu, foto, status_siswa, angkatan, jurusan, username, password, role) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id_siswa,
      no_pendaftaran,
      nama,
      jenis_kelamin,
      nipd,
      nik,
      no_telepon_siswa,
      alamat,
      email,
      tempat_lahir,
      tanggal_lahir,
      agama,
      nama_ortu,
      no_telepon_ortu,
      foto,
      status_siswa,
      angkatan,
      jurusan,
      username,
      hash,
      role,
    ]
  );

  try {
    const result = statement;

    const message =
      result.affectedRows < 1
        ? 'Siswa gagal ditambahkan'
        : 'Siswa berhasil ditambahkan';
    const status = result.affectedRows < 1 ? 400 : 201;
    return res.status(status).json({
      message: message,
      status: status,
      data: result.affectedRows < 1 ? null : req.body,
    });
  } catch (error) {
    // req.file && fs.unlinkSync(req.file.path);
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const updateSiswa = async (req, res) => {
  const {
    id_siswa,
    no_pendaftaran,
    nama,
    jenis_kelamin,
    nipd,
    nik,
    no_telepon_siswa,
    alamat,
    email,
    tempat_lahir,
    tanggal_lahir,
    agama,
    nama_ortu,
    no_telepon_ortu,
    status_siswa,
    username,
    password,
    role,
    angkatan,
    jurusan,
  } = req.body;

  if (
    no_pendaftaran === '' ||
    nama === '' ||
    jenis_kelamin === '' ||
    nipd === '' ||
    nik === '' ||
    no_telepon_siswa === '' ||
    alamat === '' ||
    email === '' ||
    tempat_lahir === '' ||
    tanggal_lahir === '' ||
    agama === '' ||
    nama_ortu === '' ||
    no_telepon_ortu === '' ||
    angkatan === ''
  ) {
    const message =
      no_pendaftaran === ''
        ? 'No pendaftaran harus diisi'
        : nama === ''
        ? 'Nama harus diisi'
        : jenis_kelamin === ''
        ? 'Jenis kelamin harus diisi'
        : nipd === ''
        ? 'NIPD harus diisi'
        : nik === ''
        ? 'NIK harus diisi'
        : no_telepon_siswa === ''
        ? 'No telepon siswa harus diisi'
        : alamat === ''
        ? 'Alamat harus diisi'
        : email === ''
        ? 'Email harus diisi'
        : tempat_lahir === ''
        ? 'Tempat_lahir harus diisi'
        : tanggal_lahir === ''
        ? 'Tanggal lahir harus diisi'
        : agama === ''
        ? 'Agama harus diisi'
        : nama_ortu === ''
        ? 'Nama ortu harus diisi'
        : no_telepon_ortu === ''
        ? 'No telepon ortu harus diisi'
        : angkatan === ''
        ? 'Angkatan harus diisi'
        : '';
    return res.status(400).json({ message: message, status: 400 });
  }

  if (req.fileValidationError) {
    return res
      .status(400)
      .json({ message: req.fileValidationError.message, status: 400 });
  }

  const [getFoto] = await query('SELECT foto FROM siswa WHERE id_siswa = ?', [
    id_siswa,
  ]);

  if (getFoto.foto !== null && req.file) {
    try {
      const img = path.relative('images', getFoto.foto);
      const filePath = path.resolve(__dirname, '..', 'public', 'images', img);
      req.file && fs.unlinkSync(filePath);
    } catch (error) {
      return res.status(500).json({ message: 'Error', status: 500 });
    }
  }

  const filePath = req.file && req.file.path;
  const foto =
    req.file && path.relative('public', filePath).replace(/\\/g, '/');

  const salt = await bcryptjs.genSalt(12);
  const hash = await bcryptjs.hash(password.toString(), salt);

  const checkNikExist = await query(
    'SELECT id_siswa FROM siswa WHERE nik = ? AND id_siswa != ?',
    [nik, id_siswa]
  );

  if (checkNikExist.length > 0) {
    req.file && fs.unlinkSync(req.file.path);

    return res
      .status(400)
      .json({ message: 'NIK sudah terdaftar', status: 400 });
  }

  const checkNipdExist = await query(
    'SELECT id_siswa FROM siswa WHERE nipd = ? AND id_siswa != ?',
    [nipd, id_siswa]
  );

  if (checkNipdExist.length > 0) {
    req.file && fs.unlinkSync(req.file.path);
    return res
      .status(400)
      .json({ message: 'NIPD sudah terdaftar', status: 400 });
  }
  const checkEmailExist = await query(
    'SELECT id_siswa FROM siswa WHERE email = ? AND id_siswa != ?',
    [email, id_siswa]
  );

  if (checkEmailExist.length > 0) {
    req.file && fs.unlinkSync(req.file.path);
    return res
      .status(400)
      .json({ message: 'Email sudah terdaftar', status: 400 });
  }

  const [getOldPassword] = await query(
    'SELECT password FROM siswa WHERE id_siswa = ?',
    [id_siswa]
  );

  const statement = await query(
    'UPDATE siswa SET no_pendaftaran = ?, nama = ?, jenis_kelamin = ?, nipd = ?, nik = ?, no_telepon_siswa = ?, alamat = ?, email = ?, tempat_lahir = ?, tanggal_lahir = ?, agama = ?, nama_ortu = ?, no_telepon_ortu = ?, foto = ?, status_siswa = ?, angkatan = ?, jurusan = ?, username = ?, password = ?, role = ? WHERE id_siswa = ?',
    [
      no_pendaftaran,
      nama,
      jenis_kelamin,
      nipd,
      nik,
      no_telepon_siswa,
      alamat,
      email,
      tempat_lahir,
      tanggal_lahir,
      agama,
      nama_ortu,
      no_telepon_ortu,
      foto,
      status_siswa,
      angkatan,
      jurusan,
      username,
      password ? hash : getOldPassword.password,
      role,
      id_siswa,
    ]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1 ? 'Siswa gagal diubah' : 'Siswa berhasil diubah';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
      // data: result.affectedRows < 1 ? null : req.body,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const deleteSiswa = async (req, res) => {
  const { id } = req.params;

  // const [getImage] = await query('SELECT foto FROM siswa WHERE id_siswa = ?', [
  //   id,
  // ]);

  try {
    // try {
    //   const img = path.relative('images', getImage.foto);
    //   const filePath = path.resolve(__dirname, '..', 'public', 'images', img);
    //   fs.unlinkSync(filePath);
    // } catch (error) {
    //   return res
    //     .status(500)
    //     .json({ message: 'Error removing image', status: 500 });
    // }

    const statement = await query(`DELETE FROM siswa WHERE id_siswa = ?`, [id]);
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Siswa gagal dihapus'
        : 'Siswa berhasil dihapus';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const updateSetAktif = async (req, res) => {
  const statusAktif = 1;
  const statusBaru = 0;

  const statement = await query(
    `UPDATE siswa SET status_siswa = ? WHERE status_siswa = ?`,
    [statusAktif, statusBaru]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Tidak ada siswa baru untuk diaktifkan'
        : `Semua siswa berhasil diaktifkan, total siswa: ${result.affectedRows}`;
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const updateSetJurusan = async (req, res) => {
  const { jurusan, id_siswa } = req.body;

  if (jurusan === '') {
    return res
      .status(400)
      .json({ message: 'Jurusan harus dipilih', status: 400 });
  }

  const statement = await query(
    `UPDATE siswa SET jurusan = ? WHERE id_siswa = ?`,
    [jurusan, id_siswa]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Jurusan gagal dipilih'
        : 'Jurusan berhasil dipilih';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

module.exports = {
  getSiswa,
  createSiswa,
  updateSiswa,
  deleteSiswa,
  updateSetAktif,
  updateSetJurusan,
};