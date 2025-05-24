export const fetchEndpoint = async (
    endpoint: string,
    method = 'GET',
    token?: string | null,
    body?: any
) => {
    try {
        const API_URL = 'http://localhost:3000';
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const options: RequestInit = {
            method,
            headers,
            credentials: 'include',
        };

        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_URL}${endpoint}`, options);
        
        // Check if response is ok
        if (!response.ok) {
            // Try to parse error as JSON
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error ${response.status}`);
            } catch (jsonError) {
                // If response isn't JSON, use status text
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }
        }

        // For 204 No Content, don't try to parse JSON
        if (response.status === 204) {
            return null;
        }

        // For all other successful responses, try to parse JSON
        try {
            return await response.json();
        } catch (error) {
            console.error('Error parsing JSON response:', error);
            throw new Error('Invalid JSON response from server');
        }
    } catch (error) {
        console.error(`Error in fetchEndpoint for ${method} ${endpoint}:`, error);
        throw error;
    }
};