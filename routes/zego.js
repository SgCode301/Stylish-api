const express = require("express");
const router = express.Router();
const { getZegoToken } = require("../controller/zego.controller");

router.post("/token", getZegoToken);

module.exports = router;
