import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-meal-log',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './meal-log.component.html',
  styleUrls: ['./meal-log.component.css']
})
export class MealLogComponent implements OnInit {
  // form fields with their initial empty values
  food = '';
  calories: number | null = null;
  carbs: number | null = null;
  protein: number | null = null;
  fats: number | null = null;
  meals: any[] = [];
  calorieGoal: number = 2000;

  // variables to hold total values
  // for calories, carbs, protein, and fats
  totalCalories = 0;
  totalCarbs = 0;
  totalProtein = 0;
  totalFats = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMeals();
    this.fetchUserGoal();
  }

  // Fetches the user's calorie goal from the server
  // and updates the calorieGoal variable with the response data
  fetchUserGoal() {
    const email = JSON.parse(localStorage.getItem('user') || '{}').email;
    if (email) {
      this.http.post<any>('http://localhost:5000/api/get-user-goals', { email }).subscribe({
        next: res => {
          if (res.success && res.user?.calorieGoal) {
            this.calorieGoal = res.user.calorieGoal;
          }
        },
        error: err => {
          console.error('Error fetching calorie goal:', err);
        }
      });
    }
  }

  // Called when the form is submitted
  // Validates the form and sends a POST request to the server to add a meal
  addMeal(form: any): void {
    if (form.invalid) return;

    const email = JSON.parse(localStorage.getItem('user') || '{}').email;
    if (!email) return;

    this.http.post<any>('http://localhost:5000/api/meals', {
      // Sends the meal data to the server
      email,
      food: this.food,
      calories: this.calories,
      carbs: this.carbs,
      protein: this.protein,
      fats: this.fats,
      date: new Date().toISOString().split('T')[0]
    }).subscribe({
      next: res => {
        // Check if the response is successful and contains meal data
        if (res.success) {
          this.food = '';
          this.calories = this.carbs = this.protein = this.fats = null;
          this.loadMeals();
        } else {
          alert(res.message);
        }
      },
      // Handle error response from the server
      error: err => {
        console.error('Add meal error:', err);
      }
    });
  }

  loadMeals(): void {
    // Fetches the meals from the server using the user's email
    // and updates the meals variable with the response data
    const email = JSON.parse(localStorage.getItem('user') || '{}').email;
    if (!email) return;

    this.http.post<any>('http://localhost:5000/api/get-meals', { email }).subscribe({
      next: res => {
        if (res.success) {
          this.meals = res.meals || [];
          this.calculateTotals();
        }
      },
      error: err => {
        console.error('Load meals error:', err);
      }
    });
  }

  // Calculates the total values for calories, carbs, protein, and fats
  // by iterating through the meals array and summing up the values
  calculateTotals() {
    this.totalCalories = this.totalCarbs = this.totalProtein = this.totalFats = 0;
    for (const meal of this.meals) {
      this.totalCalories += meal.calories || 0;
      this.totalCarbs += meal.carbs || 0;
      this.totalProtein += meal.protein || 0;
      this.totalFats += meal.fats || 0;
    }
  }
}
