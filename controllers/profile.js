const query = require('../config/database');
const pagination = require('../middleware/pagination');

const getProfileSiswa = async (req, res) => {
  const siswa = req.query.siswa || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const payload = {
    id_siswa: siswa,
  };

  const statement = await query(
    'SELECT id_siswa, no_pendaftaran, nama, jenis_kelamin, nipd, nik, no_telepon_siswa, alamat, email, tempat_lahir, DATE_FORMAT(tanggal_lahir, "%Y-%m-%d") AS tanggal_lahir, agama, nama_ortu, no_telepon_ortu, foto, status_siswa, angkatan, angkatan.no_angkatan, jurusan, jurusan.nama_jurusan, username, nama_role AS role FROM siswa LEFT JOIN role ON role.id_role = siswa.role LEFT JOIN angkatan ON siswa.angkatan = angkatan.id_angkatan LEFT JOIN jurusan ON siswa.jurusan = jurusan.id_jurusan',
    []
  );
  const filterParameter = statement.filter((object) =>
    Object.keys(payload).every((key) =>
      payload[key] == '' ? object : object[key] == payload[key]
    )
  );

  try {
    const result =
      Object.keys(payload).length < 1 ? statement : filterParameter;
    const message =
      result.length >= 0
        ? 'Profile siswa berhasil ditemukan'
        : 'Profile siswa tidak ditemukan';
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

const getProfileGuru = async (req, res) => {
  const guru = req.query.guru || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const payload = {
    id_guru: guru,
  };

  const statement = await query(
    'SELECT id_guru, nama, jenis_kelamin, nik, no_guru, jenis_ptk, no_telepon_guru, alamat, email, tempat_lahir, DATE_FORMAT(tanggal_lahir, "%Y-%m-%d") AS tanggal_lahir, agama, foto, status_kawin, status_guru, status_kepegawaian, username, nama_role AS role FROM guru LEFT JOIN role ON role.id_role = guru.role',
    []
  );
  const filterParameter = statement.filter((object) =>
    Object.keys(payload).every((key) =>
      payload[key] == '' ? object : object[key] == payload[key]
    )
  );

  try {
    const result =
      Object.keys(payload).length < 1 ? statement : filterParameter;
    const message =
      result.length >= 0
        ? 'Profile guru berhasil ditemukan'
        : 'Profile guru tidak ditemukan';
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

const getProfileTendik = async (req, res) => {
  const tendik = req.query.tendik || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const payload = {
    id_tendik: tendik,
  };

  const statement = await query(
    'SELECT id_tendik, nama, jenis_kelamin, nik, no_tendik, jenis_ptk, no_telepon_tendik, alamat, email, tempat_lahir, DATE_FORMAT(tanggal_lahir, "%Y-%m-%d") AS tanggal_lahir, agama, foto, status_kawin, status_tendik, status_kepegawaian, username, nama_role AS role FROM tendik LEFT JOIN role ON role.id_role = tendik.role',
    []
  );
  const filterParameter = statement.filter((object) =>
    Object.keys(payload).every((key) =>
      payload[key] == '' ? object : object[key] == payload[key]
    )
  );

  try {
    const result =
      Object.keys(payload).length < 1 ? statement : filterParameter;
    const message =
      result.length >= 0
        ? 'Profile tendik berhasil ditemukan'
        : 'Profile tendik tidak ditemukan';
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

module.exports = { getProfileSiswa, getProfileGuru, getProfileTendik };
