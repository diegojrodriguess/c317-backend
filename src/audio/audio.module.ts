import { Module } from '@nestjs/common';
import { AudioController } from './audio_controller';
import { AudioService } from './audio_service';

@Module({
    controllers: [AudioController],
    providers: [AudioService],
    exports: [AudioService]
})
export class AudioModule {}