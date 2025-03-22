document.addEventListener("DOMContentLoaded", function() {
    // Get the modal and relevant elements
    const viewAllLink = document.getElementById("viewAllLink");
    const viewAllModal = document.getElementById("viewAllModal");
    const closeBtn = viewAllModal.querySelector(".close");
    
    // Show modal when "View All" is clicked
    viewAllLink.addEventListener("click", function(e) {
      e.preventDefault();
      viewAllModal.style.display = "block";
    });
    
    // Close modal when close button is clicked
    closeBtn.addEventListener("click", function() {
      viewAllModal.style.display = "none";
    });
    
    // Close modal when clicking outside the modal content
    window.addEventListener("click", function(e) {
      if (e.target === viewAllModal) {
        viewAllModal.style.display = "none";
      }
    });
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".delete-btn").forEach(button => {
      button.addEventListener("click", async function () {
        const expenseId = this.getAttribute("data-id");
        console.log("Expense ID from button:", expenseId); // Debug log
  
        if (!expenseId) return alert("Expense ID missing!");
  
        const confirmed = confirm("Are you sure you want to delete this expense?");
        if (!confirmed) return;
  
        const response = await fetch("/delete-expense", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expense_id: expenseId }),
        });
  
        const result = await response.json();
        if (result.success) {
          this.closest(".expense-card").remove(); // Remove from UI
        } else {
          alert(result.error);
        }
      });
    });
  });
  
  