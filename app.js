const CSV_FILE = "student_lifestyle_dataset.csv";

let data = [];

const stressColors = {
  Low: "#4d8f72",
  Moderate: "#d19a3e",
  High: "#b45151"
};

const tooltip = d3.select("#tooltip");

let view5Groups = [];

function setupNavigation() {
  const tabs = document.querySelectorAll(".view-tab");
  const views = document.querySelectorAll(".story-view");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((button) => {
        button.classList.remove("active");
      });

      views.forEach((view) => {
        view.classList.remove("active");
      });

      tab.classList.add("active");

      const viewNumber = tab.dataset.view;

      document
        .querySelector(`#view-${viewNumber}`)
        .classList.add("active");

      if (viewNumber === "1") {
        renderView1();
      }

      if (viewNumber === "2") {
        renderView2();
      }

      if (viewNumber === "3") {
        renderView3();
      }

      if (viewNumber === "4") {
        renderView4();
      }

      if (viewNumber === "5") {
        updateView5Groups();
        renderView5();
      }

      if (viewNumber === "6") {
        renderView6();
      }
    });
  });
}

function convertRow(row) {
  return {
    id: row.Student_ID,

    studyHours:
      Number(row.Study_Hours_Per_Day),

    extracurricularHours:
      Number(row.Extracurricular_Hours_Per_Day),

    sleepHours:
      Number(row.Sleep_Hours_Per_Day),

    socialHours:
      Number(row.Social_Hours_Per_Day),

    physicalHours:
      Number(row.Physical_Activity_Hours_Per_Day),

    gpa:
      Number(row.GPA),

    stress:
      row.Stress_Level
  };
}

async function loadDataset() {
  const status =
    document.querySelector("#data-status");

  try {
    status.textContent = "Loading data...";

    data =
      await d3.csv(
        CSV_FILE,
        convertRow
      );

    status.textContent =
      `${data.length.toLocaleString()} rows loaded`;

    console.log(
      "Dataset loaded:",
      data.length
    );

    console.log(
      "First processed row:",
      data[0]
    );

    updateView5Groups();
    populateView6Filters();

    renderView1();
  } catch (error) {
    console.error(error);

    status.textContent =
      "Data load failed";

    alert(
      "The CSV file could not be loaded."
    );
  }
}

function stressCounts() {
  return [
    "Low",
    "Moderate",
    "High"
  ].map((level) => {
    const students =
      data.filter(
        (student) =>
          student.stress === level
      );

    return {
      level,
      count: students.length,
      percent:
        students.length /
        data.length *
        100
    };
  });
}

function stressDistribution(students) {
  if (students.length === 0) {
    return [
      {
        level: "Low",
        count: 0,
        percent: 0
      },
      {
        level: "Moderate",
        count: 0,
        percent: 0
      },
      {
        level: "High",
        count: 0,
        percent: 0
      }
    ];
  }

  return [
    "Low",
    "Moderate",
    "High"
  ].map((level) => {
    const count =
      students.filter(
        (student) =>
          student.stress === level
      ).length;

    return {
      level,
      count,

      percent:
        count /
        students.length *
        100
    };
  });
}

function createMetricCards() {
  const counts =
    stressCounts();

  const metrics = [
    {
      value:
        data.length.toLocaleString(),

      label:
        "students"
    },

    ...counts.map((item) => ({
      value:
        `${item.percent.toFixed(1)}%`,

      label:
        `${item.level.toLowerCase()} stress`
    }))
  ];

  d3.select("#view1-metrics")
    .selectAll(".metric")
    .data(metrics)
    .join("div")
    .attr(
      "class",
      "metric"
    )
    .html(
      (item) => `
        <strong>
          ${item.value}
        </strong>

        <span>
          ${item.label}
        </span>
      `
    );
}

function createSVG(selector) {
  const container =
    document.querySelector(selector);

  const width =
    container.clientWidth;

  const height = 470;

  d3.select(selector)
    .selectAll("*")
    .remove();

  return d3
    .select(selector)
    .append("svg")
    .attr(
      "viewBox",
      `0 0 ${width} ${height}`
    )
    .attr(
      "width",
      width
    )
    .attr(
      "height",
      height
    );
}

function makeGrid(
  students,
  startX,
  startY,
  width
) {
  const spacing = 10;

  const columns =
    Math.max(
      1,
      Math.floor(
        width / spacing
      )
    );

  return students.map(
    (student, index) => ({
      ...student,

      x:
        startX +
        (index % columns) *
        spacing,

      y:
        startY +
        Math.floor(
          index / columns
        ) *
        spacing
    })
  );
}

function showTooltip(
  event,
  student
) {
  tooltip
    .classed(
      "hidden",
      false
    )
    .html(`
      <strong>
        Student ${student.id}
      </strong>

      <br>

      Stress:
      ${student.stress}

      <br>

      Study:
      ${student.studyHours} hrs/day

      <br>

      Sleep:
      ${student.sleepHours} hrs/day

      <br>

      GPA:
      ${student.gpa.toFixed(2)}

      <br>

      Social:
      ${student.socialHours} hrs/day

      <br>

      Physical activity:
      ${student.physicalHours} hrs/day

      <br>

      Extracurricular:
      ${student.extracurricularHours} hrs/day
    `)
    .style(
      "left",
      `${event.clientX + 14}px`
    )
    .style(
      "top",
      `${event.clientY + 14}px`
    );
}

function hideTooltip() {
  tooltip.classed(
    "hidden",
    true
  );
}

function drawStressLegend(
  svg,
  width
) {
  const levels = [
    "Low",
    "Moderate",
    "High"
  ];

  const legend =
    svg.append("g")
      .attr(
        "transform",
        `translate(${width - 360},440)`
      );

  levels.forEach(
    (level, index) => {
      const item =
        legend
          .append("g")
          .attr(
            "transform",
            `translate(${index * 110},0)`
          );

      item
        .append("circle")
        .attr("r", 6)
        .attr(
          "fill",
          stressColors[level]
        );

      item
        .append("text")
        .attr("x", 12)
        .attr("y", 4)
        .attr(
          "fill",
          "#657089"
        )
        .attr(
          "font-size",
          11
        )
        .text(
          `${level} stress`
        );
    }
  );
}

function renderGroupedStress(svg) {
  const width =
    Number(
      svg.attr("width")
    );

  const groups = [
    "Low",
    "Moderate",
    "High"
  ];

  const availableWidth =
    width - 100;

  const groupWidth =
    availableWidth /
    groups.length;

  groups.forEach(
    (level, index) => {
      const students =
        data.filter(
          (student) =>
            student.stress === level
        );

      const groupX =
        50 +
        index *
        groupWidth;

      const positions =
        makeGrid(
          students,
          groupX,
          100,
          groupWidth - 30
        );

      svg
        .append("text")
        .attr(
          "x",
          groupX +
          (groupWidth - 30) / 2
        )
        .attr("y", 45)
        .attr(
          "text-anchor",
          "middle"
        )
        .attr(
          "font-weight",
          600
        )
        .attr(
          "font-size",
          14
        )
        .text(
          `${level} Stress`
        );

      svg
        .append("text")
        .attr(
          "x",
          groupX +
          (groupWidth - 30) / 2
        )
        .attr("y", 67)
        .attr(
          "text-anchor",
          "middle"
        )
        .attr(
          "fill",
          "#657089"
        )
        .attr(
          "font-size",
          11
        )
        .text(
          `${students.length} students`
        );

      svg
        .selectAll(
          `.student-${level}`
        )
        .data(positions)
        .join("circle")
        .attr(
          "cx",
          (student) =>
            student.x
        )
        .attr(
          "cy",
          (student) =>
            student.y
        )
        .attr("r", 4)
        .attr(
          "fill",
          stressColors[level]
        )
        .attr(
          "opacity",
          0.82
        )
        .on(
          "mousemove",
          showTooltip
        )
        .on(
          "mouseleave",
          hideTooltip
        );
    }
  );

  drawStressLegend(
    svg,
    width
  );
}

function renderAllStudents(svg) {
  const width =
    Number(
      svg.attr("width")
    );

  const positions =
    makeGrid(
      data,
      50,
      95,
      width - 100
    );

  svg
    .append("text")
    .attr(
      "x",
      width / 2
    )
    .attr("y", 45)
    .attr(
      "text-anchor",
      "middle"
    )
    .attr(
      "font-weight",
      600
    )
    .attr(
      "font-size",
      14
    )
    .text(
      "All Students"
    );

  svg
    .append("text")
    .attr(
      "x",
      width / 2
    )
    .attr("y", 67)
    .attr(
      "text-anchor",
      "middle"
    )
    .attr(
      "fill",
      "#657089"
    )
    .attr(
      "font-size",
      11
    )
    .text(
      `${data.length} students`
    );

  svg
    .selectAll(
      ".student-dot"
    )
    .data(positions)
    .join("circle")
    .attr(
      "cx",
      (student) =>
        student.x
    )
    .attr(
      "cy",
      (student) =>
        student.y
    )
    .attr("r", 4)
    .attr(
      "fill",
      (student) =>
        stressColors[
          student.stress
        ]
    )
    .attr(
      "opacity",
      0.82
    )
    .on(
      "mousemove",
      showTooltip
    )
    .on(
      "mouseleave",
      hideTooltip
    );

  drawStressLegend(
    svg,
    width
  );
}

function renderView1() {
  createMetricCards();

  const svg =
    createSVG(
      "#view1-chart"
    );

  const layout =
    document.querySelector(
      "#view1-layout"
    ).value;

  if (layout === "all") {
    renderAllStudents(svg);
  } else {
    renderGroupedStress(svg);
  }

  document.querySelector(
    "#view1-takeaway"
  ).textContent =
    "The dataset contains more students in the High stress category than in the Moderate or Low categories. This view establishes the overall stress distribution before exploring academic and lifestyle variables.";
}

function renderScatterplot(
  selector,
  xField,
  xLabel,
  stressFilter
) {
  const svg =
    createSVG(selector);

  const width =
    Number(
      svg.attr("width")
    );

  const height = 470;

  const margin = {
    top: 35,
    right: 40,
    bottom: 70,
    left: 70
  };

  let filteredData =
    data;

  if (
    stressFilter !== "All"
  ) {
    filteredData =
      data.filter(
        (student) =>
          student.stress ===
          stressFilter
      );
  }

  const xExtent =
    d3.extent(
      data,
      (student) =>
        student[xField]
    );

  const x =
    d3.scaleLinear()
      .domain(xExtent)
      .nice()
      .range([
        margin.left,
        width -
        margin.right
      ]);

  const y =
    d3.scaleLinear()
      .domain([
        2.2,
        4
      ])
      .range([
        height -
        margin.bottom,
        margin.top
      ]);

  svg
    .append("g")
    .attr(
      "transform",
      `translate(0,${height - margin.bottom})`
    )
    .call(
      d3.axisBottom(x)
    );

  svg
    .append("g")
    .attr(
      "transform",
      `translate(${margin.left},0)`
    )
    .call(
      d3.axisLeft(y)
      .ticks(6)
    );

  svg
    .append("text")
    .attr(
      "x",
      width / 2
    )
    .attr(
      "y",
      height - 20
    )
    .attr(
      "text-anchor",
      "middle"
    )
    .attr(
      "font-weight",
      600
    )
    .text(xLabel);

  svg
    .append("text")
    .attr(
      "transform",
      "rotate(-90)"
    )
    .attr(
      "x",
      -height / 2
    )
    .attr("y", 20)
    .attr(
      "text-anchor",
      "middle"
    )
    .attr(
      "font-weight",
      600
    )
    .text("GPA");

  svg
    .selectAll(
      ".scatter-dot"
    )
    .data(
      filteredData
    )
    .join("circle")
    .attr(
      "class",
      "scatter-dot"
    )
    .attr(
      "cx",
      (student) =>
        x(
          student[xField]
        )
    )
    .attr(
      "cy",
      (student) =>
        y(student.gpa)
    )
    .attr("r", 4)
    .attr(
      "fill",
      (student) =>
        stressColors[
          student.stress
        ]
    )
    .attr(
      "opacity",
      0.55
    )
    .on(
      "mousemove",
      showTooltip
    )
    .on(
      "mouseleave",
      hideTooltip
    );

  drawStressLegend(
    svg,
    width
  );

  return filteredData;
}

function renderView2() {
  const selectedStress =
    document.querySelector(
      "#view2-stress-filter"
    ).value;

  const filteredData =
    renderScatterplot(
      "#view2-chart",
      "studyHours",
      "Study Hours Per Day",
      selectedStress
    );

  const averageGPA =
    d3.mean(
      filteredData,
      (student) =>
        student.gpa
    );

  document.querySelector(
    "#view2-takeaway"
  ).textContent =
    selectedStress === "All"
      ? `This view shows the relationship between study time and GPA for all students. The average GPA is ${averageGPA.toFixed(2)}. Stress level remains visible through color.`
      : `This view is filtered to ${selectedStress.toLowerCase()} stress students. Their average GPA is ${averageGPA.toFixed(2)}.`;
}

function renderView3() {
  const selectedStress =
    document.querySelector(
      "#view3-stress-filter"
    ).value;

  const filteredData =
    renderScatterplot(
      "#view3-chart",
      "sleepHours",
      "Sleep Hours Per Day",
      selectedStress
    );

  const averageSleep =
    d3.mean(
      filteredData,
      (student) =>
        student.sleepHours
    );

  const averageGPA =
    d3.mean(
      filteredData,
      (student) =>
        student.gpa
    );

  document.querySelector(
    "#view3-takeaway"
  ).textContent =
    selectedStress === "All"
      ? `Students in the dataset average ${averageSleep.toFixed(2)} hours of sleep per day and an average GPA of ${averageGPA.toFixed(2)}. Stress level remains visible through color so sleep, GPA, and stress can be examined together.`
      : `${selectedStress} stress students average ${averageSleep.toFixed(2)} hours of sleep per day and a GPA of ${averageGPA.toFixed(2)}.`;
}

const lifestyleFactors = {
  studyHours: {
    label:
      "Study Hours Per Day"
  },

  sleepHours: {
    label:
      "Sleep Hours Per Day"
  },

  socialHours: {
    label:
      "Social Hours Per Day"
  },

  physicalHours: {
    label:
      "Physical Activity Hours Per Day"
  },

  extracurricularHours: {
    label:
      "Extracurricular Hours Per Day"
  }
};

function renderView4() {
  const selectedFactor =
    document.querySelector(
      "#view4-factor"
    ).value;

  const factor =
    lifestyleFactors[
      selectedFactor
    ];

  const svg =
    createSVG(
      "#view4-chart"
    );

  const width =
    Number(
      svg.attr("width")
    );

  const height = 470;

  const margin = {
    top: 55,
    right: 40,
    bottom: 70,
    left: 75
  };

  const stressLevels = [
    "Low",
    "Moderate",
    "High"
  ];

  const averages =
    stressLevels.map(
      (level) => {
        const students =
          data.filter(
            (student) =>
              student.stress ===
              level
          );

        return {
          level,

          average:
            d3.mean(
              students,
              (student) =>
                student[
                  selectedFactor
                ]
            ),

          count:
            students.length
        };
      }
    );

  const x =
    d3.scaleBand()
      .domain(
        stressLevels
      )
      .range([
        margin.left,
        width -
        margin.right
      ])
      .padding(0.35);

  const maximum =
    d3.max(
      averages,
      (item) =>
        item.average
    );

  const y =
    d3.scaleLinear()
      .domain([
        0,
        maximum * 1.2
      ])
      .nice()
      .range([
        height -
        margin.bottom,
        margin.top
      ]);

  svg
    .append("g")
    .attr(
      "transform",
      `translate(0,${height - margin.bottom})`
    )
    .call(
      d3.axisBottom(x)
    );

  svg
    .append("g")
    .attr(
      "transform",
      `translate(${margin.left},0)`
    )
    .call(
      d3.axisLeft(y)
      .ticks(6)
    );

  svg
    .append("text")
    .attr(
      "x",
      width / 2
    )
    .attr("y", 28)
    .attr(
      "text-anchor",
      "middle"
    )
    .attr(
      "font-size",
      14
    )
    .attr(
      "font-weight",
      600
    )
    .text(
      `Average ${factor.label} by Stress Level`
    );

  svg
    .append("text")
    .attr(
      "transform",
      "rotate(-90)"
    )
    .attr(
      "x",
      -height / 2
    )
    .attr("y", 20)
    .attr(
      "text-anchor",
      "middle"
    )
    .attr(
      "font-weight",
      600
    )
    .text(
      "Average Hours Per Day"
    );

  svg
    .selectAll(
      ".lifestyle-bar"
    )
    .data(
      averages
    )
    .join("rect")
    .attr(
      "x",
      (item) =>
        x(item.level)
    )
    .attr(
      "y",
      (item) =>
        y(item.average)
    )
    .attr(
      "width",
      x.bandwidth()
    )
    .attr(
      "height",
      (item) =>
        y(0) -
        y(item.average)
    )
    .attr(
      "fill",
      (item) =>
        stressColors[
          item.level
        ]
    )
    .attr("rx", 6)
    .attr(
      "opacity",
      0.88
    );

  svg
    .selectAll(
      ".lifestyle-label"
    )
    .data(
      averages
    )
    .join("text")
    .attr(
      "x",
      (item) =>
        x(item.level) +
        x.bandwidth() / 2
    )
    .attr(
      "y",
      (item) =>
        y(item.average) - 10
    )
    .attr(
      "text-anchor",
      "middle"
    )
    .attr(
      "font-weight",
      600
    )
    .attr(
      "font-size",
      13
    )
    .text(
      (item) =>
        item.average.toFixed(2)
    );

  const low =
    averages.find(
      (item) =>
        item.level === "Low"
    );

  const high =
    averages.find(
      (item) =>
        item.level === "High"
    );

  document.querySelector(
    "#view4-takeaway"
  ).textContent =
    `For ${factor.label.toLowerCase()}, Low stress students average ${low.average.toFixed(2)} hours per day while High stress students average ${high.average.toFixed(2)} hours per day. The difference is ${Math.abs(high.average - low.average).toFixed(2)} hours.`;
}

function getGroupDefinitions(field) {
  const values =
    data
      .map(
        (student) =>
          student[field]
      )
      .sort(
        d3.ascending
      );

  const minimum =
    d3.min(values);

  const maximum =
    d3.max(values);

  const lowerCut =
    d3.quantile(
      values,
      1 / 3
    );

  const upperCut =
    d3.quantile(
      values,
      2 / 3
    );

  return [
    {
      id: "lower",

      label:
        `Lower (${minimum.toFixed(1)}–${lowerCut.toFixed(1)})`,

      matches:
        (value) =>
          value <=
          lowerCut
    },

    {
      id: "middle",

      label:
        `Middle (${lowerCut.toFixed(1)}–${upperCut.toFixed(1)})`,

      matches:
        (value) =>
          value >
            lowerCut &&
          value <=
            upperCut
    },

    {
      id: "higher",

      label:
        `Higher (${upperCut.toFixed(1)}–${maximum.toFixed(1)})`,

      matches:
        (value) =>
          value >
          upperCut
    }
  ];
}

function buildComparisonGroups(field) {
  const definitions =
    getGroupDefinitions(field);

  return definitions.map(
    (definition) => ({
      ...definition,

      students:
        data.filter(
          (student) =>
            definition.matches(
              student[field]
            )
        )
    })
  );
}

function updateView5Groups() {
  if (!data.length) {
    return;
  }

  const variable =
    document.querySelector(
      "#view5-variable"
    ).value;

  view5Groups =
    buildComparisonGroups(
      variable
    );

  const groupA =
    document.querySelector(
      "#view5-a"
    );

  const groupB =
    document.querySelector(
      "#view5-b"
    );

  groupA.innerHTML = "";
  groupB.innerHTML = "";

  view5Groups.forEach(
    (group) => {
      groupA.add(
        new Option(
          group.label,
          group.id
        )
      );

      groupB.add(
        new Option(
          group.label,
          group.id
        )
      );
    }
  );

  groupA.value = "lower";
  groupB.value = "higher";
}

function drawComparisonPanel(
  svg,
  group,
  startX,
  width
) {
  const chartTop = 180;
  const chartHeight = 180;

  const panelKey =
    startX === 0
      ? "left"
      : "right";

  const averageGPA =
    d3.mean(
      group.students,
      (student) =>
        student.gpa
    );

  const distribution =
    stressDistribution(
      group.students
    );

  svg
    .append("text")
    .attr(
      "x",
      startX +
      width / 2
    )
    .attr("y", 65)
    .attr(
      "text-anchor",
      "middle"
    )
    .attr(
      "font-size",
      15
    )
    .attr(
      "font-weight",
      700
    )
    .text(
      group.label
    );

  svg
    .append("text")
    .attr(
      "x",
      startX +
      width / 2
    )
    .attr("y", 91)
    .attr(
      "text-anchor",
      "middle"
    )
    .attr(
      "fill",
      "#657089"
    )
    .attr(
      "font-size",
      12
    )
    .text(
      `${group.students.length} students • Avg GPA ${averageGPA.toFixed(2)}`
    );

  const x =
    d3.scaleBand()
      .domain([
        "Low",
        "Moderate",
        "High"
      ])
      .range([
        startX + 40,
        startX +
        width - 40
      ])
      .padding(0.25);

  const y =
    d3.scaleLinear()
      .domain([
        0,
        100
      ])
      .range([
        chartTop +
        chartHeight,
        chartTop
      ]);

  svg
    .append("g")
    .attr(
      "transform",
      `translate(0,${
        chartTop +
        chartHeight
      })`
    )
    .call(
      d3.axisBottom(x)
    );

  svg
    .append("g")
    .attr(
      "transform",
      `translate(${
        startX + 40
      },0)`
    )
    .call(
      d3.axisLeft(y)
        .ticks(5)
        .tickFormat(
          (value) =>
            `${value}%`
        )
    );

  svg
    .selectAll(
      `.comparison-${panelKey}`
    )
    .data(
      distribution
    )
    .join("rect")
    .attr(
      "class",
      `comparison-${panelKey}`
    )
    .attr(
      "x",
      (item) =>
        x(item.level)
    )
    .attr(
      "y",
      (item) =>
        y(item.percent)
    )
    .attr(
      "width",
      x.bandwidth()
    )
    .attr(
      "height",
      (item) =>
        y(0) -
        y(item.percent)
    )
    .attr(
      "fill",
      (item) =>
        stressColors[
          item.level
        ]
    )
    .attr(
      "rx",
      5
    );

  svg
    .selectAll(
      `.comparison-label-${panelKey}`
    )
    .data(
      distribution
    )
    .join("text")
    .attr(
      "class",
      `comparison-label-${panelKey}`
    )
    .attr(
      "x",
      (item) =>
        x(item.level) +
        x.bandwidth() / 2
    )
    .attr(
      "y",
      (item) =>
        y(item.percent) - 8
    )
    .attr(
      "text-anchor",
      "middle"
    )
    .attr(
      "font-size",
      12
    )
    .attr(
      "font-weight",
      600
    )
    .text(
      (item) =>
        `${item.percent.toFixed(1)}%`
    );
}

function renderView5() {
  if (!view5Groups.length) {
    return;
  }

  const groupA =
    view5Groups.find(
      (group) =>
        group.id ===
        document.querySelector(
          "#view5-a"
        ).value
    );

  const groupB =
    view5Groups.find(
      (group) =>
        group.id ===
        document.querySelector(
          "#view5-b"
        ).value
    );

  const svg =
    createSVG(
      "#view5-chart"
    );

  const width =
    Number(
      svg.attr("width")
    );

  const half =
    width / 2;

  svg
    .append("line")
    .attr(
      "x1",
      half
    )
    .attr(
      "x2",
      half
    )
    .attr(
      "y1",
      35
    )
    .attr(
      "y2",
      420
    )
    .attr(
      "stroke",
      "#dfe4ee"
    )
    .attr(
      "stroke-width",
      2
    );

  drawComparisonPanel(
    svg,
    groupA,
    0,
    half
  );

  drawComparisonPanel(
    svg,
    groupB,
    half,
    half
  );

  const avgA =
    d3.mean(
      groupA.students,
      (student) =>
        student.gpa
    );

  const avgB =
    d3.mean(
      groupB.students,
      (student) =>
        student.gpa
    );

  const highA =
    stressDistribution(
      groupA.students
    ).find(
      (item) =>
        item.level === "High"
    ).percent;

  const highB =
    stressDistribution(
      groupB.students
    ).find(
      (item) =>
        item.level === "High"
    ).percent;

  document.querySelector(
    "#view5-takeaway"
  ).textContent =
    `${groupA.label} students have an average GPA of ${avgA.toFixed(2)} and ${highA.toFixed(1)}% are in the High stress category. ${groupB.label} students have an average GPA of ${avgB.toFixed(2)} and ${highB.toFixed(1)}% are in the High stress category.`;
}

function populateFilter(
  selector,
  field
) {
  const select =
    document.querySelector(
      selector
    );

  const definitions =
    getGroupDefinitions(field);

  select.innerHTML =
    `<option value="All">Any</option>`;

  definitions.forEach(
    (definition) => {
      select.add(
        new Option(
          definition.label,
          definition.id
        )
      );
    }
  );
}

function populateView6Filters() {
  populateFilter(
    "#view6-study",
    "studyHours"
  );

  populateFilter(
    "#view6-sleep",
    "sleepHours"
  );

  populateFilter(
    "#view6-physical",
    "physicalHours"
  );
}

function matchesSelectedGroup(
  student,
  field,
  selected
) {
  if (
    selected === "All"
  ) {
    return true;
  }

  const definition =
    getGroupDefinitions(
      field
    ).find(
      (group) =>
        group.id === selected
    );

  return definition.matches(
    student[field]
  );
}

function createView6Metrics(
  students
) {
  if (
    students.length === 0
  ) {
    const emptyMetrics = [
      {
        value: "0",
        label: "matching students"
      },
      {
        value: "—",
        label: "average GPA"
      },
      {
        value: "—",
        label: "high stress"
      },
      {
        value: "—",
        label: "average sleep"
      }
    ];

    d3.select(
      "#view6-metrics"
    )
      .selectAll(".metric")
      .data(emptyMetrics)
      .join("div")
      .attr(
        "class",
        "metric"
      )
      .html(
        (item) => `
          <strong>
            ${item.value}
          </strong>

          <span>
            ${item.label}
          </span>
        `
      );

    return;
  }

  const averageGPA =
    d3.mean(
      students,
      (student) =>
        student.gpa
    );

  const averageSleep =
    d3.mean(
      students,
      (student) =>
        student.sleepHours
    );

  const highStress =
    students.filter(
      (student) =>
        student.stress ===
        "High"
    ).length /
    students.length *
    100;

  const metrics = [
    {
      value:
        students.length.toLocaleString(),

      label:
        "matching students"
    },

    {
      value:
        averageGPA.toFixed(2),

      label:
        "average GPA"
    },

    {
      value:
        `${highStress.toFixed(1)}%`,

      label:
        "high stress"
    },

    {
      value:
        `${averageSleep.toFixed(2)} hrs`,

      label:
        "average sleep"
    }
  ];

  d3.select(
    "#view6-metrics"
  )
    .selectAll(".metric")
    .data(metrics)
    .join("div")
    .attr(
      "class",
      "metric"
    )
    .html(
      (item) => `
        <strong>
          ${item.value}
        </strong>

        <span>
          ${item.label}
        </span>
      `
    );
}

function drawView6Chart(
  students
) {
  const svg =
    createSVG(
      "#view6-chart"
    );

  const width =
    Number(
      svg.attr("width")
    );

  const height = 470;

  const distribution =
    stressDistribution(
      students
    );

  /*
    LEFT SIDE:
    100% stacked stress bar
  */

  const leftStart = 65;
  const leftWidth =
    width * 0.42;

  svg
    .append("text")
    .attr(
      "x",
      leftStart
    )
    .attr(
      "y",
      60
    )
    .attr(
      "font-size",
      15
    )
    .attr(
      "font-weight",
      700
    )
    .text(
      "Stress distribution"
    );

  let cumulative = 0;

  distribution.forEach(
    (item) => {
      const barWidth =
        leftWidth *
        item.percent /
        100;

      svg
        .append("rect")
        .attr(
          "x",
          leftStart +
          cumulative
        )
        .attr(
          "y",
          120
        )
        .attr(
          "width",
          barWidth
        )
        .attr(
          "height",
          70
        )
        .attr(
          "fill",
          stressColors[
            item.level
          ]
        );

      if (
        item.percent >= 8
      ) {
        svg
          .append("text")
          .attr(
            "x",
            leftStart +
            cumulative +
            barWidth / 2
          )
          .attr(
            "y",
            161
          )
          .attr(
            "text-anchor",
            "middle"
          )
          .attr(
            "fill",
            "white"
          )
          .attr(
            "font-weight",
            700
          )
          .attr(
            "font-size",
            12
          )
          .text(
            `${item.percent.toFixed(1)}%`
          );
      }

      cumulative +=
        barWidth;
    }
  );

  distribution.forEach(
    (item, index) => {
      const y =
        235 +
        index * 30;

      svg
        .append("circle")
        .attr(
          "cx",
          leftStart
        )
        .attr(
          "cy",
          y
        )
        .attr(
          "r",
          7
        )
        .attr(
          "fill",
          stressColors[
            item.level
          ]
        );

      svg
        .append("text")
        .attr(
          "x",
          leftStart + 16
        )
        .attr(
          "y",
          y + 4
        )
        .attr(
          "font-size",
          12
        )
        .text(
          `${item.level}: ${item.count} students`
        );
    }
  );

  /*
    DIVIDER
  */

  svg
    .append("line")
    .attr(
      "x1",
      width / 2
    )
    .attr(
      "x2",
      width / 2
    )
    .attr(
      "y1",
      40
    )
    .attr(
      "y2",
      420
    )
    .attr(
      "stroke",
      "#dfe4ee"
    )
    .attr(
      "stroke-width",
      2
    );

  /*
    RIGHT SIDE:
    GPA histogram
  */

  const histogramStart =
    width / 2 + 65;

  const histogramWidth =
    width / 2 - 105;

  svg
    .append("text")
    .attr(
      "x",
      histogramStart
    )
    .attr(
      "y",
      60
    )
    .attr(
      "font-size",
      15
    )
    .attr(
      "font-weight",
      700
    )
    .text(
      "GPA distribution"
    );

  const x =
    d3.scaleLinear()
      .domain([
        2.2,
        4
      ])
      .range([
        histogramStart,
        histogramStart +
        histogramWidth
      ]);

  const bins =
    d3.bin()
      .value(
        (student) =>
          student.gpa
      )
      .domain(
        x.domain()
      )
      .thresholds(10)(
        students
      );

  const y =
    d3.scaleLinear()
      .domain([
        0,
        d3.max(
          bins,
          (bin) =>
            bin.length
        )
      ])
      .nice()
      .range([
        365,
        100
      ]);

  svg
    .append("g")
    .attr(
      "transform",
      "translate(0,365)"
    )
    .call(
      d3.axisBottom(x)
      .ticks(6)
    );

  svg
    .append("g")
    .attr(
      "transform",
      `translate(${histogramStart},0)`
    )
    .call(
      d3.axisLeft(y)
      .ticks(5)
    );

  svg
    .selectAll(
      ".gpa-bin"
    )
    .data(bins)
    .join("rect")
    .attr(
      "x",
      (bin) =>
        x(bin.x0) + 1
    )
    .attr(
      "y",
      (bin) =>
        y(bin.length)
    )
    .attr(
      "width",
      (bin) =>
        Math.max(
          0,
          x(bin.x1) -
          x(bin.x0) -
          2
        )
    )
    .attr(
      "height",
      (bin) =>
        365 -
        y(bin.length)
    )
    .attr(
      "fill",
      "#3154d4"
    )
    .attr(
      "opacity",
      0.75
    );

  svg
    .append("text")
    .attr(
      "x",
      histogramStart +
      histogramWidth / 2
    )
    .attr(
      "y",
      410
    )
    .attr(
      "text-anchor",
      "middle"
    )
    .attr(
      "font-weight",
      600
    )
    .text(
      "GPA"
    );
}

function renderView6() {
  const study =
    document.querySelector(
      "#view6-study"
    ).value;

  const sleep =
    document.querySelector(
      "#view6-sleep"
    ).value;

  const physical =
    document.querySelector(
      "#view6-physical"
    ).value;

  const students =
    data.filter(
      (student) =>
        matchesSelectedGroup(
          student,
          "studyHours",
          study
        ) &&
        matchesSelectedGroup(
          student,
          "sleepHours",
          sleep
        ) &&
        matchesSelectedGroup(
          student,
          "physicalHours",
          physical
        )
    );

  createView6Metrics(
    students
  );

  const chart =
    document.querySelector(
      "#view6-chart"
    );

  const empty =
    document.querySelector(
      "#view6-empty"
    );

  if (
    students.length === 0
  ) {
    chart.classList.add(
      "hidden"
    );

    empty.classList.remove(
      "hidden"
    );

    document.querySelector(
      "#view6-takeaway"
    ).textContent =
      "No students match this exact profile. The visualization handles the zero-match boundary case without estimating or inventing values.";

    return;
  }

  chart.classList.remove(
    "hidden"
  );

  empty.classList.add(
    "hidden"
  );

  drawView6Chart(
    students
  );

  const averageGPA =
    d3.mean(
      students,
      (student) =>
        student.gpa
    );

  document.querySelector(
    "#view6-takeaway"
  ).textContent =
    `${students.length} students match the selected lifestyle profile. Their average GPA is ${averageGPA.toFixed(2)}. This final view combines multiple variables rather than examining one factor at a time.`;
}

function setupViewControls() {
  document
    .querySelector(
      "#view1-layout"
    )
    .addEventListener(
      "change",
      renderView1
    );

  document
    .querySelector(
      "#view2-stress-filter"
    )
    .addEventListener(
      "change",
      renderView2
    );

  document
    .querySelector(
      "#view3-stress-filter"
    )
    .addEventListener(
      "change",
      renderView3
    );

  document
    .querySelector(
      "#view4-factor"
    )
    .addEventListener(
      "change",
      renderView4
    );

  document
    .querySelector(
      "#view5-variable"
    )
    .addEventListener(
      "change",
      () => {
        updateView5Groups();
        renderView5();
      }
    );

  document
    .querySelector(
      "#view5-a"
    )
    .addEventListener(
      "change",
      renderView5
    );

  document
    .querySelector(
      "#view5-b"
    )
    .addEventListener(
      "change",
      renderView5
    );

  document
    .querySelector(
      "#view6-study"
    )
    .addEventListener(
      "change",
      renderView6
    );

  document
    .querySelector(
      "#view6-sleep"
    )
    .addEventListener(
      "change",
      renderView6
    );

  document
    .querySelector(
      "#view6-physical"
    )
    .addEventListener(
      "change",
      renderView6
    );

  document
    .querySelector(
      "#view6-reset"
    )
    .addEventListener(
      "click",
      () => {
        document.querySelector(
          "#view6-study"
        ).value =
          "All";

        document.querySelector(
          "#view6-sleep"
        ).value =
          "All";

        document.querySelector(
          "#view6-physical"
        ).value =
          "All";

        renderView6();
      }
    );
}

function setupResetButton() {
  document
    .querySelector(
      "#global-reset"
    )
    .addEventListener(
      "click",
      () => {
        document.querySelector(
          "#view1-layout"
        ).value =
          "stress";

        document.querySelector(
          "#view2-stress-filter"
        ).value =
          "All";

        document.querySelector(
          "#view3-stress-filter"
        ).value =
          "All";

        document.querySelector(
          "#view4-factor"
        ).value =
          "studyHours";

        document.querySelector(
          "#view5-variable"
        ).value =
          "sleepHours";

        document.querySelector(
          "#view6-study"
        ).value =
          "All";

        document.querySelector(
          "#view6-sleep"
        ).value =
          "All";

        document.querySelector(
          "#view6-physical"
        ).value =
          "All";

        updateView5Groups();

        document
          .querySelectorAll(
            ".view-tab"
          )
          .forEach(
            (tab) => {
              tab.classList.remove(
                "active"
              );
            }
          );

        document
          .querySelectorAll(
            ".story-view"
          )
          .forEach(
            (view) => {
              view.classList.remove(
                "active"
              );
            }
          );

        document
          .querySelector(
            '.view-tab[data-view="1"]'
          )
          .classList.add(
            "active"
          );

        document
          .querySelector(
            "#view-1"
          )
          .classList.add(
            "active"
          );

        renderView1();
      }
    );
}

function init() {
  setupNavigation();

  setupViewControls();

  setupResetButton();

  loadDataset();
}

init();