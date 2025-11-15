import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Consultation, ConsultationDocument } from './schemas/consultation.schema';

@Injectable()
export class ConsultationService {
  constructor(
    @InjectModel(Consultation.name) private consultationModel: Model<ConsultationDocument>,
  ) {}

  async saveConsultation(data: Partial<Consultation>): Promise<ConsultationDocument> {
    const created = new this.consultationModel(data);
    return created.save();
  }

  async getHistoryForUser(userId: string, limit = 20) {
    return this.consultationModel.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
  }

  async updateConsultationPdf(id: string, pdfPath: string) {
    return this.consultationModel.findByIdAndUpdate(id, { pdfPath }, { new: true }).lean();
  }
}
