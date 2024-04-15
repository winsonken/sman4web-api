const query = require('../config/database');
const pagination = require('../middleware/pagination');
const crypto = require('crypto');
const idGenerator = () => {
  return crypto.randomBytes(16).toString('hex');
};

// const getTahunAjaran = async (req, res) => {
//   const status = req.query.status || '';
//   const search = req.query.q || '';
//   const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
//   const limit =
//     Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

//   const payload = {
//     status_tahun_ajaran: status,
//   };

//   const getStatus = status?.split(',');
//   const statusFirst = getStatus[0] || '';
//   const statusSecond = getStatus[1] || '';

//   const statement = await query(
//     'SELECT id_tahun_ajaran, tahun_mulai_ajaran, tahun_akhir_ajaran, DATE_FORMAT(mulai_periode_ganjil, "%Y-%m-%d") AS mulai_periode_ganjil, DATE_FORMAT(akhir_periode_ganjil, "%Y-%m-%d") AS akhir_periode_ganjil, DATE_FORMAT(mulai_periode_genap, "%Y-%m-%d") AS mulai_periode_genap, DATE_FORMAT(akhir_periode_genap, "%Y-%m-%d") AS akhir_periode_genap, status_tahun_ajaran FROM tahun_ajaran ORDER BY status_tahun_ajaran ASC',
//     []
//   );

//   // const filterParameter = statement.filter((object) =>
//   //   Object.keys(payload).every((key) =>
//   //     payload[key] == '' ? object : object[key] == payload[key]
//   //   )

//   // );

//   // Filter by status
//   const filterParameter =
//     status == ''
//       ? statement
//       : status.length == 3
//       ? statement.filter(
//           (e) =>
//             e.status_tahun_ajaran == statusFirst ||
//             e.status_tahun_ajaran == statusSecond
//         )
//       : statement.filter((e) => e.status_tahun_ajaran == status);

//   const filterSearch = filterParameter.filter((object) =>
//     search == ''
//       ? object
//       : object.tahun_mulai_ajaran.toString().startsWith(search) ||
//         object.tahun_akhir_ajaran.toString().startsWith(search) ||
//         `${object.tahun_mulai_ajaran}-${object.tahun_akhir_ajaran}`.startsWith(
//           search
//         )
//   );

//   try {
//     const result = Object.keys(payload).length < 1 ? statement : filterSearch;
//     const message =
//       result.length >= 0
//         ? 'Tahun ajaran berhasil ditemukan'
//         : 'Tahun ajaran tidak ditemukan';
//     const status = result.length >= 0 ? 200 : 400;

//     const paginationResult = pagination(result, page, limit);

//     return res.status(status).json({
//       message: message,
//       status: status,
//       data: paginationResult?.data,
//       pagination: paginationResult?.pagination,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: 'Internal error', status: 500 });
//   }
// };

const getTahunAjaran = async (req, res) => {
  const status = req.query.status || '';
  const search = req.query.q || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const payload = {
    status_tahun_ajaran: status,
  };

  const statement = await query(
    'SELECT id_tahun_ajaran, tahun_mulai_ajaran, tahun_akhir_ajaran, DATE_FORMAT(mulai_periode_ganjil, "%Y-%m-%d") AS mulai_periode_ganjil, DATE_FORMAT(akhir_periode_ganjil, "%Y-%m-%d") AS akhir_periode_ganjil, DATE_FORMAT(mulai_periode_genap, "%Y-%m-%d") AS mulai_periode_genap, DATE_FORMAT(akhir_periode_genap, "%Y-%m-%d") AS akhir_periode_genap, status_tahun_ajaran FROM tahun_ajaran WHERE status_tahun_ajaran != 2 ORDER BY status_tahun_ajaran ASC',
    []
  );

  const filterParameter = statement.filter((object) =>
    Object.keys(payload).every((key) =>
      payload[key] == '' ? object : object[key] == payload[key]
    )
  );

  const filterSearch = filterParameter.filter((object) =>
    search == ''
      ? object
      : object.tahun_mulai_ajaran.toString().startsWith(search) ||
        object.tahun_akhir_ajaran.toString().startsWith(search) ||
        `${object.tahun_mulai_ajaran}-${object.tahun_akhir_ajaran}`.startsWith(
          search
        )
  );

  try {
    const result = Object.keys(payload).length < 1 ? statement : filterSearch;
    const message =
      result.length >= 0
        ? 'Tahun ajaran berhasil ditemukan'
        : 'Tahun ajaran tidak ditemukan';
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

const getTahunAjaranAktif = async (req, res) => {
  const status = req.query.status || '';
  const search = req.query.q || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const payload = {
    status_tahun_ajaran: status,
  };

  const statement = await query(
    'SELECT id_tahun_ajaran, tahun_mulai_ajaran, tahun_akhir_ajaran, DATE_FORMAT(mulai_periode_ganjil, "%Y-%m-%d") AS mulai_periode_ganjil, DATE_FORMAT(akhir_periode_ganjil, "%Y-%m-%d") AS akhir_periode_ganjil, DATE_FORMAT(mulai_periode_genap, "%Y-%m-%d") AS mulai_periode_genap, DATE_FORMAT(akhir_periode_genap, "%Y-%m-%d") AS akhir_periode_genap, status_tahun_ajaran FROM tahun_ajaran WHERE status_tahun_ajaran = 1 ORDER BY status_tahun_ajaran ASC',
    []
  );

  const filterParameter = statement.filter((object) =>
    Object.keys(payload).every((key) =>
      payload[key] == '' ? object : object[key] == payload[key]
    )
  );

  const filterSearch = filterParameter.filter((object) =>
    search == ''
      ? object
      : object.tahun_mulai_ajaran.toString().startsWith(search) ||
        object.tahun_akhir_ajaran.toString().startsWith(search) ||
        `${object.tahun_mulai_ajaran}-${object.tahun_akhir_ajaran}`.startsWith(
          search
        )
  );

  try {
    const result = Object.keys(payload).length < 1 ? statement : filterSearch;
    const message =
      result.length >= 0
        ? 'Tahun ajaran berhasil ditemukan'
        : 'Tahun ajaran tidak ditemukan';
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

const getTahunAjaranBerakhir = async (req, res) => {
  const status = req.query.status || '';
  const search = req.query.q || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const payload = {
    status_tahun_ajaran: status,
  };

  const statement = await query(
    'SELECT id_tahun_ajaran, tahun_mulai_ajaran, tahun_akhir_ajaran, DATE_FORMAT(mulai_periode_ganjil, "%Y-%m-%d") AS mulai_periode_ganjil, DATE_FORMAT(akhir_periode_ganjil, "%Y-%m-%d") AS akhir_periode_ganjil, DATE_FORMAT(mulai_periode_genap, "%Y-%m-%d") AS mulai_periode_genap, DATE_FORMAT(akhir_periode_genap, "%Y-%m-%d") AS akhir_periode_genap, status_tahun_ajaran FROM tahun_ajaran WHERE status_tahun_ajaran = 2 ORDER BY status_tahun_ajaran ASC',
    []
  );

  const filterParameter = statement.filter((object) =>
    Object.keys(payload).every((key) =>
      payload[key] == '' ? object : object[key] == payload[key]
    )
  );

  const filterSearch = filterParameter.filter((object) =>
    search == ''
      ? object
      : object.tahun_mulai_ajaran.toString().startsWith(search) ||
        object.tahun_akhir_ajaran.toString().startsWith(search) ||
        `${object.tahun_mulai_ajaran}-${object.tahun_akhir_ajaran}`.startsWith(
          search
        )
  );

  try {
    const result = Object.keys(payload).length < 1 ? statement : filterSearch;
    const message =
      result.length >= 0
        ? 'Tahun ajaran berhasil ditemukan'
        : 'Tahun ajaran tidak ditemukan';
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

const getAllTahunAjaran = async (req, res) => {
  const status = req.query.status || '';
  const search = req.query.q || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const payload = {
    status_tahun_ajaran: status,
  };

  const statement = await query(
    'SELECT id_tahun_ajaran, tahun_mulai_ajaran, tahun_akhir_ajaran, DATE_FORMAT(mulai_periode_ganjil, "%Y-%m-%d") AS mulai_periode_ganjil, DATE_FORMAT(akhir_periode_ganjil, "%Y-%m-%d") AS akhir_periode_ganjil, DATE_FORMAT(mulai_periode_genap, "%Y-%m-%d") AS mulai_periode_genap, DATE_FORMAT(akhir_periode_genap, "%Y-%m-%d") AS akhir_periode_genap, status_tahun_ajaran FROM tahun_ajaran ORDER BY tahun_mulai_ajaran DESC',
    []
  );

  const filterParameter = statement.filter((object) =>
    Object.keys(payload).every((key) =>
      payload[key] == '' ? object : object[key] == payload[key]
    )
  );

  const filterSearch = filterParameter.filter((object) =>
    search == ''
      ? object
      : object.tahun_mulai_ajaran.toString().startsWith(search) ||
        object.tahun_akhir_ajaran.toString().startsWith(search) ||
        `${object.tahun_mulai_ajaran}-${object.tahun_akhir_ajaran}`.startsWith(
          search
        )
  );

  try {
    const result = Object.keys(payload).length < 1 ? statement : filterSearch;
    const message =
      result.length >= 0
        ? 'Tahun ajaran berhasil ditemukan'
        : 'Tahun ajaran tidak ditemukan';
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

const createTahunAjaran = async (req, res) => {
  const {
    tahun_mulai_ajaran,
    tahun_akhir_ajaran,
    mulai_periode_ganjil,
    akhir_periode_ganjil,
    mulai_periode_genap,
    akhir_periode_genap,
  } = req.body;

  const id_tahun_ajaran = idGenerator();
  const status_tahun_ajaran = 0;

  if (
    tahun_mulai_ajaran === '' ||
    tahun_akhir_ajaran === '' ||
    mulai_periode_ganjil === '' ||
    akhir_periode_ganjil === '' ||
    mulai_periode_genap === '' ||
    akhir_periode_genap === ''
  ) {
    const message =
      tahun_mulai_ajaran === ''
        ? 'Tahun mulai ajaran harus diisi'
        : tahun_akhir_ajaran === ''
        ? 'Tahun akhir ajaran harus diisi'
        : mulai_periode_ganjil === ''
        ? 'Tanggal mulai periode ganjil harus diisi'
        : akhir_periode_ganjil === ''
        ? 'Tanggal akhir periode ganjil harus diisi'
        : mulai_periode_genap === ''
        ? 'Tanggal mulai periode genap harus diisi'
        : akhir_periode_genap === ''
        ? 'Tanggal akhir periode genap harus diisi'
        : status_tahun_ajaran === ''
        ? 'Status tahun ajaran harus dipilih'
        : '';
    return res.status(400).json({ message: message, status: 400 });
  }

  if (tahun_mulai_ajaran === tahun_akhir_ajaran) {
    const message = 'Tahun tidak boleh sama';
    return res.status(400).json({ message: message, status: 400 });
  }

  const checkTahunAjaran = await query(
    'SELECT id_tahun_ajaran FROM tahun_ajaran WHERE tahun_mulai_ajaran = ? AND tahun_akhir_ajaran = ?',
    [tahun_mulai_ajaran, tahun_akhir_ajaran]
  );

  if (checkTahunAjaran.length > 0) {
    return res
      .status(400)
      .json({ message: 'Tahun ajaran sudah terdaftar', status: 400 });
  }

  const statement = await query(
    'INSERT INTO tahun_ajaran (id_tahun_ajaran, tahun_mulai_ajaran, tahun_akhir_ajaran, mulai_periode_ganjil, akhir_periode_ganjil, mulai_periode_genap, akhir_periode_genap, status_tahun_ajaran) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id_tahun_ajaran,
      tahun_mulai_ajaran,
      tahun_akhir_ajaran,
      mulai_periode_ganjil,
      akhir_periode_ganjil,
      mulai_periode_genap,
      akhir_periode_genap,
      status_tahun_ajaran,
    ]
  );

  try {
    const result = statement;

    const message =
      result.affectedRows < 1
        ? 'Tahun ajaran gagal ditambahkan'
        : 'Tahun ajaran berhasil ditambahkan';
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

const updateTahunAjaran = async (req, res) => {
  const {
    id_tahun_ajaran,
    tahun_mulai_ajaran,
    tahun_akhir_ajaran,
    mulai_periode_ganjil,
    akhir_periode_ganjil,
    mulai_periode_genap,
    akhir_periode_genap,
    status_tahun_ajaran,
  } = req.body;

  if (
    tahun_mulai_ajaran === '' ||
    tahun_akhir_ajaran === '' ||
    mulai_periode_ganjil === '' ||
    akhir_periode_ganjil === '' ||
    mulai_periode_genap === '' ||
    akhir_periode_genap === ''
  ) {
    const message =
      tahun_mulai_ajaran === ''
        ? 'Tahun mulai ajaran harus diisi'
        : tahun_akhir_ajaran === ''
        ? 'Tahun akhir ajaran harus diisi'
        : mulai_periode_ganjil === ''
        ? 'Tanggal mulai periode ganjil harus diisi'
        : akhir_periode_ganjil === ''
        ? 'Tanggal akhir periode ganjil harus diisi'
        : mulai_periode_genap === ''
        ? 'Tanggal mulai periode genap harus diisi'
        : akhir_periode_genap === ''
        ? 'Tanggal akhir periode genap harus diisi'
        : status_tahun_ajaran === ''
        ? 'Status tahun ajaran harus dipilih'
        : '';
    return res.status(400).json({ message: message, status: 400 });
  }

  if (tahun_mulai_ajaran === tahun_akhir_ajaran) {
    const message = 'Tahun tidak boleh sama';
    return res.status(400).json({ message: message, status: 400 });
  }

  const [checkTahunAjaran] = await query(
    'SELECT status_tahun_ajaran FROM tahun_ajaran WHERE id_tahun_ajaran = ?',
    [id_tahun_ajaran]
  );

  // Jika tahun ajaran sudah dimulai dan edit ke belum dimulai
  if (checkTahunAjaran.status_tahun_ajaran == 1 && status_tahun_ajaran == 0) {
    return res.status(400).json({
      message: 'Tahun ajaran sudah dimulai dan tidak dapat dihentikan',
      status: 400,
    });
  }

  // Jika tahun ajaran belum dimulai dan edit ke berakhir
  if (checkTahunAjaran.status_tahun_ajaran == 0 && status_tahun_ajaran == 2) {
    return res.status(400).json({
      message: 'Tahun ajaran belum dimulai dan tidak dapat dihentikan',
      status: 400,
    });
  }

  // Jika tahun ajaran sudah berakhir dan edit ke belum dimulai atau dimulai
  if (
    checkTahunAjaran.status_tahun_ajaran == 2 &&
    (status_tahun_ajaran == 0 || status_tahun_ajaran == 1)
  ) {
    return res.status(400).json({
      message: 'Tahun ajaran sudah berakhir',
      status: 400,
    });
  }

  // Jika ada tahun ajaran yang sudah dimulai
  const status_tahun_ajaran_mulai = 1;
  const checkTahunAjaranMulai = await query(
    'SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status_tahun_ajaran = ? AND id_tahun_ajaran != ?',
    [status_tahun_ajaran_mulai, id_tahun_ajaran]
  );

  if (status_tahun_ajaran == 1 && checkTahunAjaranMulai.length > 0) {
    return res.status(400).json({
      message: 'Tahun ajaran sebelumnya harus diselesaikan terlebih dahulu',
      status: 400,
    });
  }

  const statement = await query(
    `UPDATE tahun_ajaran SET tahun_mulai_ajaran = ?, tahun_akhir_ajaran = ?, mulai_periode_ganjil = ?, akhir_periode_ganjil = ?, mulai_periode_genap = ?, akhir_periode_genap = ?, status_tahun_ajaran = ? WHERE id_tahun_ajaran = ?`,
    [
      tahun_mulai_ajaran,
      tahun_akhir_ajaran,
      mulai_periode_ganjil,
      akhir_periode_ganjil,
      mulai_periode_genap,
      akhir_periode_genap,
      status_tahun_ajaran,
      id_tahun_ajaran,
    ]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Tahun ajaran gagal diubah'
        : 'Tahun ajaran berhasil diubah';
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

const deleteTahunAjaran = async (req, res) => {
  const { id } = req.params;

  const statement = await query(
    `DELETE FROM tahun_ajaran WHERE id_tahun_ajaran = ?`,
    [id]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Tahun ajaran gagal dihapus'
        : 'Tahun ajaran berhasil dihapus';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const updateMulaiTahunAjaran = async (req, res) => {
  const { id_tahun_ajaran } = req.body;

  const status_tahun_ajaran = 1;

  const checkTahunAjaran = await query(
    'SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status_tahun_ajaran = ?',
    status_tahun_ajaran
  );

  if (checkTahunAjaran.length > 0) {
    return res.status(400).json({
      message: 'Tahun ajaran sebelumnya harus diselesaikan terlebih dahulu',
      status: 400,
    });
  }

  const statement = await query(
    `UPDATE tahun_ajaran SET status_tahun_ajaran = ? WHERE id_tahun_ajaran = ?`,
    [status_tahun_ajaran, id_tahun_ajaran]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Tahun ajaran gagal dimulai'
        : 'Tahun ajaran berhasil dimulai';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const updateSelesaiTahunAjaran = async (req, res) => {
  const { id_tahun_ajaran } = req.body;

  const status_tahun_ajaran = 2;

  const [checkTahunAjaran] = await query(
    'SELECT status_tahun_ajaran FROM tahun_ajaran WHERE id_tahun_ajaran = ?',
    [id_tahun_ajaran]
  );

  if (checkTahunAjaran.status_tahun_ajaran == 0) {
    return res
      .status(400)
      .json({ message: 'Tahun ajaran belum dimulai', status: 400 });
  }

  const statement = await query(
    `UPDATE tahun_ajaran SET status_tahun_ajaran = ? WHERE id_tahun_ajaran = ?`,
    [status_tahun_ajaran, id_tahun_ajaran]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Tahun ajaran gagal diakhiri'
        : 'Tahun ajaran berhasil diakhiri';
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
  getTahunAjaran,
  getTahunAjaranAktif,
  getTahunAjaranBerakhir,
  getAllTahunAjaran,
  createTahunAjaran,
  updateTahunAjaran,
  deleteTahunAjaran,
  updateMulaiTahunAjaran,
  updateSelesaiTahunAjaran,
};
