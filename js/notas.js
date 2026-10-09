// ==========================================
// CONFIGURACIÓN DE SUPABASE Y SESIÓN
// ==========================================
const SUPABASE_URL = 'https://pchccjflbbgwgvwbzxdf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wqYYELBreJMpd4_RdadZiw_EUpW2Z5x';

// Variable global utilizada por todas las páginas
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const FECHA_INICIO = new Date(2023, 10, 15); // Fecha de aniversario

// Verificar sesión
async function verificarSesion() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error || !session) {
            window.location.href = '../login.html';
        }
    } catch (err) {
        console.error("Error verificando sesión:", err);
    }
}

// Cerrar sesión
async function cerrarSesion() {
    await supabaseClient.auth.signOut();
    window.location.href = '../login.html';
}

// Contador para el inicio
function calcularDiasJuntos() {
    const elem = document.getElementById('dias');
    if (!elem) return;
    const hoy = new Date();
    const dif = hoy - FECHA_INICIO;
    const dias = Math.floor(dif / (1000 * 60 * 60 * 24));
    elem.textContent = dias > 0 ? dias : 0;
}