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

const getGuru = async (req, res) => {
  const nama = req.query.nama || '';
  const no = req.query.no || '';
  const status_kepegawaian = req.query.kepegawaian || '';
  const search = req.query.q || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const payload = {
    nama: nama,
    no_guru: no,
    status_kepegawaian: status_kepegawaian,
  };

  const statusAktif = 1;

  const statement = await query(
    'SELECT id_guru, nama, jenis_kelamin, nik, no_guru, jenis_ptk, no_telepon_guru, alamat, email, tempat_lahir, DATE_FORMAT(tanggal_lahir, "%Y-%m-%d") AS tanggal_lahir, agama, foto, status_kawin, status_guru, status_kepegawaian, username, nama_role, role FROM guru LEFT JOIN role ON guru.role = role.id_role WHERE status_guru = ?',
    [statusAktif]
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
        object.no_guru.toString().startsWith(search) ||
        object.status_kepegawaian.toLowerCase().startsWith(search)
  );

  try {
    const result = Object.keys(payload).length < 1 ? statement : filterSearch;
    const message =
      result.length >= 0 ? 'Guru berhasil ditemukan' : 'Guru tidak ditemukan';
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

const createGuru = async (req, res) => {
  const {
    nama,
    jenis_kelamin,
    nik,
    no_guru,
    jenis_ptk,
    no_telepon_guru,
    alamat,
    email,
    tempat_lahir,
    tanggal_lahir,
    agama,
    status_kawin,
    status_kepegawaian,
  } = req.body;

  const id_guru = idGenerator();
  const username = email;
  const password = tanggal_lahir.split('-').join('');
  const role = '5dfe6abc80617c68755e8d9dd8551d4d';
  const status_guru = 1;

  const salt = await bcryptjs.genSalt(12);
  const hash = await bcryptjs.hash(password.toString(), salt);

  if (
    nama === '' ||
    jenis_kelamin === '' ||
    nik === '' ||
    no_guru === '' ||
    jenis_ptk === '' ||
    no_telepon_guru === '' ||
    alamat === '' ||
    email === '' ||
    tempat_lahir === '' ||
    tanggal_lahir === '' ||
    agama === '' ||
    status_kawin === '' ||
    status_kepegawaian === ''
  ) {
    const message =
      nama === ''
        ? 'Nama harus diisi'
        : jenis_kelamin === ''
        ? 'Jenis kelamin harus diisi'
        : nik === ''
        ? 'NIK harus diisi'
        : no_guru === ''
        ? 'No guru harus diisi'
        : jenis_ptk === ''
        ? 'Jenis ptk harus diisi'
        : no_telepon_guru === ''
        ? 'No telepon guru harus diisi'
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
    'SELECT id_guru FROM guru WHERE nik = ? AND id_guru != ?',
    [nik, id_guru]
  );

  if (checkNikExist.length > 0) {
    req.file && fs.unlinkSync(req.file.path);
    return res
      .status(400)
      .json({ message: 'NIK sudah terdaftar', status: 400 });
  }

  const checkNoGuruExist = await query(
    'SELECT id_guru FROM guru WHERE no_guru = ? AND id_guru != ?',
    [no_guru, id_guru]
  );

  if (checkNoGuruExist.length > 0) {
    req.file && fs.unlinkSync(req.file.path);
    return res
      .status(400)
      .json({ message: 'No guru sudah terdaftar', status: 400 });
  }
  const checkEmailExist = await query(
    'SELECT id_guru FROM guru WHERE email = ? AND id_guru != ?',
    [email, id_guru]
  );

  if (checkEmailExist.length > 0) {
    req.file && fs.unlinkSync(req.file.path);
    return res
      .status(400)
      .json({ message: 'Email sudah terdaftar', status: 400 });
  }

  const statement = await query(
    'INSERT INTO guru (id_guru, nama, jenis_kelamin, nik, no_guru, jenis_ptk, no_telepon_guru, alamat, email, tempat_lahir, tanggal_lahir, agama, foto, status_kawin, status_guru, status_kepegawaian, username, password, role) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id_guru,
      nama,
      jenis_kelamin,
      nik,
      no_guru,
      jenis_ptk,
      no_telepon_guru,
      alamat,
      email,
      tempat_lahir,
      tanggal_lahir,
      agama,
      foto,
      status_kawin,
      status_guru,
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
        ? 'Guru gagal ditambahkan'
        : 'Guru berhasil ditambahkan';
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

const updateGuru = async (req, res) => {
  const {
    id_guru,
    nama,
    jenis_kelamin,
    nik,
    no_guru,
    jenis_ptk,
    no_telepon_guru,
    alamat,
    email,
    tempat_lahir,
    tanggal_lahir,
    agama,
    status_kawin,
    status_guru,
    status_kepegawaian,
    username,
    password,
    role,
  } = req.body;

  if (
    nama === '' ||
    jenis_kelamin === '' ||
    nik === '' ||
    no_guru === '' ||
    jenis_ptk === '' ||
    no_telepon_guru === '' ||
    alamat === '' ||
    email === '' ||
    tempat_lahir === '' ||
    tanggal_lahir === '' ||
    agama === '' ||
    status_kawin === '' ||
    status_guru === '' ||
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
        : no_guru === ''
        ? 'No guru harus diisi'
        : jenis_ptk === ''
        ? 'Jenis ptk harus diisi'
        : no_telepon_guru === ''
        ? 'No telepon guru harus diisi'
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
        : status_guru === ''
        ? 'Status guru harus diisi'
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

  if (req.fileValidationError) {
    return res
      .status(400)
      .json({ message: req.fileValidationError.message, status: 400 });
  }

  const [getFoto] = await query('SELECT foto FROM guru WHERE id_guru = ?', [
    id_guru,
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

  const [getOldPassword] = await query(
    'SELECT password FROM guru WHERE id_guru = ?',
    [id_guru]
  );

  const statement = await query(
    'UPDATE guru SET nama = ?, jenis_kelamin = ?, nik = ?, no_guru = ?, jenis_ptk = ?, no_telepon_guru = ?, alamat = ?, email = ?, tempat_lahir = ?, tanggal_lahir = ?, agama = ?, foto = ?, status_kawin = ?, status_guru = ?, status_kepegawaian = ?, username = ?, password = ?, role = ? WHERE id_guru = ?',
    [
      nama,
      jenis_kelamin,
      nik,
      no_guru,
      jenis_ptk,
      no_telepon_guru,
      alamat,
      email,
      tempat_lahir,
      tanggal_lahir,
      agama,
      req.file == undefined ? getFoto.foto : foto,
      status_kawin,
      status_guru,
      status_kepegawaian,
      username,
      password ? hash : getOldPassword.password,
      role,
      id_guru,
    ]
  );

  try {
    const result = statement;

    const message =
      result.affectedRows < 1 ? 'Guru gagal diubah' : 'Guru berhasil diubah';
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

const deleteGuru = async (req, res) => {
  const { id } = req.params;

  const statement = await query(`DELETE FROM guru WHERE id_guru = ?`, [id]);

  try {
    const result = statement;
    const message =
      result.affectedRows < 1 ? 'Guru gagal dihapus' : 'Guru berhasil dihapus';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

module.exports = { getGuru, createGuru, updateGuru, deleteGuru };
