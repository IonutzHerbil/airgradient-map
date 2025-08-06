import { Injectable, Logger } from '@nestjs/common';
import LocationRepository from './location.repository';
import axios from 'axios';

@Injectable()
export class GeographicService {
  private readonly logger = new Logger(GeographicService.name);
  private cache = new Map();

  constructor(private readonly locationRepository: LocationRepository) {}

  async getLocationInfo(lat: number, lng: number) {
    const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          format: 'json',
          lat: lat,
          lon: lng,
          'accept-language': 'en'
        },
        headers: { 'User-Agent': 'AirGradient/1.0' },
        timeout: 5000
      });

      const address = response.data?.address || {};
      const result = {
        city: address.city || address.town || address.village || 'Unknown City',
        country: address.country || 'Unknown Country'
      };

      this.cache.set(key, result);
      return result;
    } catch (error) {
      this.logger.warn(`Geocoding failed for ${lat}, ${lng}`);
      return { city: 'Unknown City', country: 'Unknown Country' };
    }
  }

  createSlug(text: string): string {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  async getCountries() {
    const locations = await this.locationRepository.retrieveLocations(0, 1000);
    const countryMap = new Map();

    for (const location of locations) {
      const info = await this.getLocationInfo(location.latitude, location.longitude);
      const count = countryMap.get(info.country) || 0;
      countryMap.set(info.country, count + 1);
    }

    return Array.from(countryMap.entries()).map(([country, count]) => ({
      country,
      slug: this.createSlug(country),
      locationCount: count
    }));
  }

  async getCitiesByCountry(countrySlug: string) {
    const locations = await this.locationRepository.retrieveLocations(0, 1000);
    const cityMap = new Map();

    for (const location of locations) {
      const info = await this.getLocationInfo(location.latitude, location.longitude);
      
      if (this.createSlug(info.country) === countrySlug) {
        const count = cityMap.get(info.city) || 0;
        cityMap.set(info.city, count + 1);
      }
    }

    return Array.from(cityMap.entries()).map(([city, count]) => ({
      city,
      slug: this.createSlug(city),
      locationCount: count
    }));
  }

  async getLocationsByCity(countrySlug: string, citySlug: string) {
    const locations = await this.locationRepository.retrieveLocations(0, 1000);
    const filtered = [];

    for (const location of locations) {
      const info = await this.getLocationInfo(location.latitude, location.longitude);
      
      if (this.createSlug(info.country) === countrySlug && 
          this.createSlug(info.city) === citySlug) {
        filtered.push(location);
      }
    }

    return filtered;
  }

  async getCountryBySlug(countrySlug: string) {
    const countries = await this.getCountries();
    return countries.find(c => c.slug === countrySlug) || null;
  }

  async getCityBySlug(countrySlug: string, citySlug: string) {
    const cities = await this.getCitiesByCountry(countrySlug);
    return cities.find(c => c.slug === citySlug) || null;
  }
}