// --- CONFIGURATION ---
const CORRECT_REF_CODE = 'BadiTech';

// Get references to the elements using the IDs we added
const registerForm = document.getElementById('registerForm');
const emailInput = document.getElementById('regEmail');
const passwordInput = document.getElementById('regPassword');
const refCodeInput = document.getElementById('regRefCode');
const registerButton = document.getElementById('registerBtn');
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const loginButton = document.getElementById('loginBtn');



// Only attach the registration handler if the button exists
if (registerButton) {
    registerButton.addEventListener('click', handleRegistration);
}

// Only attach the login handler if the button exists
if (loginButton) {
    loginButton.addEventListener('click', handleLogin);
}


function handleRegistration(event) {
    // Prevent the default form submission action
    event.preventDefault(); 

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const refCode = refCodeInput.value.trim();

    // 1. Validate inputs (basic check)
    if (email === '' || password === '' || refCode === '') {
        alert('Please fill in all fields.');
        return;
    }

    // 2. Check the Reference Code 
    if (refCode !== CORRECT_REF_CODE) {
        Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'Invalid Reference Code. You cannot register without the correct code.',
        });
        refCodeInput.value = '';
        return;
    }

    // 3. Retrieve or Initialize User List
    // Get existing users (or an empty array if none exist)
    let users = JSON.parse(localStorage.getItem('users')) || [];


    // 4. Check for Existing User (prevent duplicate registration)
    const userExists = users.some(user => user.email === email);
    if (userExists) {
        Swal.fire({
            icon: 'info',
            title: 'Already Registered',
            text: 'This email is already registered. Please log in.',
        });
        return;
    }

    // 5. Create New User Object
    const newUser = {
        email: email,
        password: password // ⚠️ Reminder: For a real app, hash this password!
    };

    // 6. Success!
    Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'You can now proceed to log in.',
        showConfirmButton: false,
        timer: 2000
    }).then(() => {
        // Clear the form and redirect after the SweetAlert closes
        emailInput.value = '';
        passwordInput.value = '';
        refCodeInput.value = '';
        window.location.href = 'login.html';
    });
};

function handleLogin(event) {
    event.preventDefault(); // Stop default form submission

    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();

    if (email === '' || password === '') {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Fields',
            text: 'Please enter both email and password.',
        });
        return;
    }

    // 1. Retrieve all stored users from Local Storage
    // Parse the JSON string back into a JavaScript array.
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // 2. Find the user with matching email and password
    const foundUser = users.find(user => 
        user.email === email && user.password === password
    );

    if (foundUser) {
        // 3. Successful Login: Store the logged-in status
        localStorage.setItem('loggedInUser', JSON.stringify({ email: foundUser.email }));

        // 4. Success Alert and Redirect
        Swal.fire({
            icon: 'success',
            title: 'Welcome Back!',
            text: 'Login successful! Redirecting to your To-Do List...',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            window.location.href = 'index.html'; 
        });

    } else {
        // Unsuccessful Login
        Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Invalid email or password.',
        });
        loginPasswordInput.value = '';
    }
};