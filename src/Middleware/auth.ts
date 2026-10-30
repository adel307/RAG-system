import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_ENV, NODE_ENV } from '../config/env.js';

const JWT_SECRET = JWT_SECRET_ENV;

// توسيع واجهة الـ Request الخاصة بـ Express لتشمل بيانات المستخدم المستخرجة من التوكن
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware للتحقق من صحة الـ JWT وحماية المسارات
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!JWT_SECRET) {
      res.status(500).json({ 
        success: false, 
        message: NODE_ENV === 'development' ? "Error: JWT_SECRET is not defined in the environment variables." : 'حدث خطأ في إعدادات الخادم، يرجى التواصل مع الدعم الفني.' 
      });
      return;
    }

    // 2. استخراج الـ Token من الـ Header (بعد كلمة Bearer)
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'غير مصرح بالوصول، يرجى تسجيل الدخول أولاً (التوكن مفقود من الكوكي).' 
      });
      return;
    }

    // 3. فك تشفير والتحقق من صحة وصلاحية التوكن
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

    // 4. إرفاق بيانات المستخدم بـ Request ليتم استخدامها في الـ Controller اللاحق
    req.user = decoded;

    // 5. الانتقال للخطوة التالية (الـ Controller)
    next();

  } catch (error: any) {
    // التعامل مع الأخطاء الخاصة بالـ JWT (مثل انتهاء الصلاحية أو التعديل عليه)
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ 
        success: false, 
        message: 'انتهت صلاحية الجلسة (Token Expired)، يرجى تسجيل الدخول مجدداً.' 
      });
      return;
    }

    res.status(401).json({ 
      success: false, 
      message: 'توكن غير صالح (Invalid Token).' 
    });
  }
};

/**
 * (اختياري) Middleware للتحقق من صلاحيات المستخدم (Authorization / Roles)
 */
export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'ليس لديك الصلاحية للقيام بهذا الإجراء.' 
      });
      return;
    }
    next();
  };
};