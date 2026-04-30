const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/permission.middleware");

const {
  createProject,
  getProjects,
  editProject,
  getProjectStatuses,
  getAvailableProjects,
  deleteProject
} = require("../controllers/admin/project/projectController");
const {detectSuperAdmin} = require("../middleware/adminRole.middleware")

router.use(authMiddleware,detectSuperAdmin);

router.post("/projects", createProject);
router.get("/projects", getProjects);
router.put("/projects/:id", editProject);
router.get(
  "/projects/available",
 getAvailableProjects
);
router.delete(
  "/projects/:id",


  deleteProject
);
router.get("/project-statuses", getProjectStatuses);
module.exports = router;