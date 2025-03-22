document.addEventListener("DOMContentLoaded", function () {
  const players = [
    document.getElementById("lottie1"),
    document.getElementById("lottie2"),
    document.getElementById("lottie3")
  ];
  let currentIndex = 0;
  
  // Initially display only the first animation
  players.forEach((player, index) => {
    if (index === 0) {
      player.classList.add("visible");
    } else {
      player.classList.remove("visible");
    }
  });
  
  function cyclePlayers() {
    // Fade out current player
    players[currentIndex].classList.remove("visible");
    // Calculate next index
    currentIndex = (currentIndex + 1) % players.length;
    // Fade in the next player
    players[currentIndex].classList.add("visible");
  }
  
  // Cycle every 4 seconds (4000ms)
  setInterval(cyclePlayers, 5700);
});

document.addEventListener("DOMContentLoaded", function () {
  const players = [
    document.getElementById("lottie4"),
    document.getElementById("lottie5"),
    document.getElementById("lottie6"),
    document.getElementById("lottie7")
  ];
  let currentIndex = 0;
  
  // Initially display only the first animation
  players.forEach((player, index) => {
    if (index === 0) {
      player.classList.add("visible");
    } else {
      player.classList.remove("visible");
    }
  });
  
  function cyclePlayers() {
    // Fade out current player
    players[currentIndex].classList.remove("visible");
    // Calculate next index
    currentIndex = (currentIndex + 1) % players.length;
    // Fade in the next player
    players[currentIndex].classList.add("visible");
  }
  
  // Cycle every 4 seconds (4000ms)
  setInterval(cyclePlayers, 10000);
});


document.addEventListener("DOMContentLoaded", function () {
  const players = [
    document.getElementById("lottie8"),
    document.getElementById("lottie9"),
    document.getElementById("lottie10")
  ];
  let currentIndex = 0;
  
  // Initially display only the first animation
  players.forEach((player, index) => {
    if (index === 0) {
      player.classList.add("visible");
    } else {
      player.classList.remove("visible");
    }
  });
  
  function cyclePlayers() {
    // Fade out current player
    players[currentIndex].classList.remove("visible");
    // Calculate next index
    currentIndex = (currentIndex + 1) % players.length;
    // Fade in the next player
    players[currentIndex].classList.add("visible");
  }
  
  // Cycle every 4 seconds (4000ms)
  setInterval(cyclePlayers, 8000);
});


document.addEventListener("DOMContentLoaded", function () {
    const standalone=document.getElementById("standalone");
    standalone.classList.add('visible')

})
