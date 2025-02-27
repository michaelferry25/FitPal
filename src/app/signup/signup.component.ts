import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  username: string = '';
  email: string = '';
  password: string = '';

  onSubmit(form: NgForm) {
    if (form.valid) {
      alert(`Account created for ${this.username}!`);
      console.log('Signup data:', this.username, this.email, this.password);
    }
  }
}
