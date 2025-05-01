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

  // form fields with their initial empty values
  firstname = '';
  surname = '';
  dateOfBirth = '';
  address = '';
  email = '';
  confirmEmail = '';
  password = '';
  confirmPassword = '';
  acceptedTerms = false; // toggles the T and C checkbox, default is false


  // inject HttpClient for API calls and Router for navigation
  constructor(private http: HttpClient, private router: Router) {}

  // called when the form is submitted
  onSubmit(form: any): void {
    // cancel if the form isn't valid
    if (form.invalid) return;

    // Checks that the two email fields match up
    if (this.email !== this.confirmEmail) {
      alert('Emails do not match');
      return;
    }
    // Checks that passwords are identical
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // Makes sure the user has ticked the terms checkbox
    if (!this.acceptedTerms) {
      alert('You must accept Terms & Conditions');
      return;
    }

    // Sends a POST request with the signup details
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
        // If the signup succeeded, this lets the user know by an alert and to let them navigate to login
        if (data.success) {
          alert(data.message);
          this.router.navigate(['/login']);
        } else {
          // Server responded but signup failed
          // This could be due to a duplicate email or other validation errors
          alert(data.message);
        }
      },
      error: err => {
        // Something went wrong on the network or server side
        // This could be due to a server error or network issue
        alert(err.error?.message || 'Signup failed');
      }
    });
  }
}
