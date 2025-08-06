import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GeographicService } from './geographic.service';

@Controller('map/api/v1/geographic')
@ApiTags('Geographic')
export class GeographicController {
  constructor(private readonly geographicService: GeographicService) {}

  @Get('countries')
  @ApiOperation({ summary: 'Get all countries' })
  async getCountries() {
    return await this.geographicService.getCountries();
  }

  @Get('countries/:countrySlug')
  @ApiOperation({ summary: 'Get country by slug' })
  async getCountryBySlug(@Param('countrySlug') countrySlug: string) {
    const country = await this.geographicService.getCountryBySlug(countrySlug);
    if (!country) {
      throw new NotFoundException(`Country "${countrySlug}" not found`);
    }
    return country;
  }

  @Get('countries/:countrySlug/cities')
  @ApiOperation({ summary: 'Get cities in country' })
  async getCities(@Param('countrySlug') countrySlug: string) {
    return await this.geographicService.getCitiesByCountry(countrySlug);
  }

  @Get('countries/:countrySlug/cities/:citySlug')
  @ApiOperation({ summary: 'Get city by slug' })
  async getCityBySlug(
    @Param('countrySlug') countrySlug: string,
    @Param('citySlug') citySlug: string
  ) {
    const city = await this.geographicService.getCityBySlug(countrySlug, citySlug);
    if (!city) {
      throw new NotFoundException(`City "${citySlug}" not found`);
    }
    return city;
  }

  @Get('countries/:countrySlug/cities/:citySlug/locations')
  @ApiOperation({ summary: 'Get locations in city' })
  async getLocations(
    @Param('countrySlug') countrySlug: string,
    @Param('citySlug') citySlug: string
  ) {
    return await this.geographicService.getLocationsByCity(countrySlug, citySlug);
  }
}