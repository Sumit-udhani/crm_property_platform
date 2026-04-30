const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");


const {
  createOrganization,
  getOrganizations,
  editOrganization,
  deleteOrganization
} = require("../controllers/admin/organization/organizationController");
const {detectSuperAdmin} = require("../middleware/adminRole.middleware")

router.use(authMiddleware,detectSuperAdmin);
router.delete(
  "/organizations/:id",

  deleteOrganization
);
router.post("/organizations", createOrganization);
router.get("/organizations", getOrganizations);
router.put("/organizations/:id", editOrganization);

module.exports = router;