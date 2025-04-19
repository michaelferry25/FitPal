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
  Math = Math;

  food = '';
  category = 'Breakfast';
  quantity = 1;
  unit = 'g';
  calories = 0;
  protein = 0;
  carbs = 0;
  fats = 0;

  meals: any[] = [];
  calorieGoal: number | null = null;
  noGoal = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const email = JSON.parse(localStorage.getItem('user') || '{}').email;

    this.http.post<any>('http://localhost:5000/api/get-user-goals', { email }).subscribe({
      next: res => {
        if (res.success && res.user.calorieGoal) {
          this.calorieGoal = res.user.calorieGoal;
          this.loadMeals();
        } else {
          this.noGoal = true;
        }
      },
      error: err => {
        console.error(err);
        this.noGoal = true;
      }
    });
  }

  get totals() {
    return this.meals.reduce((acc, meal) => {
      acc.calories += meal.calories || 0;
      acc.carbs += meal.carbs || 0;
      acc.protein += meal.protein || 0;
      acc.fats += meal.fats || 0;
      return acc;
    }, { calories: 0, carbs: 0, protein: 0, fats: 0 });
  }

  getMacroBarWidth(actual: number, target: number): string {
    const percent = (actual / target) * 100;
    return Math.min(percent, 100) + '%';
  }

  getMacroBarClass(actual: number, target: number): string {
    return actual > target ? 'bg-danger overflow' : 'bg-success';
  }

  logMeal(): void {
    const email = JSON.parse(localStorage.getItem('user') || '{}').email;
    const meal = {
      food: this.food,
      category: this.category,
      quantity: this.quantity,
      unit: this.unit,
      calories: this.calories,
      carbs: this.carbs,
      protein: this.protein,
      fats: this.fats,
      email
    };

    this.http.post('http://localhost:5000/api/meals', meal).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.resetForm();
          this.loadMeals();
        } else {
          alert(res.message);
        }
      },
      error: err => {
        alert(err.error?.message || 'Meal logging failed');
      }
    });
  }

  loadMeals(): void {
    const email = JSON.parse(localStorage.getItem('user') || '{}').email;

    this.http.post<any>('http://localhost:5000/api/get-meals', { email }).subscribe({
      next: res => {
        this.meals = res.meals || [];
      },
      error: err => {
        console.error(err);
      }
    });
  }

  resetForm(): void {
    this.food = '';
    this.category = 'Breakfast';
    this.quantity = 1;
    this.unit = 'g';
    this.calories = 0;
    this.protein = 0;
    this.carbs = 0;
    this.fats = 0;
  }
}
