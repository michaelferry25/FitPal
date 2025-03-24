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
  firstname = '';
  surname = '';
  dateOfBirth = '';
  address = '';
  email = '';
  confirmEmail = '';
  password = '';
  confirmPassword = '';
  acceptedTerms = false;

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(form: any): void {
    if (form.invalid) return;

    if (this.email !== this.confirmEmail) {
      alert('Emails do not match');
      return;
    }
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!this.acceptedTerms) {
      alert('You must accept Terms & Conditions');
      return;
    }

    this.http.post<any>('http://localhost:5000/api/signup', {
      firstname: this.firstname,
      surname: this.surname,
      dateOfBirth: this.dateOfBirth,
      address: this.address,
      email: this.email,
      password: this.password,
      acceptedTerms: this.acceptedTerms
    }).subscribe({
      next: data => {
        if (data.success) {
          alert(data.message);
          this.router.navigate(['/login']);
        } else {
          alert(data.message);
        }
      },
      error: err => {
        alert(err.error?.message || 'Signup failed');
      }
    });
  }
}
