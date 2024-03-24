const query = require('../config/database');
const pagination = require('../middleware/pagination');
const crypto = require('crypto');
const idGenerator = () => {
  return crypto.randomBytes(16).toString('hex');
};

const getModulUser = async (req, res) => {
  const role = req.query.role || '';
  const search = req.query.q || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 15;

  const payload = {
    role: role,
  };

  const statement = await query(
    'SELECT id_modul_user, role, role.nama_role, nama_modul, akses, tambah, ubah, hapus FROM modul_user LEFT JOIN role ON role.id_role = modul_user.role LEFT JOIN modul ON modul.id_modul = modul_user.modul ORDER by nama_modul ASC',
    []
  );

  const filterParameter = statement.filter((object) =>
    Object.keys(payload).every((key) =>
      payload[key] == '' ? object : object[key] == payload[key]
    )
  );

  const mappedResults = filterParameter.map((object) => ({
    ...object,
    akses: object.akses === 1,
    tambah: object.tambah === 1,
    ubah: object.ubah === 1,
    hapus: object.hapus === 1,
  }));

  const filterSearch = mappedResults.filter((object) =>
    search == '' ? object : object.nama_role.toLowerCase().startsWith(search)
  );

  try {
    const result = Object.keys(payload).length < 1 ? statement : filterSearch;
    const message =
      result.length >= 0
        ? 'Modul user berhasil ditemukan'
        : 'Modul user tidak ditemukan';
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

// const createModulUser = async (req, res) => {
//   const { akses, edit, ubah, hapus, modul, role } = req.body;
//   console.log(req.body);
//   const id_modul_user = idGenerator();

//   const checkUserModul = await query(
//     'SELECT modul FROM modul_user WHERE modul = ? AND role = ?',
//     [modul, role]
//   );

//   if (checkUserModul.length > 0) {
//     return res.status(400).json({
//       message: 'Modul tersebut sudah ada untuk role ini',
//       status: 400,
//     });
//   }

//   if (
//     akses === '' ||
//     edit === '' ||
//     hapus === '' ||
//     ubah === '' ||
//     modul === '' ||
//     role === ''
//   ) {
//     const message =
//       akses === ''
//         ? 'Akses harus diisi'
//         : edit === ''
//         ? 'Edit harus diisi'
//         : ubah === ''
//         ? 'Ubah harus diisi'
//         : hapus === ''
//         ? 'Hapus harus diisi'
//         : modul === ''
//         ? 'Id modul harus diisi'
//         : role === ''
//         ? 'Id role harus diisi'
//         : '';
//     return res.status(400).json({ message: message, status: 400 });
//   }

//   for (const modulUserData of req.body) {
//     const { id_modul_user, akses, edit, ubah, hapus, modul, role } = req.body;

//     const statement = await query(
//       'INSERT INTO modul_user (id_modul_user, akses, edit, ubah, hapus, modul, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
//       [id_modul_user, akses, edit, ubah, hapus, modul, role]
//     );
//   }

//   try {
//     const result = statement;

//     const message =
//       result.affectedRows < 1
//         ? 'Modul user gagal ditambahkan'
//         : 'Modul user berhasil ditambahkan';
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

const createModulUser = async (req, res) => {
  const modulUserData = req.body;

  // Check if any required field is missing in any of the modul user data
  for (const userData of modulUserData) {
    const { akses, tambah, ubah, hapus, modul, role } = userData;
    if (
      akses === undefined ||
      tambah === undefined ||
      ubah === undefined ||
      hapus === undefined ||
      modul === undefined ||
      role === undefined
    ) {
      const message =
        akses === undefined
          ? 'Akses harus diisi'
          : tambah === undefined
          ? 'Tambah harus diisi'
          : ubah === undefined
          ? 'Ubah harus diisi'
          : hapus === undefined
          ? 'Hapus harus diisi'
          : modul === undefined
          ? 'Modul harus diisi'
          : role === undefined
          ? 'Role harus diisi'
          : '';
      return res.status(400).json({ message: message, status: 400 });
    }
  }

  try {
    const insertPromises = modulUserData.map(async (userData) => {
      const { akses, tambah, ubah, hapus, modul, role } = userData;
      const id_modul_user = idGenerator();
      const statement = await query(
        'INSERT INTO modul_user (id_modul_user, akses, tambah, ubah, hapus, modul, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id_modul_user, akses, tambah, ubah, hapus, modul, role]
      );
      return statement;
    });

    const results = await Promise.all(insertPromises);

    const failedInsertions = results.filter(
      (result) => result.affectedRows < 1
    );

    const status = failedInsertions.length === 0 ? 201 : 400;
    const message =
      failedInsertions.length === 0
        ? 'Modul user berhasil ditambahkan'
        : 'Beberapa modul user gagal ditambahkan';

    return res.status(status).json({
      message: message,
      status: status,
      data: failedInsertions.length === 0 ? modulUserData : null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

// const updateModulUser = async (req, res) => {
//   const { id_modul_user, akses, edit, ubah, hapus } = req.body;

//   if (akses === '' || edit === '' || hapus === '' || ubah === '') {
//     const message =
//       akses === ''
//         ? 'Akses harus diisi'
//         : edit === ''
//         ? 'Edit harus diisi'
//         : ubah === ''
//         ? 'Ubah harus diisi'
//         : hapus === ''
//         ? 'Hapus harus diisi'
//         : '';
//     return res.status(400).json({ message: message, status: 400 });
//   }
//   const statement = await query(
//     `UPDATE modul_user SET akses = ?, edit = ?, ubah = ?, hapus = ? WHERE id_modul_user = ?`,
//     [akses, edit, ubah, hapus, id_modul_user]
//   );

//   try {
//     const result = statement;
//     const message =
//       result.affectedRows < 1
//         ? 'Modul user gagal diubah'
//         : 'Modul user berhasil diubah';
//     const status = result.affectedRows < 1 ? 400 : 200;
//     return res.status(status).json({
//       message: message,
//       status: status,
//       data: result.affectedRows < 1 ? null : req.body,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: 'Internal error', status: 500 });
//   }
// };

const updateModulUser = async (req, res) => {
  const modulUserData = req.body;

  try {
    const updatePromises = modulUserData.map(async (userData) => {
      const { id_modul_user, akses, tambah, ubah, hapus } = userData;
      // Check if any required field is missing for this modul user data
      if (
        akses === undefined ||
        tambah === undefined ||
        hapus === undefined ||
        ubah === undefined
      ) {
        const message =
          akses === undefined
            ? 'Akses harus diisi'
            : tambah === undefined
            ? 'Edit harus diisi'
            : ubah === undefined
            ? 'Ubah harus diisi'
            : hapus === undefined
            ? 'Hapus harus diisi'
            : '';
        return { id_modul_user: id_modul_user, message: message, status: 400 };
      }
      const statement = await query(
        `UPDATE modul_user SET akses = ?, tambah = ?, ubah = ?, hapus = ? WHERE id_modul_user = ?`,
        [akses, tambah, ubah, hapus, id_modul_user]
      );
      return {
        id_modul_user: id_modul_user,
        affectedRows: statement.affectedRows,
      };
    });

    const results = await Promise.all(updatePromises);

    const failedUpdates = results.filter((result) => result.affectedRows < 1);

    const status = failedUpdates.length === 0 ? 200 : 400;
    const message =
      failedUpdates.length === 0
        ? 'Modul user berhasil diubah'
        : 'Beberapa modul user gagal diubah';

    return res.status(status).json({
      message: message,
      status: status,
      data: failedUpdates.length === 0 ? modulUserData : null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const deleteModulUser = async (req, res) => {
  const { id } = req.params;

  const statement = await query(
    `DELETE FROM modul_user WHERE id_modul_user = ?`,
    [id]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Modul user gagal dihapus'
        : 'Modul user berhasil dihapus';
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
  getModulUser,
  createModulUser,
  updateModulUser,
  deleteModulUser,
};
