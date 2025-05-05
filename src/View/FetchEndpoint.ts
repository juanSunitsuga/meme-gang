export const fetchEndpoint = async (
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    token: string | null,
    body?: any
): Promise<any> => {
    try {
        const headers: Record<string, string> = {};
        
        // Don't set Content-Type for FormData - browser will set it with boundary
        if (!(body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const options: RequestInit = {
            method,
            headers,
        };

        if (body) {
            // Don't stringify FormData objects
            options.body = body instanceof FormData ? body : JSON.stringify(body);
        }

        // Ensure proper URL formatting
        const fullUrl = `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
        
        console.log(`Sending ${method} request to ${fullUrl}`);
        const response = await fetch(fullUrl, options);
        
        // Handle non-JSON responses (like file uploads)
        const contentType = response.headers.get('content-type');
        const data = contentType && contentType.includes('application/json') 
            ? await response.json() 
            : await response.text();

        if (!response.ok) {
            const errorMessage = typeof data === 'object' && data.message 
                ? data.message 
                : 'Failed to fetch data';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error(`Error during ${method} request to ${url}:`, error);
        throw error;
    }
};