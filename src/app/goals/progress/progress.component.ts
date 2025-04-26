import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {
  selectedGoal: 'lose' | 'maintain' | 'gain' | null = null;
  difficulty = '';
  difficultyOptions: { label: string; value: string; info: string }[] = [];

  currentWeight: number | null = null;
  goalWeight: number | null = null;
  estimatedWeeks: number | null = null;

  gender: 'male' | 'female' | '' = '';
  age: number | null = null;
  height: number | null = null;
  activityLevel: string = '';

  maintenanceCalories: number | null = null;
  recommendedCalories: number | null = null;

  showCalorieResults = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const email = JSON.parse(localStorage.getItem('user') || '{}').email;

    this.http.post<any>('http://localhost:5000/api/get-user-goals', { email }).subscribe(res => {
      if (res.success && res.user) {
        const user = res.user;
        this.gender = user.gender || '';
        this.age = user.age || null;
        this.height = user.height || null;
        this.activityLevel = user.activityLevel || '';
        this.recommendedCalories = user.calorieGoal || null;
      }
    });
  }

  selectGoal(goal: 'lose' | 'maintain' | 'gain') {
    this.selectedGoal = goal;
    this.difficulty = '';
    this.currentWeight = null;
    this.goalWeight = null;
    this.estimatedWeeks = null;
    this.maintenanceCalories = null;
    this.recommendedCalories = null;
    this.showCalorieResults = false;

    if (goal === 'lose') {
      this.difficultyOptions = [
        { label: '0.25 kg/week - Very Easy', value: '0.25', info: 'Slow and sustainable fat loss' },
        { label: '0.5 kg/week - Moderate', value: '0.5', info: 'Balanced approach to cutting' },
        { label: '1 kg/week - Aggressive', value: '1', info: 'Harder to sustain, faster results' }
      ];
    } else if (goal === 'gain') {
      this.difficultyOptions = [
        { label: '0.25 kg/week - Lean Bulk', value: '0.25', info: 'Minimizes fat gain' },
        { label: '0.5 kg/week - Classic Bulk', value: '0.5', info: 'Muscle gain with some fat' },
        { label: '1 kg/week - Aggressive Bulk', value: '1', info: 'Fast gain, more fat possible' }
      ];
    } else {
      this.difficultyOptions = [
        { label: 'Maintain - No change', value: '0', info: 'Keep your current weight stable' }
      ];
    }
  }

  get selectedDifficultyInfo(): string {
    const match = this.difficultyOptions.find(opt => opt.value === this.difficulty);
    return match ? match.info : '';
  }

  calculateTime(): void {
    if (
      this.currentWeight !== null &&
      this.goalWeight !== null &&
      this.difficulty !== ''
    ) {
      const rate = parseFloat(this.difficulty);
      if (rate === 0) {
        this.estimatedWeeks = 0;
      } else {
        const diff = Math.abs(this.goalWeight - this.currentWeight);
        this.estimatedWeeks = Math.ceil(diff / rate);
      }
    } else {
      this.estimatedWeeks = null;
    }
  }

  calculateCalories(): void {
    if (!this.gender || !this.age || !this.height || !this.currentWeight || !this.activityLevel) {
      alert('Please fill in all fields before calculating.');
      return;
    }

    const weight = this.currentWeight;
    const height = this.height;
    const age = this.age;

    let bmr = this.gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

    const activityFactors: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725
    };

    const multiplier = activityFactors[this.activityLevel];
    const tdee = bmr * multiplier;

    this.maintenanceCalories = Math.round(tdee);

    const goal = this.selectedGoal;
    const diff = goal === 'lose' ? -0.2 : goal === 'gain' ? 0.15 : 0;
    this.recommendedCalories = Math.round(tdee * (1 + diff));

    this.showCalorieResults = true;
  }

  saveCalculatedGoal(): void {
    const email = JSON.parse(localStorage.getItem('user') || '{}').email;

    if (!email) {
      alert('User not logged in');
      return;
    }

    this.http.post('http://localhost:5000/api/save-goals', {
      email,
      gender: this.gender,
      age: this.age,
      height: this.height,
      activityLevel: this.activityLevel,
      calorieGoal: this.recommendedCalories
    }).subscribe({
      next: () => {
        alert('Goal saved successfully!');
      },
      error: () => {
        alert('Error saving your goal. Try again.');
      }
    });
  }

  startLogging(): void {
    this.router.navigate(['/meal-log']);
  }
}
