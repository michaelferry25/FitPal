import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-weight-log',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './weight-log.component.html',
  styleUrls: ['./weight-log.component.css']
})
export class WeightLogComponent implements OnInit {
  weights: any[] = [];
  selectedDate = '';
  weight: number | null = null;
  maxDate = new Date().toISOString().split('T')[0];
  editingEntry: any = null;
  chart: any;

  estimatedWeeks: number = 0;
  startWeight: number = 0;
  goalWeight: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadWeights();
    this.loadGoalData();
  }

  loadGoalData() {
    const goalData = JSON.parse(localStorage.getItem('goalData') || '{}');
    this.estimatedWeeks = goalData.estimatedWeeks || 0;
    this.startWeight = goalData.startWeight || 0;
    this.goalWeight = goalData.goalWeight || 0;
  }

  loadWeights() {
    this.http.get<any>('http://localhost:5000/api/weight').subscribe({
      next: res => {
        this.weights = res.weights;
        this.renderChart();
      },
      error: err => {
        console.error('Error loading weights:', err);
      }
    });
  }

  addWeight() {
    if (!this.selectedDate || this.weight === null) return;

    const payload = { date: this.selectedDate, weight: this.weight };

    this.http.post<any>('http://localhost:5000/api/weight', payload).subscribe({
      next: res => {
        this.selectedDate = '';
        this.weight = null;
        this.loadWeights();
      },
      error: err => {
        console.error('Error saving weight:', err);
      }
    });
  }

  startEdit(entry: any) {
    this.editingEntry = entry;
    this.selectedDate = entry.date;
    this.weight = entry.weight;
  }

  updateWeight() {
    if (!this.editingEntry || !this.selectedDate || this.weight === null) return;

    const payload = { date: this.selectedDate, weight: this.weight };

    this.http.put<any>(`http://localhost:5000/api/weight/${this.editingEntry._id}`, payload).subscribe({
      next: res => {
        this.editingEntry = null;
        this.selectedDate = '';
        this.weight = null;
        this.loadWeights();
      },
      error: err => {
        console.error('Error updating weight:', err);
      }
    });
  }

  deleteWeight(id: string) {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    this.http.delete<any>(`http://localhost:5000/api/weight/${id}`).subscribe({
      next: res => {
        this.loadWeights();
      },
      error: err => {
        console.error('Error deleting weight:', err);
      }
    });
  }

  renderChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = document.getElementById('weightChart') as HTMLCanvasElement;

    const actualData = this.weights.map(w => ({
      x: w.date,
      y: w.weight
    }));

    const idealData: { x: string, y: number }[] = [];

    if (this.startWeight && this.goalWeight && this.estimatedWeeks) {
      const extraWeeks = Math.ceil(this.estimatedWeeks * 0.1);
      const totalWeeks = this.estimatedWeeks + extraWeeks;
      const weeklyChange = (this.goalWeight - this.startWeight) / this.estimatedWeeks;

      for (let i = 0; i <= totalWeeks; i++) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i * 7);
        const formattedDate = futureDate.toISOString().split('T')[0];
        let weight = this.startWeight + weeklyChange * i;
        if (i >= this.estimatedWeeks) weight = this.goalWeight;
        idealData.push({ x: formattedDate, y: parseFloat(weight.toFixed(1)) });
      }
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Your Weight',
            data: actualData,
            borderColor: '#007bff',
            tension: 0.3,
            fill: false
          },
          {
            label: 'Ideal Progress',
            data: idealData,
            borderColor: '#28a745',
            borderDash: [5, 5],
            tension: 0.3,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: { unit: 'week' },
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Weight (kg)'
            }
          }
        }
      }
    });
  }

  cancelEdit() {
    this.editingEntry = null;
    this.selectedDate = '';
    this.weight = null;
  }
}
