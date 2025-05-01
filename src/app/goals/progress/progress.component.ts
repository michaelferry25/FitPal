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
  //Goal selection
  selectedGoal: 'lose' | 'maintain' | 'gain' | null = null;
  difficulty = ''; // '0.25', '0.5', '1' for lose/gain, '0' for maintain
  // Options for difficulty selection based on goal
  difficultyOptions: { label: string; value: string; info: string }[] = [];

  currentWeight: number | null = null; // Current weight of the user
  goalWeight: number | null = null; // Goal weight of the user
  estimatedWeeks: number | null = null; // Estimated weeks to reach the goal weight

  // User's personal information
  gender: 'male' | 'female' | '' = ''; 
  age: number | null = null; 
  height: number | null = null;
  activityLevel: string = '';

  // Caloric needs
  maintenanceCalories: number | null = null;
  recommendedCalories: number | null = null;

  // To show the results of the calorie calculation
  showCalorieResults = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // Fetch user data from local storage and set the initial values
    const email = JSON.parse(localStorage.getItem('user') || '{}').email;

    this.http.post<any>('http://localhost:5000/api/get-user-goals', { email }).subscribe(res => {
      if (res.success && res.user) { 
        // Set the initial values based on the user data
        const user = res.user;
        this.gender = user.gender || '';
        this.age = user.age || null;
        this.height = user.height || null;
        this.activityLevel = user.activityLevel || '';
        this.recommendedCalories = user.calorieGoal || null;
      }
    });
  }

  // Method to select the goal (lose, maintain, gain)
  // and reset the difficulty, current weight, goal weight, estimated weeks, and calorie results
  selectGoal(goal: 'lose' | 'maintain' | 'gain') {
    this.selectedGoal = goal;
    this.difficulty = '';
    this.currentWeight = null;
    this.goalWeight = null;
    this.estimatedWeeks = null;
    this.maintenanceCalories = null;
    this.recommendedCalories = null;
    this.showCalorieResults = false;

    // Set the difficulty options based on the selected goal
    // lose, maintain  or gain
    if (goal === 'lose') {
      this.difficultyOptions = [
        // Lose weight options
        { label: '0.25 kg/week - Very Easy', value: '0.25', info: 'Slow and sustainable fat loss' },
        { label: '0.5 kg/week - Moderate', value: '0.5', info: 'Balanced approach to cutting' },
        { label: '1 kg/week - Aggressive', value: '1', info: 'Harder to sustain, faster results' }
      ];
    } else if (goal === 'gain') {
      this.difficultyOptions = [
        // Gain weight options
        { label: '0.25 kg/week - Lean Bulk', value: '0.25', info: 'Minimizes fat gain' },
        { label: '0.5 kg/week - Classic Bulk', value: '0.5', info: 'Muscle gain with some fat' },
        { label: '1 kg/week - Aggressive Bulk', value: '1', info: 'Fast gain, more fat possible' }
      ];
    } else {
      this.difficultyOptions = [
        // Maintain weight options
        { label: 'Maintain - No change', value: '0', info: 'Keep your current weight stable' }
      ];
    }
  }

  // Method to set the current weight and goal weight
  get selectedDifficultyInfo(): string {
    const match = this.difficultyOptions.find(opt => opt.value === this.difficulty);
    return match ? match.info : '';
  }

  // Method to calculate the estimated weeks to reach the goal weight
  // based on the current weight, goal weight and difficulty
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

  // Method to calculate the maintenance and recommended calories
  // based on the user's personal information and activity level
  calculateCalories(): void {
    if (!this.gender || !this.age || !this.height || !this.currentWeight || !this.activityLevel) {
      // Check if all required fields are filled
      // If not, show an alert message and return
      alert('Please fill in all fields before calculating.');
      return;
    }

    // Calculate the Basal Metabolic Rate which is BMR, using the Mifflin-St Jeor equation
    // BMR = 10 * weight + 6.25 * height - 5 * age
    const weight = this.currentWeight;
    const height = this.height;
    const age = this.age;

    // Convert height from cm to m for the calculation
    let bmr = this.gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

    // Calculate the Total Daily Energy Expenditure (TDEE) using the activity level
    // TDEE = BMR * activity level multiplier
    const activityFactors: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725
    };

    // Check if the activity level is valid and set the multiplier accordingly
    const multiplier = activityFactors[this.activityLevel];
    const tdee = bmr * multiplier;

    // Round the TDEE to the nearest whole number
    // and set the maintenance calories and recommended calories
    this.maintenanceCalories = Math.round(tdee);

    // Calculate the recommended calories based on the selected goal
    // If the goal is to lose weight, subtract 20% of TDEE
    const goal = this.selectedGoal;
    const diff = goal === 'lose' ? -0.2 : goal === 'gain' ? 0.15 : 0;
    this.recommendedCalories = Math.round(tdee * (1 + diff));

    this.showCalorieResults = true;
  }

  // Method to save the calculated goal to the server
  // and show an alert message to the user
  saveCalculatedGoal(): void {
    const email = JSON.parse(localStorage.getItem('user') || '{}').email;

    if (!email) {
      // Check if the user is logged in
      // If not, show an alert message and return
      alert('User not logged in');
      return;
    }

    this.http.post('http://localhost:5000/api/save-goals', {
      // Send the calculated goal to the server
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
    // Navigate to the meal log page when the user clicks the button
    // This allows the user to start logging their meals and progress
    this.router.navigate(['/meal-log']);
  }
}
