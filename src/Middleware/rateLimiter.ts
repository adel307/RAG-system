import rateLimit from 'express-rate-limit';

// Rate limiter عام للـ APIs العادية
export const globalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100, // أقصى حد 100 ريكويست لكل IP خلال الـ 15 دقيقة
    standardHeaders: true, // بيعرض هيدرز الـ RateLimit في الـ Response
    legacyHeaders: false, 
    message: {
        success: false,
        message: 'لقد تجاوزت الحد المسموح من الطلبات، يرجى المحاولة لاحقاً.',
    },
});

// Rate limiter صارع للـ Endpoints الحساسة (زي الـ Login أو Sign up)
export const strictAuthLimiter = rateLimit({
    windowMs: 60 * 1000, // دقيقة واحدة
    max: 5, // 5 محاولات فقط في الدقيقة
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'عدد محاولات تسجيل دخول غير مسموح به، يرجى الانتظار لمدة دقيقة.',
    },
});