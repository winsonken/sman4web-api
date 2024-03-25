const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  const token = req.header('auth-token');

  if (!token) {
    return res.status(401).json({ message: 'Unathorized', status: 401 });
  }

  try {
    const data = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
    req.userId = data.id;
    req.userRole = data.role;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Token expired, please relogin', status: 401 });
  }
};

module.exports = {
  verifyToken,
};
