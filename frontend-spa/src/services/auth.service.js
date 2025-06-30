import { API_BASE_URL } from '@/constants';

/**
 * Custom fetch wrapper với error handling
 * @param {string} url 
 * @param {RequestInit} options 
 * @returns {Promise<any>}
 */
async function efetch(url, options = {}) {
    let result = {};
    let json = {};

    try {
        result = await fetch(url, options);
        json = await result.json();
    } catch (error) {
        throw new Error(error.message);
    }
    
    if (!result.ok || json.status !== 'success') {
        throw new Error(json.message || 'Request failed');
    }
    
    return json.data;
}

function makeAuthService() {
    const baseUrl = `${API_BASE_URL}/auth`;

    // === AUTH HELPERS ===
    function getAuthHeaders() {
        const token = localStorage.getItem('cinema_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // === AUTHENTICATION ===
    async function login(phoneNumber, password) {
        return efetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                phone_number: phoneNumber, 
                password 
            }),
        });
    }

    async function googleLogin() {
        try {
            // Step 1: Get the Google Auth URL from our backend
            const { url } = await efetch(`${baseUrl}/google/url`);
            // Step 2: Redirect the user to that URL
            window.location.href = url;
        } catch (error) {
            console.error('Failed to get Google login URL:', error);
            // Optionally, show an error message to the user
            throw new Error('Could not initiate Google login.');
        }
    }

    async function handleGoogleCallback(code) {
        // Chuẩn: Gửi code nhận được từ frontend lên backend qua method POST
        return efetch(`${baseUrl}/google/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
        });
    }

    async function getCurrentUser() {
        return efetch(`${baseUrl}/me`, {
            headers: getAuthHeaders()
        });
    }

    // === EMPLOYEE MANAGEMENT ===
    async function registerEmployee(employeeData) {
        const token = localStorage.getItem('cinema_token');
        return efetch(`${baseUrl}/register-employee`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(employeeData),
        });
    }

    async function getAllEmployees() {
        const token = localStorage.getItem('cinema_token');
        return efetch(`${baseUrl}/employees`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }

    async function getEmployeeById(id) {
        const token = localStorage.getItem('cinema_token');
        return efetch(`${baseUrl}/employees/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }

    async function updateEmployee(id, updateData) {
        const token = localStorage.getItem('cinema_token');
        return efetch(`${baseUrl}/employees/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ input: updateData }),
        });
    }

    // === CUSTOMER MANAGEMENT ===
    async function getAllCustomers() {
        const token = localStorage.getItem('cinema_token');
        return efetch(`${baseUrl}/customers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }

    async function getCustomerById(id) {
        const token = localStorage.getItem('cinema_token');
        return efetch(`${baseUrl}/customers/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }

    async function updateCustomer(id, updateData) {
        const token = localStorage.getItem('cinema_token');
        return efetch(`${baseUrl}/customers/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ input: updateData }),
        });
    }

    // === ROLES ===
    async function getRoles() {
        const token = localStorage.getItem('cinema_token');
        return efetch(`${baseUrl}/roles`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }

    return {
        // Auth
        login,
        googleLogin,
        handleGoogleCallback,
        getCurrentUser,
        
        // Employee
        registerEmployee,
        getAllEmployees,
        getEmployeeById,
        updateEmployee,
        
        // Customer  
        getAllCustomers,
        getCustomerById,
        updateCustomer,
        
        // Roles
        getRoles
    };
}

export default makeAuthService(); 