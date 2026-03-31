export const getRandomRGB = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
};

// Generate consistent color based on ID (user ID, group ID, etc.)
export const getConsistentColor = (id) => {
    if (!id) return '#e9edef'; // Default fallback color

    // Simple hash function to convert string to number
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        const char = id.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }

    // Use hash to generate RGB values
    // Ensure good contrast by keeping values in a reasonable range
    const r = (Math.abs(hash) % 150) + 50; // 50-200 range
    const g = (Math.abs(hash * 2) % 150) + 50; // 50-200 range
    const b = (Math.abs(hash * 3) % 150) + 50; // 50-200 range

    return `rgb(${r}, ${g}, ${b})`;
};