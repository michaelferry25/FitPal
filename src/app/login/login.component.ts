import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  constructor(private router: Router) {}
  onSubmit(form: any): void {
    alert(`Welcome, ${this.username}!`);
  }
  goToSignup(): void {
    this.router.navigate(['/signup']);
  }
}
