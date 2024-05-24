const { Router } = require("express");
const { register, login, getUser } = require("../controllers/auth");
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user", getUser);
module.exports = router;
