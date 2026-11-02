const fs = require("fs");

const fileName = "student_lifestyle_dataset.csv";

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);

  const headers = lines[0]
    .split(",")
    .map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = line
      .split(",")
      .map((value) => value.trim());

    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    return {
      Student_ID: row.Student_ID,

      Study_Hours_Per_Day:
        Number(row.Study_Hours_Per_Day),

      Extracurricular_Hours_Per_Day:
        Number(row.Extracurricular_Hours_Per_Day),

      Sleep_Hours_Per_Day:
        Number(row.Sleep_Hours_Per_Day),

      Social_Hours_Per_Day:
        Number(row.Social_Hours_Per_Day),

      Physical_Activity_Hours_Per_Day:
        Number(row.Physical_Activity_Hours_Per_Day),

      GPA:
        Number(row.GPA),

      Stress_Level:
        row.Stress_Level
    };
  });
}

function average(values) {
  return (
    values.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length
  );
}

function quantile(sortedValues, q) {
  const position =
    (sortedValues.length - 1) * q;

  const base =
    Math.floor(position);

  const remainder =
    position - base;

  if (
    sortedValues[base + 1] !== undefined
  ) {
    return (
      sortedValues[base] +
      remainder *
        (
          sortedValues[base + 1] -
          sortedValues[base]
        )
    );
  }

  return sortedValues[base];
}

function getCuts(data, field) {
  const values =
    data
      .map((row) => row[field])
      .sort((a, b) => a - b);

  return {
    min:
      values[0],

    lower:
      quantile(
        values,
        1 / 3
      ),

    upper:
      quantile(
        values,
        2 / 3
      ),

    max:
      values[
        values.length - 1
      ]
  };
}

function inGroup(
  value,
  group,
  cuts
) {
  if (group === "lower") {
    return (
      value <= cuts.lower
    );
  }

  if (group === "middle") {
    return (
      value > cuts.lower &&
      value <= cuts.upper
    );
  }

  if (group === "higher") {
    return (
      value > cuts.upper
    );
  }

  return true;
}

const text =
  fs.readFileSync(
    fileName,
    "utf8"
  );

const data =
  parseCSV(text);

console.log(
  `Loaded ${data.length} rows.`
);

console.log(
  "\n========================================"
);

console.log(
  "NUMERICAL VERIFICATION"
);

console.log(
  "========================================"
);

const highStress =
  data.filter(
    (row) =>
      row.Stress_Level ===
      "High"
  );

const highStressPercent =
  highStress.length /
  data.length *
  100;

console.log(
  `High stress students: ${highStress.length}`
);

console.log(
  `Total students: ${data.length}`
);

console.log(
  `Calculation: ${highStress.length} / ${data.length} × 100`
);

console.log(
  `High stress percentage: ${highStressPercent.toFixed(1)}%`
);

console.log(
  "\nThis should match View 1."
);

console.log(
  "\n========================================"
);

console.log(
  "SECOND NUMERICAL CHECK"
);

console.log(
  "========================================"
);

const lowStress =
  data.filter(
    (row) =>
      row.Stress_Level ===
      "Low"
  );

const lowStudyAverage =
  average(
    lowStress.map(
      (row) =>
        row.Study_Hours_Per_Day
    )
  );

console.log(
  `Low stress students: ${lowStress.length}`
);

console.log(
  `Average study hours for Low stress students: ${lowStudyAverage.toFixed(2)}`
);

console.log(
  "\nThis should match the Low bar in View 4 when Study is selected."
);

console.log(
  "\n========================================"
);

console.log(
  "VIEW 6 GROUP CUTS"
);

console.log(
  "========================================"
);

const studyCuts =
  getCuts(
    data,
    "Study_Hours_Per_Day"
  );

const sleepCuts =
  getCuts(
    data,
    "Sleep_Hours_Per_Day"
  );

const physicalCuts =
  getCuts(
    data,
    "Physical_Activity_Hours_Per_Day"
  );

console.log(
  "Study:",
  studyCuts
);

console.log(
  "Sleep:",
  sleepCuts
);

console.log(
  "Physical Activity:",
  physicalCuts
);

console.log(
  "\n========================================"
);

console.log(
  "SEARCHING FOR ZERO-MATCH PROFILES"
);

console.log(
  "========================================"
);

const groups = [
  "lower",
  "middle",
  "higher"
];

let zeroMatches = [];

groups.forEach(
  (studyGroup) => {
    groups.forEach(
      (sleepGroup) => {
        groups.forEach(
          (physicalGroup) => {
            const matches =
              data.filter(
                (row) =>
                  inGroup(
                    row.Study_Hours_Per_Day,
                    studyGroup,
                    studyCuts
                  ) &&
                  inGroup(
                    row.Sleep_Hours_Per_Day,
                    sleepGroup,
                    sleepCuts
                  ) &&
                  inGroup(
                    row.Physical_Activity_Hours_Per_Day,
                    physicalGroup,
                    physicalCuts
                  )
              );

            if (
              matches.length === 0
            ) {
              zeroMatches.push({
                study:
                  studyGroup,
                sleep:
                  sleepGroup,
                physical:
                  physicalGroup
              });
            }
          }
        );
      }
    );
  }
);

if (
  zeroMatches.length === 0
) {
  console.log(
    "No zero-match combinations were found."
  );
} else {
  console.log(
    `Found ${zeroMatches.length} zero-match combinations:`
  );

  zeroMatches.forEach(
    (combo) => {
      console.log(
        `Study: ${combo.study}, Sleep: ${combo.sleep}, Physical activity: ${combo.physical}`
      );
    }
  );
}