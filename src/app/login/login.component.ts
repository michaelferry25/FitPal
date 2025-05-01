import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // form fields with their initial empty values
  email = '';
  password = '';
  showAuthMessage = false;
  loginError = false; // flag to show login error message

  // inject HttpClient for API calls and Router for navigation
  // and ActivatedRoute for query parameters
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  // called when the component is initialized
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['authRequired']) {
        this.showAuthMessage = true;
      }
    });
  }

  // called when the form is submitted
  onSubmit(): void {
    this.http.post<any>('http://localhost:5000/api/login', {
      email: this.email,
      password: this.password
    }).subscribe((res) => {
      // Check if the response is successful and contains user data
      if (res.success) {
        localStorage.setItem('user', JSON.stringify(res.user));
        this.router.navigate(['/home']);
      } else {
        // Handle login failure
        alert('Login failed: ' + res.message);
      }
    }, err => {
      // Handle error response from the server
      alert('Error connecting to server.');
    });
  }
}
