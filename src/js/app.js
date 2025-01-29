
const profileSection = document.getElementById("profile-section");
const profileBtn = document.getElementById("profile-btn");
const dropdownMenu = document.getElementById("dropdown-menu");
const viewBtn = document.getElementById("view-btn");
const logoutBtn = document.getElementById("logout-btn");

// Function to toggle UI based on login state
function updateUI() {
    const storedToken = localStorage.getItem("token");

    if (!profileSection) return;
    if (storedToken) {
        profileSection.classList.remove("hidden");
    } else {
        profileSection.classList.add("hidden");
    }
}
// Logout Functionality (Clear token and update UI)
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        console.log("User logged out");
        updateUI();
        document.location.reload();
    });
}
if (viewBtn) {
    viewBtn.addEventListener("click", () => {
        document.location.href = "profile.html";
    });
}
// Toggle dropdown visibility
if (profileBtn && dropdownMenu) {
    profileBtn.addEventListener("click", () => {
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    });
    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
        if (profileSection && !profileSection.contains(event.target)) {
            dropdownMenu.style.display = "none";
        }
    });
}

function setMOTD() {
    const MOTD = '"you gotta speculate to accumulate" - célyan empis';
    const el_motd = document.getElementsByClassName("MOTD")[0];
    el_motd.innerHTML = "MOTD: "+MOTD;
    console.log("motd set;")
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("welcome");
    setMOTD();
    updateUI();
});