const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { getCountries, getStates, getCities } = require("../controllers/admin/location/locationController");

router.use(authMiddleware);


router.get("/countries", getCountries);
router.get("/states/:countryId", getStates);
router.get("/cities/:stateId", getCities);

module.exports = router;