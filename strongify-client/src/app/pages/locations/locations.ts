import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from '../../shared/map/map';

@Component({
  selector: 'app-locations',
  imports: [CommonModule, MapComponent],
  templateUrl: './locations.html',
  styleUrl: './locations.scss'
})
export class Locations {}

