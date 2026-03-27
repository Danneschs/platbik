export const URL =
    import.meta.env.MODE === "development"
        ? "/api" // Vite proxy to přepošle na backend
        : "/api"; // produkce: backend servíruje API a frontend ze stejného hostu
