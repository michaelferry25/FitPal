import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent {
  selectedGoal: 'lose' | 'maintain' | 'gain' | null = null;

  selectGoal(goal: 'lose' | 'maintain' | 'gain') {
    this.selectedGoal = goal;
  }
}
