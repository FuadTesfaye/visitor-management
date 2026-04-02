import mongoose, { Schema, Document, Model } from 'mongoose';
import { Department } from '@/types';

export interface IDepartment extends Omit<Department, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const DepartmentSchema = new Schema<IDepartment>({
  name: { type: String, required: true },
  branchId: { type: String, required: true },
});

DepartmentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    const obj = returnedObject as any;
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
  }
});

export const DepartmentModel = (mongoose.models.Department as Model<IDepartment>) || mongoose.model<IDepartment>('Department', DepartmentSchema);
