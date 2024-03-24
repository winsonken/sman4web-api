const jwt = require('jsonwebtoken');

const verifyRole = async (req, res, next) => {
  const token = req.header('auth-token');

  if (!token) {
    return res.status(401).json({ message: 'Unathorized', status: 401 });
  }

  try {
    const data = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);

    if (data.role == '45cc3b0962e46586971c66b152a8a293') {
      return res.status(401).json({ message: 'Unathorized', status: 401 });
    }
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Token expired, please relogin', status: 401 });
  }
};

module.exports = {
  verifyRole,
};
