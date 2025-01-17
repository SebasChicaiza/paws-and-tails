
document.addEventListener('DOMContentLoaded', () => {
    const contenedorCarrito = document.querySelector('.contenedor-carrito'); // Contenedor del carrito
    const ajustarMargenInferior = () => {
        if (contenedorCarrito) {
            // Calcula la altura del contenedor
            const alturaCarrito = contenedorCarrito.scrollHeight;

            // Ajusta el margen inferior dinámicamente
            contenedorCarrito.style.marginBottom = `${alturaCarrito * 0.1}px`; // 10% de la altura del carrito
        }
    };

    // Ajusta el margen al cargar la página
    ajustarMargenInferior();

    // Escucha cambios de tamaño en la ventana para recalcular el margen
    window.addEventListener('resize', ajustarMargenInferior);

    // Si el contenido cambia dinámicamente
    const observer = new MutationObserver(ajustarMargenInferior);
    observer.observe(contenedorCarrito, { childList: true, subtree: true });
});

const video = document.getElementById('video');
const playPause = document.getElementById('playPause');
const seekBar = document.getElementById('seekBar');
const mute = document.getElementById('mute');
const fullscreen = document.getElementById('fullscreen');

// Play/Pause Toggle
playPause.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        playPause.textContent = '⏸️';
    } else {
        video.pause();
        playPause.textContent = '▶️';
    }
});