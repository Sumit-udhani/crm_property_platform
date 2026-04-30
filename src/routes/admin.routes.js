const express = require("express");
const router = express.Router();

const { createUser,  getUsers,editUser,updateUserStatus,deleteUser } = require("../controllers/admin/userController");
const  authMiddleware = require("../middleware/auth.middleware");
const {detectSuperAdmin} = require("../middleware/adminRole.middleware")

// const { authorize } = require("../middleware/permission.middleware");


router.use(authMiddleware,detectSuperAdmin);
router.get("/users",  getUsers);
router.post("/create/users",  createUser);
router.put("/users/:id",      editUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/status",   updateUserStatus);

module.exports = router;