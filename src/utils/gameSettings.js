export function readGameSettings(key) {
    try {
        const settings = JSON.parse(localStorage.getItem(key) || '{}');
        return settings && typeof settings === 'object' && !Array.isArray(settings) ? settings : {};
    } catch {
        return {};
    }
}

export function saveGameSettings(key, settings) {
    try {
        localStorage.setItem(key, JSON.stringify(settings));
    } catch {
    }
}
