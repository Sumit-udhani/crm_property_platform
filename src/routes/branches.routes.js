const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");


const {
  createBranch,
  getBranches,
  editBranch,
} = require("../controllers/admin/branches/branchesController");

router.use(authMiddleware);

router.post("/branches", createBranch);
router.get("/branches", getBranches);
router.put("/branches/:id", editBranch);

module.exports = router;