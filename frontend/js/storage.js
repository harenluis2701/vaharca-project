// ==========================================
// VAHARCA
// storage.js
// Manejo del LocalStorage
// ==========================================

const Storage = {

    guardarUsuario(usuario) {

        localStorage.setItem(
            "usuario",
            JSON.stringify(usuario)
        );

    },

    obtenerUsuario() {

        const usuario = localStorage.getItem("usuario");

        if (!usuario) {
            return null;
        }

        try {
            return JSON.parse(usuario);
        } catch (error) {
            console.error("Error parseando usuario en localStorage:", error);
            this.eliminarUsuario();
            return null;
        }

    },

    eliminarUsuario() {

        localStorage.removeItem("usuario");

    },

    guardarToken(token) {

        localStorage.setItem(
            "token",
            token
        );

    },

    obtenerToken() {

        return localStorage.getItem("token");

    },

    eliminarToken() {

        localStorage.removeItem("token");

    },

    cerrarSesion() {

        this.eliminarUsuario();
        this.eliminarToken();

    }

};