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
  email = '';
  password = '';
  showAuthMessage = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['authRequired']) {
        this.showAuthMessage = true;
      }
    });
  }

  onSubmit(): void {
    this.http.post<any>('http://localhost:5000/api/login', {
      email: this.email,
      password: this.password
    }).subscribe((res) => {
      if (res.success) {
        localStorage.setItem('user', JSON.stringify(res.user));
        this.router.navigate(['/home']);
      } else {
        alert('Login failed: ' + res.message);
      }
    }, err => {
      alert('Error connecting to server.');
    });
  }
}
