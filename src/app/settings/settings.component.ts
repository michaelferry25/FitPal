import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  darkMode: boolean = false;
  notifications: boolean = true;
  notificationFrequency: string = 'daily';
  measurementSystem: string = 'metric';
  weightGoal: number | null = null;
  shareProgress: boolean = false;
  reminderTime: string = '';
  calorieGoal: number | null = null;

  email: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.email) {
      this.email = user.email;
    }
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      this.darkMode = savedDarkMode === 'true';
    }
    this.applyDarkMode();
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    this.applyDarkMode();
  }

  applyDarkMode(): void {
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  saveSettings(): void {
    if (!this.email) {
      alert('User not found. Please login.');
      return;
    }

    const settings = {
      email: this.email,
      darkMode: this.darkMode,
      notifications: this.notifications,
      notificationFrequency: this.notificationFrequency,
      measurementSystem: this.measurementSystem,
      weightGoal: this.weightGoal,
      shareProgress: this.shareProgress,
      reminderTime: this.reminderTime,
      calorieGoal: this.calorieGoal
    };

    this.http.post('http://localhost:5000/api/save-settings', settings).subscribe({
      next: (res: any) => {
        if (res.success) {
          localStorage.setItem('darkMode', this.darkMode.toString());
          alert('Settings saved successfully!');
        } else {
          alert(res.message || 'Failed to save settings.');
        }
      },
      error: (err) => {
        console.error('Error saving settings:', err);
        alert('Server error while saving settings.');
      }
    });
  }
}
