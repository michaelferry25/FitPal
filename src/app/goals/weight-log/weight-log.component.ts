import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Chart } from 'chart.js/auto';

// This component is responsible for logging and displaying weight data
// It allows users to log their weight, view their weight history and see their progress towards they goal weight.
@Component({
  selector: 'app-weight-log',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './weight-log.component.html',
  styleUrls: ['./weight-log.component.css']
})
export class WeightLogComponent implements OnInit {
  // Properties to hold weight logs, current weight, date, chart instance, and user goal information
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

  // Load user goal information from the server
  // and set the start weight, goal weight and estimated weeks
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
    // Fetch weight logs from the server
    // and update the weightLogs property with the response data
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
      // Validate the form fields before sending the request
      // If any field is empty, show an alert and return
      alert('Please enter weight and date.');
      return;
    }

    // Send a POST request to log the weight
    // and reset the form fields after successful logging
    this.http.post<any>('http://localhost:5000/api/log-weight', {
      email: this.email,
      weight: this.weight,
      date: this.date
    }).subscribe({
      next: res => {
        if (res.success) {
          alert('Weight logged successfully!'); // Show the success message
          this.weight = null;
          this.date = '';
          this.loadWeightLogs();
        }
      },
      // Handle error response from the server
      error: err => console.error('Error logging weight:', err)
    });
  }

  formatDate(dateString: string): string {
    // Converts the date string from 'YYYY-MM-DD' format to 'DD/MM/YYYY' format
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  // This function renders the chart using Chart.js library
  // It takes the weight logs and formats the data for the chart
  renderChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.weightLogs.map(log => this.formatDate(log.date)); // Format the date for the x-axis labels
    const data = this.weightLogs.map(log => log.weight); // Take the weight data for the y-axis

    const startWeight = this.weightLogs.length > 0 ? this.weightLogs[0].weight : 80; // Default start weight if no logs are available
    const goalWeight = this.goalWeight ?? 70; // Default goal weight if not set
    const totalWeeks = this.estimatedWeeks ?? 10; // Default estimated weeks if not set
    const extraWeeks = Math.ceil(totalWeeks * 1.1); // Extra weeks for the ideal progress line +10%

    const idealLabels: string[] = []; // Labels for the ideal progress line
    const idealData: number[] = []; // Data for the ideal progress line

    const firstDate = new Date(this.weightLogs[0]?.date || new Date()); // Get the first date from the logs or use the current date
    for (let week = 0; week <= extraWeeks; week++) {
      // Calculate the ideal progress line based on the start weight and goal weight
      const futureDate = new Date(firstDate);
      // Set the future date based on the week number
      // This will create a date for each week in the estimated weeks
      futureDate.setDate(firstDate.getDate() + week * 7);
      idealLabels.push(this.formatDate(futureDate.toISOString().split('T')[0]));

      // Calculate the  weight for the ideal progress line
      const progress = week / totalWeeks;
      let interpolatedWeight = startWeight + (goalWeight - startWeight) * progress;
      if (progress > 1) interpolatedWeight = goalWeight;
      idealData.push(interpolatedWeight);
    }

    // Create the chart using Chart.js
    this.chart = new Chart('weightChart', {
      type: 'line', // Set the chart type to line
      data: {
        // Set the data for the chart
        labels: labels.length > idealLabels.length ? labels : idealLabels,
        datasets: [
          {
            // Dataset for the user's weight logs
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
            // Dataset for the ideal progress line
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
      // Set the options for the chart
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              // Set the title for the x-axis
              text: 'Date',
              color: 'black'
            }
          },
          y: {
            title: {
              display: true,
              // Set the title for the y-axis
              text: 'Weight (kg)',
              color: 'black'
            },
            // Set the y-axis to start from the minimum weight value
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
