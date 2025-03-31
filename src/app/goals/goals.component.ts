import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
  goals = {
    dailyCalories: 2000,
    proteins: 150,
    carbs: 250,
    fats: 70,
    waterLitres: 2.0
  };
  currentGoal: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadGoals();
  }

  saveGoals(): void {
    this.http.post<any>('http://localhost:5000/api/goals', this.goals).subscribe({
      next: res => {
        this.currentGoal = res.goal;
        alert('Goals successfully saved!');
      },
      error: err => {
        alert(err.error?.message || 'Failed to save goals.');
        console.error('Error saving goals:', err);
      }
    });
  }

  loadGoals(): void {
    this.http.get<any>('http://localhost:5000/api/goals').subscribe({
      next: res => {
        this.currentGoal = res.goal;
      },
      error: err => {
        console.error('Error loading goals:', err);
      }
    });
  }

  resetGoals(): void {
    this.goals = {
      dailyCalories: 2000,
      proteins: 150,
      carbs: 250,
      fats: 70,
      waterLitres: 2.0
    };
  }
}
