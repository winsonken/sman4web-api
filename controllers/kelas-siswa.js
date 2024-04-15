const query = require('../config/database');
const pagination = require('../middleware/pagination');
const crypto = require('crypto');
const idGenerator = () => {
  return crypto.randomBytes(16).toString('hex');
};

const getKelasSiswa = async (req, res) => {
  const kelas = req.query.kelas || '';
  const siswa = req.query.siswa || '';
  const search = req.query.q || '';
  const page = Number(req.query.page) < 1 ? 1 : Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) < 1 ? 10 : Number(req.query.limit) || 10;

  const payload = {
    nama_siswa: siswa,
    kelas: kelas,
  };

  const statement = await query(
    'SELECT id_kelas_siswa, no_absen, status_kelas_siswa, kelas_siswa.kelas, kelas.kelas AS no_kelas, kelas.nama_kelas, kelas_siswa.siswa, siswa.jurusan, jurusan.nama_jurusan, siswa.nama AS nama_siswa, kelas.walikelas, guru.nama AS nama_walikelas, rapot, rapot_siswa.rapot_ganjil_awal, rapot_siswa.rapot_ganjil_akhir, rapot_siswa.rapot_genap_awal, rapot_siswa.rapot_genap_akhir, kelas.tahun_ajaran, tahun_ajaran.tahun_mulai_ajaran, tahun_ajaran.tahun_akhir_ajaran FROM kelas_siswa LEFT JOIN kelas ON kelas_siswa.kelas = kelas.id_kelas LEFT JOIN siswa ON kelas_siswa.siswa = siswa.id_siswa LEFT JOIN rapot_siswa ON kelas_siswa.rapot = rapot_siswa.id_rapot LEFT JOIN guru ON kelas.walikelas = guru.id_guru LEFT JOIN tahun_ajaran ON kelas.tahun_ajaran = tahun_ajaran.id_tahun_ajaran LEFT JOIN jurusan ON kelas.jurusan = jurusan.id_jurusan ORDER BY no_kelas ASC, no_absen ASC ',
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
      result.length >= 0 ? 'Kelas berhasil ditemukan' : 'Kelas tidak ditemukan';
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

const createKelasSiswa = async (req, res) => {
  const {
    kelas,
    siswa,
    rapot_ganjil_awal,
    rapot_ganjil_akhir,
    rapot_genap_awal,
    rapot_genap_akhir,
  } = req.body;

  const id_kelas_siswa = idGenerator();
  const status_kelas_siswa = 1;
  const status_tahun_ajaran = 1;

  const id_rapot = idGenerator();

  if (kelas === '' || siswa === '') {
    const message =
      kelas === ''
        ? 'Nama kelas harus diisi'
        : siswa === ''
        ? 'Nama siswa harus diisi'
        : '';
    return res.status(400).json({ message: message, status: 400 });
  }

  // Jika siswa sudah terdaftar ke dalam kelas di tahun ajaran yang aktif
  const checkKelasDuplicate = await query(
    'SELECT id_kelas_siswa FROM kelas_siswa LEFT JOIN kelas ON kelas_siswa.kelas = kelas.id_kelas LEFT JOIN tahun_ajaran ON kelas.tahun_ajaran = tahun_ajaran.id_tahun_ajaran WHERE kelas_siswa.kelas = ? AND siswa = ? AND status_tahun_ajaran = ?',
    [kelas, siswa, status_tahun_ajaran]
  );

  if (checkKelasDuplicate.length > 0) {
    return res
      .status(400)
      .json({ message: 'Siswa sudah terdaftar dikelas lain', status: 400 });
  }

  const statement = await query(
    'INSERT INTO kelas_siswa (id_kelas_siswa, status_kelas_siswa, kelas, siswa, rapot) VALUES (?, ?, ?, ?, ?)',
    [id_kelas_siswa, status_kelas_siswa, kelas, siswa, id_rapot]
  );

  const [getTahunAjaran] = await query(
    'SELECT tahun_ajaran FROM kelas WHERE id_kelas = ?',
    [kelas]
  );

  const insertRapot = await query(
    'INSERT INTO rapot_siswa (id_rapot, rapot_ganjil_awal, rapot_ganjil_akhir, rapot_genap_awal, rapot_genap_akhir, siswa, tahun_ajaran) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      id_rapot,
      rapot_ganjil_awal,
      rapot_ganjil_akhir,
      rapot_genap_awal,
      rapot_genap_akhir,
      siswa,
      getTahunAjaran.tahun_ajaran,
    ]
  );

  try {
    const result = insertRapot;

    const message =
      result.affectedRows < 1
        ? 'Siswa gagal dimasukkan ke kelas'
        : 'Siswa berhasil dimasukkan ke kelas';
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

const updateKelasSiswa = async (req, res) => {
  const { id_kelas_siswa, no_absen, status_kelas_siswa } = req.body;
  const status_tahun_ajaran = 1;

  if (status_kelas_siswa === '') {
    const message =
      status_kelas_siswa === '' ? 'Status kelas siswa harus diisi' : '';
    return res.status(400).json({ message: message, status: 400 });
  }

  const [getKelas] = await query(
    'SELECT kelas FROM kelas_siswa WHERE id_kelas_siswa = ?',
    [id_kelas_siswa]
  );

  const checkNoAbsen = await query(
    'SELECT id_kelas_siswa FROM kelas_siswa LEFT JOIN kelas ON kelas_siswa.kelas = kelas.id_kelas WHERE kelas_siswa.kelas = ? AND no_absen = ? AND id_kelas_siswa != ?',
    [getKelas?.kelas, no_absen, id_kelas_siswa]
  );

  if (checkNoAbsen.length > 0) {
    return res
      .status(400)
      .json({ message: 'No absen sudah terdaftar', status: 400 });
  }

  const statement = await query(
    'UPDATE kelas_siswa SET no_absen = ?, status_kelas_siswa = ? WHERE id_kelas_siswa = ?',
    [no_absen, status_kelas_siswa, id_kelas_siswa]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Kelas siswa gagal diubah'
        : 'Kelas siswa berhasil diubah';
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

const deleteKelasSiswa = async (req, res) => {
  const { id } = req.params;

  try {
    const getIdRapot = await query(
      'SELECT id_rapot FROM rapot_siswa LEFT JOIN kelas_siswa ON rapot_siswa.id_rapot = kelas_siswa.rapot WHERE kelas_siswa.id_kelas_siswa = ?',
      [id]
    );

    if (getIdRapot.length > 0) {
      await query('DELETE FROM rapot_siswa WHERE id_rapot = ?', [
        getIdRapot[0].id_rapot,
      ]);

      const deleteKelas = await query(
        'DELETE FROM kelas_siswa WHERE id_kelas_siswa = ?',
        [id]
      );

      const status = deleteKelas.affectedRows > 0 ? 200 : 400;
      const message =
        deleteKelas.affectedRows > 0
          ? 'Kelas siswa berhasil dihapus'
          : 'Kelas siswa gagal dihapus';

      return res.status(status).json({ message: message, status: status });
    } else {
      return res.status(404).json({
        message: 'Rapot siswa tidak ditemukan',
        status: 404,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const updateNaikKelas = async (req, res) => {
  const { id_kelas_siswa } = req.body;
  const statusNaikKelas = 2;

  const statement = await query(
    `UPDATE kelas_siswa SET status_kelas_siswa = ? WHERE id_kelas_siswa = ?`,
    [statusNaikKelas, id_kelas_siswa]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Siswa gagal naik kelas'
        : 'Siswa berhasil naik kelas';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const updateTinggalKelas = async (req, res) => {
  const { id_kelas_siswa } = req.body;
  const statusTinggalKelas = 3;

  const statement = await query(
    `UPDATE kelas_siswa SET status_kelas_siswa = ? WHERE id_kelas_siswa = ?`,
    [statusTinggalKelas, id_kelas_siswa]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Siswa gagal tinggal kelas'
        : 'Siswa berhasil tinggal kelas';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const updateLulus = async (req, res) => {
  const { id_kelas_siswa } = req.body;
  const statusLulus = 4;

  const [getSiswa] = await query(
    'SELECT siswa FROM kelas_siswa WHERE id_kelas_siswa = ?',
    [id_kelas_siswa]
  );

  const statement = await query(
    `UPDATE kelas_siswa SET status_kelas_siswa = ? WHERE id_kelas_siswa = ?`,
    [statusLulus, id_kelas_siswa]
  );

  statement.affectedRows > 0 &&
    (await query('UPDATE siswa SET status_siswa = 2 WHERE id_siswa = ?', [
      getSiswa?.siswa,
    ]));

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Siswa gagal diluluskan'
        : 'Siswa berhasil diluluskan';
    const status = result.affectedRows < 1 ? 400 : 200;
    return res.status(status).json({
      message: message,
      status: status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', status: 500 });
  }
};

const updateTidakLulus = async (req, res) => {
  const { id_kelas_siswa } = req.body;
  const statusTidakLulus = 5;

  const statement = await query(
    `UPDATE kelas_siswa SET status_kelas_siswa = ? WHERE id_kelas_siswa = ?`,
    [statusTidakLulus, id_kelas_siswa]
  );

  try {
    const result = statement;
    const message =
      result.affectedRows < 1
        ? 'Siswa gagal tidak diluluskan'
        : 'Siswa berhasil tidak diluluskan';
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
  getKelasSiswa,
  createKelasSiswa,
  updateKelasSiswa,
  deleteKelasSiswa,
  updateNaikKelas,
  updateTinggalKelas,
  updateLulus,
  updateTidakLulus,
};
