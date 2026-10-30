import { Router } from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  Adminlogin,
  logout
} from '../controllers/user.controller.js';
import { createUserSchema, updateUserSchema, userIdSchema } from '../validators/user.validator.js';
import { validate } from '../Middleware/validate.middleware.js';
import { protect, restrictTo } from '../Middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    جلب جميع المستخدمين
 * @access  Public/Protected
 */
router.get('/',protect,restrictTo('admin'), getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    جلب مستخدم محدد بواسطة الـ ID
 * @access  Public/Protected
 */
router.get('/:id',protect,restrictTo('admin'), validate(userIdSchema), getUserById);

/**
 * @route   POST /api/users/Adminlogin
 * @desc    تسجيل دخول المستخدم (Login)
 * @access  Public
 */
router.post('/Adminlogin', Adminlogin);

/**
 * @route   POST /api/users/logout
 * @desc    تسجيل خروج المستخدم (Logout) ومسح الكوكي
 * @access  Protected
 */
router.post('/logout', protect, logout);

/**
 * @route   POST /api/users
 * @desc    إنشاء مستخدم جديد
 * @access  Protected
 */
router.post('/',protect,restrictTo('admin'), validate(createUserSchema), createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    تحديث بيانات مستخدم
 * @access  Public/Protected
 */
router.put('/:id',protect,restrictTo('admin'), validate(userIdSchema), validate(updateUserSchema), updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    حذف مستخدم
 * @access  Public/Protected
 */
router.delete('/:id',protect,restrictTo('admin'), validate(userIdSchema), deleteUser);

export default router;