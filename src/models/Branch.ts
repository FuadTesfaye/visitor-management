import mongoose, { Schema, Document, Model } from 'mongoose';
import { Branch } from '@/types';

export interface IBranch extends Omit<Branch, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const BranchSchema = new Schema<IBranch>({
  name: { type: String, required: true },
});

BranchSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    const obj = returnedObject as any;
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
  }
});

export const BranchModel = (mongoose.models.Branch as Model<IBranch>) || mongoose.model<IBranch>('Branch', BranchSchema);
