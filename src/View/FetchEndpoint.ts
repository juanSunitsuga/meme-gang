export const fetchEndpoint = async (
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    token: string | null,
    body?: any
): Promise<any> => {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const options: RequestInit = {
            method,
            headers,
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch('http://localhost:3000/' + url, options);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch data');
        }

        return await response.json();
    } catch (error) {
        console.error(`Error during ${method} request to ${url}:`, error);
        throw error;
    }
};