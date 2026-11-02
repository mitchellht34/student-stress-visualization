# Student Lifestyle and Stress

CPS 5745 Interact Info Visualization Midterm Project

## Research Question

How do students' daily lifestyle patterns relate to academic performance and stress?

This project explores associations in the dataset and does not claim that any single lifestyle factor causes stress.

## Data Source

The project uses the Student Lifestyle Dataset from Kaggle.

The dataset contains 2,000 student records and the following variables:

- Student_ID
- Study_Hours_Per_Day
- Extracurricular_Hours_Per_Day
- Sleep_Hours_Per_Day
- Social_Hours_Per_Day
- Physical_Activity_Hours_Per_Day
- GPA
- Stress_Level

The dataset contains no missing values in these fields.

## Change From Proposal

The original proposal planned to use a Student Stress Survey dataset from Hugging Face.

During implementation, inspection of the raw Hugging Face data showed that several columns contained responses that belonged to different survey questions. For example, the study-time column contained yes/no responses, the sleep-duration column contained diet responses, and many of the stress-related fields were blank.

Because these issues made the data unreliable for the planned visualizations, the project switched to the Student Lifestyle Dataset from Kaggle.

The overall topic remained the same: exploring student lifestyle, academic performance, and stress through six connected interactive views.

## Data Preparation

The Kaggle CSV is loaded directly in the browser using D3.

Numeric fields are converted from strings to numbers before visualization.

Stress level is already provided as three categories:

- Low
- Moderate
- High

For the comparison and profile views, study time, sleep, and physical activity are divided into three groups using approximately the lower third, middle third, and upper third of the dataset.

The resulting cut points are:

### Study Hours Per Day

- Lower: 5.0 to 6.7 hours
- Middle: greater than 6.7 to 8.3 hours
- Higher: greater than 8.3 to 10.0 hours

### Sleep Hours Per Day

- Lower: 5.0 to 6.6 hours
- Middle: greater than 6.6 to 8.3 hours
- Higher: greater than 8.3 to 10.0 hours

### Physical Activity Hours Per Day

- Lower: 0.0 to 3.0 hours
- Middle: greater than 3.0 to 5.3 hours
- Higher: greater than 5.3 to 13.0 hours

## Six Dynamic Views

### View 1 — Stress Overview

Shows all 2,000 students and their Low, Moderate, or High stress category.

Users can switch between:

- grouping students by stress
- showing all students together

Hovering over a student dot displays the student's actual values.

### View 2 — Study Time and Academic Performance

Scatterplot of:

- x-axis: study hours per day
- y-axis: GPA
- color: stress level

Users can filter the chart by stress level.

### View 3 — Sleep, Stress, and GPA

Scatterplot of:

- x-axis: sleep hours per day
- y-axis: GPA
- color: stress level

Users can filter the chart by stress level.

### View 4 — Lifestyle Factors

Bar chart comparing average lifestyle hours across Low, Moderate, and High stress groups.

Users can switch among:

- study time
- sleep
- social time
- physical activity
- extracurricular activity

### View 5 — Compare Two Student Groups

Allows two lifestyle groups to be compared side by side.

Users can compare groups based on:

- sleep
- study time
- physical activity

Each comparison shows:

- number of students
- average GPA
- percentage of Low, Moderate, and High stress students

### View 6 — Combined Student Profile

Allows multiple filters to be combined:

- study-time group
- sleep group
- physical-activity group

The view shows:

- number of matching students
- average GPA
- percentage of High-stress students
- average sleep
- stress distribution
- GPA distribution

## Interactions

The project includes the required interaction types.

### Change a Parameter

Users can change layouts, factors, filters, and comparison variables.

### Inspect Actual Values

Hovering over student points displays the student's actual values.

### Filter or Compare Scenarios

Views 2 and 3 allow filtering by stress level.

View 5 allows two groups to be compared.

View 6 allows several lifestyle conditions to be combined.

### Reset

The project includes a global Reset button and a Clear Profile button in View 6.

The project does not use a time-based animation, so play/pause controls are not applicable.

## Numerical Verification

A numerical check was performed using the original CSV.

There are:

- 1,029 High-stress students
- 2,000 total students

Calculation:

1029 / 2000 × 100 = 51.45%

Rounded to one decimal place:

51.4%

This matches the High-stress percentage shown in View 1.

A second check was also performed for View 4.

Among the 297 Low-stress students, the average study time is:

5.47 hours per day

This matches the Low-stress Study bar shown in View 4.

## Boundary-Case Verification

All 27 valid combinations of the three View 6 lifestyle groups were checked, and every combination contained at least one student.

A different boundary case was therefore used.

In View 5, the Higher study-time group contains:

- 0.0% Low stress
- 0.0% Moderate stress
- 100.0% High stress

The visualization correctly displays the High-stress bar at the 100% upper boundary without exceeding the chart scale or producing an error.

## Run Locally

Open a terminal in the project folder and run:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Do not open `index.html` directly because the browser needs to load the local CSV through the web server.

## Project Files

- `index.html` — page structure and controls
- `styles.css` — layout and visual styling
- `app.js` — data loading, transformations, interactions, and visualizations
- `student_lifestyle_dataset.csv` — dataset
- `inspect-data.js` — dataset inspection and verification script
- `README.md` — documentation and launch instructions