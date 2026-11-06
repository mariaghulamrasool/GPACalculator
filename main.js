const gradingScales = {
   muet: {
      grades: { "A+": 4, A: 3.5, "B+": 3, B: 2.5, "C+": 2, C: 1.5, "C-": 1, F: 0 }
   },
   sau: {
      grades: { A: 4, "A-": 3.67, "B+": 3.33, B: 3, "B-": 2.67, "C+": 2.33, C: 2, "C-": 1.67, "D+": 1.33, D: 1, F: 0 }
   },
   usindh: {
      grades: { "A+": 4, A: 3.6, "B+": 3.2, B: 2.8, "C+": 2.4, C: 2, "D+": 1.5, D: 1, F: 0 }
   },
   qau: {
      grades: { A: 4, "A-": 3.8, "B+": 3.5, B: 3, "B-": 2.8, "C+": 2.5, C: 2, D: 1, F: 0 }
   }
};

const creditWeights = { major: 3, minor: 2, practical: 1 };
const universitySelect = document.querySelector("#university");
const courseList = document.querySelector("#course-list");
const emptyState = document.querySelector("#empty-state");
const scaleHint = document.querySelector("#scale-hint");

function addCourse(category = "major") {
   const row = document.createElement("div");
   row.className = "course-row";
   row.innerHTML = `
      <input class="course-name" type="text" maxlength="48" placeholder="e.g. Calculus" aria-label="Course name">
      <select class="course-type" aria-label="Course type">
         <option value="major">Major · 3 cr</option>
         <option value="minor">Minor · 2 cr</option>
         <option value="practical">Practical · 1 cr</option>
      </select>
      <div class="course-grade-cell"><select class="course-grade" aria-label="Course grade"></select><span class="grade-points" aria-hidden="true">—</span></div>
      <button class="remove-course" type="button" aria-label="Remove course" title="Remove course">×</button>
   `;
   row.querySelector(".course-type").value = category;
   courseList.append(row);
   updateGradeOptions(row);
   updateResults();
   row.querySelector(".course-name").focus();
}

function updateGradeOptions(row) {
   const gradeSelect = row.querySelector(".course-grade");
   const previousGrade = gradeSelect.value;
   const grades = gradingScales[universitySelect.value].grades;
   gradeSelect.replaceChildren(new Option("Grade", ""));

   Object.entries(grades).forEach(([grade, points]) => {
      const option = new Option(grade, grade);
      option.dataset.points = String(points);
      gradeSelect.add(option);
   });

   if (Object.hasOwn(grades, previousGrade)) gradeSelect.value = previousGrade;
   updateGradePoints(row);
}

function updateGradePoints(row) {
   const gradeSelect = row.querySelector(".course-grade");
   const points = gradeSelect.selectedOptions[0]?.dataset.points;
   row.querySelector(".grade-points").textContent = points === undefined ? "—" : Number(points).toFixed(2);
}

function updateResults() {
   const rows = [...courseList.querySelectorAll(".course-row")];
   const gradedRows = rows.filter((row) => row.querySelector(".course-grade").value !== "");
   const allGraded = rows.length > 0 && gradedRows.length === rows.length;
   const credits = rows.reduce((total, row) => total + creditWeights[row.querySelector(".course-type").value], 0);
   const qualityPoints = gradedRows.reduce((total, row) => {
      const gradeSelect = row.querySelector(".course-grade");
      const points = Number(gradeSelect.selectedOptions[0]?.dataset.points ?? 0);
      return total + points * creditWeights[row.querySelector(".course-type").value];
   }, 0);
   const gpa = allGraded ? qualityPoints / credits : null;

   document.querySelector("#credit-total").textContent = String(credits);
   document.querySelector("#quality-total").textContent = allGraded ? qualityPoints.toFixed(2) : "—";
   document.querySelector("#course-total").textContent = `${gradedRows.length} / ${rows.length}`;
   document.querySelector("#gpa-value").textContent = gpa === null ? "—" : gpa.toFixed(2);
   document.querySelector("#gpa-status").textContent = rows.length === 0
      ? "Add a course to begin."
      : allGraded
         ? "All courses are graded."
         : `Choose a grade for ${rows.length - gradedRows.length} more ${rows.length - gradedRows.length === 1 ? "course" : "courses"}.`;

   const rating = gpa === null
      ? "Ready when you are"
      : gpa >= 3.7
         ? "Outstanding work"
         : gpa >= 3
            ? "Strong semester"
            : gpa >= 2
               ? "Building momentum"
               : "Keep moving forward";
   document.querySelector("#gpa-rating").textContent = rating;

   const progress = gpa === null ? 0 : (gpa / 4) * 100;
   const gpaRing = document.querySelector("#gpa-ring");
   gpaRing.style.background = `conic-gradient(var(--mint) ${progress}%, #36574b ${progress}%)`;
   gpaRing.setAttribute("aria-label", gpa === null ? "GPA not calculated" : `GPA ${gpa.toFixed(2)} out of 4.00`);
   emptyState.hidden = rows.length !== 0;
}

function updateScaleHint() {
   const grades = gradingScales[universitySelect.value].grades;
   scaleHint.textContent = `Available grades: ${Object.keys(grades).join(", ")}`;
}

document.querySelector("#add-course-button").addEventListener("click", () => addCourse());
document.querySelector("#reset-button").addEventListener("click", () => {
   universitySelect.value = "muet";
   courseList.replaceChildren();
   updateScaleHint();
   addCourse();
});

courseList.addEventListener("click", (event) => {
   const removeButton = event.target.closest(".remove-course");
   if (!removeButton) return;
   removeButton.closest(".course-row").remove();
   updateResults();
});

courseList.addEventListener("change", (event) => {
   const row = event.target.closest(".course-row");
   if (!row) return;
   if (event.target.matches(".course-grade")) updateGradePoints(row);
   updateResults();
});

universitySelect.addEventListener("change", () => {
   courseList.querySelectorAll(".course-row").forEach(updateGradeOptions);
   updateScaleHint();
   updateResults();
});

updateScaleHint();
addCourse();

