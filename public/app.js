document.getElementById('registroForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const form = document.getElementById('registroForm');
    const nombre = form.elements['nombre'].value;
    const email = form.elements['email'].value;
    const numero = form.elements['numero'].value;
    const contrasena = form.elements['contrasena'].value;  
    const confContra = form.elements['confirm-password'].value;  

    console.log('Número de Teléfono:', numero); // Verifica que el número se captura correctamente
  

    //Obligatorio validación de datos
    if (!nombre.trim()) {
        alert("Por favor escribe tu nombre");
        return;
    }
    if (!email.includes("@")) {
        alert("Por favor escribe un correo válido");
        return;
    }   

    // Verificar si las contraseñas coinciden
    if (contrasena !== confContra) {
        alert('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
        return; // Detener el proceso si las contraseñas no coinciden
    }

    // Si las contraseñas coinciden, enviar los datos al servidor
    const formData = {
        nombre: nombre,
        email: email,
        numero: numero,
        contrasena: contrasena
    };

    // Enviar datos al servidor usando Fetch API
    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, email, numero, contrasena }),
    })
        .then(response => {
            if (response.ok) {
                alert('Registro exitoso.');
                document.getElementById('registroForm').reset(); // Reinicia el formulario
            } else {
                alert('Hubo un error al registrar. Intenta nuevamente.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error en la conexión con el servidor.');
        });
});

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Capturar valores
    const nombre = document.getElementById('nombre').value.trim();
    const contrasena = document.getElementById('contrasena').value.trim();


    // Enviar datos al servidor
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: nombre, contrasena: contrasena }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.valid) {
            alert('Inicio de sesión exitoso. ¡Bienvenido!');
            // Redirigir a una página principal
            // window.location.href = '../index.html';
        } else {
            document.getElementById('error-message').innerText = 'Credenciales incorrectas. Por favor, inténtalo de nuevo.';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('error-message').innerText = 'Hubo un error al conectar con el servidor.';
    });
});

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

