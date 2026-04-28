const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/permission.middleware");

const {
  createProject,
  getProjects,
  editProject,
  getProjectStatuses,
  getAvailableProjects
} = require("../controllers/admin/project/projectController");

router.use(authMiddleware);

router.post("/projects", createProject);
router.get("/projects", getProjects);
router.put("/projects/:id", editProject);
router.get(
  "/projects/available",
  authMiddleware,
 getAvailableProjects
);
router.get("/project-statuses", getProjectStatuses);
module.exports = router;