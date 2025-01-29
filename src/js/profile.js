import { dec } from "./utils.js";

function getUsername() {
    const token = localStorage.getItem("token");
    return token.split("___")[0];
}

document.addEventListener('DOMContentLoaded', () => {
    const name = document.getElementById("profilename");
    name.innerText = getUsername();
});