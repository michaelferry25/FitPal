import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-meal-log',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './meal-log.component.html',
  styleUrls: ['./meal-log.component.css']
})
export class MealLogComponent implements OnInit {
  food = '';
  calories!: number;
  meals: any[] = [];

  calorieGoal: number | null = null;
  noGoal = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const email = JSON.parse(localStorage.getItem('user') || '{}').email;

    this.http.post('http://localhost:5000/api/get-user-goals', { email }).subscribe(
      (res: any) => {
        if (res.success && res.user.calorieGoal) {
          this.calorieGoal = res.user.calorieGoal;
          this.loadMeals();
        } else {
          this.noGoal = true;
        }
      },
      err => {
        console.error(err);
        this.noGoal = true;
      }
    );
  }

  addMeal(form: any): void {
    if (form.invalid) return;
    this.http.post<any>('http://localhost:5000/api/meals', { food: this.food, calories: this.calories })
      .subscribe({
        next: res => {
          if (res.success) {
            alert(res.message);
            this.food = '';
            this.calories = 0;
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
    this.http.get<any>('http://localhost:5000/api/meals')
      .subscribe({
        next: res => {
          if (res.success) {
            this.meals = res.meals;
          } else {
            alert(res.message);
          }
        },
        error: err => {
          alert(err.error?.message || 'Failed to fetch meals');
        }
      });
  }
}
