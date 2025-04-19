import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent {
  selectedGoal: 'lose' | 'maintain' | 'gain' | null = null;
  difficulty = '';
  difficultyOptions: { label: string; value: string; info: string }[] = [];

  selectGoal(goal: 'lose' | 'maintain' | 'gain') {
    this.selectedGoal = goal;
    this.difficulty = '';

    if (goal === 'lose') {
      this.difficultyOptions = [
        { label: '0.25 kg/week - Very Easy', value: '0.25', info: 'Slow and sustainable fat loss' },
        { label: '0.5 kg/week - Moderate', value: '0.5', info: 'Balanced approach to cutting' },
        { label: '1 kg/week - Aggressive', value: '1', info: 'Harder to sustain, faster results' }
      ];
    } else if (goal === 'gain') {
      this.difficultyOptions = [
        { label: '0.25 kg/week - Lean Bulk', value: '0.25', info: 'Minimizes fat gain' },
        { label: '0.5 kg/week - Classic Bulk', value: '0.5', info: 'Muscle gain with some fat' },
        { label: '1 kg/week - Aggressive Bulk', value: '1', info: 'Fast gain, more fat possible' }
      ];
    } else {
      this.difficultyOptions = [
        { label: 'Maintain - No change', value: '0', info: 'Keep your current weight stable' }
      ];
    }
  }

  get selectedDifficultyInfo(): string {
    const match = this.difficultyOptions.find(opt => opt.value === this.difficulty);
    return match ? match.info : '';
  }
}
