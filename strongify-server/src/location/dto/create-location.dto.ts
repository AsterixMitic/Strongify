import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateLocationDto {
	@IsString()
	name: string;

	// latitude and longitude come as numbers
	@IsNumber()
	latitude: number;

	@IsNumber()
	longitude: number;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	imageUrl?: string;
}
