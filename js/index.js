// ==========================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN SUPABASE
// ==========================================
const SUPABASE_URL = 'https://pchccjflbbgwgvwbzxdf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wqYYElBreJMpd4_RdadZiw_EUpW2...'; // Inserte su Publishable Key completa si fue recortada

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Configurar la fecha de inicio de su relación para el contador (AÑO, MES [0-11], DÍA)
// Ejemplo: 15 de Noviembre de 2023 -> new Date(2023, 10, 15)
const FECHA_INICIO = new Date(2023, 10, 15);

// ==========================================
// 2. VERIFICACIÓN DE SESIÓN Y NAVEGACIÓN
// ==========================================
async function verificarSesion() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error || !session) {
        window.location.href = 'login.html';
        return;
    }
    // Cargar datos tras confirmar la autenticación
    calcularDiasJuntos();
    cargarNotitaHoy();
    cargarCartas();
    cargarRecuerdos();
}

async function cerrarSesion() {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
}

function mostrarSeccion(idSeccion) {
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(sec => sec.classList.remove('activa'));

    const seccionObjetivo = document.getElementById(idSeccion);
    if (seccionObjetivo) {
        seccionObjetivo.classList.add('activa');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ==========================================
// 3. CONTADOR DE DÍAS
// ==========================================
function calcularDiasJuntos() {
    const hoy = new Date();
    const diferenciaMs = hoy - FECHA_INICIO;
    const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    
    const elementoDias = document.getElementById('dias');
    if (elementoDias) {
        elementoDias.textContent = dias > 0 ? dias : 0;
    }
}

// ==========================================
// 4. MODALES (SORPRESA, CARTAS Y RECUERDOS)
// ==========================================
function mostrarSorpresa() {
    const modal = document.getElementById('sorpresa');
    if (modal) modal.style.display = 'flex';
}

function cerrarSorpresa() {
    const modal = document.getElementById('sorpresa');
    if (modal) modal.style.display = 'none';
}

function abrirModalRecuerdo() {
    const modal = document.getElementById('modalAgregarRecuerdo');
    if (modal) modal.style.display = 'flex';
}

function cerrarModalRecuerdo() {
    const modal = document.getElementById('modalAgregarRecuerdo');
    if (modal) modal.style.display = 'none';
}

function cerrarModalCarta() {
    const modal = document.getElementById('modalLecturaCarta');
    if (modal) modal.style.display = 'none';
}

// ==========================================
// 5. OBTENCIÓN Y MUESTRA DE DATOS (SUPABASE)
// ==========================================

// --- Notita del Día ---
async function cargarNotitaHoy() {
    const contenedor = document.getElementById('notitaContenido');
    const elementoFecha = document.getElementById('notitaFecha');
    if (!contenedor) return;

    const { data, error } = await supabaseClient
        .from('notas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error || !data || data.length === 0) {
        if (elementoFecha) elementoFecha.textContent = 'Hoy';
        contenedor.innerHTML = '<p>Aún no hay notitas registradas para hoy. ❤️</p>';
        return;
    }

    const nota = data[0];
    if (elementoFecha) {
        const fecha = new Date(nota.created_at);
        elementoFecha.textContent = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    contenedor.innerHTML = `<p>${nota.contenido.replace(/\n/g, '<br>')}</p>`;
}

// --- Cartas ---
async function cargarCartas() {
    const contenedor = document.getElementById('contenedorCartas');
    if (!contenedor) return;

    const { data: cartas, error } = await supabaseClient
        .from('cartas')
        .select('*')
        .order('created_at', { ascending: false });

    if (error || !cartas || cartas.length === 0) {
        contenedor.innerHTML = '<p>Aún no hay cartas guardadas.</p>';
        return;
    }

    contenedor.innerHTML = '';
    cartas.forEach(carta => {
        const tarjeta = document.createElement('button');
        tarjeta.className = 'carta-card';
        tarjeta.innerHTML = `
            <span>${carta.icono || '💌'}</span>
            <h3>${carta.titulo}</h3>
        `;
        tarjeta.onclick = () => verCartaCompleta(carta);
        contenedor.appendChild(tarjeta);
    });
}

function verCartaCompleta(carta) {
    document.getElementById('modalCartaIcono').textContent = carta.icono || '💌';
    document.getElementById('modalCartaTitulo').textContent = carta.titulo;
    document.getElementById('modalCartaContenido').innerHTML = `<p>${carta.contenido.replace(/\n/g, '<br>')}</p>`;
    document.getElementById('modalLecturaCarta').style.display = 'flex';
}

// --- Recuerdos ---
async function cargarRecuerdos() {
    const contenedor = document.getElementById('contenedorRecuerdos');
    if (!contenedor) return;

    const { data: recuerdos, error } = await supabaseClient
        .from('recuerdos')
        .select('*')
        .order('fecha', { ascending: false });

    if (error || !recuerdos || recuerdos.length === 0) {
        contenedor.innerHTML = '<p>Aún no han agregado recuerdos.</p>';
        return;
    }

    contenedor.innerHTML = '';
    recuerdos.forEach(item => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'recuerdo';
        
        const fechaFormateada = new Date(item.fecha).toLocaleDateString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        const fotoHTML = item.imagen_url 
            ? `<img src="${item.imagen_url}" alt="${item.titulo}" style="width:100%; border-radius:8px;">`
            : `<div class="recuerdo-foto">📷</div>`;

        tarjeta.innerHTML = `
            ${fotoHTML}
            <h3>${item.titulo}</h3>
            <p>${item.descripcion}</p>
            <span>${fechaFormateada}</span>
        `;
        contenedor.appendChild(tarjeta);
    });
}

// ==========================================
// 6. GUARDAR NUEVO RECUERDO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();

    const formRecuerdo = document.getElementById('formNuevoRecuerdo');
    if (formRecuerdo) {
        formRecuerdo.addEventListener('submit', async (e) => {
            e.preventDefault();

            const titulo = document.getElementById('recuerdoTitulo').value;
            const descripcion = document.getElementById('recuerdoDescripcion').value;
            const fecha = document.getElementById('recuerdoFecha').value;
            const imagen = document.getElementById('recuerdoImagen').value;

            const { data: { user } } = await supabaseClient.auth.getUser();

            const { error } = await supabaseClient
                .from('recuerdos')
                .insert([
                    {
                        titulo: titulo,
                        descripcion: descripcion,
                        fecha: fecha,
                        imagen_url: imagen || null,
                        user_id: user ? user.id : null
                    }
                ]);

            if (error) {
                alert('Error al guardar el recuerdo: ' + error.message);
            } else {
                alert('¡Recuerdo guardado con éxito! ❤️');
                formRecuerdo.reset();
                cerrarModalRecuerdo();
                cargarRecuerdos();
            }
        });
    }
});