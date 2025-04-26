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
    window.addEventListener('storage', () => this.loadUser());

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.loadUser();
      }
    });
  }

  loadUser() {
    const stored = localStorage.getItem('user');
    this.user = stored ? JSON.parse(stored) : null;
  }

  logout() {
    localStorage.removeItem('user');
    this.user = null;
    this.router.navigate(['/login']);
  }

  onSubmitSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/recipes'], { queryParams: { search: this.searchQuery.trim() } });
      this.searchQuery = '';
    }
  }
}
