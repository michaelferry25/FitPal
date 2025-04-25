import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';


@Component({
  selector: 'app-weight-log',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './weight-log.component.html',
  styleUrls: ['./weight-log.component.css']
})
export class WeightLogComponent implements OnInit {
  weight!: number;
  weightLogs: { date: string; weight: number }[] = [];
  chart!: Chart;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchWeightLogs();
  }

  logWeight() {
    const email = JSON.parse(localStorage.getItem('user') || '{}').email;
  
    if (!email || !this.weight) {
      alert('Please enter your weight and make sure you are logged in.');
      return;
    }
  
    this.http.post<any>('http://localhost:5000/api/log-weight', { email, weight: this.weight })
      .subscribe({
        next: (res) => {
          if (res.success) {
            alert('Weight logged successfully.');
            this.weight = 0;
            this.fetchWeightLogs();
          } else {
            alert(res.message);
          }
        },
        error: (err) => {
          console.error(err);
          alert('Failed to log weight.');
        }
      });
  }

  fetchWeightLogs() {
    const email = JSON.parse(localStorage.getItem('user') || '{}').email;
    this.http.post<any>('http://localhost:5000/api/get-weight-log', { email })
      .subscribe(res => {
        if (res.success) {
          this.weightLogs = res.weights;
          this.setupChart();
        }
      });
  }

  setupChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.weightLogs.map(entry => entry.date);
    const weights = this.weightLogs.map(entry => entry.weight);
    const startWeight = weights[0];
    const goalWeight = weights[weights.length - 1];
    const idealWeights = weights.map((_, i) =>
      startWeight + ((goalWeight - startWeight) / (weights.length - 1)) * i
    );

    this.chart = new Chart('weightChart', {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Actual Weight',
            data: weights,
            borderColor: 'rgb(75, 192, 192)',
            fill: false,
          },
          {
            label: 'Ideal Weight Progress',
            data: idealWeights,
            borderColor: 'rgb(255, 99, 132)',
            fill: false,
            borderDash: [5, 5],
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: { title: { display: true, text: 'Weight (kg)' } },
          x: { title: { display: true, text: 'Date' } }
        }
      }
    });
  }
}
