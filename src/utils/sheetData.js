const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1C_JtpNZzgy0iFdmt8oPAunVPQnihENhSIsD2L7H2Wd0/export?format=csv';
const CACHE_KEY = 'vocabularySheetCsvCache';
const CACHE_DURATION_MS = 12 * 60 * 60 * 1000;

let pendingRequest = null;

function readCachedCsv() {
    try {
        const stored = localStorage.getItem(CACHE_KEY);
        if (!stored) return null;

        const cache = JSON.parse(stored);
        const isValid = typeof cache.csv === 'string'
            && cache.csv.trim() !== ''
            && Number.isFinite(cache.fetchedAt)
            && Date.now() >= cache.fetchedAt
            && Date.now() - cache.fetchedAt < CACHE_DURATION_MS;

        if (isValid) return cache.csv;

        localStorage.removeItem(CACHE_KEY);
        return null;
    } catch (error) {
        console.warn('Unable to read Google Sheet cache:', error);
        return null;
    }
}

function saveCsvToCache(csv) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            csv,
            fetchedAt: Date.now()
        }));
    } catch (error) {
        console.warn('Unable to save Google Sheet cache:', error);
    }
}

export function getSheetCsv() {
    const cachedCsv = readCachedCsv();
    if (cachedCsv) return Promise.resolve(cachedCsv);
    if (pendingRequest) return pendingRequest;

    pendingRequest = fetch(SHEET_URL)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Google Sheet request failed: ${response.status}`);
            }
            return response.text();
        })
        .then((csv) => {
            if (!csv.trim()) {
                throw new Error('Google Sheet returned empty data');
            }
            saveCsvToCache(csv);
            return csv;
        })
        .finally(() => {
            pendingRequest = null;
        });

    return pendingRequest;
}
