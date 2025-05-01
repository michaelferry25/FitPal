import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recipe',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, FormsModule],
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css']
})

// RecipeComponent is responsible for displaying a list of recipes
// and allowing users to filter them by category or search query.
export class RecipeComponent implements OnInit {

  // fields with their initial empty values
  // categories is an array of recipe categories
  // selectedCategory is the currently selected category for filtering
  categories = ['Chicken', 'Beef', 'Seafood', 'Vegan', 'Vegetarian'];
  selectedCategory = '';
  meals: any[] = [];
  searchQuery = '';

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.fetchMeals();
    });
  }

  // Fetches the list of meals from the API from the server based on the selected category and search query
  fetchMeals(): void {
    let url = 'http://localhost:5000/api/recipes';
    if (this.selectedCategory) {
      // If a category is selected, append it to the URL as a query parameter
      url += `?category=${this.selectedCategory}`;
    }
    this.http.get<any>(url).subscribe({
      next: data => {
        if (data.success) {
          // If the response is successful, filter the meals based on the search query
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
