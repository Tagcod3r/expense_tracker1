document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  document.body.appendChild(overlay);

  // Toggle the sidebar open/close on mobile
  menuToggle.addEventListener("click", function () {
    sidebar.classList.toggle("expanded");
    overlay.classList.toggle("active");
  });

  // Hide sidebar if clicking on the overlay
  overlay.addEventListener("click", function () {
    sidebar.classList.remove("expanded");
    overlay.classList.remove("active");
  });
});

document.addEventListener("DOMContentLoaded", function() {
  const addAccountBtn = document.getElementById("addAccountBtn");
  const accountModal = document.getElementById("accountModal");
  const closeAccountModal = document.getElementById("closeAccountModal");
  const cancelAccountModal = document.getElementById("cancelAccountModal");

  // Show modal when Add Account button is clicked
  addAccountBtn.addEventListener("click", function() {
    accountModal.classList.remove("hidden");
    accountModal.classList.add("show");
  });

  // Function to hide modal
  function hideModal() {
    accountModal.classList.remove("show");
    setTimeout(() => accountModal.classList.add("hidden"), 400);
  }

  // Close modal on click
  closeAccountModal.addEventListener("click", hideModal);
  cancelAccountModal.addEventListener("click", hideModal);
});


//Account selection and updation to backend
document.addEventListener("DOMContentLoaded", function () {
  const accountDropdown = document.getElementById("accountDropdown");
  const flashMessage = document.querySelector(".flash-message");

  accountDropdown.addEventListener("change", async function () {
    const selectedAccount = this.value;

    // Handle deselection: when no account is selected, reset dashboard values.
    if (!selectedAccount) {
      resetDashboardValues();
      return;
    }

    try {
      const response = await fetch("/select-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ selectedAccount }),
      });

      const data = await response.json();

      if (data.success) {
        handleSuccessResponse(data, selectedAccount);
      }
    } catch (err) {
      handleError(err);
    }
  });

  // Animation handler for updating values
  function animateValue(element, value) {
    element.style.transition = "all 0.5s ease-out";
    element.style.opacity = "0";
    element.style.transform = "translateY(20px)";
    
    // Force reflow to restart animation
    void element.offsetWidth;
    
    element.textContent = Number(value).toFixed(2);
    element.style.opacity = "1";
    element.style.transform = "translateY(0)";
  }

  // Success handler: update the dashboard with animated values
  function handleSuccessResponse(data, selectedAccount) {
    animateValue(document.getElementById("balanceAmount"), data.data.balanceRemaining);
    animateValue(document.getElementById("totalExpensesDisplay"), data.data.totalExpenses);
    animateValue(document.getElementById("initialBalanceDisplay"), data.data.initialBalance);

    // Update hidden field so the backend knows the current account
    document.getElementById("selectedAccount").value = selectedAccount;

    // Show flash message with the server response message
    flashMessage.textContent = data.message;
    flashMessage.style.display = "block";
    setTimeout(() => {
      flashMessage.style.display = "none";
    }, 3000);
  }

  // Reset the dashboard values to 0.00
  function resetDashboardValues() {
    [balanceAmount, totalExpensesDisplay, initialBalanceDisplay].forEach(el => {
      el.textContent = "0.00"; 
      el.style.transition = 'none';
      void el.offsetWidth;
      el.style.transition = '';
    });
  }
  // Error handler: display an error flash message
  function handleError(error) {
    console.error("Account selection error:", error);
    flashMessage.textContent = "Error updating account data";
    flashMessage.style.color = "#dc3545";
    flashMessage.style.display = "block";
    setTimeout(() => {
      flashMessage.style.display = "none";
    }, 3000);
  }
});


// dashboard close-notification
document.addEventListener("DOMContentLoaded", function() {
  const note = document.getElementById("note-message");
  const closeBtn = note?.querySelector('.close-btn');

  if (note && closeBtn) {
      closeBtn.addEventListener('click', () => {
          note.remove();
      });

      const accountSelect = document.getElementById('selectedAccount');
      accountSelect?.addEventListener('change', () => {
          note.remove();
      });
  }
});
