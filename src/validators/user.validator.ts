import { z } from 'zod';

// Schema لإنشاء مستخدم جديد (Create User)
export const createUserSchema = z.object({
  body: z.object({
    name: z.string()
    .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل')
    .max(50, 'الاسم طويل جداً'),

    email: z.string()
    .email('البريد الإلكتروني غير صالح'),

    password: z.string()
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),

  }),
});

// Schema لتحديث بيانات المستخدم (Update User) - جميع الحقل اختيارية (optional)
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'معرف المستخدم (ID) غير صالح'),
  }),
  body: z.object({
    name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل').optional(),
    email: z.string().email('البريد الإلكتروني غير صالح').optional(),
  }),
});

// Schema للتحقق من الـ ID في الـ Params فقط (لـ GetById و Delete)
export const userIdSchema = z.object({
  params: z.object({
    id: z.string().min(24, 'معرف المستخدم (ID) غير صالح'),
  }),
});

// استخراج أنواع البيانات (TypeScript Types) تلقائياً من Zod إذا أردت استخدامها
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;