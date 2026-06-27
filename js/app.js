const gradePoints = {
    "S": 10,
    "A+": 9,
    "A": 8,
    "B+": 7,
    "B": 6,
    "C": 5,
    "U": 0
};

// =========================
// STUDENT LOGIN SYSTEM
// =========================

function getCurrentStudent() {
    return localStorage.getItem("currentStudent");
}

function getStudentData() {

    const roll = getCurrentStudent();

    if (!roll) return null;

    let students =
    JSON.parse(localStorage.getItem("students")) || {};

    return students[roll] || null;
}

function saveStudentData(data) {

    const roll = getCurrentStudent();

    if (!roll) return;

    let students =
    JSON.parse(localStorage.getItem("students")) || {};

    students[roll] = data;

    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );
}

function loginStudent() {

    const roll =
    document.getElementById("loginRoll").value.trim();

    if (!roll) {
        alert("Enter Roll Number");
        return;
    }

    let students =
    JSON.parse(localStorage.getItem("students")) || {};

    if (!students[roll]) {

        const name =
        prompt("Enter Student Name");

        if (!name) return;

        students[roll] = {
            name: name,
            rollNo: roll,
            grades: {},
            gpas: {},
            arrears: []
        };

        localStorage.setItem(
            "students",
            JSON.stringify(students)
        );
    }

    localStorage.setItem(
        "currentStudent",
        roll
    );

    location.reload();
}

function logout() {

    localStorage.removeItem(
        "currentStudent"
    );

    location.reload();
}

// =========================
// PROFILE
// =========================

function loadProfile() {

    const student =
    getStudentData();

    if (!student) return;

    const nameField =
    document.getElementById("studentName");

    const rollField =
    document.getElementById("rollNo");

    if (nameField) {
        nameField.value =
        student.name || "";
    }

    if (rollField) {
        rollField.value =
        student.rollNo || "";
    }
}

function saveProfile() {

    let student =
    getStudentData();

    if (!student) return;

    student.name =
    document.getElementById("studentName").value;

    saveStudentData(student);

    alert("Profile Saved");
}
function loadSubjects() {


const semesterDropdown =
document.getElementById("semester");

if (!semesterDropdown) return;

const sem =
semesterDropdown.value;

const table =
document.getElementById("subjectsTable");

if (!table) return;

table.innerHTML = "";

const student =
getStudentData();

if (!student) return;

if (!student.grades) {
    student.grades = {};
}

semesters[sem].forEach(subject => {

    const savedGrade =
    student.grades[
        `${sem}_${subject.code}`
    ] || "";

    table.innerHTML += `
    <tr>
        <td>${subject.code}</td>
        <td>${subject.name}</td>
        <td>${subject.credit}</td>
        <td>
            <select onchange="calculateGPA()">

                <option value="">Select</option>

                <option value="S"
                ${savedGrade==="S"?"selected":""}>
                S
                </option>

                <option value="A+"
                ${savedGrade==="A+"?"selected":""}>
                A+
                </option>

                <option value="A"
                ${savedGrade==="A"?"selected":""}>
                A
                </option>

                <option value="B+"
                ${savedGrade==="B+"?"selected":""}>
                B+
                </option>

                <option value="B"
                ${savedGrade==="B"?"selected":""}>
                B
                </option>

                <option value="C"
                ${savedGrade==="C"?"selected":""}>
                C
                </option>

                <option value="U"
                ${savedGrade==="U"?"selected":""}>
                U
                </option>

            </select>
        </td>
    </tr>
    `;
});

calculateGPA();


}

// =========================
// GPA CALCULATION
// =========================

function calculateGPA() {

const sem =
document.getElementById("semester").value;

const rows =
document.querySelectorAll(
    "#subjectsTable tr"
);

let totalCredits = 0;
let totalPoints = 0;

let student =
getStudentData();

if (!student) return;

if (!student.grades) {
    student.grades = {};
}

if (!student.arrears) {
    student.arrears = [];
}

rows.forEach((row,index)=>{

    const grade =
    row.querySelector("select").value;

    const subject =
    semesters[sem][index];

    student.grades[
        `${sem}_${subject.code}`
    ] = grade;

    
    student.arrears =
   student.arrears.filter(
    a => !(a.code === subject.code && a.status === "Pending")
);
    if (
        grade === "" ||
        subject.credit <= 0
    ) {
        return;
    }

    if (grade === "U") {

    const exists = student.arrears.find(
        a => a.code === subject.code &&
             a.status === "Pending"
    );

    if (!exists) {
        student.arrears.push({
            code: subject.code,
            name: subject.name,
            credit: subject.credit,
            sem: sem,
            status: "Pending"
        });
    }

    return;
    }

    totalCredits +=
    subject.credit;

    totalPoints +=
    subject.credit *
    gradePoints[grade];
});

const gpa =
totalCredits > 0
?
totalPoints / totalCredits
:
0;

if (!student.gpas) {
    student.gpas = {};
}

student.gpas[sem] =
gpa.toFixed(2);

saveStudentData(student);

const result =
document.getElementById("gpaResult");

if(result){

    result.innerHTML =
    "Semester GPA : " +
    gpa.toFixed(2);
}

loadCGPA();
loadArrears();
updateCards();


}

function loadCGPA() {


const student =
getStudentData();

if (!student) return 0;

const table =
document.getElementById("cgpaTable");

if (table) {
    table.innerHTML = "";
}

let totalCredits = 0;
let totalPoints = 0;

if (student.gpas) {

    for (let sem = 1; sem <= 8; sem++) {

        const gpa =
        student.gpas[sem];

        if (gpa) {

            if (table) {

                table.innerHTML += `
                <tr>
                    <td>Semester ${sem}</td>
                    <td>${gpa}</td>
                </tr>
                `;
            }

            totalCredits +=
            semesterCredits[sem];

            totalPoints +=
            parseFloat(gpa) *
            semesterCredits[sem];
        }
    }
}

const cgpa =
totalCredits > 0
?
totalPoints / totalCredits
:
0;

const result =
document.getElementById("cgpaResult");

if (result) {

    result.innerHTML =
    "Current CGPA : " +
    cgpa.toFixed(2);
}

return cgpa;


}

// =========================
// ARREARS
// =========================

function loadArrears() {


const table =
document.getElementById("arrearsTable");

if (!table) return;

const student =
getStudentData();

if (!student) return;

const arrears =
student.arrears || [];

table.innerHTML = "";

if (arrears.length === 0) {

    table.innerHTML =
    "<tr><td colspan='4'>No Arrears</td></tr>";

    return;
}

arrears.forEach((a,index)=>{

    table.innerHTML += `
    <tr>

        <td>${a.code}</td>

        <td>${a.name}</td>

        <td>${a.status}</td>

        <td>

            ${
            a.status === "Pending"

            ?

            `<button onclick="clearArrear(${index})">
            Mark Cleared
            </button>`

            :

            "✔ Cleared"
            }

        </td>

    </tr>
    `;
});


}

function clearArrear(index){

    let student =
    getStudentData();

    if(!student) return;

    let arrears =
    student.arrears || [];

    let clearedSem =
    prompt("Enter semester cleared:");

    if(!clearedSem) return;

    let grade =
    prompt(
    "Enter grade obtained (S, A+, A, B+, B, C)"
    );

    if(
        !grade ||
        gradePoints[grade] === undefined ||
        grade === "U"
    ){
        alert("Invalid Grade");
        return;
    }

    arrears[index].status =
    "Cleared in Sem " + clearedSem;

    arrears[index].clearedSem =
    Number(clearedSem);

    arrears[index].grade =
    grade;

    student.arrears =
    arrears;

    saveStudentData(student);

    recalculateAllSemesters();

    loadCGPA();
    loadArrears();
    updateCards();

    alert("Arrear Cleared Successfully");
}

function recalculateAllSemesters(){

    let student =
    getStudentData();

    if(!student) return;

    student.gpas = {};

    for(let sem=1; sem<=8; sem++){

        let totalCredits = 0;
        let totalPoints = 0;

        if(!semesters[sem]) continue;

        semesters[sem].forEach(subject=>{

            let grade =
            student.grades[
            `${sem}_${subject.code}`
            ];

            if(
                !grade ||
                grade === "U" ||
                subject.credit <= 0
            ){
                return;
            }

            totalCredits += subject.credit;

            totalPoints +=
            subject.credit *
            gradePoints[grade];
        });

        (student.arrears || []).forEach(a=>{

            if(
                a.clearedSem == sem &&
                a.grade
            ){

                totalCredits += a.credit;

                totalPoints +=
                a.credit *
                gradePoints[a.grade];
            }
        });

        if(totalCredits > 0){

            student.gpas[sem] =
            (
                totalPoints /
                totalCredits
            ).toFixed(2);
        }
    }

    saveStudentData(student);
}

// =========================
// DASHBOARD CARDS
// =========================

function updateCards() {


const student =
getStudentData();

if (!student) return;

const cgpa =
loadCGPA();

const cgpaCard =
document.getElementById("cgpaCard");

if (cgpaCard) {

    cgpaCard.innerHTML =
    cgpa.toFixed(2);
}

const arrearCard =
document.getElementById("arrearCard");

if (arrearCard) {

    arrearCard.innerHTML =
    (student.arrears || [])
    .filter(
        a => a.status === "Pending"
    ).length;
}

let completed = 0;
let credits = 0;

if (student.gpas) {

    for (let sem = 1; sem <= 8; sem++) {

        if (student.gpas[sem]) {

            completed++;

            credits +=
            semesterCredits[sem];
        }
    }
}

const semCard =
document.getElementById("semCard");

if (semCard) {

    semCard.innerHTML =
    completed;
}

const creditCard =
document.getElementById("creditCard");

if (creditCard) {

    creditCard.innerHTML =
    credits;
}


}


// =========================
// CGPA PREDICTOR
// =========================

function predictCGPA() {


const targetInput =
document.getElementById("targetCgpa");

if (!targetInput) return;

const target =
parseFloat(targetInput.value);

if (isNaN(target)) {

    alert("Enter Target CGPA");
    return;
}

const student =
getStudentData();

if (!student) return;

let totalCredits = 0;
let totalPoints = 0;
let completed = 0;

if (student.gpas) {

    for (let sem = 1; sem <= 8; sem++) {

        const gpa =
        student.gpas[sem];

        if (gpa) {

            completed++;

            totalCredits +=
            semesterCredits[sem];

            totalPoints +=
            parseFloat(gpa) *
            semesterCredits[sem];
        }
    }
}

const currentCgpa =
totalCredits > 0
?
totalPoints / totalCredits
:
0;

let remainingCredits = 0;

for (
    let sem = completed + 1;
    sem <= 8;
    sem++
) {

    remainingCredits +=
    semesterCredits[sem];
}

if (remainingCredits === 0) {

    alert("All semesters completed");
    return;
}

const finalCredits =
totalCredits +
remainingCredits;

const requiredPoints =
(target * finalCredits)
-
totalPoints;

const requiredGpa =
requiredPoints /
remainingCredits;

const result =
document.getElementById("predictResult");

if (result) {

    result.innerHTML = `
    Current CGPA :
    ${currentCgpa.toFixed(2)}

    <br><br>

    Required GPA :
    ${requiredGpa.toFixed(2)}
    `;
}


}

// =========================
// STARTUP
// =========================

window.onload = function () {


const currentStudent =
localStorage.getItem(
    "currentStudent"
);

const loginScreen =
document.getElementById(
    "loginScreen"
);

const appContainer =
document.getElementById(
    "appContainer"
);

if (currentStudent) {

    if (loginScreen) {
        loginScreen.style.display =
        "none";
    }

    if (appContainer) {
        appContainer.style.display =
        "block";
    }

    loadProfile();
    loadSubjects();
    loadCGPA();
    loadArrears();
    updateCards();
    calculateGPA();

} else {

    if (loginScreen) {
        loginScreen.style.display =
        "block";
    }

    if (appContainer) {
        appContainer.style.display =
        "none";
    }
}


};
