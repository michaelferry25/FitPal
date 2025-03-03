import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  darkMode = false;
  notifications = true;
  notificationFrequency = 'instant';
  measurementSystem = 'metric';
  weightGoal = 70;
  shareProgress = false;
  reminderTime = '08:00';
  calorieGoal = 2000;
  saveSettings(): void {
    alert('Settings saved');
  }
}
