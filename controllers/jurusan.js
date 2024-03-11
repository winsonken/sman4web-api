const query = require('../config/database');
const pagination = require('../middleware/pagination');
const crypto = require('crypto');
const idGenerator = crypto.randomBytes(16).toString('hex');

const getJurusan = async (req, res) => {
  const nama_jurusan = req.query.nama || '';
  const search = req.query.q || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const payload = {
    nama_jurusan: nama_jurusan,
  };

  const statement = await query(
    'SELECT id_jurusan, nama_jurusan FROM jurusan',
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
    search == '' ? object : object.nama_jurusan.toLowerCase().startsWith(search)
  );

  try {
    const result = Object.keys(payload).length < 1 ? statement : filterSearch;
    const message =
      result.length >= 0
        ? 'Jurusan berhasil ditemukan'
        : 'Jurusan tidak ditemukan';
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

const createJurusan = async (req, res) => {
  const { nama_jurusan } = req.body;

  const id_jurusan = idGenerator;

  if (nama_jurusan === '') {
    const message = 'Nama jurusan harus diisi';
    return res.status(400).json({ message: message, status: 400 });
  }

  const statement = await query(
    'INSERT INTO jurusan (id_jurusan, nama_jurusan) VALUES (?, ?)',
    [id_jurusan, nama_jurusan]
  );

  try {
    const result = statement;

    const message =
      result.affectedRows < 1
        ? 'Jurusan gagal ditambahkan'
        : 'Jurusan berhasil ditambahkan';
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

const updateJurusan = async (req, res) => {
  const { id_jurusan, nama_jurusan } = req.body;

  if (nama_jurusan === '') {
    const message = 'Nama jurusan harus diisi';
    return res.status(400).json({ message: message, status: 400 });
  }

  const statement = await query(
    `UPDATE jurusan SET nama_jurusan = ? WHERE id_jurusan = ?`,
    [nama_jurusan, id_jurusan]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Jurusan gagal diubah'
        : 'Jurusan berhasil diubah';
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

const deleteJurusan = async (req, res) => {
  const { id } = req.params;

  const statement = await query(`DELETE FROM jurusan WHERE id_jurusan = ?`, [
    id,
  ]);

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Jurusan gagal dihapus'
        : 'Jurusan berhasil dihapus';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};
module.exports = { getJurusan, createJurusan, updateJurusan, deleteJurusan };
