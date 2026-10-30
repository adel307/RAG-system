import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {type UserInterface } from '../types/models.js';
import { JWT_SECRET_ENV, NODE_ENV } from '../config/env.js';

/**
 * 1. جلب جميع المستخدمين (Read - All)
 */
export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users: UserInterface[] = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. جلب مستخدم محدد بواسطة الـ ID (Read - Single)
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user: UserInterface | null = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const JWT_SECRET = JWT_SECRET_ENV;
const JWT_EXPIRES_IN = '7d';

/**
 * 6. تسجيل دخول المستخدم (Login) وتوليد JWT
 */
export const Adminlogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. التحقق من إدخال البريد الإلكتروني وكلمة المرور
    if (!email || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور بدقة.' 
      });
      return;
    }

    // 2. البحث عن المستخدم بواسطة الإيميل
    const user: UserInterface | null = await User.findOne({ email: email.trim() }).select('+password');

    if (!user) {
      res.status(401).json({ 
        success: false,
        message: 'The login details are incorrect (the email or password does not match).' 
      });
      return;
    }

    if (!JWT_SECRET) {
      res.status(401).json({ 
        success: false, 
        message: NODE_ENV === 'development' ? "Error: JWT_SECRET is not defined in the environment variables." : 'حدث خطأ في إعدادات الخادم، يرجى التواصل مع الدعم الفني.' 
      });
      return;
    }

    // 3. التحقق من مطابقة كلمة المرور المدخلة مع المشفرة في قاعدة البيانات
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ 
        success: false, 
        message: 'The login details are incorrect (the email or password does not match).' 
      });
      return;
    }

    // 4. التحقق من أن دور المستخدم هو Admin فقط
    if (user.role !== 'admin') {
      res.status(403).json({ 
        success: false, 
        message: 'غير مسموح لك بتسجيل الدخول، هذه البوابة مخصصة للمسؤولين (Admins) فقط.'
      });
      return;
    }

    // 5. إعداد الـ Payload الخاص بالـ JWT
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role
    };

    // 6. توليد التوكن
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: NODE_ENV === 'production', // يعمل عبر HTTPS فقط في بيئة الإنتاج
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 أيام (تتطابق مع expiresIn: '7d')
    });

    // 7. استبعاد كلمة المرور من بيانات المستخدم المُرسلة في الاستجابة
    const userObject = user.toObject();
    const { password: _, ...userWithoutPassword } = userObject;

    // 8. إرسال الاستجابة بنجاح
    res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      data: userWithoutPassword
    });

  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ غير متوقع، يجدر المحاولة لاحقاً.',
      error: NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

/**
 * 7. تسجيل الخروج (Logout) ومسح الـ Cookie
 */
export const logout = (_req: Request, res: Response): void => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الخروج',
      error: NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 3. إنشاء مستخدم جديد (Create)
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, role, password } = req.body;

    // التحقق من وجود المستخدم مسبقاً
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ success: false, message: 'The email is already in use' });
      return;
    }

    const existingPassword = await User.findOne({ password });
    if (existingPassword) {
      res.status(400).json({ success: false, message: 'The password is already in use' });
      return;
    }

    if (role === 'admin' ) {
      res.status(400).json({ success: false, message: 'There is already an admin user' });
      return;
    }

    const newUser: UserInterface = await User.create({ name, email, role : "user", password });
    res.status(201).json({ success: true, data: newUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. تحديث بيانات مستخدم (Update)
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true, runValidators: true } // لضمان إرجاع النسخة المحدثة وتطبيق شروط الـ Schema
    );

    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
      return;
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. حذف مستخدم (Delete)
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
      return;
    }

    res.status(200).json({ success: true, message: 'تم حذف المستخدم بنجاح', data: deletedUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};