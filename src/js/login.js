import { print, genToken, checkToken, tokenExists, encrypt, encryptWithSalt } from "./utils.js";
import { setStatus } from "./status.js";

const SUPABASE_URL = 'https://iljdzxckclkmlbeelmmm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsamR6eGNrY2xrbWxiZWVsbW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxMTQ3MjMsImV4cCI6MjA1MzY5MDcyM30.SZrDjSldFcBQkc92tZccxfshhr8xY67rnxbNlhPlo6Q';

const loginBtn = document.getElementById("login-btn");
loginBtn.addEventListener("click", async () => {
    const username = document.getElementById("username_input").value;
    const password = document.getElementById("password_input").value;
    const token = genToken(username);

    try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
            },});

        if (!resp.ok) {
            console.error("unable to reach db.");
        }
        const data = await resp.json();

        data.forEach(async user => {
            if (user.username == username) {
                if ((typeof user.hash == "object") || (user.hash == "")) {
                    console.log("first time");
                    console.log(user.username);
                    var enc = await encrypt(password, username);
                    console.log("cipher: "+enc.ciphertext+" salt: "+btoa(enc.salt));
                    updateHashAndSalt(user.uid, enc.ciphertext, btoa(enc.salt));
                    alert("password set for first time login. retry login.");
                } else {
                    const salt = new Uint8Array(atob(user.salt).split('').map(char => char.charCodeAt(0)));
                    var ciphertext = await encryptWithSalt(password, username, salt);
                    console.log("ciphertext: "+ciphertext.ciphertext+" salt: "+ciphertext.salt)
                    console.log("hash: "+user.hash+" salt: "+user.salt)
                    if (user.hash == ciphertext.ciphertext) {
                        console.log("good hash");
                        localStorage.setItem("userdata", ciphertext);
                        console.log("User logged in, token:", token);
                        document.location.href = "home.html";
                    }
                }
            }
        });
    }
    catch (err){
        console.error(err)
        localStorage.clear();
    }
});

async function updateHashAndSalt(uid, newHash, newSalt) {
    try {
        // The data you want to update
        const updatedData = {
            hash: newHash, // Change this to the column and value you want to update
            salt: newSalt
        };

        // Send the PATCH request to update the row
        const response = await fetch(`${SUPABASE_URL}/rest/v1/users?uid=eq.${uid}`, {
            method: 'PATCH',
            headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        });

        // Check if the update was successful
        if (!response.ok) {
            throw new Error('Failed to update row');
        }

        // Parse the response
        const data = await response.json();
        console.log('Updated row:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {

});