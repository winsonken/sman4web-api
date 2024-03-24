const query = require('../config/database');
const pagination = require('../middleware/pagination');
const crypto = require('crypto');
const idGenerator = () => {
  return crypto.randomBytes(16).toString('hex');
};

const getKelas = async (req, res) => {
  const angkatan = req.query.angkatan || '';
  const search = req.query.q || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const payload = {
    no_angkatan: angkatan,
  };

  const statement = await query(
    'SELECT id_kelas, kelas, nama_kelas, guru.nama AS walikelas, jurusan.nama_jurusan, angkatan.no_angkatan, tahun_ajaran.tahun_mulai_ajaran, tahun_ajaran.tahun_akhir_ajaran FROM kelas LEFT JOIN guru ON kelas.walikelas = guru.id_guru LEFT JOIN jurusan ON kelas.jurusan = jurusan.id_jurusan LEFT JOIN angkatan ON kelas.angkatan = angkatan.id_angkatan LEFT JOIN tahun_ajaran ON kelas.tahun_ajaran = tahun_ajaran.id_tahun_ajaran',
    []
  );

  const filterParameter = statement.filter((object) =>
    Object.keys(payload).every((key) =>
      payload[key] == ''
        ? object
        : object[key].toString() == payload[key].toString()
    )
  );

  const filterSearch = filterParameter.filter((object) =>
    search == '' ? object : object.kelas.toString().startsWith(search)
  );

  try {
    const result = Object.keys(payload).length < 1 ? statement : filterSearch;
    const message =
      result.length >= 0 ? 'Kelas berhasil ditemukan' : 'Kelas tidak ditemukan';
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

const createKelas = async (req, res) => {
  const { kelas, nama_kelas, walikelas, jurusan, angkatan, tahun_ajaran } =
    req.body;

  const id_kelas = idGenerator();

  if (
    kelas === '' ||
    nama_kelas === '' ||
    walikelas === '' ||
    angkatan === '' ||
    tahun_ajaran === ''
  ) {
    const message =
      kelas === ''
        ? 'Kelas harus diisi'
        : nama_kelas === ''
        ? 'Nama kelas harus diisi'
        : walikelas === ''
        ? 'Walikelas harus diisi'
        : angkatan === ''
        ? 'Angkatan harus diisi'
        : tahun_ajaran === ''
        ? 'Tahun ajaran harus diisi'
        : '';
    return res.status(400).json({ message: message, status: 400 });
  }

  const checkKelasDuplicate = await query(
    'SELECT id_kelas FROM kelas WHERE kelas = ? AND nama_kelas = ? AND tahun_ajaran = ?',
    [kelas, nama_kelas, tahun_ajaran]
  );

  if (checkKelasDuplicate.length > 0) {
    return res.status(400).json({
      message: `Kelas ${nama_kelas} sudah ada untuk tahun ajaran ini`,
      status: 400,
    });
  }

  const statement = await query(
    'INSERT INTO kelas (id_kelas, kelas, nama_kelas, walikelas, jurusan, angkatan, tahun_ajaran) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      id_kelas,
      kelas,
      nama_kelas,
      walikelas,
      jurusan || null,
      angkatan,
      tahun_ajaran,
    ]
  );

  try {
    const result = statement;

    const message =
      result.affectedRows < 1
        ? 'Kelas gagal ditambahkan'
        : 'Kelas berhasil ditambahkan';
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

const updateKelas = async (req, res) => {
  const {
    id_kelas,
    kelas,
    nama_kelas,
    walikelas,
    jurusan,
    angkatan,
    tahun_ajaran,
  } = req.body;

  if (
    kelas === '' ||
    nama_kelas === '' ||
    walikelas === '' ||
    angkatan === '' ||
    tahun_ajaran === ''
  ) {
    const message =
      kelas === ''
        ? 'Kelas harus diisi'
        : nama_kelas === ''
        ? 'Nama kelas harus diisi'
        : walikelas === ''
        ? 'Walikelas harus diisi'
        : angkatan === ''
        ? 'Angkatan harus diisi'
        : tahun_ajaran === ''
        ? 'Tahun ajaran harus diisi'
        : '';
    return res.status(400).json({ message: message, status: 400 });
  }

  const checkKelasDuplicate = await query(
    'SELECT id_kelas FROM kelas WHERE kelas = ? AND nama_kelas = ? AND tahun_ajaran = ? AND id_kelas != ?',
    [kelas, nama_kelas, tahun_ajaran, id_kelas]
  );

  if (checkKelasDuplicate.length > 0) {
    return res.status(400).json({
      message: `Kelas ${nama_kelas} sudah ada untuk tahun ajaran ini`,
      status: 400,
    });
  }

  const statement = await query(
    'UPDATE kelas SET kelas = ?, nama_kelas = ?, walikelas = ?, jurusan = ?, angkatan = ?, tahun_ajaran = ? WHERE id_kelas = ?',
    [
      kelas,
      nama_kelas,
      walikelas,
      jurusan || null,
      angkatan,
      tahun_ajaran,
      id_kelas,
    ]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1 ? 'Kelas gagal diubah' : 'Kelas berhasil diubah';
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

const deleteKelas = async (req, res) => {
  const { id } = req.params;

  const statement = await query(`DELETE FROM kelas WHERE id_kelas = ?`, [id]);

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Kelas gagal dihapus'
        : 'Kelas berhasil dihapus';
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
  getKelas,
  createKelas,
  updateKelas,
  deleteKelas,
};
