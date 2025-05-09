export const fetchEndpoint = async (
    endpoint: string,
    method: string,
    token?: string | null,
    body?: any
) => {
    console.log(`fetchEndpoint called for ${method} ${endpoint}`);
    
    const baseUrl = 'http://localhost:3000';
    const url = `${baseUrl}${endpoint}`;
    
    try {
        const headers: Record<string, string> = {};
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const options: RequestInit = {
            method,
            headers,
            credentials: 'include',
        };
        
        if (body) {
            if (body instanceof FormData) {
                // For FormData, don't set Content-Type - browser will set it with boundary
                options.body = body;
                
                // Log the FormData contents for debugging
                console.log('Sending FormData with entries:');
                for (const pair of body.entries()) {
                    console.log(`${pair[0]}: ${pair[1]}`);
                }
            } else if (method !== 'GET') {
                // For regular JSON data
                headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(body);
                console.log(`Request body included for ${method} request`);
            }
        }
        
        console.log(`Making ${method} request to ${url}`);
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => {
                return { message: 'Unknown error' };
            });
            console.error('Error data from response:', errorData);
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            const jsonData = await response.json();
            console.log('Parsed JSON response successfully');
            return jsonData;
        } else {
            const textData = await response.text();
            console.log('Received text response');
            return textData;
        }
    } catch (error) {
        console.error(`Error in fetchEndpoint for ${method} ${endpoint}:`, error);
        throw error;
    }
};