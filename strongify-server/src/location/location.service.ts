import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './location.entity';

@Injectable()
export class LocationService {
   constructor(
    @InjectRepository(Location)
    private repo: Repository<Location>,
  ) {}

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const location = this.repo.create(createLocationDto);
    return this.repo.save(location);
  }

  async findAll(): Promise<Location[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Location> {
    const location = await this.repo.findOne({ where: { id: id } });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async update(id: string, updateLocationDto: UpdateLocationDto): Promise<Location> {
    const location = await this.findOne(id);
    await this.repo.update(id, updateLocationDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const location = await this.findOne(id);
    await this.repo.remove(location);
  }

  async findNearby(latitude: number, longitude: number, radiusKm: number = 5): Promise<Location[]> {
    // TODO: implement finding nearby locations
    const query = this.repo.createQueryBuilder('location')
    return query.getMany();
  }
}
