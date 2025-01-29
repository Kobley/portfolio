export function print(msg) {
    console.log(msg);
}

export function enc(msg, pass) {
    const iv = CryptoJS.enc.Utf8.parse('1234567890123456');
    const password = CryptoJS.enc.Utf8.parse(pass);
    const salt = CryptoJS.enc.Utf8.parse('1234567890123456'); // 16 bytes salt (matching AES block size)
    const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,  // AES-256
    iterations: 1000,   // Number of iterations
    });
    var ciphertext = CryptoJS.AES.encrypt(msg, key, { iv: iv, mode: CryptoJS.mode.CBC}).toString();
    return ciphertext;
}

export function dec(msg, pass) {
    const iv = CryptoJS.enc.Utf8.parse('1234567890123456');
    const password = CryptoJS.enc.Utf8.parse(pass);
    const salt = CryptoJS.enc.Utf8.parse('1234567890123456'); // 16 bytes salt (matching AES block size)
    const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,  // AES-256
    iterations: 1000,   // Number of iterations
    });
    var bytes  = CryptoJS.AES.decrypt(msg, key, { iv: iv, mode: CryptoJS.mode.CBC});
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    return plaintext;
}

// Helper function to encode text into an ArrayBuffer
const encodeText = (text) => new TextEncoder().encode(text);

// Helper function to decode an ArrayBuffer back to text
const decodeText = (buffer) => new TextDecoder().decode(buffer);

// Helper function to derive a key from the password using PBKDF2
async function deriveKey(password, salt) {
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encodeText(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-CBC', length: 256 }, // AES-256 key
        false,
        ['encrypt', 'decrypt']
    );
}

// **Encrypt Function**
export async function encrypt(message, password) {
    // Use a fixed IV (for deterministic encryption) - AES block size (16 bytes)
    const iv = encodeText('1234567890123456'); // 16-byte IV

    // Generate a random salt for key derivation (should be saved and used for decryption)
    const salt = crypto.getRandomValues(new Uint8Array(16)); // 16-byte salt

    // Derive the encryption key from the password and salt
    const key = await deriveKey(password, salt);

    // Encrypt the message
    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv: iv },
        key,
        encodeText(message) // The message to encrypt
    );

    // Return the ciphertext as a base64 string, along with the salt used for key derivation
    return {
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
        salt: btoa(String.fromCharCode(...salt)) // Return salt as base64 for later use in decryption
    };
}

export async function encryptWithSalt(message, password, salt) {
    // Use a fixed IV (for deterministic encryption) - AES block size (16 bytes)
    const iv = encodeText('1234567890123456'); // 16-byte IV

    // Derive the encryption key from the password and salt
    const key = await deriveKey(password, salt);

    // Encrypt the message
    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv: iv },
        key,
        encodeText(message) // The message to encrypt
    );

    // Return the ciphertext as a base64 string, along with the salt used for key derivation
    return {
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
        salt: btoa(String.fromCharCode(...salt)) // Return salt as base64 for later use in decryption
    };
}

// **Decrypt Function**
export async function decrypt(encryptedData, password, saltBase64) {
    // Convert the salt from base64 back to an ArrayBuffer
    const salt = new Uint8Array(atob(saltBase64).split('').map(char => char.charCodeAt(0)));

    // Derive the encryption key from the password and salt
    const key = await deriveKey(password, salt);

    // Convert the encrypted data from base64 back to an ArrayBuffer
    const ciphertext = new Uint8Array(atob(encryptedData).split('').map(char => char.charCodeAt(0)));

    // Use the same fixed IV for decryption
    const iv = encodeText('1234567890123456'); // 16-byte IV

    // Decrypt the message
    const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: iv },
        key,
        ciphertext
    );

    // Return the decrypted text
    return decodeText(decryptedData);
}

export function genToken(username) {
    const token = username+"___"+crypto.randomUUID();
    localStorage.setItem("token", token);
    return token;
}

export function tokenExists() {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
        console.error("chk_tkn: no token exists.");
        return false;
    }

    return true;
}

export function checkToken(token) {
    if (!token) {
        console.error("chk_tkn: token cannot be null or undefined.");
        return false;
    }

    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
        console.error("chk_tkn: no token exists.");
        return false;
    }

    if (storedToken === token) {
        return true;
    } else {
        console.error("chk_tkn: token is incorrect.");
        return false;
    }
}