import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-weight-log',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './weight-log.component.html',
  styleUrls: ['./weight-log.component.css']
})
export class WeightLogComponent implements OnInit {
  weightLogs: any[] = [];
  weight: number | null = null;
  date: string = '';
  chart: any;
  startWeight: number | null = null;
  goalWeight: number | null = null;
  estimatedWeeks: number | null = null;
  email: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.email = user.email;

    this.loadWeightLogs();
    this.loadUserGoal();
  }

  loadUserGoal(): void {
    this.http.post<any>('http://localhost:5000/api/get-user-goals', { email: this.email }).subscribe({
      next: res => {
        if (res.success && res.user) {
          this.startWeight = res.user.startWeight || null;
          this.goalWeight = res.user.goalWeight || null;
          this.estimatedWeeks = res.user.estimatedWeeks || null;
        }
      },
      error: err => console.error('Error loading user goal:', err)
    });
  }

  loadWeightLogs(): void {
    this.http.post<any>('http://localhost:5000/api/get-weight-log', { email: this.email }).subscribe({
      next: res => {
        if (res.success) {
          this.weightLogs = res.weights;
          this.renderChart();
        }
      },
      error: err => console.error('Error loading weight logs:', err)
    });
  }

  logWeight(): void {
    if (!this.weight || !this.date) {
      alert('Please enter weight and date.');
      return;
    }

    this.http.post<any>('http://localhost:5000/api/log-weight', {
      email: this.email,
      weight: this.weight,
      date: this.date
    }).subscribe({
      next: res => {
        if (res.success) {
          alert('Weight logged successfully!');
          this.weight = null;
          this.date = '';
          this.loadWeightLogs();
        }
      },
      error: err => console.error('Error logging weight:', err)
    });
  }

  formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  renderChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.weightLogs.map(log => this.formatDate(log.date));
    const data = this.weightLogs.map(log => log.weight);

    const startWeight = this.weightLogs.length > 0 ? this.weightLogs[0].weight : 80;
    const goalWeight = this.goalWeight ?? 70;
    const totalWeeks = this.estimatedWeeks ?? 10;
    const extraWeeks = Math.ceil(totalWeeks * 1.1);

    const idealLabels: string[] = [];
    const idealData: number[] = [];

    const firstDate = new Date(this.weightLogs[0]?.date || new Date());
    for (let week = 0; week <= extraWeeks; week++) {
      const futureDate = new Date(firstDate);
      futureDate.setDate(firstDate.getDate() + week * 7);
      idealLabels.push(this.formatDate(futureDate.toISOString().split('T')[0]));

      const progress = week / totalWeeks;
      let interpolatedWeight = startWeight + (goalWeight - startWeight) * progress;
      if (progress > 1) interpolatedWeight = goalWeight;
      idealData.push(interpolatedWeight);
    }

    this.chart = new Chart('weightChart', {
      type: 'line',
      data: {
        labels: labels.length > idealLabels.length ? labels : idealLabels,
        datasets: [
          {
            label: 'Your Weight',
            data,
            fill: false,
            borderColor: 'blue',
            backgroundColor: 'lightblue',
            tension: 0.2,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'blue',
            borderWidth: 2
          },
          {
            label: 'Ideal Progress',
            data: idealData,
            fill: false,
            borderColor: 'gold',
            backgroundColor: 'gold',
            borderDash: [5, 5],
            pointRadius: 4,
            pointHoverRadius: 5,
            pointBackgroundColor: 'gold',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date',
              color: 'black'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Weight (kg)',
              color: 'black'
            },
            beginAtZero: false
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  }
}
