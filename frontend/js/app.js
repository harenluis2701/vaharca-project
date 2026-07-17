// ==========================================
// VAHARCA
// app.js
// Control principal de la aplicación (SPA)
// ==========================================

// Contenedor donde se mostrarán todas las vistas
const app = document.getElementById("app");

// Guarda la vista actualmente cargada
let vistaActual = null;

/**
 * Carga una vista HTML dentro del contenedor principal.
 * @param {string} nombreVista
 */
async function cargarVista(nombreVista) {

    if (vistaActual === nombreVista) {
        return;
    }

    try {

        console.log(`Cargando vista: ${nombreVista}`);

        const respuesta = await fetch(`views/${nombreVista}.html`);

        if (!respuesta.ok) {
            throw new Error(`No existe la vista "${nombreVista}"`);
        }

        const html = await respuesta.text();

        app.innerHTML = html;

        vistaActual = nombreVista;

        inicializarVista(nombreVista);

    } catch (error) {

        console.error(error);

        app.innerHTML = `
            <section class="error-container">

                <h1>Error</h1>

                <p>${error.message}</p>

            </section>
        `;

    }

}

/**
 * Inicializa la lógica de cada pantalla.
 */
function inicializarVista(nombreVista) {

    switch (nombreVista) {

        case "login":
            iniciarLogin();
            break;

        case "dashboard-coder":
            iniciarDashboardCoder();
            break;

        case "dashboard-leader":
            iniciarDashboardLeader();
            break;

        case "dashboard-admin":
            iniciarDashboardAdmin();
            break;

        default:
            console.log(`Vista "${nombreVista}" inicializada.`);
            break;

    }

}

/**
 * Dashboard del estudiante
 */
function iniciarDashboardCoder() {

    console.log("Dashboard Coder iniciado");

    const botones = document.querySelectorAll('.card-action');
    botones.forEach(boton => {
        boton.addEventListener('click', () => {
            const accion = boton.dataset.action;
            mostrarSubview(accion);
        });
    });

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(btn => btn.classList.remove('active'));
            item.classList.add('active');
            mostrarSubview(item.dataset.subview || 'home');
        });
    });

    const backButton = document.getElementById('coder-subview-back');
    if (backButton) {
        backButton.addEventListener('click', () => {
            mostrarSubview('home');
            document.querySelector('.menu-item[data-subview="home"]').classList.add('active');
        });
    }
}

function mostrarSubview(subview) {
    const homePanel = document.getElementById('coder-home');
    const subviewPanel = document.getElementById('coder-subview');
    const title = document.getElementById('coder-subview-title');
    const text = document.getElementById('coder-subview-text');

    if (!homePanel || !subviewPanel || !title || !text) {
        return;
    }

    const contenido = {
        home: {
            titulo: 'Bienvenido de nuevo',
            texto: 'Selecciona una opción del menú o de las tarjetas para ver más detalles.',
        },
        python: {
            titulo: 'Curso de Python',
            texto: 'Accede a lecciones, ejercicios y recursos para mejorar tus habilidades en Python.',
        },
        ingles: {
            titulo: 'Curso de Inglés',
            texto: 'Practica vocabulario técnico, gramática y conversaciones de programación.',
        },
        'tutor-ia': {
            titulo: 'Tutor IA',
            texto: 'Haz preguntas y recibe respuestas inteligentes de nuestro asistente IA.',
        },
        progreso: {
            titulo: 'Mi progreso',
            texto: 'Revisa tu avance en los cursos y descubre qué sigue en tu ruta de aprendizaje.',
        },
        perfil: {
            titulo: 'Mi perfil',
            texto: 'Actualiza tus datos, tu foto y tus preferencias de aprendizaje.',
        },
    };

    const seleccion = contenido[subview] || contenido.home;
    title.textContent = seleccion.titulo;
    text.textContent = seleccion.texto;

    if (subview === 'home') {
        homePanel.classList.remove('hidden');
        subviewPanel.classList.add('hidden');
    } else {
        homePanel.classList.add('hidden');
        subviewPanel.classList.remove('hidden');
    }
}

/**
 * Dashboard del Team Leader
 */
function iniciarDashboardLeader() {

    console.log("Dashboard Team Leader iniciado");

    const menuItems = document.querySelectorAll('.leader-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(btn => btn.classList.remove('active'));
            item.classList.add('active');
            alert(`Navegando a: ${item.textContent.trim()}`);
        });
    });

    const aiButtons = document.querySelectorAll('.btn-ai');
    aiButtons.forEach(button => {
        button.addEventListener('click', () => {
            const texto = button.textContent.trim();
            alert(`${texto} en construcción.`);
        });
    });

    const publishButton = document.querySelector('.btn-publish');
    if (publishButton) {
        publishButton.addEventListener('click', () => {
            alert('Publicación de lección en construcción.');
        });
    }

}

/**
 * Dashboard del Administrador
 */
function iniciarDashboardAdmin() {

    console.log("Dashboard Administrador iniciado");

    const adminItems = document.querySelectorAll('.admin-item');
    adminItems.forEach(item => {
        item.addEventListener('click', () => {
            adminItems.forEach(btn => btn.classList.remove('active'));
            item.classList.add('active');
            alert(`Navegando a: ${item.textContent.trim()}`);
        });
    });

    const adminActions = document.querySelectorAll('.admin-action');
    adminActions.forEach(button => {
        button.addEventListener('click', () => {
            const acción = button.dataset.action || button.textContent.trim();
            alert(`Acción admin: ${acción}`);
        });
    });

}

function obtenerRutaInicial() {
    const usuario = Storage.obtenerUsuario();

    if (!usuario) {
        return "login";
    }

    switch (usuario.rol) {
        case "leader":
            return "dashboard-leader";
        case "coder":
            return "dashboard-coder";
        case "admin":
            return "dashboard-admin";
        default:
            return "login";
    }
}

/**
 * Inicia la aplicación
 */
window.addEventListener("DOMContentLoaded", () => {

    console.log("VAHARCA iniciada");

    const vistaInicial = obtenerRutaInicial();
    cargarVista(vistaInicial);

});