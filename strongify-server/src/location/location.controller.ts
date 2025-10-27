import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Req() req: Request, @Body() createLocationDto: CreateLocationDto) {
    try {
      const user = (req as any).user;
      if (user && user.userId) {
        // attach ownership info server-side
        (createLocationDto as any).user = { id: user.userId };
      }
      return await this.locationService.create(createLocationDto);
    } catch (err) {
      console.error('Location create failed', err);
      throw err;
    }
  }

  @Get()
  findAll() {
    return this.locationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    return this.locationService.update(id, updateLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationService.remove(id);
  }
}
