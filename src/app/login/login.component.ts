import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  onSubmit(form: NgForm) {
    // Check if the form is valid
    if (form.valid) {
      // Show a simple success alert
      alert(`Welcome, ${this.username}!`);
      console.log('Form Submitted:', this.username, this.password);
    }
  }
}
