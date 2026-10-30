import { Schema, models, model } from 'mongoose';
import { UserInterface } from '../types/models';

const UserSchema = new Schema<UserInterface>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  password: { type: String, select: false, required: true, minlength: 6 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// التحقق مما إذا كان النموذج مُعرّفاً مسبقاً لتجنب أخطاء إعادة التعريف في Hot Reload
const User = models.User || model<UserInterface>('User', UserSchema);

export default User;