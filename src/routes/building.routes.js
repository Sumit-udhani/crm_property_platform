const express = require("express");
const router = express.Router();

const buildingController = require("../controllers/admin/buildings/buildingsController");
const authMiddleware = require("../middleware/auth.middleware");
const {detectSuperAdmin} = require("../middleware/adminRole.middleware")

router.use(authMiddleware,detectSuperAdmin);
router.get("/types", buildingController.getBuildingTypes);
router.post("/", buildingController.createBuilding);
router.get("/", buildingController.getBuildings);
router.put("/:id", buildingController.updateBuilding);
router.delete("/:id", buildingController.deleteBuilding);

module.exports = router;