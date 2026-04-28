const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/permission.middleware");

const {
  createPermission,
  getPermissions,
  assignPermissionsToRole,
} = require("../controllers/permissions/permissionController");



router.use(authMiddleware, authorize("permission.manage"));



router.post("/", createPermission);
router.get("/", getPermissions);
router.post("/assign", assignPermissionsToRole);

module.exports = router;