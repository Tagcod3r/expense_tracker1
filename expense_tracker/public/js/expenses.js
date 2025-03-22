// expense search optimization
document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.getElementById("searchBar");
    const expenseTable = document.getElementById("expenseTable");
  
    if (!searchBar || !expenseTable) return;
  
    searchBar.addEventListener("input", () => {
      const filterText = searchBar.value.toLowerCase();
      const rows = expenseTable.querySelectorAll("tbody tr");
  
      rows.forEach(row => {
        const dateTime = row.cells[0].textContent.toLowerCase();
        const spent = row.cells[1].textContent.toLowerCase();
  
        // Show row if search text is in either dateTime or spent
        if (dateTime.includes(filterText) || spent.includes(filterText)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  });
  