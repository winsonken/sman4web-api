const query = require('../config/database');
const pagination = require('../middleware/pagination');
const crypto = require('crypto');
const idGenerator = () => {
  return crypto.randomBytes(16).toString('hex');
};

const getPrestasi = async (req, res) => {
  const siswa = req.query.siswa || '';
  const search = req.query.q || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const payload = {
    id_siswa: siswa,
  };

  const statement = await query(
    'SELECT id_prestasi, nama_prestasi, jenis_prestasi, tahun_prestasi, siswa.nama AS nama_siswa, siswa.id_siswa, siswa.nipd FROM prestasi_siswa LEFT JOIN siswa ON prestasi_siswa.siswa = siswa.id_siswa',
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
    search == '' ? object : object.nama_siswa.toLowerCase().startsWith(search)
  );

  try {
    const result = Object.keys(payload).length < 1 ? statement : filterSearch;
    const message =
      result.length >= 0
        ? 'Prestasi berhasil ditemukan'
        : 'Prestasi tidak ditemukan';
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

const createPrestasi = async (req, res) => {
  const { nama_prestasi, jenis_prestasi, tahun_prestasi, siswa } = req.body;

  const id_prestasi = idGenerator();

  if (
    nama_prestasi === '' ||
    jenis_prestasi === '' ||
    tahun_prestasi === '' ||
    siswa === ''
  ) {
    const message =
      nama_prestasi === ''
        ? 'Nama prestasi harus diisi'
        : jenis_prestasi === ''
        ? 'Jenis prestasi harus diisi'
        : tahun_prestasi === ''
        ? 'Tahun prestasi harus diisi'
        : siswa === ''
        ? 'Nama siswa harus diisi'
        : '';
    return res.status(400).json({ message: message, status: 400 });
  }

  const statement = await query(
    'INSERT INTO prestasi_siswa (id_prestasi, nama_prestasi, jenis_prestasi, tahun_prestasi, siswa) VALUES (?, ?, ?, ?, ?)',
    [id_prestasi, nama_prestasi, jenis_prestasi, tahun_prestasi, siswa]
  );

  try {
    const result = statement;

    const message =
      result.affectedRows < 1
        ? 'Prestasi gagal ditambahkan'
        : 'Prestasi berhasil ditambahkan';
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

const updatePrestasi = async (req, res) => {
  const { id_prestasi, nama_prestasi, jenis_prestasi, tahun_prestasi, siswa } =
    req.body;

  if (
    nama_prestasi === '' ||
    jenis_prestasi === '' ||
    tahun_prestasi === '' ||
    siswa === ''
  ) {
    const message =
      nama_prestasi === ''
        ? 'Nama prestasi harus diisi'
        : jenis_prestasi === ''
        ? 'Jenis prestasi harus diisi'
        : tahun_prestasi === ''
        ? 'Tahun prestasi harus diisi'
        : siswa === ''
        ? 'Nama siswa harus diisi'
        : '';
    return res.status(400).json({ message: message, status: 400 });
  }

  const statement = await query(
    'UPDATE prestasi_siswa SET nama_prestasi = ?, jenis_prestasi = ?, tahun_prestasi = ?, siswa = ? WHERE id_prestasi = ?',
    [nama_prestasi, jenis_prestasi, tahun_prestasi, siswa, id_prestasi]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Prestasi gagal diubah'
        : 'Prestasi berhasil diubah';
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

const deletePrestasi = async (req, res) => {
  const { id } = req.params;

  const statement = await query(
    `DELETE FROM prestasi_siswa WHERE id_prestasi = ?`,
    [id]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Prestasi gagal dihapus'
        : 'Prestasi berhasil dihapus';
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
  getPrestasi,
  createPrestasi,
  updatePrestasi,
  deletePrestasi,
};
