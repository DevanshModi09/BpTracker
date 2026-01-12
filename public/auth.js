const API_BASE_URL = '/api/v1';

document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            loginForm.classList.remove('active');
            registerForm.classList.remove('active');
            
            if (tab === 'login') {
                loginForm.classList.add('active');
            } else {
                registerForm.classList.add('active');
            }
            
            clearMessage();
        });
    });

    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/dashboard.html';
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();
    
    const formData = {
        name: document.getElementById('registerName').value.trim(),
        email: document.getElementById('registerEmail').value.trim(),
        password: document.getElementById('registerPassword').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.msg || 'Registration failed');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user.name);
        
        showMessage('Registration successful! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1000);

    } catch (error) {
        showMessage(error.message || 'Registration failed. Please try again.', 'error');
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();
    
    const formData = {
        email: document.getElementById('loginEmail').value.trim(),
        password: document.getElementById('loginPassword').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.msg || 'Login failed');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user.name);
        
        showMessage(data.msg || 'Login successful! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1000);

    } catch (error) {
        showMessage(error.message || 'Login failed. Please check your credentials.', 'error');
    }
});

function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type} show`;
    
    setTimeout(() => {
        clearMessage();
    }, 5000);
}

function clearMessage() {
    const messageEl = document.getElementById('message');
    messageEl.textContent = '';
    messageEl.className = 'message';
}
