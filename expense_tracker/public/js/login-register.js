function toggleForm() {
    const registerBox = document.getElementById('register-box');
    const loginBox = document.getElementById('login-box');
    
    // Toggle visibility of the forms
    registerBox.style.display = registerBox.style.display === 'none' ? 'block' : 'none';
    loginBox.style.display = loginBox.style.display === 'none' ? 'block' : 'none';
  }
  