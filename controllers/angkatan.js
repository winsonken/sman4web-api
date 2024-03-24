const query = require('../config/database');
const pagination = require('../middleware/pagination');
const crypto = require('crypto');
const idGenerator = () => {
  return crypto.randomBytes(16).toString('hex');
};

const getAngkatan = async (req, res) => {
  const no_angkatan = req.query.no || '';
  const tahun = req.query.tahun || '';
  const status = req.query.status || '';
  const search = req.query.q || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const payload = {
    no_angkatan: no_angkatan,
    tahun: tahun,
    status_angkatan: status,
  };

  // const payload = {
  //   no_angkatan: no_angkatan,
  //   tahun: tahun,
  //   status_angkatan:
  //     '0'.startsWith(status) || 'belum dimulai'.startsWith(status)
  //       ? '0'
  //       : '1'.startsWith(status) || 'aktif'.startsWith(status)
  //       ? '1'
  //       : '2'.startsWith(status) || 'lulus'.startsWith(status)
  //       ? '2'
  //       : null,
  // };

  const statement = await query(
    'SELECT id_angkatan, no_angkatan, tahun, jumlah_siswa, siswa_lulus, status_angkatan FROM angkatan ORDER BY no_angkatan DESC',
    []
  );

  const filterParameter = statement.filter((object) =>
    Object.keys(payload).every((key) =>
      payload[key] == '' ? object : object[key] == payload[key]
    )
  );

  const filterSearch = filterParameter.filter(
    (object) =>
      search == ''
        ? object
        : object.no_angkatan.toString().startsWith(search) ||
          object.tahun.toString().startsWith(search)
    // object.status_angkatan.toString().startsWith(search)
  );

  try {
    const result = Object.keys(payload).length < 1 ? statement : filterSearch;
    const message =
      result.length >= 0
        ? 'Angkatan berhasil ditemukan'
        : 'Angkatan tidak ditemukan';
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

const createAngkatan = async (req, res) => {
  const { no_angkatan, tahun } = req.body;

  const id_angkatan = idGenerator();
  const jumlah_siswa = null;
  const siswa_lulus = null;
  const status_angkatan = 0;

  if (no_angkatan === '' || tahun === '') {
    const message =
      no_angkatan === ''
        ? 'No angkatan harus diisi'
        : tahun === ''
        ? 'Tahun harus diisi'
        : '';
    return res.status(400).json({ message: message, status: 400 });
  }

  const checkDuplicate = await query(
    'SELECT no_angkatan FROM angkatan WHERE no_angkatan = ?',
    [no_angkatan]
  );

  const statement = await query(
    'INSERT INTO angkatan (id_angkatan, no_angkatan, tahun, jumlah_siswa, siswa_lulus, status_angkatan) VALUES (?, ?, ?, ?, ?, ?)',
    [
      id_angkatan,
      no_angkatan,
      tahun,
      jumlah_siswa,
      siswa_lulus,
      status_angkatan,
    ]
  );

  try {
    if (checkDuplicate.length > 0) {
      return res
        .status(400)
        .json({ message: 'No angkatan sudah ada', status: 400 });
    }

    const result = statement;

    const message =
      result.affectedRows < 1
        ? 'Angkatan gagal ditambahkan'
        : 'Angkatan berhasil ditambahkan';
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

const updateAngkatan = async (req, res) => {
  const { id_angkatan, no_angkatan, tahun, status_angkatan } = req.body;

  if (no_angkatan === '' || tahun === '' || status_angkatan === '') {
    const message =
      no_angkatan === ''
        ? 'No angkatan harus diisi'
        : tahun === ''
        ? 'Tahun harus diisi'
        : status_angkatan === ''
        ? 'Status angkatan harus dipilih'
        : '';

    return res.status(400).json({ message: message, status: 400 });
  }

  const [checkAngkatan] = await query(
    'SELECT status_angkatan FROM angkatan WHERE id_angkatan = ?',
    [id_angkatan]
  );

  if (checkAngkatan.status_angkatan == 1 && status_angkatan == 0) {
    return res
      .status(400)
      .json({ message: 'Angkatan sudah dimulai', status: 400 });
  }

  if (checkAngkatan.status_angkatan == 0 && status_angkatan == 2) {
    return res
      .status(400)
      .json({ message: 'Angkatan belum dimulai', status: 400 });
  }

  if (
    checkAngkatan.status_angkatan == 2 &&
    (status_angkatan == 0 || status_angkatan == 1)
  ) {
    return res
      .status(400)
      .json({ message: 'Angkatan sudah lulus', status: 400 });
  }

  const statement = await query(
    `UPDATE angkatan SET no_angkatan = ?, tahun = ?, status_angkatan = ? WHERE id_angkatan = ?`,
    [no_angkatan, tahun, status_angkatan, id_angkatan]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Angkatan gagal diubah'
        : 'Angkatan berhasil diubah';
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

const deleteAngkatan = async (req, res) => {
  const { id } = req.params;

  const statement = await query(`DELETE FROM angkatan WHERE id_angkatan = ?`, [
    id,
  ]);

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Angkatan gagal dihapus'
        : 'Angkatan berhasil dihapus';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const updateMulaiAngkatan = async (req, res) => {
  const { id_angkatan } = req.body;

  const status_angkatan = 1;

  const statement = await query(
    `UPDATE angkatan SET status_angkatan = ? WHERE id_angkatan = ?`,
    [status_angkatan, id_angkatan]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Angkatan gagal dimulai'
        : 'Angkatan berhasil dimulai';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const updateLulusAngkatan = async (req, res) => {
  const { id_angkatan } = req.body;

  const status_angkatan = 2;

  const statement = await query(
    `UPDATE angkatan SET status_angkatan = ? WHERE id_angkatan = ?`,
    [status_angkatan, id_angkatan]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Angkatan gagal diluluskan'
        : 'Angkatan berhasil diluluskan';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const updateJumlahSiswa = async (req, res) => {
  const { jumlah_siswa, id_angkatan } = req.body;
  const statement = await query(
    `UPDATE angkatan SET jumlah_siswa = ? WHERE id_angkatan = ?`,
    [jumlah_siswa, id_angkatan]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Jumlah siswa gagal dibah'
        : 'Jumlah siswa berhasil dibah';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const updateSiswaLulus = async (req, res) => {
  const { siswa_lulus, id_angkatan } = req.body;
  const statement = await query(
    `UPDATE angkatan SET siswa_lulus = ? WHERE id_angkatan = ?`,
    [siswa_lulus, id_angkatan]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Siswa lulus gagal dibah'
        : 'Siswa lulus berhasil dibah';
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
  getAngkatan,
  createAngkatan,
  updateAngkatan,
  deleteAngkatan,
  updateMulaiAngkatan,
  updateLulusAngkatan,
  updateJumlahSiswa,
  updateSiswaLulus,
};
