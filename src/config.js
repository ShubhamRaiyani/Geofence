const config = {
    mapApiKey: import.meta.env.VITE_MAP_API_KEY,
    defaultRadiusKm: parseFloat(import.meta.env.VITE_DEFAULT_RADIUS_KM),
    enableAlarm: import.meta.env.VITE_ENABLE_SOUND_ALARM === 'true',
};

export default config;
