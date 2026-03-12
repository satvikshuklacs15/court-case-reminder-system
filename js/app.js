function login() {
  window.location.href = "dashboard.html";
}

window.onload = function () {
  let cases = JSON.parse(localStorage.getItem("cases")) || [];

  let table = document.getElementById("caseTable");

  let totalCases = document.getElementById("totalCases");
  let upcomingCount = document.getElementById("upcomingCount");

  if (totalCases) totalCases.innerText = cases.length;

  let upcoming = 0;

  if (table) {
    cases.forEach((c, index) => {
      let row = table.insertRow();

      row.insertCell(0).innerText = c.number;
      row.insertCell(1).innerText = c.department;
      row.insertCell(2).innerText = c.date;
      if (c.fileData) {
        row.insertCell(3).innerHTML =
          `<a href="${c.fileData}" download="${c.fileName}">Download PDF</a>`;
      } else {
        row.insertCell(3).innerText = "No File";
      }

      let statusCell = row.insertCell(4);

      let today = new Date();
      let hearing = new Date(c.date);

      let diffDays = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));

      if (diffDays <= 7 && diffDays >= 0) {
        statusCell.innerHTML = "⚠ Hearing in " + diffDays + " days";
        statusCell.style.color = "red";

        upcoming++;
      } else {
        statusCell.innerHTML = "OK";
      }

      let actionCell = row.insertCell(5);

      actionCell.innerHTML = `<button onclick="deleteCase(${index})">Delete</button>`;
    });
  }

  if (upcomingCount) upcomingCount.innerText = upcoming;
};
function addCase() {
  let caseNumber = document.getElementById("caseNumber").value;
  let department = document.getElementById("department").value;
  let hearingDate = document.getElementById("hearingDate").value;

  let fileInput = document.getElementById("caseFile");
  let file = fileInput.files[0];

  let reader = new FileReader();

  reader.onload = function (e) {
    let caseData = {
      number: caseNumber,
      department: department,
      date: hearingDate,
      fileName: file ? file.name : "No File",
      fileData: file ? e.target.result : null,
    };

    let cases = JSON.parse(localStorage.getItem("cases")) || [];

    cases.push(caseData);

    localStorage.setItem("cases", JSON.stringify(cases));

    alert("Case Added Successfully");

    window.location.href = "dashboard.html";
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    reader.onload({ target: { result: null } });
  }
}

window.addEventListener("load", function () {
  let upcomingTable = document.getElementById("upcomingTable");

  if (!upcomingTable) return;

  let cases = JSON.parse(localStorage.getItem("cases")) || [];

  let today = new Date();

  cases.forEach((c) => {
    let hearing = new Date(c.date);

    let diffDays = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));

    if (diffDays <= 7 && diffDays >= 0) {
      let row = upcomingTable.insertRow();

      row.insertCell(0).innerText = c.number;
      row.insertCell(1).innerText = c.department;
      row.insertCell(2).innerText = c.date;
      if (c.fileData) {
        row.insertCell(3).innerHTML =
          `<a href="${c.fileData}" download="${c.fileName}">Download PDF</a>`;
      } else {
        row.insertCell(3).innerText = "No File";
      }

      let status = row.insertCell(4);
      status.innerHTML = "⚠ Hearing in " + diffDays + " days";
      status.style.color = "red";
    }
  });
});
function deleteCase(index) {
  let cases = JSON.parse(localStorage.getItem("cases")) || [];

  cases.splice(index, 1);

  localStorage.setItem("cases", JSON.stringify(cases));

  location.reload();
}
