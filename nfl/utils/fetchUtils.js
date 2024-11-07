// utils/fetchUtils.js

export const fetchWithCache = async (url) => {
    // Check if data is already cached
    const cachedData = localStorage.getItem(url);
    if (cachedData) {
        console.log('Using cached data');
        return JSON.parse(cachedData);
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Cache the response data
        localStorage.setItem(url, JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};
