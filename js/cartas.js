<!-- SDK de Supabase (necesario para verificar la sesión) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Archivo JS principal con las credenciales y verificarSesion() -->
<script src="../js/script.js"></script>

<script>
    function verCarta(titulo, texto, icono) {
        const modal = document.getElementById('modalLecturaCarta');
        document.getElementById('modalCartaIcono').textContent = icono;
        document.getElementById('modalCartaTitulo').textContent = titulo;
        document.getElementById('modalCartaContenido').innerHTML = `<p style="margin-top: 15px; line-height: 1.7; color: var(--secundario);">${texto.replace(/\n/g, '<br>')}</p>`;
        
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('activo');
        }
    }

    function cerrarCarta() {
        const modal = document.getElementById('modalLecturaCarta');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('activo');
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (typeof verificarSesion === 'function') {
            verificarSesion();
        }
    });
</script>