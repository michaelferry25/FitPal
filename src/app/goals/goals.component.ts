import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
  goals = {
    // Default values for the goals
    // These can be changed by the user in the form
    dailyCalories: 2000,
    proteins: 150,
    carbs: 250,
    fats: 70,
    waterLitres: 2.0
  };
  currentGoal: any = null;

  //if the user is currently editing the goals
  isEditing = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadGoals();
  }

  // Called when the form is submitted
  saveGoals(): void {
    this.http.post<any>('http://localhost:5000/api/goals', this.goals).subscribe({
      next: res => {
        this.currentGoal = res.goal;
        this.isEditing = false;
        alert('Goals successfully saved!');
      },
      error: err => {
        alert(err.error?.message || 'Failed to save goals.');
        console.error('Error saving goals:', err);
      }
    });
  }

  // Fetches the current goals from the server
  // and updates the goals variable with the response data
  loadGoals(): void {
    this.http.get<any>('http://localhost:5000/api/goals').subscribe({
      next: res => {
        this.currentGoal = res.goal;
        if (this.currentGoal) {
          this.goals = { 
            // Update the goals variable with the response data
            // This allows the user to see their current goals when the component loads
            dailyCalories: this.currentGoal.dailyCalories,
            proteins: this.currentGoal.proteins,
            carbs: this.currentGoal.carbs,
            fats: this.currentGoal.fats,
            waterLitres: this.currentGoal.waterLitres
          };
        }
      },
      error: err => {
        // Handle error response from the server
        console.error('Error loading goals:', err);
      }
    });
  }

  resetGoals(): void {
    // Resets the goals to default values
    this.goals = {
      dailyCalories: 2000,
      proteins: 150,
      carbs: 250,
      fats: 70,
      waterLitres: 2.0
    };
  }

  startEditing(): void {
    // Sets the isEditing variable to true to enable editing mode
    // This allows the user to edit their goals in the form
    this.isEditing = true;
  }
}
