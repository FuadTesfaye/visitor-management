import mongoose, { Schema, Document, Model } from 'mongoose';
import { User } from '@/types';

export interface IUser extends Omit<User, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['visitor', 'staff', 'head', 'security', 'superadmin'], 
    required: true 
  },
  branchId: { type: String, default: null },
  departmentId: { type: String, default: null },
}, { timestamps: true });

UserSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    const obj = returnedObject as any;
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
  }
});

// Avoid OverwriteModelError in Next.js development
export const UserModel = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
