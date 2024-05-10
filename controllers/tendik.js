const query = require('../config/database');
const pagination = require('../middleware/pagination');
const crypto = require('crypto');
const idGenerator = crypto.randomBytes(16).toString('hex');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const getTendik = async (req, res) => {
  const nama = req.query.nama || '';
  const no = req.query.no || '';
  const status_kepegawaian = req.query.kepegawaian || '';
  const search = req.query.q || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const payload = {
    nama: nama,
    no_tendik: no,
    status_kepegawaian: status_kepegawaian,
  };

  const statusAktif = 1;

  const statement = await query(
    'SELECT id_tendik, nama, jenis_kelamin, nik, no_tendik, jenis_ptk, no_telepon_tendik, alamat, email, tempat_lahir, DATE_FORMAT(tanggal_lahir, "%Y-%m-%d") AS tanggal_lahir, agama, foto, status_kawin, status_tendik, status_kepegawaian, username, nama_role, role FROM tendik LEFT JOIN role ON tendik.role = role.id_role ORDER BY status_tendik ASC',
    []
  );

  const filterParameter = statement.filter((object) =>
    Object.keys(payload).every((key) =>
      payload[key] == '' ? object : object[key] == payload[key]
    )
  );

  const filterSearch = filterParameter.filter((object) =>
    search == ''
      ? object
      : object.nama.toLowerCase().startsWith(search) ||
        object.no_tendik.toString().startsWith(search) ||
        object.status_kepegawaian.toLowerCase().startsWith(search)
  );

  try {
    const result = Object.keys(payload).length < 1 ? statement : filterSearch;
    const message =
      result.length >= 0
        ? 'Tendik berhasil ditemukan'
        : 'Tendik tidak ditemukan';
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

const createTendik = async (req, res) => {
  const {
    nama,
    jenis_kelamin,
    nik,
    no_tendik,
    jenis_ptk,
    no_telepon_tendik,
    alamat,
    email,
    tempat_lahir,
    tanggal_lahir,
    agama,
    status_kawin,
    status_kepegawaian,
    role,
  } = req.body;

  const id_tendik = idGenerator;
  const username = email;
  const password = tanggal_lahir.split('-').join('');
  // const role = 'dcef15809d5686e1925c12623b595cfb';
  const status_tendik = 1;

  const salt = await bcryptjs.genSalt(12);
  const hash = await bcryptjs.hash(password.toString(), salt);

  if (
    nama === '' ||
    jenis_kelamin === '' ||
    nik === '' ||
    no_tendik === '' ||
    jenis_ptk === '' ||
    no_telepon_tendik === '' ||
    alamat === '' ||
    email === '' ||
    tempat_lahir === '' ||
    tanggal_lahir === '' ||
    agama === '' ||
    status_kawin === '' ||
    status_kepegawaian === '' ||
    role === ''
  ) {
    const message =
      nama === ''
        ? 'Nama harus diisi'
        : jenis_kelamin === ''
        ? 'Jenis kelamin harus diisi'
        : nik === ''
        ? 'NIK harus diisi'
        : no_tendik === ''
        ? 'No tendik harus diisi'
        : jenis_ptk === ''
        ? 'Jenis ptk harus diisi'
        : no_telepon_tendik === ''
        ? 'No telepon tendik harus diisi'
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
        : status_kawin === ''
        ? 'Status kawin harus diisi'
        : status_kepegawaian === ''
        ? 'Status kepegawaian ortu harus diisi'
        : role === ''
        ? 'Role harus diisi'
        : '';
    req.file && fs.unlinkSync(req.file.path);
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

  const checkNikExist = await query(
    'SELECT id_tendik FROM tendik WHERE nik = ? AND id_tendik != ?',
    [nik, id_tendik]
  );

  if (checkNikExist.length > 0) {
    req.file && fs.unlinkSync(req.file.path);
    return res
      .status(400)
      .json({ message: 'NIK sudah terdaftar', status: 400 });
  }

  const checkNoTendikExist = await query(
    'SELECT id_tendik FROM tendik WHERE no_tendik = ? AND id_tendik != ?',
    [no_tendik, id_tendik]
  );

  if (checkNoTendikExist.length > 0) {
    req.file && fs.unlinkSync(req.file.path);
    return res
      .status(400)
      .json({ message: 'No tendik sudah terdaftar', status: 400 });
  }
  const checkEmailExist = await query(
    'SELECT id_tendik FROM tendik WHERE email = ? AND id_tendik != ? ',
    [email, id_tendik]
  );

  if (checkEmailExist.length > 0) {
    req.file && fs.unlinkSync(req.file.path);
    return res
      .status(400)
      .json({ message: 'Email sudah terdaftar', status: 400 });
  }

  const statement = await query(
    'INSERT INTO tendik (id_tendik, nama, jenis_kelamin, nik, no_tendik, jenis_ptk, no_telepon_tendik, alamat, email, tempat_lahir, tanggal_lahir, agama, foto, status_kawin, status_tendik, status_kepegawaian, username, password, role) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id_tendik,
      nama,
      jenis_kelamin,
      nik,
      no_tendik,
      jenis_ptk,
      no_telepon_tendik,
      alamat,
      email,
      tempat_lahir,
      tanggal_lahir,
      agama,
      foto,
      status_kawin,
      status_tendik,
      status_kepegawaian,
      username,
      hash,
      role,
    ]
  );

  try {
    const result = statement;

    const message =
      result.affectedRows < 1
        ? 'Tendik gagal ditambahkan'
        : 'Tendik berhasil ditambahkan';
    const status = result.affectedRows < 1 ? 400 : 201;
    return res.status(status).json({
      message: message,
      status: status,
      data: result.affectedRows < 1 ? null : req.body,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const updateTendik = async (req, res) => {
  const {
    id_tendik,
    nama,
    jenis_kelamin,
    nik,
    no_tendik,
    jenis_ptk,
    no_telepon_tendik,
    alamat,
    email,
    tempat_lahir,
    tanggal_lahir,
    agama,
    status_kawin,
    status_tendik,
    status_kepegawaian,
    username,
    password,
    role,
  } = req.body;

  if (
    nama === '' ||
    jenis_kelamin === '' ||
    nik === '' ||
    no_tendik === '' ||
    jenis_ptk === '' ||
    no_telepon_tendik === '' ||
    alamat === '' ||
    email === '' ||
    tempat_lahir === '' ||
    tanggal_lahir === '' ||
    agama === '' ||
    status_kawin === '' ||
    status_tendik === '' ||
    status_kepegawaian === '' ||
    role === ''
  ) {
    const message =
      nama === ''
        ? 'Nama harus diisi'
        : jenis_kelamin === ''
        ? 'Jenis kelamin harus diisi'
        : nik === ''
        ? 'NIK harus diisi'
        : no_tendik === ''
        ? 'No tendik harus diisi'
        : jenis_ptk === ''
        ? 'Jenis ptk harus diisi'
        : no_telepon_tendik === ''
        ? 'No telepon tendik harus diisi'
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
        : status_kawin === ''
        ? 'Status kawin harus diisi'
        : status_tendik === ''
        ? 'Status tendik harus diisi'
        : status_kepegawaian === ''
        ? 'Status kepegawaian ortu harus diisi'
        : username === ''
        ? 'Username harus diisi'
        : role === ''
        ? 'Role harus diisi'
        : '';
    req.file && fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: message, status: 400 });
  }

  const salt = await bcryptjs.genSalt(12);
  const hash = await bcryptjs.hash(password.toString(), salt);

  if (req.fileValidationError) {
    return res
      .status(400)
      .json({ message: req.fileValidationError.message, status: 400 });
  }

  const [getFoto] = await query('SELECT foto FROM tendik WHERE id_tendik = ?', [
    id_tendik,
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

  const [getOldPassword] = await query(
    'SELECT password FROM tendik WHERE id_tendik = ?',
    [id_tendik]
  );

  const statement = await query(
    'UPDATE tendik SET nama = ?, jenis_kelamin = ?, nik = ?, no_tendik = ?, jenis_ptk = ?, no_telepon_tendik = ?, alamat = ?, email = ?, tempat_lahir = ?, tanggal_lahir = ?, agama = ?, foto = ?, status_kawin = ?, status_tendik = ?, status_kepegawaian = ?, username = ?, password = ?, role = ? WHERE id_tendik = ?',
    [
      nama,
      jenis_kelamin,
      nik,
      no_tendik,
      jenis_ptk,
      no_telepon_tendik,
      alamat,
      email,
      tempat_lahir,
      tanggal_lahir,
      agama,
      req.file == undefined ? getFoto.foto : foto,
      status_kawin,
      status_tendik,
      status_kepegawaian,
      username,
      password ? hash : getOldPassword.password,
      role,
      id_tendik,
    ]
  );

  try {
    const result = statement;

    const message =
      result.affectedRows < 1
        ? 'Tendik gagal diubah'
        : 'Tendik berhasil diubah';
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

const deleteTendik = async (req, res) => {
  const { id } = req.params;

  if (id == 'a8c8fe0b97996298eb084322c9d525f3') {
    return res
      .status(400)
      .json({ message: 'Akun admin ini tidak dapat dihapus', status: 400 });
  }

  const statement = await query(`DELETE FROM tendik WHERE id_tendik = ?`, [id]);

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Tendik gagal dihapus'
        : 'Tendik berhasil dihapus';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

module.exports = { getTendik, createTendik, updateTendik, deleteTendik };
