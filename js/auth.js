function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true';
}

function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

(function protectHome() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'home.html') {
        if (!isAuthenticated()) {
            window.location.replace('index.html');
            return;
        }
        
        const user = getCurrentUser();
        if (user) {
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = `¡Bienvenido ${user.name}!`;
            }
        }
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (isAuthenticated() && (currentPage === 'index.html' || currentPage === 'register.html' || currentPage === '')) {
        window.location.replace('home.html');
        return;
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                showError('Por favor completa todos los campos');
                return;
            }
            
            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.replace('home.html');
            } else {
                showError('Email o contraseña incorrectos');
            }
        });
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            if (!name || !email || !password) {
                showError('Por favor completa todos los campos');
                return;
            }
            
            if (password.length < 6) {
                showError('La contraseña debe tener al menos 6 caracteres');
                return;
            }
            
            const users = getUsers();
            
            if (users.some(u => u.email === email)) {
                showError('Este email ya está registrado');
                return;
            }
            
            const newUser = {
                id: Date.now(),
                name: name,
                email: email,
                password: password
            };
            
            users.push(newUser);
            saveUsers(users);
            
            alert('¡Registro exitoso! Serás redirigido al login');
            window.location.replace('index.html');
        });
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('currentUser');
            window.location.replace('index.html');
        });
    }
});