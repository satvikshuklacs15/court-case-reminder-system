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
  let urgentHearings = [];

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
        upcoming++;
      }

      if (diffDays === 0) {
        statusCell.innerHTML = "⚠ Hearing Today";
        statusCell.style.color = "red";
      } else if (diffDays === 1) {
        statusCell.innerHTML = "⚠ Hearing Tomorrow";
        statusCell.style.color = "red";
      } else if (diffDays <= 3) {
        statusCell.innerHTML = "⚠ Hearing in " + diffDays + " Days";
        statusCell.style.color = "orange";
      } else if (diffDays <= 7) {
        statusCell.innerHTML = "Hearing in " + diffDays + " Days";
        statusCell.style.color = "#1F4E79";
      } else {
        statusCell.innerHTML = "Scheduled";
      }

      let actionCell = row.insertCell(5);

      actionCell.innerHTML = `<button onclick="deleteCase(${index})">Delete</button>`;

      if (diffDays === 0) {
        urgentHearings.push("Case " + c.number + " — Hearing Today");
      }

      if (diffDays === 1) {
        urgentHearings.push("Case " + c.number + " — Hearing Tomorrow");
      }
    });
  }

  if (upcomingCount) upcomingCount.innerText = upcoming;

  let popup = document.getElementById("hearingPopup");
  let hearingList = document.getElementById("hearingList");

  if (urgentHearings.length > 0 && popup) {
    urgentHearings.forEach((h) => {
      let li = document.createElement("li");
      li.innerText = h;
      hearingList.appendChild(li);
    });

    popup.style.display = "flex";
  }
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
      if (diffDays === 0) {
        status.innerHTML = "⚠ Hearing Today";
        status.style.color = "red";
      } else if (diffDays === 1) {
        status.innerHTML = "⚠ Hearing Tomorrow";
        status.style.color = "red";
      } else if (diffDays <= 3) {
        status.innerHTML = "⚠ Hearing in " + diffDays + " Days";
        status.style.color = "orange";
      } else {
        status.innerHTML = "Hearing in " + diffDays + " Days";
      }
    }
  });
});
function deleteCase(index) {
  let cases = JSON.parse(localStorage.getItem("cases")) || [];

  cases.splice(index, 1);

  localStorage.setItem("cases", JSON.stringify(cases));

  location.reload();
}
function closePopup(){
document.getElementById("hearingPopup").style.display="none";
}