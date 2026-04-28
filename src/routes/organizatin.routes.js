const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");


const {
  createOrganization,
  getOrganizations,
  editOrganization,
} = require("../controllers/admin/organization/organizationController");

router.use(authMiddleware);

router.post("/organizations", createOrganization);
router.get("/organizations", getOrganizations);
router.put("/organizations/:id", editOrganization);

module.exports = router;