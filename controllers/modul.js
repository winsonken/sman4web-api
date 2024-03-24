const query = require('../config/database');
const pagination = require('../middleware/pagination');
const crypto = require('crypto');
const idGenerator = () => {
  return crypto.randomBytes(16).toString('hex');
};

const getModul = async (req, res) => {
  const modul = req.query.nama || '';
  const search = req.query.q || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 15;

  const payload = {
    nama_modul: modul,
  };

  const statement = await query(
    'SELECT id_modul, nama_modul, kode_modul FROM modul',
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
    search == '' ? object : object.nama_modul.toLowerCase().startsWith(search)
  );

  try {
    const result = Object.keys(payload).length < 1 ? statement : filterSearch;
    const message =
      result.length >= 0 ? 'Modul berhasil ditemukan' : 'Modul tidak ditemukan';
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

const createModul = async (req, res) => {
  const { nama_modul, kode_modul } = req.body;

  const id_modul = idGenerator();

  if (nama_modul === '' || kode_modul === '') {
    const message =
      no_angkatan === ''
        ? 'Nama modul harus diisi'
        : tahun === ''
        ? 'Kode modul harus diisi'
        : '';
    return res.status(400).json({ message: message, status: 400 });
  }

  const statement = await query(
    'INSERT INTO modul (id_modul, nama_modul, kode_modul) VALUES (?, ?, ?)',
    [id_modul, nama_modul, kode_modul]
  );

  try {
    const result = statement;

    const message =
      result.affectedRows < 1
        ? 'Modul gagal ditambahkan'
        : 'Modul berhasil ditambahkan';
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

const updateModul = async (req, res) => {
  const { id_modul, nama_modul, kode_modul } = req.body;

  if (id_modul === '' || nama_modul === '' || kode_modul === '') {
    const message =
      id_modul === ''
        ? 'Id modul harus diisi'
        : nama_modul === ''
        ? 'Nama modul harus diisi'
        : kode_modul === ''
        ? 'Kode modul harus diisi'
        : '';
    return res.status(400).json({ message: message, status: 400 });
  }

  const statement = await query(
    `UPDATE modul SET nama_modul = ?, kode_modul = ? WHERE id_modul = ?`,
    [nama_modul, kode_modul, id_modul]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1 ? 'Modul gagal diubah' : 'Modul berhasil diubah';
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

const deleteModul = async (req, res) => {
  const { id } = req.params;

  const statement = await query(`DELETE FROM modul WHERE id_modul = ?`, [id]);

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Modul gagal dihapus'
        : 'Modul berhasil dihapus';
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
  getModul,
  createModul,
  updateModul,
  deleteModul,
};
