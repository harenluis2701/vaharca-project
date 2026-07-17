// ==========================================
// VAHARCA
// auth.js
// Autenticación (Modo Demo - Sprint 1)
// ==========================================

function iniciarLogin() {

    console.log("Vista Login iniciada.");

    const formulario = document.getElementById("loginForm");

    if (!formulario) return;

    formulario.addEventListener("submit", iniciarSesion);

    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', (evento) => {
            evento.preventDefault();
            alert('Inicio con Google no disponible todavía. Usa las credenciales de prueba.');
        });
    }

    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', (evento) => {
            evento.preventDefault();
            alert('Recuperación de contraseña en construcción.');
        });
    }

    const registerLink = document.querySelector('.register-link');
    if (registerLink) {
        registerLink.addEventListener('click', (evento) => {
            evento.preventDefault();
            alert('Registro en línea no está disponible aún.');
        });
    }

}

async function iniciarSesion(evento) {

    evento.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {

        alert("Todos los campos son obligatorios.");

        return;

    }

    // ============================
    // USUARIOS DE PRUEBA
    // ============================

    const usuarios = [

        {
            id: 1,
            nombre: "Carlos",
            correo: "coder@vaharca.com",
            password: "123456",
            rol: "coder"
        },

        {
            id: 2,
            nombre: "Haren",
            correo: "leader@vaharca.com",
            password: "123456",
            rol: "leader"
        },

        {
            id: 3,
            nombre: "Administrador",
            correo: "admin@vaharca.com",
            password: "admin123",
            rol: "admin"
        }

    ];

    const usuario = usuarios.find(u =>
        u.correo === email &&
        u.password === password
    );

    if (!usuario) {

        alert("Correo o contraseña incorrectos.");

        return;

    }

    Storage.guardarUsuario(usuario);

    Storage.guardarToken("TOKEN_DE_PRUEBA");

    console.log("Bienvenido", usuario.nombre);

    switch (usuario.rol) {

        case "coder":

            cargarVista("dashboard-coder");

            break;

        case "leader":

            cargarVista("dashboard-leader");

            break;

        case "admin":

            cargarVista("dashboard-admin");

            break;

        default:

            alert("Dashboard en construcción para este rol.");

            break;

    }

}

function cerrarSesion() {

    Storage.cerrarSesion();

    cargarVista("login");

}