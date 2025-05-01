import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, Event, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  user: any = null;
  searchQuery: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUser();
    // Listens for changes in local storage to update the user information
    // and reload the user data when the page is refreshed or navigated
    // and when the user logs out
    window.addEventListener('storage', () => this.loadUser());

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.loadUser();
      }
    });
  }

  // Loads the user information from local storage
  loadUser() {
    const stored = localStorage.getItem('user');
    this.user = stored ? JSON.parse(stored) : null;
  }

  // Logs out the user by removing the user information from local storage
  // and navigating to the login page
  logout() {
    localStorage.removeItem('user');
    this.user = null;
    this.router.navigate(['/login']);
  }

  // Called when the search form is submitted
  // and navigates to the recipes page with the search
  onSubmitSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/recipes'], { queryParams: { search: this.searchQuery.trim() } });
      this.searchQuery = '';
    }
  }
}
