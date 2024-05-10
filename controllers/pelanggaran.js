const query = require('../config/database');
const pagination = require('../middleware/pagination');
const crypto = require('crypto');
const idGenerator = () => {
  return crypto.randomBytes(16).toString('hex');
};

const getPelanggaran = async (req, res) => {
  const siswa = req.query.siswa || '';
  const search = req.query.q || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const isSiswa = req.userRole == '45cc3b0962e46586971c66b152a8a293';
  const isAlumni = req.userRole == '92a2664681ea75e6ede4a6e78e79e765';

  const payload = {
    id_siswa: siswa,
  };
  let statement;
  if (isSiswa || isAlumni) {
    statement = await query(
      'SELECT id_pelanggaran, jenis_pelanggaran, DATE_FORMAT(tanggal_pelanggaran, "%Y-%m-%d") AS tanggal_pelanggaran, siswa.nama AS nama_siswa, siswa.nipd, siswa.id_siswa FROM pelanggaran LEFT JOIN siswa ON pelanggaran.siswa = siswa.id_siswa WHERE siswa.id_siswa = ?',
      [req.userId]
    );
  } else {
    statement = await query(
      'SELECT id_pelanggaran, jenis_pelanggaran, DATE_FORMAT(tanggal_pelanggaran, "%Y-%m-%d") AS tanggal_pelanggaran, siswa.nama AS nama_siswa, siswa.nipd, siswa.id_siswa FROM pelanggaran LEFT JOIN siswa ON pelanggaran.siswa = siswa.id_siswa',
      []
    );
  }

  const filterParameter = statement.filter((object) =>
    Object.keys(payload).every((key) =>
      payload[key] == ''
        ? object
        : object[key].toLowerCase() == payload[key].toLowerCase()
    )
  );

  const filterSearch = filterParameter.filter((object) =>
    search == '' ? object : object.nama_siswa.toLowerCase().startsWith(search)
  );

  try {
    const result = Object.keys(payload).length < 1 ? statement : filterSearch;
    const message =
      result.length >= 0
        ? 'Pelanggaran berhasil ditemukan'
        : 'Pelanggaran tidak ditemukan';
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

const createPelanggaran = async (req, res) => {
  const { jenis_pelanggaran, tanggal_pelanggaran, siswa } = req.body;

  const id_pelanggaran = idGenerator();

  if (jenis_pelanggaran === '' || tanggal_pelanggaran === '' || siswa === '') {
    const message =
      jenis_pelanggaran === ''
        ? 'Jenis pelanggaran harus diisi'
        : tanggal_pelanggaran === ''
        ? 'Tanggal pelanggaran harus diisi'
        : siswa === ''
        ? 'Nama siswa harus diisi'
        : '';
    return res.status(400).json({ message: message, status: 400 });
  }

  const statement = await query(
    'INSERT INTO pelanggaran (id_pelanggaran, jenis_pelanggaran, tanggal_pelanggaran, siswa) VALUES (?, ?, ?, ?)',
    [id_pelanggaran, jenis_pelanggaran, tanggal_pelanggaran, siswa]
  );

  try {
    const result = statement;

    const message =
      result.affectedRows < 1
        ? 'Pelanggaran gagal ditambahkan'
        : 'Pelanggaran berhasil ditambahkan';
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

const updatePelanggaran = async (req, res) => {
  const { id_pelanggaran, jenis_pelanggaran, tanggal_pelanggaran, siswa } =
    req.body;

  if (jenis_pelanggaran === '' || tanggal_pelanggaran === '' || siswa === '') {
    const message =
      jenis_pelanggaran === ''
        ? 'Jenis pelanggaran harus diisi'
        : tanggal_pelanggaran === ''
        ? 'Tanggal pelanggaran harus diisi'
        : siswa === ''
        ? 'Nama siswa harus diisi'
        : '';
    return res.status(400).json({ message: message, status: 400 });
  }

  const statement = await query(
    'UPDATE pelanggaran SET jenis_pelanggaran = ?, tanggal_pelanggaran = ?, siswa = ? WHERE id_pelanggaran = ?',
    [jenis_pelanggaran, tanggal_pelanggaran, siswa, id_pelanggaran]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Pelanggaran gagal diubah'
        : 'Pelanggaran berhasil diubah';
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

const deletePelanggaran = async (req, res) => {
  const { id } = req.params;

  const statement = await query(
    `DELETE FROM pelanggaran WHERE id_pelanggaran = ?`,
    [id]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Pelanggaran gagal dihapus'
        : 'Pelanggaran berhasil dihapus';
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
  getPelanggaran,
  createPelanggaran,
  updatePelanggaran,
  deletePelanggaran,
};
