const express = require('express');
const {
  getUsers,
  updateUserRole,
  deleteUser
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleGuard');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
