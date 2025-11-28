// Tentukan alamat Backend di sini (Satu tempat untuk semua)
const BASE_URL = "https://tabungansdital-hidayah-anbaaua8hwf5fnb6.indonesiacentral-01.azurewebsites.net";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Export helper ini agar tidak error jika ada file yang mengimpornya
export const getApiUrl = (endpoint) => {
    return endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
};

export const fetchWithAuth = async (endpoint, options = {}) => {
    let token = localStorage.getItem('token');
    
    // Logika Pintar: Gabungkan dengan BASE_URL jika path relatif
    const url = getApiUrl(endpoint);

    if (!token) {
        console.warn("⚠️ Tidak ada token. Redirecting to login...");
        logout();
        return Promise.reject("No token");
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    try {
        let response = await fetch(url, { ...options, headers });

        // Cek apakah server mengembalikan HTML (Error 404/500 dari server yang salah)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") === -1) {
            console.error(`❌ Server mengembalikan HTML, bukan JSON.`);
            console.error(`URL yang diakses: ${url}`);
            throw new Error("Backend server tidak merespons JSON. Pastikan backend running di port 5000.");
        }

        // Jika token expired (403/401)
        if (response.status === 403 || response.status === 401) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    headers['Authorization'] = `Bearer ${token}`;
                    return fetch(url, { ...options, headers });
                }).catch(err => Promise.reject(err));
            }

            isRefreshing = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                logout();
                return Promise.reject("No refresh token");
            }

            try {
                const refreshResponse = await fetch(`${BASE_URL}/api/refresh-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: refreshToken })
                });

                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    localStorage.setItem('token', data.accessToken);
                    processQueue(null, data.accessToken);
                    isRefreshing = false;
                    
                    headers['Authorization'] = `Bearer ${data.accessToken}`;
                    return await fetch(url, { ...options, headers });
                } else {
                    processQueue("Failed to refresh");
                    logout();
                    return Promise.reject("Failed to refresh");
                }
            } catch (refreshErr) {
                processQueue(refreshErr);
                logout();
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return response;
    } catch (error) {
        console.error("❌ Network Error pada fetchWithAuth:", error);
        throw error;
    }
};

const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
};