const express = require('express');
const router = express.Router();
const { getRoles, createRole, editRole, deleteRole } = require('../controllers/admin/roleController');
const  authMiddleware = require("../middleware/auth.middleware");
const {detectSuperAdmin} = require("../middleware/adminRole.middleware")
router.use(authMiddleware,detectSuperAdmin);


router.get  ('/roles',     getRoles);

router.post  ('/roles',     createRole);
router.put   ('/roles/:id', editRole);
router.delete('/roles/:id', deleteRole);
module.exports = router;