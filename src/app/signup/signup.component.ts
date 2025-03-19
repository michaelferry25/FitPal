import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  username = '';
  email = '';
  password = '';
  constructor(private http: HttpClient, private router: Router) {}
  onSubmit(form: any): void {
    if (form.valid) {
      this.http.post<any>('http://localhost:5000/api/signup', { username: this.username, email: this.email, password: this.password })
        .subscribe({
          next: data => {
            if (data.success) {
              alert(data.message);
              this.router.navigate(['/login']);
            } else {
              alert(data.message);
            }
          },
          error: (err) => {
            alert(err.error?.message || 'Signup failed');
          }
        });
    }
  }
}
