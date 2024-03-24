const query = require('../config/database');
const pagination = require('../middleware/pagination');
const crypto = require('crypto');
const idGenerator = crypto.randomBytes(16).toString('hex');

const getRole = async (req, res) => {
  const role = req.query.nama || '';
  const search = req.query.q || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const payload = {
    nama_role: role,
  };

  const status_role = 1;
  const statement = await query(
    'SELECT id_role, nama_role, status_role FROM role WHERE status_role = ?',
    [status_role]
  );

  const filterParameter = statement.filter((object) =>
    Object.keys(payload).every((key) =>
      payload[key] == ''
        ? object
        : object[key].toLowerCase() == payload[key].toLowerCase()
    )
  );

  const filterSearch = filterParameter.filter((object) =>
    search == '' ? object : object.nama_role.toLowerCase().startsWith(search)
  );

  try {
    const result = Object.keys(payload).length < 1 ? statement : filterSearch;
    const message =
      result.length >= 0 ? 'Role berhasil ditemukan' : 'Role tidak ditemukan';
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

const createRole = async (req, res) => {
  const { nama_role, status_role } = req.body;

  const id_role = idGenerator;

  if (nama_role === '' || status_role === '') {
    const message =
      nama_role === ''
        ? 'Nama role harus diisi'
        : status_role === ''
        ? 'Status role harus diisi'
        : '';
    return res.status(400).json({ message: message, status: 400 });
  }

  const statement = await query(
    'INSERT INTO role (id_role, nama_role, status_role) VALUES (?, ?, ?)',
    [id_role, nama_role, status_role]
  );

  try {
    const result = statement;

    const message =
      result.affectedRows < 1
        ? 'Role gagal ditambahkan'
        : 'Role berhasil ditambahkan';
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

const updateRole = async (req, res) => {
  const { id_role, nama_role, status_role } = req.body;

  if (nama_role === '' || status_role === '') {
    const message =
      id_role === ''
        ? 'Id role harus diisi'
        : nama_role === ''
        ? 'Nama role harus diisi'
        : status_role === ''
        ? 'Status role harus diisi'
        : '';
    return res.status(400).json({ message: message, status: 400 });
  }

  const statement = await query(
    `UPDATE role SET nama_role = ?, status_role = ? WHERE id_role = ?`,
    [nama_role, status_role, id_role]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1 ? 'Role gagal diubah' : 'Role berhasil diubah';
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

const deleteRole = async (req, res) => {
  const { id } = req.params;

  const statement = await query(`DELETE FROM role WHERE id_role = ?`, [id]);

  try {
    const result = statement;
    const message =
      result.affectedRows < 1 ? 'Role gagal dihapus' : 'Role berhasil dihapus';
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
  getRole,
  createRole,
  updateRole,
  deleteRole,
};
