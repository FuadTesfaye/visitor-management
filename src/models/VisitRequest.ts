import mongoose, { Schema, Document, Model } from 'mongoose';
import { VisitRequest } from '@/types';

export interface IVisitRequest extends Omit<VisitRequest, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const VisitRequestSchema = new Schema<IVisitRequest>({
  visitorId: { type: String, required: true },
  visitorName: { type: String, required: true },
  faydaNumber: { type: String, required: true },
  phone: { type: String, required: true },
  branchId: { type: String, required: true },
  departmentId: { type: String, required: true },
  departmentName: { type: String, required: true },
  purpose: { type: String, required: true },
  requestedDateTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'checked-in', 'checked-out'], 
    default: 'pending' 
  },
  visitType: { 
    type: String, 
    enum: ['digital', 'walk-in'], 
    required: true 
  },
  visitCode: { type: String, default: null },
  submittedBy: { type: String, default: null },
  qrToken: { type: String, default: null },
  qrExpiration: { type: Date, default: null },
  approvedBy: { type: String, default: null },
  approvedAt: { type: Date, default: null },
  rejectedBy: { type: String, default: null },
  rejectedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null },
}, { timestamps: true });

VisitRequestSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export const VisitRequestModel = (mongoose.models.VisitRequest as Model<IVisitRequest>) || mongoose.model<IVisitRequest>('VisitRequest', VisitRequestSchema);
