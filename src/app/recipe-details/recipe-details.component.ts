import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.css']
})
export class RecipeDetailsComponent implements OnInit {
  // form fields with their initial empty values
  recipeId = '';
  recipe: any = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.recipeId = params.get('id') || '';
      this.fetchRecipeDetail();
    });
  }

  // Fetches the recipe details from the server using the recipeId
  // and updates the recipe variable with the response data
  fetchRecipeDetail(): void {
    this.http.get<any>(`http://localhost:5000/api/recipes/${this.recipeId}`).subscribe({
      next: data => {
        // Check if the response is successful and contains recipe data
        // and then update the recipe variable with the response data
        if (data.success) {
          this.recipe = data.recipe;
        } else {
          alert(data.message);
        }
      },
      // Handle error response from the server
      error: () => {
        alert('Error fetching recipe details');
      }
    });
  }
}
