

const express = require("express");
const router = express.Router();

const moduleController = require("../controllers/admin/modules/moduleController");

const {detectSuperAdmin} = require("../middleware/adminRole.middleware")
const  authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware,detectSuperAdmin);

router.post("/modules", moduleController.createModule);
router.get("/modules", moduleController.getModules);
router.put("/modules/:id",  moduleController.editModule);
router.delete("/modules/:id", moduleController.deleteModule);


module.exports = router;