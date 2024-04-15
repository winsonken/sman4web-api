const query = require('../config/database');
const pagination = require('../middleware/pagination');
const crypto = require('crypto');
const idGenerator = () => {
  return crypto.randomBytes(16).toString('hex');
};
const path = require('path');
const fs = require('fs');

const getRapotSiswa = async (req, res) => {
  const siswa = req.query.siswa || '';
  const tahun_ajaran = req.query.tahunAjaran || '';
  const search = req.query.q || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const payload = {
    id_siswa: siswa,
    status_tahun_ajaran: tahun_ajaran,
  };

  const statement = await query(
    'SELECT id_rapot, rapot_ganjil_awal, rapot_ganjil_akhir, rapot_genap_awal, rapot_genap_akhir, siswa.nama AS nama_siswa, siswa.nipd, siswa.id_siswa, tahun_ajaran.tahun_mulai_ajaran, tahun_ajaran.tahun_akhir_ajaran FROM rapot_siswa LEFT JOIN siswa ON rapot_siswa.siswa = siswa.id_siswa LEFT JOIN tahun_ajaran ON rapot_siswa.tahun_ajaran = tahun_ajaran.id_tahun_ajaran',
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
        ? 'Rapot siswa berhasil ditemukan'
        : 'Rapot siswa tidak ditemukan';
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

// const createRapotSiswa = async (req, res) => {
//   const {
//     rapot_ganjil_awal,
//     rapot_ganjil_akhir,
//     rapot_genap_awal,
//     rapot_genap_akhir,
//     siswa,
//     tahun_ajaran,
//   } = req.body;

//   const id_rapot = idGenerator();

//   if (siswa === '' || tahun_ajaran === '') {
//     const message =
//       siswa === ''
//         ? 'Siswa harus diisi'
//         : tahun_ajaran === ''
//         ? 'Tahun ajaran harus diisi'
//         : '';
//     return res.status(400).json({ message: message, status: 400 });
//   }

//   const statement = await query(
//     'INSERT INTO rapot_siswa (id_rapot, rapot_ganjil_awal, rapot_ganjil_akhir, rapot_genap_awal, rapot_genap_akhir, siswa, tahun_ajaran) VALUES (?, ?, ?, ?, ?, ?, ?)',
//     [
//       id_rapot,
//       rapot_ganjil_awal,
//       rapot_ganjil_akhir,
//       rapot_genap_akhir,
//       rapot_genap_awal,
//       rapot_genap_akhir,
//       siswa,
//       tahun_ajaran,
//     ]
//   );

//   try {
//     const result = statement;

//     const message =
//       result.affectedRows < 1
//         ? 'Rapot gagal ditambahkan'
//         : 'Rapot berhasil ditambahkan';
//     const status = result.affectedRows < 1 ? 400 : 201;
//     return res.status(status).json({
//       message: message,
//       status: status,
//       data: result.affectedRows < 1 ? null : req.body,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: 'Internal error', status: 500 });
//   }
// };

const updateRapotSiswa = async (req, res) => {
  const {
    id_rapot,
    rapot_ganjil_awal,
    rapot_ganjil_akhir,
    rapot_genap_awal,
    rapot_genap_akhir,
  } = req.body;

  const statement = await query(
    'UPDATE rapot_siswa SET rapot_ganjil_awal = ?, rapot_ganjil_akhir = ?, rapot_genap_awal = ?, rapot_genap_akhir = ? WHERE id_rapot = ?',
    [
      rapot_ganjil_awal,
      rapot_ganjil_akhir,
      rapot_genap_awal,
      rapot_genap_akhir,
      id_rapot,
    ]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1 ? 'Rapot gagal diubah' : 'Rapot berhasil diubah';
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

// const deleteRapotSiswa = async (req, res) => {
//   const { id } = req.params;

//   const statement = await query(`DELETE FROM rapot_siswa WHERE id_rapot = ?`, [
//     id,
//   ]);

//   try {
//     const result = statement;
//     const message =
//       result.affectedRows < 1
//         ? 'Rapot gagal dihapus'
//         : 'Rapot berhasil dihapus';
//     const status = result.affectedRows < 1 ? 400 : 200;
//     return res.status(status).json({
//       message: message,
//       status: status,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: 'Internal error', status: 500 });
//   }
// };

const uploadRapotGanjilAwal = async (req, res) => {
  const { id_rapot, file } = req.body;

  if (req.fileValidationError) {
    return res
      .status(400)
      .json({ message: req.fileValidationError.message, status: 400 });
  }

  // else if (!req.file) {
  //   return res.status(400).json({ message: 'File harus diisi', status: 400 });
  // }

  const [getRapot] = await query(
    'SELECT rapot_ganjil_awal FROM rapot_siswa WHERE id_rapot = ?',
    [id_rapot]
  );

  if (req.file && getRapot.rapot_ganjil_awal !== null) {
    try {
      const img = path.relative('files', getRapot.rapot_ganjil_awal);
      const filePath = path.resolve(__dirname, '..', 'public', 'files', img);
      fs.unlinkSync(filePath);
    } catch (error) {
      return res.status(500).json({ message: 'Error', status: 500 });
    }
  } else if (
    !file &&
    req.file == undefined &&
    getRapot.rapot_ganjil_awal !== null
  ) {
    try {
      const img = path.relative('files', getRapot.rapot_ganjil_awal);
      const filePath = path.resolve(__dirname, '..', 'public', 'files', img);
      fs.unlinkSync(filePath);
    } catch (error) {
      return res.status(500).json({ message: 'Error', status: 500 });
    }
  }

  const filePath = req.file && req.file.path;
  const rapot_ganjil_awal =
    req.file && path.relative('public', filePath).replace(/\\/g, '/');

  const statement = await query(
    'UPDATE rapot_siswa SET rapot_ganjil_awal = ? WHERE id_rapot = ?',
    [file ? file : req.file == undefined ? null : rapot_ganjil_awal, id_rapot]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1 ? 'Rapot gagal diubah' : 'Rapot berhasil diubah';
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

const uploadRapotGanjilAkhir = async (req, res) => {
  const { id_rapot, file } = req.body;

  if (req.fileValidationError) {
    return res
      .status(400)
      .json({ message: req.fileValidationError.message, status: 400 });
  }

  // else if (!req.file) {
  //   return res.status(400).json({ message: 'File harus diisi', status: 400 });
  // }

  const [getRapot] = await query(
    'SELECT rapot_ganjil_akhir FROM rapot_siswa WHERE id_rapot = ?',
    [id_rapot]
  );

  if (req.file && getRapot.rapot_ganjil_akhir !== null) {
    try {
      const img = path.relative('files', getRapot.rapot_ganjil_akhir);
      const filePath = path.resolve(__dirname, '..', 'public', 'files', img);
      fs.unlinkSync(filePath);
    } catch (error) {
      return res.status(500).json({ message: 'Error', status: 500 });
    }
  } else if (
    !file &&
    req.file == undefined &&
    getRapot.rapot_ganjil_akhir !== null
  ) {
    try {
      const img = path.relative('files', getRapot.rapot_ganjil_akhir);
      const filePath = path.resolve(__dirname, '..', 'public', 'files', img);
      fs.unlinkSync(filePath);
    } catch (error) {
      return res.status(500).json({ message: 'Error', status: 500 });
    }
  }

  const filePath = req.file && req.file.path;
  const rapot_ganjil_akhir =
    req.file && path.relative('public', filePath).replace(/\\/g, '/');

  const statement = await query(
    'UPDATE rapot_siswa SET rapot_ganjil_akhir = ? WHERE id_rapot = ?',
    [file ? file : req.file == undefined ? null : rapot_ganjil_akhir, id_rapot]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1 ? 'Rapot gagal diubah' : 'Rapot berhasil diubah';
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

const uploadRapotGenapAwal = async (req, res) => {
  const { id_rapot, file } = req.body;

  if (req.fileValidationError) {
    return res
      .status(400)
      .json({ message: req.fileValidationError.message, status: 400 });
  }

  // else if (!req.file) {
  //   return res.status(400).json({ message: 'File harus diisi', status: 400 });
  // }

  const [getRapot] = await query(
    'SELECT rapot_genap_awal FROM rapot_siswa WHERE id_rapot = ?',
    [id_rapot]
  );

  if (req.file && getRapot.rapot_genap_awal !== null) {
    try {
      const img = path.relative('files', getRapot.rapot_genap_awal);
      const filePath = path.resolve(__dirname, '..', 'public', 'files', img);
      fs.unlinkSync(filePath);
    } catch (error) {
      return res.status(500).json({ message: 'Error', status: 500 });
    }
  } else if (
    !file &&
    req.file == undefined &&
    getRapot.rapot_genap_awal !== null
  ) {
    try {
      const img = path.relative('files', getRapot.rapot_genap_awal);
      const filePath = path.resolve(__dirname, '..', 'public', 'files', img);
      fs.unlinkSync(filePath);
    } catch (error) {
      return res.status(500).json({ message: 'Error', status: 500 });
    }
  }

  const filePath = req.file && req.file.path;
  const rapot_genap_awal =
    req.file && path.relative('public', filePath).replace(/\\/g, '/');

  const statement = await query(
    'UPDATE rapot_siswa SET rapot_genap_awal = ? WHERE id_rapot = ?',
    [file ? file : req.file == undefined ? null : rapot_genap_awal, id_rapot]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1 ? 'Rapot gagal diubah' : 'Rapot berhasil diubah';
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

const uploadRapotGenapAkhir = async (req, res) => {
  const { id_rapot, file } = req.body;

  if (req.fileValidationError) {
    return res
      .status(400)
      .json({ message: req.fileValidationError.message, status: 400 });
  }
  // else if (!req.file) {
  //   return res.status(400).json({ message: 'File harus diisi', status: 400 });
  // }

  const [getRapot] = await query(
    'SELECT rapot_genap_akhir FROM rapot_siswa WHERE id_rapot = ?',
    [id_rapot]
  );

  if (req.file && getRapot.rapot_genap_akhir !== null) {
    try {
      const img = path.relative('files', getRapot.rapot_genap_akhir);
      const filePath = path.resolve(__dirname, '..', 'public', 'files', img);
      fs.unlinkSync(filePath);
    } catch (error) {
      return res.status(500).json({ message: 'Error', status: 500 });
    }
  } else if (
    !file &&
    req.file == undefined &&
    getRapot.rapot_genap_akhir !== null
  ) {
    try {
      const img = path.relative('files', getRapot.rapot_genap_akhir);
      const filePath = path.resolve(__dirname, '..', 'public', 'files', img);
      fs.unlinkSync(filePath);
    } catch (error) {
      return res.status(500).json({ message: 'Error', status: 500 });
    }
  }

  const filePath = req.file && req.file.path;
  const rapot_genap_akhir =
    req.file && path.relative('public', filePath).replace(/\\/g, '/');

  const statement = await query(
    'UPDATE rapot_siswa SET rapot_genap_akhir = ? WHERE id_rapot = ?',
    [file ? file : req.file == undefined ? null : rapot_genap_akhir, id_rapot]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1 ? 'Rapot gagal diubah' : 'Rapot berhasil diubah';
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

module.exports = {
  getRapotSiswa,
  // createRapotSiswa,
  updateRapotSiswa,
  // deleteRapotSiswa,
  uploadRapotGanjilAwal,
  uploadRapotGanjilAkhir,
  uploadRapotGenapAwal,
  uploadRapotGenapAkhir,
};
