const menu = document.getElementById("menu");
const menuToggle = document.getElementById("menuToggle");

menuToggle.addEventListener("click", () => {
  menu.classList.toggle("active");
});