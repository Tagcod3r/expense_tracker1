/* ===========================
   CHART & REPORT LOGIC
=========================== */
let chart;

// 1) Fetch dynamic data from your /api/report endpoint
async function fetchReportData() {
  try {
    const response = await fetch("/api/report");
    const data = await response.json();
    // Extract labels and totals from the data
    const labels = data.map(item => item.category_name);
    const totals = data.map(item => parseFloat(item.total));
    return { labels, totals };
  } catch (error) {
    console.error("Error fetching report data:", error);
    return { labels: [], totals: [] };
  }
}

// 2) Chart Generation Functions
async function generatePieChart() {
  const { labels, totals } = await fetchReportData();
  const ctx = document.getElementById("chartCanvas").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels.length > 0 ? labels : ["No Data"],
      datasets: [{
        data: totals.length > 0 ? totals : [1],
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
          "#9966FF", "#FF9F40", "#C9CBCF", "#E7E9ED",
          "#FF4500", "#32CD32", "#FFD700", "#DA70D6",
          "#00CED1", "#FF1493", "#00BFFF", "#ADFF2F",
          "#FF7F50", "#8A2BE2", "#7FFF00", "#DC143C"
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

async function generateBarChart() {
  const { labels, totals } = await fetchReportData();
  const ctx = document.getElementById("chartCanvas").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels.length > 0 ? labels : ["No Data"],
      datasets: [{
        label: "Expenses",
        data: totals.length > 0 ? totals : [1],
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
          "#9966FF", "#FF9F40", "#C9CBCF", "#E7E9ED",
          "#FF4500", "#32CD32", "#FFD700", "#DA70D6",
          "#00CED1", "#FF1493", "#00BFFF", "#ADFF2F",
          "#FF7F50", "#8A2BE2", "#7FFF00", "#DC143C"
        ]
        
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

async function generateLineChart() {
  const { labels, totals } = await fetchReportData();
  const ctx = document.getElementById("chartCanvas").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels.length > 0 ? labels : ["No Data"],
      datasets: [{
        label: "Expenses",
        data: totals.length > 0 ? totals : [1],
        borderColor: "#36A2EB",
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// 3) Download Functions
function downloadImage() {
  const canvas = document.getElementById("chartCanvas");
  const imageURL = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = imageURL;
  a.download = "report.png";
  a.click();
}

function downloadPDF() {
  const canvas = document.getElementById("chartCanvas");
  const imageURL = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("landscape");
  pdf.addImage(imageURL, "PNG", 10, 10, 280, 150);
  pdf.save("report.pdf");
}

function showDownloadOptions() {
  document.getElementById("downloadOptions").style.display = "block";
}

// 4) Generate Chart on "Generate Report" Button Click
document.getElementById("generateReport").addEventListener("click", async function () {
  const reportType = document.querySelector('input[name="reportType"]:checked').value;
  if (reportType === "pie") {
    await generatePieChart();
  } else if (reportType === "bar") {
    await generateBarChart();
  } else if (reportType === "line") {
    await generateLineChart();
  }
  // After generating the chart, show the download options
  setTimeout(showDownloadOptions, 500);
});

// ===========================
// MODAL & "Save & Download" LOGIC
// ===========================
const reportModal = document.getElementById("reportModal");
const closeModalBtn = document.getElementById("closeModal");
const reportForm = document.getElementById("reportForm");
const reportTypeField = document.getElementById("reportTypeField");

// Ensure modal and its content are non-draggable via inline attributes (set in HTML)
// Also enforce via JS:
document.addEventListener("DOMContentLoaded", function () {
  reportModal.setAttribute("draggable", "false");
  reportModal.ondragstart = () => false;
  const modalContent = document.querySelector(".modal-content");
  modalContent.setAttribute("draggable", "false");
  modalContent.ondragstart = () => false;
});

// Show / Hide Modal Functions
function showModal() {
  reportModal.classList.add("show");
}
function hideModal() {
  reportModal.classList.remove("show");
}
closeModalBtn.addEventListener("click", hideModal);

// Intercept download button clicks to show the modal first
const downloadImageBtn = document.getElementById("downloadImageBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");

downloadImageBtn.addEventListener("click", (e) => {
  e.preventDefault();
  reportTypeField.value = "image";
  showModal();
});
downloadPdfBtn.addEventListener("click", (e) => {
  e.preventDefault();
  reportTypeField.value = "pdf";
  showModal();
});

// Save & Download: POST to /api/save-report, then perform download
reportForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const desc = document.getElementById("reportDesc").value;
  const type = reportTypeField.value;
  try {
    const response = await fetch("/api/save-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, reportDesc: desc })
    });
    if (!response.ok) throw new Error("Failed to save report in DB");
    hideModal();
    if (type === "pdf") {
      downloadPDF();
    } else if (type === "image") {
      downloadImage();
    }
  } catch (err) {
    console.error("Error saving report:", err);
    alert("Could not save report. Try again.");
  }
});

// Optionally, generate a default chart on page load
(async function init() {
  await generatePieChart();
  showDownloadOptions();
})();
