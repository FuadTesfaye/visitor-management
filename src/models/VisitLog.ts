import mongoose, { Schema, Document, Model } from 'mongoose';
import { VisitLog } from '@/types';

export interface IVisitLog extends Omit<VisitLog, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const VisitLogSchema = new Schema<IVisitLog>({
  visitRequestId: { type: String, required: true },
  checkInTime: { type: Date, required: true },
  checkOutTime: { type: Date, default: null },
  processedBy: { type: String, required: true },
}, { timestamps: true });

VisitLogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    const obj = returnedObject as any;
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
  }
});

export const VisitLogModel = (mongoose.models.VisitLog as Model<IVisitLog>) || mongoose.model<IVisitLog>('VisitLog', VisitLogSchema);
