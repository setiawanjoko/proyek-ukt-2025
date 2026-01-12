const dotenv = require("dotenv");
const { pool } = require("../../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");
const logger = require("../../utils/logger");
dotenv.config();

// Utility function to hash tokens
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Utility function to generate tokens
function generateToken(payload, secret, expiresIn) {
  return jsonwebtoken.sign(payload, secret, { expiresIn });
}

// Utility function to calculate expiry dates
function calculateExpiry(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function loginService(email, password) {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1 LIMIT 1",
    [email]
  );
  const user = result.rows[0];
  if (user && bcrypt.compareSync(password, user.password)) {
    const accessToken = generateToken(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      "1h"
    );
    const refreshToken = generateToken(
      { id: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      "7d"
    );
    await saveRefreshTokenService(user.id, refreshToken);
    return { success: true, message: "Login successful", token: { accessToken, refreshToken } };
  }
  return { success: false, message: "Invalid credentials" };
}

async function registerService(fullname, email, password) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    const data = await pool.query(
      "INSERT INTO users (fullname, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id",
      [fullname, email, hashedPassword, "user"]
    );
    return {
      success: true,
      message: "User registered",
      userId: data.rows[0].id,
    };
  } catch (err) {
    logger.error(`Registration error: ${err.message}`);
    return { success: false, message: "Error during registration" };
  }
}

async function refreshTokenService(token) {
  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_REFRESH_SECRET);
    const tokenHash = hashToken(token);
    const result = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token_hash = $1 AND user_id = $2 AND is_revoked = FALSE AND expires_at > NOW()",
      [tokenHash, decoded.id]
    );
    if (result.rows.length === 0) {
      return { success: false, message: "Invalid or expired refresh token" };
    }
    const accessToken = generateToken(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      "1h"
    );
    const refreshToken = generateToken(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_REFRESH_SECRET,
      "7d"
    );
    await invalidateRefreshTokenService(token);
    await saveRefreshTokenService(decoded.id, refreshToken);
    return { success: true, accessToken, refreshToken };
  } catch (err) {
    logger.error(`Refresh token error: ${err.message}`);
    return { success: false, message: "Error during token refresh" };
  }
}

async function profileService(token) {
  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      "SELECT id, fullname, email, role FROM users WHERE id = $1",
      [decoded.id]
    );
    if (result.rows.length === 0) {
      return { success: false, message: "User not found" };
    }
    return { success: true, profile: result.rows[0] };
  } catch (err) {
    logger.error(`Profile retrieval error: ${err.message}`);
    return { success: false, message: "Error retrieving profile" };
  }
}

async function logoutService(token) {
  try {
    const result = await findRefreshTokenService(token);
    if (result.rows.length === 0) {
      return { success: false, message: "Invalid refresh token" };
    }
    await invalidateRefreshTokenService(token);
    return { success: true, message: "Logout successful" };
  } catch (err) {
    logger.error(`Logout error: ${err.message}`);
    return { success: false, message: "Error during logout" };
  }
}

async function findRefreshTokenService(token) {
  return await pool.query(
    "SELECT * FROM refresh_tokens WHERE token_hash = $1 AND is_revoked = FALSE AND expires_at > NOW()",
    [hashToken(token)]
  );
}

async function saveRefreshTokenService(userId, token) {
  return await pool.query(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    [userId, hashToken(token), calculateExpiry(7)]
  );
}

async function invalidateRefreshTokenService(token) {
  return await pool.query(
    "UPDATE refresh_tokens SET is_revoked = TRUE WHERE token_hash = $1",
    [hashToken(token)]
  );
}

module.exports = {
  loginService,
  registerService,
  refreshTokenService,
  profileService,
  logoutService,
};
