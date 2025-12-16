// Dashboard JavaScript
let currentUser = null;

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) {
            window.location.href = '/login.html';
            return false;
        }
        const data = await response.json();
        currentUser = data.user;
        updateUserDisplay();
        return true;
    } catch (error) {
        window.location.href = '/login.html';
        return false;
    }
}

// Update user display
function updateUserDisplay() {
    if (currentUser) {
        document.getElementById('userDisplay').textContent = `${currentUser.fullName} (${currentUser.role})`;
    }
}

// Load dashboard stats
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalUsers').textContent = data.stats.totalUsers;
            document.getElementById('activeUsers').textContent = data.stats.activeUsers;
            document.getElementById('totalSessions').textContent = data.stats.totalSessions;
            document.getElementById('systemStatus').textContent = data.stats.systemStatus;
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Load users
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.getElementById('usersTableBody');
            tbody.innerHTML = '';
            
            data.users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.fullName}</td>
                    <td><span class="role-badge">${user.role}</span></td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Failed to load users:', error);
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '<tr><td colspan="4">Failed to load users</td></tr>';
    }
}

// Logout
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Logout failed:', error);
        window.location.href = '/login.html';
    }
}

// Navigation
function switchPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.getElementById(`${pageName}-page`);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Add active class to selected nav link
    const selectedLink = document.querySelector(`[data-page="${pageName}"]`);
    if (selectedLink) {
        selectedLink.classList.add('active');
    }
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'users': 'User Management',
        'settings': 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[pageName] || pageName;
    
    // Load page-specific data
    if (pageName === 'users') {
        loadUsers();
    } else if (pageName === 'dashboard') {
        loadStats();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    const isAuth = await checkAuth();
    if (isAuth) {
        loadStats();
        
        // Setup navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageName = link.dataset.page;
                switchPage(pageName);
            });
        });
        
        // Setup logout button
        document.getElementById('logoutBtn').addEventListener('click', logout);
    }
});
