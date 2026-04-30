const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");


const {
  createBranch,
  getBranches,
  editBranch,
  deleteBranch
} = require("../controllers/admin/branches/branchesController");
const {detectSuperAdmin} = require("../middleware/adminRole.middleware")

router.use(authMiddleware,detectSuperAdmin);

router.post("/branches", createBranch);
router.get("/branches", getBranches);
router.put("/branches/:id", editBranch);

module.exports = router;