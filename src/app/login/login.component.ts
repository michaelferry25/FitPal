import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private http: HttpClient, private router: Router) {}

onSubmit() {
  this.http.post<any>('http://localhost:5000/api/login', {
    email: this.email,
    password: this.password
  }).subscribe(res => {
    if(res.success){
      localStorage.setItem('user', JSON.stringify(res.user));
      this.router.navigate(['/home']);
    } else {
      alert('Login failed: ' + res.message);
    }
  });
}
}
