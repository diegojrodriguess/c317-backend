import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConsultationDocument = Consultation & Document;

@Schema({ timestamps: true })
export class Consultation {
  @Prop({ required: true })
  userId: string;

  @Prop()
  targetWord: string;

  @Prop()
  transcription: string;

  @Prop()
  score: number;

  @Prop()
  feedback: string;

  @Prop({ type: [String], default: [] })
  errors: string[];

  @Prop({ type: [String], default: [] })
  suggestions: string[];

  @Prop({ type: Object, default: {} })
  highlights: any;

  @Prop()
  audioFilename: string;

  @Prop()
  transcriptionProvider: string;

  @Prop()
  pdfPath: string;
}

export const ConsultationSchema = SchemaFactory.createForClass(Consultation);
