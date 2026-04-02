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
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export const BranchModel = (mongoose.models.Branch as Model<IBranch>) || mongoose.model<IBranch>('Branch', BranchSchema);
