const express = require("express");
const router = express.Router();

const { createUser, getRoles, getUsers,editUser,updateUserStatus } = require("../controllers/admin/userController");
const  authMiddleware = require("../middleware/auth.middleware");
const { isSuperAdmin } = require("../middleware/adminRole.middleware");


router.get("/roles",authMiddleware , isSuperAdmin, getRoles);

router.get("/users", authMiddleware, isSuperAdmin, getUsers);
router.post("/create/users", authMiddleware, isSuperAdmin, createUser);
router.put("/users/:id",    authMiddleware, isSuperAdmin, editUser);
router.patch("/users/:id/status", authMiddleware, isSuperAdmin, updateUserStatus);

module.exports = router;