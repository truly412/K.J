// q1.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-q1',
  templateUrl: './q1.component.html',
  styleUrls: ['./q1.component.css']
})
export class Q1Component {
  // Define the list of questions and options
  questions = [
    {
      text: '당신은 김치입니까?',
      options: [
        { value: 1, label: '매우 그렇다' },
        { value: 2, label: '그렇다' },
        { value: 3, label: '아니다' },
        { value: 4, label: '매우 아니다' }
      ]
    },
    {
      text: '당신은 배고픕니까?',
      options: [
        { value: 1, label: '매우 그렇다' },
        { value: 2, label: '그렇다' },
        { value: 3, label: '아니다' },
        { value: 4, label: '매우 아니다' }
      ]
    }
  ];

  currentQuestionIndex = 0; // To track which question is being displayed
  selectedValue: number | null = null; // To store the selected radio value
  answers: { [key: string]: number } = {}; // To store answers in q1: value format

  get currentQuestion() {
    return this.questions[this.currentQuestionIndex];
  }

  // Move to the next question
  nextQuestion() {
    if (this.selectedValue === null) {
      alert('먼저 답을 선택해 주세요.');
      return;
    }

    // Store the selected answer
    this.answers[`q${this.currentQuestionIndex + 1}`] = this.selectedValue;

    // Move to the next question if available
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedValue = null; // Reset the selected value for the next question
    }

    console.log(this.answers); // Debugging: log the answers
  }

  // Move to the previous question
  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.selectedValue = this.answers[`q${this.currentQuestionIndex + 1}`] || null;
    }
  }
}
