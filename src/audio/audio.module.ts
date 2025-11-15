import { Module } from '@nestjs/common';
import { AudioController } from './audio_controller';
import { AudioService } from './audio_service';
import { ConsultationService } from './consultation.service';
import { PdfService } from './pdf.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Consultation, ConsultationSchema } from './schemas/consultation.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Consultation.name, schema: ConsultationSchema }])
    ],
    controllers: [AudioController],
    providers: [AudioService, ConsultationService, PdfService],
    exports: [AudioService]
})
export class AudioModule {}