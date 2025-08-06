import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import LocationRepository from './location.repository';
import { GeographicController } from './geographic.controller'; 
import { GeographicService } from './geographic.service'; 

@Module({
  controllers: [LocationController, GeographicController], 
  providers: [LocationService, LocationRepository, GeographicService], 
  exports: [LocationService, GeographicService],
})
export class LocationModule {}