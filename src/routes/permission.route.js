const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/permission.middleware");

const {
  createPermission,
  getPermissionsByRole,
  assignPermissions,
} = require("../controllers/permissions/permissionController");
const { detectSuperAdmin } = require("../middleware/adminRole.middleware");



router.use(authMiddleware, detectSuperAdmin);

router.get("/:role_id", getPermissionsByRole);
router.post("/assign", assignPermissions);

module.exports = router;