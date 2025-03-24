document.addEventListener("DOMContentLoaded", function () {
  // Elements for the initial expense modal
  const addExpenseBtns = document.querySelectorAll(".add-expense-btn");
  const expenseModal = document.getElementById("expenseModal");
  const closeModalBtn = document.getElementById("closeModal");
  const expenseForm = document.getElementById("expenseForm");
  const proceedBtn = document.getElementById("proceedExpense");
  const categoryPillsContainer = document.getElementById("categoryPills");
  const categoryInput = document.getElementById("category");

  // Elements for the expense details modal
  const expenseDetailsModal = document.getElementById("expenseDetailsModal");
  const closeDetailsModalBtn = document.getElementById("closeDetailsModal");
  const cancelDetailsModalBtn = document.getElementById("cancelDetailsModal");
  const expenseDetailsForm = document.getElementById("expenseDetailsForm");

  // Open expense modal on clicking add expense button
  addExpenseBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      expenseModal.classList.remove("hidden");
      expenseModal.classList.add("show");
    });
  });

  // Function to close a modal (used for both modals)
  function closeModal(modalElement) {
    modalElement.classList.remove("show");
    setTimeout(() => {
      modalElement.classList.add("hidden");
    }, 400);
  }

  // Close modal via buttons
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => closeModal(expenseModal));
  }
  if (closeDetailsModalBtn) {
    closeDetailsModalBtn.addEventListener("click", () => closeModal(expenseDetailsModal));
  }
  if (cancelDetailsModalBtn) {
    cancelDetailsModalBtn.addEventListener("click", () => closeModal(expenseDetailsModal));
  }

  // Category pills: update category input
  if (categoryPillsContainer && categoryInput) {
    categoryPillsContainer.addEventListener("click", function (e) {
      if (e.target && e.target.classList.contains("pill")) {
        // Remove active from all pills and add to clicked one
        const pills = categoryPillsContainer.querySelectorAll(".pill");
        pills.forEach(p => p.classList.remove("active"));
        e.target.classList.add("active");
        categoryInput.value = e.target.textContent.trim();
      }
    });
  }

  // Intercept the "Next" button click in expenseForm to show the expense details modal
  proceedBtn.addEventListener("click", function () {
    const amountInput = document.getElementById("amount");
    const selectedAccountInput = document.getElementById("selectedAccount");

    if (!amountInput.value || !categoryInput.value || !selectedAccountInput.value) {
      // Instead of alert, you could also display a flash message in the modal
      // For now, we simply do nothing
      return;
    }

    // Hide the first modal and show the expense details modal
    closeModal(expenseModal);
    expenseDetailsModal.classList.remove("hidden");
    expenseDetailsModal.classList.add("show");
  });

  // Final submission in expenseDetailsForm
  expenseDetailsForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const amount = document.getElementById("amount").value;
    const category = categoryInput.value;
    const selectedAccount = document.getElementById("selectedAccount").value;
    const expenseTitle = document.getElementById("expenseTitle").value;
    const description = document.getElementById("description").value;

    if (!amount || !category || !selectedAccount || !expenseTitle || !description) {
      // Do nothing or update the UI to show error near the form fields
      return;
    }

    // Create an object with the combined data
    const expenseData = {
      amount,
      category,
      selectedAccount,
      expense_title: expenseTitle,
      description
    };

    try {
      const response = await fetch("/add-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData)
      });
      const result = await response.json();
      if (result.success) {
        // Hide the expense details modal
        closeModal(expenseDetailsModal);
        // Instead of alert(), set a flash message in session (handled on backend)
        // and reload the page. The backend flash message will be displayed.
        window.location.reload();
      } else {
        // Handle error in UI (you could show an inline error message here)
      }
    } catch (error) {
      console.error("Error submitting expense:", error);
    }
  });

  // (Optional) Mobile drag-down to close modal (if desired)
  // Function to add mobile drag-down (swipe) to close functionality on a modal element
function enableSwipeToClose(modalElement) {
  let startY = 0;
  let endY = 0;

  modalElement.addEventListener("touchstart", function(e) {
    startY = e.touches[0].clientY;
  });

  modalElement.addEventListener("touchmove", function(e) {
    endY = e.touches[0].clientY;
  });

  modalElement.addEventListener("touchend", function(e) {
    const swipeDistance = endY - startY;
    const threshold = 100; // Adjust this threshold as needed
    if (swipeDistance > threshold) {
      closeModal(modalElement);
    }
  });
}

// Enable swipe-to-close for your modals
if (expenseModal) {
  enableSwipeToClose(expenseModal);
}
if (expenseDetailsModal) {
  enableSwipeToClose(expenseDetailsModal);
}
});
