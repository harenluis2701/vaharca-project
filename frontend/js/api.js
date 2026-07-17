// ==========================================
// VAHARCA
// Comunicación con FastAPI
// ==========================================

const API_URL = "http://127.0.0.1:8000";

/**
 * Verifica que el backend esté funcionando.
 */
async function obtenerEstadoServidor() {
    try {
        const respuesta = await fetch(`${API_URL}/test-connection`);
        return await respuesta.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Login real contra el backend.
 */
async function login(datos) {
    try {
        const respuesta = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.detail || "Error al iniciar sesión");
        }

        return resultado;
    } catch (error) {
        console.error(error);
        throw error;
    }
}