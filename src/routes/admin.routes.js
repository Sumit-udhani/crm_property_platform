const express = require("express");
const router = express.Router();

const { createUser, getRoles, getUsers } = require("../controllers/admin/userController");
const  authMiddleware = require("../middleware/auth.middleware");
const { isSuperAdmin } = require("../middleware/adminRole.middleware");


router.get("/roles",authMiddleware , isSuperAdmin, getRoles);

router.get("/users", authMiddleware, isSuperAdmin, getUsers);
router.post("/create/users", authMiddleware, isSuperAdmin, createUser);


module.exports = router;