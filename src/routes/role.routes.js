const express = require('express');
const router = express.Router();
const { getRoles, createRole, editRole, deleteRole } = require('../controllers/admin/roleController');
const  authMiddleware = require("../middleware/auth.middleware");
const { isSuperAdmin } = require("../middleware/adminRole.middleware");

router.get  ('/roles',     authMiddleware, isSuperAdmin, getRoles);

router.post  ('/roles',     authMiddleware, isSuperAdmin, createRole);
router.put   ('/roles/:id', authMiddleware, isSuperAdmin, editRole);
router.delete('/roles/:id', authMiddleware, isSuperAdmin, deleteRole);
module.exports = router;