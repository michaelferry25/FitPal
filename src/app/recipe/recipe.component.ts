import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recipe',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, FormsModule],
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css']
})
export class RecipeComponent implements OnInit {
  categories = ['Chicken', 'Beef', 'Seafood', 'Vegan', 'Vegetarian'];
  selectedCategory = '';
  meals: any[] = [];
  searchQuery = ''; // NEW

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchMeals();
  }

  fetchMeals(): void {
    let url = 'http://localhost:5000/api/recipes';
    if (this.selectedCategory) {
      url += `?category=${this.selectedCategory}`;
    }
    this.http.get<any>(url).subscribe({
      next: data => {
        if (data.success) {
          this.meals = this.searchQuery
          ? data.meals.filter((m: { title: string }) =>
            m.title.toLowerCase().includes(this.searchQuery.toLowerCase())
          )
        : data.meals;
        
        } else {
          alert(data.message);
        }
      },
      error: () => {
        alert('Error fetching recipes');
      }
    });
  }

  onCategoryChange(): void {
    this.fetchMeals();
  }

  onSearchChange(): void {
    this.fetchMeals();
  }

  viewDetails(mealId: string): void {
    this.router.navigate(['/recipes', mealId]);
  }
}
