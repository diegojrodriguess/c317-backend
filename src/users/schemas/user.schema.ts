import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // cria automaticamente createdAt e updatedAt
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  age: number;

  @Prop()
  speechDifficultyType: string;

  @Prop({ type: [String], default: [] })
  roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
