if (sessionStorage.getItem("loggedIn") !== "true" && window.location.pathname !== "/index.html") {
  window.location.href = "index.html";
}

const supabaseUrl = "https://jebiygsmwibdtlbrrjjx.supabase.co";
const supabaseKey = "sb_publishable_RhnyqXE5j3I3nD8I4_OYNQ_PUbTX6hO";

const { createClient } = supabase;

const supabaseClient = createClient(supabaseUrl, supabaseKey);

let sortAscending = true;

window.login = function () {
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  if (username === "admin" && password === "admin123") {
      sessionStorage.setItem("loggedIn", "true");
      window.location.href = "dashboard.html";
  } 
  else {
      alert("Invalid Username or Password");
  }

};

window.onload = async function () {
  let { data: cases, error } = await supabaseClient.from("cases").select("*");

  if (error) {
    console.log(error);
    alert("Error loading cases");
    return;
  }

  let table = document.getElementById("caseTable");

  let totalCases = document.getElementById("totalCases");
  let upcomingCount = document.getElementById("upcomingCount");

  if (cases && totalCases) totalCases.innerText = cases.length;

  let upcoming = 0;
  let urgentHearings = [];

  if (table) {
    cases.forEach((c, index) => {
      let row = table.insertRow();

      row.insertCell(0).innerText = c.case_number;
      row.insertCell(1).innerText = c.department;
      row.insertCell(2).innerText = c.hearing_date;
      if (c.file_url) {
        const { data } = supabaseClient.storage
          .from("case-files")
          .getPublicUrl(c.file_url);

        row.insertCell(3).innerHTML =
          `<a href="${data.publicUrl}" target="_blank">View</a> |
           <a href="${data.publicUrl}" download>Download</a>`;
      } else {
        row.insertCell(3).innerText = "No File";
      }

      let remarksCell = row.insertCell(4);

      remarksCell.innerHTML = `<input type="text" id="remarks-${c.id}" value="${c.remarks || ""}" style="width:120px;">
<button onclick="saveRemarks(${c.id})">Save</button>`;

      let statusCell = row.insertCell(5);

      let today = new Date();
      let hearing = new Date(c.hearing_date);

      let diffDays = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));

      if (diffDays <= 7 && diffDays >= 0) {
        upcoming++;
      }
      if (diffDays < 0) {
        statusCell.innerHTML = "Hearing date passed";
        statusCell.style.color = "gray";
      } else if (diffDays === 0) {
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

      let actionCell = row.insertCell(6);

      actionCell.innerHTML = `<button onclick="deleteCase(${c.id})">Delete</button>`;

      if (diffDays === 0) {
        urgentHearings.push("Case " + c.case_number + " — Hearing Today");
      }

      if (diffDays === 1) {
        urgentHearings.push("Case " + c.case_number + " — Hearing Tomorrow");
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
async function addCase() {
  let caseNumber = document.getElementById("caseNumber").value;
  let department = document.getElementById("department").value;
  let hearingDate = document.getElementById("hearingDate").value;

  if (!caseNumber || !hearingDate) {
    alert("Please fill all required fields");
    return;
  }
  const pattern = /^[0-9/]+$/;

  if (!pattern.test(caseNumber)) {
    alert("Case number can contain only numbers and '/' only.\nExample: 1234/567");
    return;
  }

  let fileInput = document.getElementById("caseFile");
  let file = fileInput.files[0];

  let fileUrl = null;

  // Upload file to Supabase storage
  if (file) {
    const { data, error } = await supabaseClient.storage
      .from("case-files")
      .upload("cases/" + Date.now() + "_" + file.name, file);

    if (error) {
      alert("File upload failed");
      return;
    }

    fileUrl = data.path;
  }

  // Insert case into database
  const { error } = await supabaseClient.from("cases").insert([
    {
      case_number: caseNumber,
      department: department,
      hearing_date: hearingDate,
      file_url: fileUrl,
    },
  ]);

  if (error) {
    alert("Error saving case");
    console.log(error);
    return;
  }

  alert("Case Added Successfully");

  window.location.href = "dashboard.html";
}

window.addEventListener("load", async function () {
  let upcomingTable = document.getElementById("upcomingTable");

  if (!upcomingTable) return;

  let { data: cases, error } = await supabaseClient.from("cases").select("*");

  if (error) {
    console.log(error);
    alert("Error loading cases");
    return;
  }

  let today = new Date();

  cases.forEach((c) => {
    let hearing = new Date(c.hearing_date);

    let diffDays = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));

    if (diffDays <= 7 && diffDays >= 0) {
      let row = upcomingTable.insertRow();

      row.insertCell(0).innerText = c.case_number;
      row.insertCell(1).innerText = c.department;
      row.insertCell(2).innerText = c.hearing_date;
      if (c.file_url) {
        const { data } = supabaseClient.storage
          .from("case-files")
          .getPublicUrl(c.file_url);

        row.insertCell(3).innerHTML =
          `<a href="${data.publicUrl}" target="_blank">View</a> |
           <a href="${data.publicUrl}" download>Download</a>`;
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
async function deleteCase(id) {
  const { error } = await supabaseClient
    .from("cases")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Error deleting case");
    console.log(error);
    return;
  }

  location.reload();
}
function closePopup() {
  document.getElementById("hearingPopup").style.display = "none";
}

function searchCase() {
  let input = document.getElementById("searchCase").value.toLowerCase();

  let table = document.getElementById("caseTable");

  let rows = table.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    let caseNumber = rows[i].cells[0].innerText.toLowerCase();

    if (caseNumber.includes(input)) {
      rows[i].style.display = "";
    } else {
      rows[i].style.display = "none";
    }
  }
}
function sortByDate() {
  let table = document.getElementById("caseTable");

  let rows = Array.from(table.rows);

  rows.sort(function (a, b) {
    let dateA = new Date(a.cells[2].innerText);
    let dateB = new Date(b.cells[2].innerText);

    if (sortAscending) {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  });

  rows.forEach((row) => table.appendChild(row));

  sortAscending = !sortAscending;
}
async function saveRemarks(id) {
  let remarkText = document.getElementById("remarks-" + id).value;

  const { error } = await supabaseClient
    .from("cases")
    .update({ remarks: remarkText })
    .eq("id", id);

  if (error) {
    alert("Error saving remarks");
    console.log(error);
    return;
  }

  alert("Remarks saved successfully");
}

async function downloadCSV() {

  let { data: cases, error } = await supabaseClient
    .from("cases")
    .select("*");

  if (error) {
    alert("Error downloading data");
    return;
  }

  let csv = "Case Number,Department,Hearing Date,Remarks\n";

  cases.forEach(c => {
    csv += `${c.case_number},${c.department},${c.hearing_date},${c.remarks || ""}\n`;
  });

  let blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  let url = window.URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "all_cases.csv";
  a.click();
}

async function downloadUpcomingCSV() {

  let { data: cases, error } = await supabaseClient
    .from("cases")
    .select("*");

  if (error) {
    alert("Error downloading data");
    return;
  }

  let today = new Date();
  let csv = "Case Number,Department,Hearing Date\n";

  cases.forEach(c => {

    let hearing = new Date(c.hearing_date);
    let diffDays = Math.ceil((hearing - today) / (1000*60*60*24));

    if (diffDays <= 7 && diffDays >= 0) {
      csv += `${c.case_number},${c.department},${c.hearing_date}\n`;
    }

  });

  let blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  let url = window.URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "upcoming_hearings.csv";
  a.click();
}