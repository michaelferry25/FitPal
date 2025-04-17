import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  firstname = '';

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.firstname = user.firstname || 'user';
  }
}
