import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
// AuthGuard checks if the user is logged in before allowing access to certain routes
// and redirects to the login page if not authenticated
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const user = localStorage.getItem('user');
    if (!user) {
      this.router.navigate(['/login'], { queryParams: { authRequired: true } });
      return false;
    }
    return true;
  }
}
