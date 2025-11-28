export const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem('token');
    
    if (!token) {
        console.warn("⚠️ Tidak ada token. Redirecting to login...");
        logout();
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    try {
        let response = await fetch(url, { ...options, headers });

        // Jika token expired (403 Forbidden atau 401 Unauthorized)
        if (response.status === 403 || response.status === 401) {
            console.warn(`⚠️ Token Expired (Status ${response.status}). Mencoba refresh...`);
            
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                console.error("❌ Tidak ada Refresh Token. Logout.");
                logout();
                return response;
            }

            try {
                const refreshResponse = await fetch('http://localhost:5000/api/refresh-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: refreshToken })
                });

                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    localStorage.setItem('token', data.accessToken);
                    console.log("✅ Token berhasil diperbarui!");

                    // Ulangi request asli dengan token baru
                    headers['Authorization'] = `Bearer ${data.accessToken}`;
                    response = await fetch(url, { ...options, headers });
                } else {
                    console.error("❌ Gagal refresh token (Server menolak). Logout.");
                    const errText = await refreshResponse.text();
                    console.error("Server Response:", errText);
                    logout();
                }
            } catch (refreshErr) {
                console.error("❌ Error koneksi saat refresh token:", refreshErr);
                logout();
            }
        }

        return response;
    } catch (error) {
        console.error("❌ Network Error pada fetchWithAuth:", error);
        throw error;
    }
};

const logout = () => {
    // Beri jeda 2 detik agar error terlihat di console sebelum reload
    console.log("🔄 Logout dalam 2 detik...");
    setTimeout(() => {
        localStorage.clear();
        window.location.href = '/login';
    }, 2000);
};