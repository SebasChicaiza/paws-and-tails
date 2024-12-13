const menuIcon = document.getElementById('menu-icon');
const navLinks = document.getElementById('nav-links');


let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
carrito = carrito.filter(producto => producto.precio && producto.precio.startsWith('$'));
localStorage.setItem('carrito', JSON.stringify(carrito));

console.log(JSON.parse(localStorage.getItem('carrito')));

menuIcon.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

let productoActual = '';
let descripcionActual = '';
let imagenesActuales = [];
let imagenPrincipal = '';

function abrirModal(nombreProducto, descripcion, imagenes) {
    productoActual = nombreProducto;
    descripcionActual = descripcion;
    imagenesActuales = imagenes;

    // Mostrar el modal
    document.getElementById("modal").style.display = "flex";
    
    // Establecer la primera imagen como principal
    imagenPrincipal = imagenes[0];
    document.getElementById("main-img").src = imagenPrincipal;

    // Mostrar la descripción
    document.getElementById("modal-desc").textContent = descripcion;

    // Generar las imágenes en miniatura
    const contenedorMiniaturas = document.getElementById("modal-img-container");
    contenedorMiniaturas.innerHTML = '';
    imagenes.forEach((imgSrc, index) => {
        const img = document.createElement("img");
        img.src = imgSrc;
        img.className = "modal-img" + (index === 0 ? " active" : "");
        img.onclick = function() {
            seleccionarImagenPrincipal(imgSrc);
        };
        contenedorMiniaturas.appendChild(img);
    });
}

function seleccionarImagenPrincipal(src) {
    imagenPrincipal = src;
    document.getElementById("main-img").src = src;

    // Actualizar la clase activa en las miniaturas
    const miniaturas = document.querySelectorAll(".modal-img");
    miniaturas.forEach(img => img.classList.remove("active"));
    document.querySelector(`.modal-img[src="${src}"]`).classList.add("active");
}

function cerrarModal() {
    document.getElementById("modal").style.display = "none";
}
function agregarAlCarrito(nombre, descripcion, precio, cantidad) {
    cantidad = parseInt(cantidad, 10);

    if (isNaN(cantidad) || cantidad <= 0) {
        alert("Por favor, selecciona una cantidad válida.");
        return;
    }

    // Verificar que el precio esté en el formato correcto
    if (!precio || typeof precio !== 'string' || !precio.startsWith('$')) {
        console.error(`Precio inválido para el producto "${nombre}": ${precio}`);
        return;
    }

    // Obtener el carrito actual o inicializarlo
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Verificar si el producto ya existe en el carrito
    const indexProducto = carrito.findIndex(item => item.nombre === nombre);
    if (indexProducto >= 0) {
        // Si el producto ya está en el carrito, actualizar la cantidad
        carrito[indexProducto].cantidad += cantidad;
    } else {
        // Si el producto no existe, añadirlo al carrito
        carrito.push({ nombre, descripcion, precio, cantidad });
    }

    // Guardar el carrito actualizado en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // Mostrar mensaje de confirmación
    alert(`Se añadió ${cantidad} unidad(es) de "${nombre}" al carrito.`);
}


document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video'); // Asegúrate de que el id coincide
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

    // Update SeekBar
    video.addEventListener('timeupdate', () => {
        seekBar.value = (video.currentTime / video.duration) * 100;
    });

    // SeekBar Change
    seekBar.addEventListener('input', () => {
        video.currentTime = (seekBar.value / 100) * video.duration;
    });

    // Mute Toggle
    mute.addEventListener('click', () => {
        video.muted = !video.muted;
        mute.textContent = video.muted ? '🔊' : '🔇';
    });

    // Fullscreen
    fullscreen.addEventListener('click', () => {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const contenedorCarrito = document.getElementById('miCarritoDet');

    if (!contenedorCarrito) {
        console.error("No se encontró el contenedor del carrito.");
        return;
    }

    // Limpiar el contenedor actual
    contenedorCarrito.innerHTML = `
        <h3 id="tit-desglose">Mis productos</h3>
    `;

    let subtotal = 0;

    // Iterar sobre los productos y generarlos dinámicamente
    carrito.forEach((producto, index) => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('prods-detalle');

        const precioTotalProducto = producto.cantidad * parseFloat(producto.precio.slice(1));
        subtotal += precioTotalProducto;

        productoDiv.innerHTML = `
            <h4>${producto.nombre} (x${producto.cantidad})</h4>
            <h4>$${precioTotalProducto.toFixed(2)}</h4>
            <button class="eliminar-btn" data-index="${index}">X</button>
        `;

        contenedorCarrito.appendChild(productoDiv);
    });

    // Calcular IVA y total
    const iva = subtotal * 0.15;
    const total = subtotal + iva;

    // Agregar desglose de subtotal, IVA y total
    const subtotalDiv = document.createElement('div');
    subtotalDiv.classList.add('prods-detalle');
    subtotalDiv.innerHTML = `
        <h4>Subtotal</h4>
        <h4>$${subtotal.toFixed(2)}</h4>
    `;
    contenedorCarrito.appendChild(subtotalDiv);

    const ivaDiv = document.createElement('div');
    ivaDiv.classList.add('prods-detalle');
    ivaDiv.innerHTML = `
        <h4>IVA (15%)</h4>
        <h4>$${iva.toFixed(2)}</h4>
    `;
    contenedorCarrito.appendChild(ivaDiv);

    const totalDiv = document.createElement('div');
    totalDiv.classList.add('prods-detalle');
    totalDiv.innerHTML = `
        <h4>Total</h4>
        <h4>$${total.toFixed(2)}</h4>
    `;
    contenedorCarrito.appendChild(totalDiv);

    // Agregar evento de eliminación a los botones "X"
    const eliminarBtns = document.querySelectorAll('.eliminar-btn');
    eliminarBtns.forEach(btn => {
        btn.addEventListener('click', (event) => {
            const index = event.target.dataset.index;
            carrito.splice(index, 1); // Eliminar el producto del carrito
            localStorage.setItem('carrito', JSON.stringify(carrito)); // Actualizar el localStorage
            location.reload(); // Recargar la página para reflejar los cambios
        });
    });

    // Manejar el evento de pago en el botón existente
    const pagarBtn = document.getElementById('btn_pagar');
    if (pagarBtn) {
        pagarBtn.addEventListener('click', () => {
            alert('Gracias por tu compra. El carrito ha sido limpiado.');
            localStorage.removeItem('carrito');
            location.reload(); // Recargar para limpiar el carrito en la vista
        });
    }
});

// Función para alternar entre modos
// Comprobar y aplicar el estado guardado en Session Storage
 window.onload = () => {
    const darkMode = sessionStorage.getItem('dark-mode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
};

// Función para alternar entre modos y guardar el estado
function toggleDarkMode() {
    const body = document.body;
    const darkModeEnabled = body.classList.toggle('dark-mode');

    // Guardar el estado en Session Storage
    if (darkModeEnabled) {
        sessionStorage.setItem('dark-mode', 'enabled');
    } else {
        sessionStorage.setItem('dark-mode', 'disabled');
    }
}
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Evita el envío predeterminado del formulario

    // Obtén los valores de los campos de entrada
    const nombreUsuario = document.getElementById("nombre").value;
    const contrasena = document.getElementById("contrasena").value;

    // Verifica las credenciales
    if (nombreUsuario === "Sebastian" && contrasena === "Puce2024") {
        // Si las credenciales son correctas, redirige a otra página
        alert("Ingreso exitoso. Bienvenido Sebastian!")
        window.location.href = "../pages/carrito.html";
    } else {
        // Muestra un mensaje de error si las credenciales no son correctas
        alert("Nombre de usuario o contraseña incorrectos. Por favor, inténtelo de nuevo.");
    }
});

// Recuperar los valores guardados al cargar la página desde sessionStorage
window.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('#registroForm input');
    inputs.forEach(input => {
        const savedValue = sessionStorage.getItem(input.id);
        if (savedValue) {
            input.value = savedValue;
        }
    });
});

// Guardar automáticamente en sessionStorage mientras el usuario escribe
document.querySelectorAll('#registroForm input').forEach(input => {
    input.addEventListener('input', (event) => {
        sessionStorage.setItem(event.target.id, event.target.value);
    });
});
