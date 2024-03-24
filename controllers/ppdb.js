const query = require('../config/database');
const pagination = require('../middleware/pagination');
const crypto = require('crypto');

const idGenerator = () => {
  return crypto.randomBytes(16).toString('hex');
};
const bcryptjs = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const getPpdb = async (req, res) => {
  const nipd = req.query.nipd || '';
  const nama = req.query.nama || '';
  const search = req.query.q || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const payload = {
    nama: nama,
    nipd: nipd,
  };

  const statement = await query(
    'SELECT id_ppdb, no_pendaftaran, nama, jenis_kelamin, nipd, nik, no_telepon_siswa, alamat, email, tempat_lahir, DATE_FORMAT(tanggal_lahir, "%Y-%m-%d") AS tanggal_lahir, agama, nama_ortu, no_telepon_ortu, foto, status_ppdb, angkatan, tahun_ajaran FROM ppdb',
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
        object.nipd.toString().startsWith(search)
  );

  try {
    const result = Object.keys(payload).length < 1 ? statement : filterSearch;
    const message =
      result.length >= 0 ? 'PPDB berhasil ditemukan' : 'PPDB tidak ditemukan';
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

const createPpdb = async (req, res) => {
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
    tahun_ajaran,
  } = req.body;

  const id_ppdb = idGenerator();
  const status_ppdb = 0;

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
    angkatan === '' ||
    tahun_ajaran === ''
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
        : tahun_ajaran === ''
        ? 'Tahun ajaran harus diisi'
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
    'SELECT id_ppdb FROM ppdb WHERE nik = ? AND id_ppdb != ?',
    [nik, id_ppdb]
  );
  if (checkNikExist.length > 0) {
    req.file && fs.unlinkSync(req.file.path);
    return res
      .status(400)
      .json({ message: 'NIK sudah terdaftar', status: 400 });
  }

  const checkNipdExist = await query(
    'SELECT id_ppdb FROM ppdb WHERE nipd = ? AND id_ppdb != ?',
    [nipd, id_ppdb]
  );

  if (checkNipdExist.length > 0) {
    req.file && fs.unlinkSync(req.file.path);
    return res
      .status(400)
      .json({ message: 'NIPD sudah terdaftar', status: 400 });
  }
  const checkEmailExist = await query(
    'SELECT id_ppdb FROM ppdb WHERE email = ? AND id_ppdb != ?',
    [email, id_ppdb]
  );

  if (checkEmailExist.length > 0) {
    req.file && fs.unlinkSync(req.file.path);
    return res
      .status(400)
      .json({ message: 'Email sudah terdaftar', status: 400 });
  }

  const statement = await query(
    'INSERT INTO ppdb (id_ppdb, no_pendaftaran, nama, jenis_kelamin, nipd, nik, no_telepon_siswa, alamat, email, tempat_lahir, tanggal_lahir, agama, nama_ortu, no_telepon_ortu, foto, status_ppdb, angkatan, tahun_ajaran) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id_ppdb,
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
      status_ppdb,
      angkatan,
      tahun_ajaran,
    ]
  );

  try {
    const result = statement;

    const message =
      result.affectedRows < 1
        ? 'Ppdb gagal ditambahkan'
        : 'Ppdb berhasil ditambahkan';
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

const updatePpdb = async (req, res) => {
  const {
    id_ppdb,
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
    status_ppdb,
    angkatan,
    tahun_ajaran,
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
    status_ppdb === '' ||
    angkatan === '' ||
    tahun_ajaran === ''
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
        : status_ppdb === ''
        ? 'Status ppdb harus diisi'
        : angkatan === ''
        ? 'Angkatan harus diisi'
        : tahun_ajaran === ''
        ? 'Tahun ajaran harus diisi'
        : '';
    req.file && fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: message, status: 400 });
  }

  if (req.fileValidationError) {
    return res
      .status(400)
      .json({ message: req.fileValidationError.message, status: 400 });
  }

  const [getFoto] = await query('SELECT foto FROM ppdb WHERE id_ppdb = ?', [
    id_ppdb,
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

  const statement = await query(
    'UPDATE ppdb SET no_pendaftaran = ?, nama = ?, jenis_kelamin = ?, nipd = ?, nik = ?, no_telepon_siswa = ?, alamat = ?, email = ?, tempat_lahir = ?, tanggal_lahir = ?, agama = ?, nama_ortu = ?, no_telepon_ortu = ?, foto = ?, status_ppdb = ?, angkatan = ?, tahun_ajaran = ?',
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
      status_ppdb,
      angkatan,
      tahun_ajaran,
      id_ppdb,
    ]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1 ? 'Ppdb gagal diubah' : 'Ppdb berhasil diubah';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
      data: result.affectedRows < 1 ? null : req.body,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const deletePpdb = async (req, res) => {
  const { id } = req.params;

  const statement = await query(`DELETE FROM ppdb WHERE id_ppdb = ?`, [id]);

  try {
    const result = statement;
    const message =
      result.affectedRows < 1 ? 'Ppdb gagal dihapus' : 'Ppdb berhasil dihapus';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const updateTerimaPpdb = async (req, res) => {
  const { id_ppdb } = req.body;

  const status_ppdb = 1;

  if (id_ppdb === '') {
    return res
      .status(400)
      .json({ message: 'Id ppdb harus diisi', status: 400 });
  }

  const statement = await query(
    `UPDATE ppdb SET status_ppdb = ? WHERE id_ppdb = ?`,
    [status_ppdb, id_ppdb]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Ppdb gagal diterima'
        : 'Ppdb berhasil diterima';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const updateTolakPpdb = async (req, res) => {
  const { id_ppdb } = req.body;

  const status_ppdb = 2;

  if (id_ppdb === '') {
    return res
      .status(400)
      .json({ message: 'Id ppdb harus diisi', status: 400 });
  }

  const statement = await query(
    `UPDATE ppdb SET status_ppdb = ? WHERE id_ppdb = ?`,
    [status_ppdb, id_ppdb]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1 ? 'Ppdb gagal ditoak' : 'Ppdb berhasil ditolak';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const updateTerimaSemuaPpdb = async (req, res) => {
  const status_ppdb = 1;

  const statement = await query(
    `UPDATE ppdb SET status_ppdb = ? WHERE status_ppdb = 0`,
    [status_ppdb]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? `Tidak ada ppdb untuk diterima, siswa diterima: ${result.affectedRows}`
        : `Semua Ppdb berhasil diterima, siswa diterima: ${result.affectedRows}`;
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const updatePindahSiswa = async (req, res) => {
  const status_ppdb = 1;
  const status_siswa = 0;
  const role = '45cc3b0962e46586971c66b152a8a293';
  const salt = await bcryptjs.genSalt(12);

  const selectPpdb = await query(
    'SELECT id_ppdb, no_pendaftaran, nama, jenis_kelamin, nipd, nik, no_telepon_siswa, alamat, email, tempat_lahir, DATE_FORMAT(tanggal_lahir, "%Y-%m-%d") AS tanggal_lahir, agama, nama_ortu, no_telepon_ortu, foto, status_ppdb, angkatan FROM ppdb WHERE status_ppdb = ?',
    [status_ppdb]
  );

  for (const ppdbData of selectPpdb) {
    const {
      id_ppdb,
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
      angkatan,
    } = ppdbData;

    const defaultPass = tanggal_lahir.split('-').join('');
    const password = await bcryptjs.hash(defaultPass, salt);

    await query(
      `INSERT INTO siswa (id_siswa, no_pendaftaran, nama, jenis_kelamin, nipd, nik, no_telepon_siswa, alamat, email, tempat_lahir, tanggal_lahir, agama, nama_ortu, no_telepon_ortu, foto, status_siswa, angkatan, username, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id_ppdb,
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
        nipd,
        password,
        role,
      ]
    );
  }

  const deleteResult = await query('DELETE FROM ppdb WHERE status_ppdb = ?', [
    status_ppdb,
  ]);

  try {
    const result = deleteResult.affectedRows > 0;

    const message = result
      ? 'Semua ppdb berhasil dipindahkan'
      : 'Tidak ada ppdb untuk dipindahkan';
    const status = result ? 200 : 400;

    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

module.exports = {
  getPpdb,
  createPpdb,
  updatePpdb,
  deletePpdb,
  updateTerimaPpdb,
  updateTolakPpdb,
  updateTerimaSemuaPpdb,
  updatePindahSiswa,
};
