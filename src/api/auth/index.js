const { Router } = require("express");
const {
  login,
  register,
  refreshToken,
  profile,
  logout,
} = require("./authController.js");
const routes = new Router();

routes.post("/login", login);

routes.post("/register", register);

routes.post("/refresh-token", refreshToken);

routes.get("/profile", profile);

routes.post("/logout", logout);

// Export the routes
module.exports = routes;
