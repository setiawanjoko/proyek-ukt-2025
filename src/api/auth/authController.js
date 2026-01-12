const {
  loginService,
  registerService,
  refreshTokenService,
  profileService,
  logoutService,
} = require("./authService.js");
const { validateFields } = require("../../utils/helpers.js");
const logger = require("../../utils/logger.js");

async function login(req, res) {
  const validationError = validateFields(["email", "password"], req.body);
  if (validationError) {
    return res.status(400).json(validationError);
  }

  try {
    const result = await loginService(req.body.email, req.body.password);
    res.json(result);
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function register(req, res) {
  const validationError = validateFields(
    ["fullname", "email", "password"],
    req.body
  );
  if (validationError) {
    return res.status(400).json(validationError);
  }

  try {
    const result = await registerService(
      req.body.fullname,
      req.body.email,
      req.body.password
    );
    res.json(result);
  } catch (err) {
    logger.error(`Registration error: ${err.message}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function refreshToken(req, res) {
  const validationError = validateFields(["refreshToken"], req.body);
  if (validationError) {
    return res.status(400).json(validationError);
  }

  try {
    const result = await refreshTokenService(req.body.refreshToken);
    res.json(result);
  } catch (err) {
    logger.error(`Refresh token error: ${err.message}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function profile(req, res) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const result = await profileService(token);
    res.json(result);
  } catch (err) {
    logger.error(`Profile error: ${err.message}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function logout(req, res) {
  const validationError = validateFields(["refreshToken"], req.body);
  if (validationError) {
    return res.status(400).json(validationError);
  }

  try {
    const result = await logoutService(req.body.refreshToken);
    res.json(result);
  } catch (err) {
    logger.error(`Logout error: ${err.message}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  login,
  register,
  refreshToken,
  profile,
  logout,
};
