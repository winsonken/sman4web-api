const query = require('../config/database');
// const pagination = require('../middleware/pagination');
// const crypto = require('crypto');
// const idGenerator = crypto.randomBytes(16).toString('hex');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

// const login = async (req, res) => {
//   const { username, password } = req.body;
//   const statementSiswa = await query(
//     `SELECT id_siswa, no_pendaftaran, nama, jenis_kelamin, nipd, nik, no_telepon_siswa, alamat, email, tempat_lahir, tanggal_lahir, agama, nama_ortu, no_telepon_ortu, foto, status_siswa, angkatan, jurusan, username, password, id_role, nama_role FROM siswa LEFT JOIN role ON role.id_role = siswa.role WHERE username = ?`,
//     [username]
//   );

//   const statementGuru = await query(
//     `SELECT id_guru, nama, jenis_kelamin, nik, no_guru, jenis_ptk, no_telepon_guru, alamat, email, tempat_lahir, tanggal_lahir, agama, foto, status_kawin, status_guru, status_kepegawaian, username, password, id_role, nama_role FROM guru LEFT JOIN role ON role.id_role = guru.role WHERE username = ?`,
//     [username]
//   );

//   const statementTendik = await query(
//     `SELECT id_tendik, username, password, id_role, nama_role FROM tendik LEFT JOIN role ON role.id_role = tendik.role WHERE username = ?`,
//     [username]
//   );
//   // const [statement] = await query(
//   //   `SELECT id_siswa, username, password, id_role, nama_role FROM siswa LEFT JOIN role ON role.id_role = siswa.role WHERE username = ?`,
//   //   [username]
//   // );

//   const statement =
//     statementSiswa.length > 0
//       ? statementSiswa[0]
//       : statementGuru.length > 0
//       ? statementGuru[0]
//       : statementTendik[0];
//   const payload = {
//     id: statement.id_siswa || statement.id_guru || statement.id_tendik,
//     username: statement.username,
//     role: statement.nama_role,
//   };

//   const permission = await query(
//     'SELECT modul.nama_modul, modul.kode_modul, modul_user.akses, modul_user.edit, modul_user.ubah, modul_user.hapus FROM modul_user LEFT JOIN modul ON modul_user.modul = modul.id_modul WHERE modul_user.role = ?',
//     [statement.id_role]
//   );

//   try {
//     // password type must string
//     const passwordMatch = bcryptjs.compareSync(
//       password.toString(),
//       statement.password
//     );

//     if (!passwordMatch) {
//       return res.status(400).json({
//         message: 'Password does not match',
//         status: 400,
//       });
//     }

//     const token = jwt.sign(payload, process.env.SECRET_ACCESS_TOKEN, {
//       expiresIn: '10h',
//     });

//     const userData = { ...statement };
//     delete userData.password;

//     return res.status(200).json({
//       message: 'Login success',
//       status: 200,
//       data: {
//         token: token,
//         data: {
//           data: userData,
//           modul: permission,
//         },
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message,
//       status: 500,
//     });
//   }
// };

const login = async (req, res) => {
  const { username, password } = req.body;

  if (username === '' || password === '') {
    const message =
      username === ''
        ? 'Username harus diisi'
        : password === ''
        ? 'Password harus diisi'
        : '';
    return res.status(400).json({ message: message, status: 400 });
  }

  const statementSiswa = await query(
    `SELECT id_siswa, username, password, id_role FROM siswa LEFT JOIN role ON role.id_role = siswa.role WHERE username = ?`,
    [username]
  );

  const statementGuru = await query(
    `SELECT id_guru, username, password, id_role FROM guru LEFT JOIN role ON role.id_role = guru.role WHERE username = ? `,
    [username]
  );

  const statementTendik = await query(
    `SELECT id_tendik, username, password, id_role FROM tendik LEFT JOIN role ON role.id_role = tendik.role WHERE username = ?`,
    [username]
  );

  const statement =
    statementSiswa?.length > 0
      ? statementSiswa[0]
      : statementGuru?.length > 0
      ? statementGuru[0]
      : statementTendik?.length > 0
      ? statementTendik[0]
      : null;

  // If user not found
  if (statement == null) {
    return res
      .status(400)
      .json({ message: 'Username or password is wrong', status: 400 });
  }

  const siswaData =
    statementSiswa.length > 0 &&
    (await query(
      'SELECT id_siswa, no_pendaftaran, nama, jenis_kelamin, nipd, nik, no_telepon_siswa, alamat, email, tempat_lahir, tanggal_lahir, agama, nama_ortu, no_telepon_ortu, foto, status_siswa, angkatan, angkatan.no_angkatan, jurusan, jurusan.nama_jurusan, username, nama_role AS role FROM siswa LEFT JOIN role ON role.id_role = siswa.role LEFT JOIN angkatan ON siswa.angkatan = angkatan.id_angkatan LEFT JOIN jurusan ON siswa.jurusan = jurusan.id_jurusan WHERE id_siswa = ?',
      [statement.id_siswa]
    ));

  const guruData =
    statementGuru.length > 0 &&
    (await query(
      'SELECT id_guru, nama, jenis_kelamin, nik, no_guru, jenis_ptk, no_telepon_guru, alamat, email, tempat_lahir, tanggal_lahir, agama, foto, status_kawin, status_guru, status_kepegawaian, username, nama_role AS role FROM guru LEFT JOIN role ON role.id_role = guru.role WHERE id_guru = ?',
      [statement.id_guru]
    ));

  const tendikData =
    statementTendik.length > 0 &&
    (await query(
      'SELECT id_tendik, nama, jenis_kelamin, nik, no_tendik, jenis_ptk, no_telepon_tendik, alamat, email, tempat_lahir, tanggal_lahir, agama, foto, status_kawin, status_tendik, status_kepegawaian, username, nama_role AS role FROM tendik LEFT JOIN role ON role.id_role = tendik.role WHERE id_tendik = ?',
      [statement.id_tendik]
    ));

  const userData =
    statementSiswa.length > 0
      ? siswaData
      : statementGuru.length > 0
      ? guruData
      : tendikData;

  const payload = {
    id: statement.id_siswa || statement.id_guru || statement.id_tendik,
    username: statement.username,
    role: statement.id_role,
  };

  const permissionStatement = await query(
    'SELECT modul.nama_modul, modul.kode_modul, modul_user.akses, modul_user.tambah, modul_user.ubah, modul_user.hapus FROM modul_user LEFT JOIN modul ON modul_user.modul = modul.id_modul WHERE modul_user.role = ?',
    [statement.id_role]
  );

  const permission = permissionStatement.map((object) => ({
    ...object,
    akses: object.akses === 1,
    tambah: object.tambah === 1,
    ubah: object.ubah === 1,
    hapus: object.hapus === 1,
  }));

  try {
    // password type must string
    const passwordMatch = bcryptjs.compareSync(
      password.toString(),
      statement.password
    );

    if (!passwordMatch) {
      return res.status(400).json({
        message: 'Username or password is wrong',
        status: 400,
      });
    }

    const token = jwt.sign(payload, process.env.SECRET_ACCESS_TOKEN, {
      expiresIn: '10h',
    });

    return res.status(200).json({
      message: 'Login success',
      status: 200,
      data: {
        token: token,
        data: {
          data: userData[0],
          modul: permission,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal error',
      status: 500,
    });
  }
};

module.exports = {
  login,
};
