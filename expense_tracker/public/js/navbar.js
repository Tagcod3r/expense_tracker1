const hamburger = document.getElementById('hamburger');
    const navbarLinks = document.getElementById('navbar-links');

    // Toggle the navbar on mobile
    hamburger.addEventListener('click', () => {
      navbarLinks.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
 
  //top scroll-button
  