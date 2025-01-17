const menuIcon = document.getElementById('menu-icon');
const navLinks = document.getElementById('nav-links');


//let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
//carrito = carrito.filter(producto => producto.precio && producto.precio.startsWith('$'));
//localStorage.setItem('carrito', JSON.stringify(carrito));

console.log(JSON.parse(localStorage.getItem('carrito')));

menuIcon.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

let productoActual = '';
let descripcionActual = '';
let imagenesActuales = [];
let imagenPrincipal = '';

function mostrarModal(id_producto) {
    // Buscar el producto con el id_producto correspondiente
    const producto = productos.find(p => p.id_producto === id_producto);

    console.log(producto);  // Verifica que los datos del producto sean correctos

    // Mostrar la imagen principal en el modal
    document.getElementById('main-img').src = producto.img_principal;

    // Limpiar las imágenes secundarias previas
    const modalImgContainer = document.getElementById('modal-img-container');
    modalImgContainer.innerHTML = '';

    // Agregar imágenes secundarias al modal
    producto.imagenes.forEach(img_url => {
        const imgElement = document.createElement('img');
        imgElement.src = img_url;
        modalImgContainer.appendChild(imgElement);
    });

    // Mostrar la descripción
    document.getElementById('modal-desc').innerText = producto.prod_desc;

    // Mostrar el modal
    document.getElementById('modal').style.display = 'block';
}


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
        img.onclick = function () {
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
function agregarAlCarrito(id_producto, nombre, descripcion, precio, cantidad) {
    cantidad = parseInt(cantidad, 10);

    if (isNaN(cantidad) || cantidad <= 0) {
        alert("Por favor, selecciona una cantidad válida.");
        return;
    }

    // Verificar que el precio esté en el formato correcto
    if (!precio || typeof precio !== 'string') {
        console.error(`Precio inválido para el producto "${nombre}": ${precio}`);
        return;
    }

    // Obtener el carrito actual o inicializarlo
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Verificar si el producto ya existe en el carrito
    const indexProducto = carrito.findIndex(item => item.id_producto === id_producto);
    if (indexProducto >= 0) {
        // Si el producto ya está en el carrito, actualizar la cantidad
        carrito[indexProducto].cantidad += cantidad;
    } else {
        // Si el producto no existe, añadirlo al carrito
        carrito.push({ id_producto, nombre, descripcion, precio, cantidad });
    }

    // Guardar el carrito actualizado en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // Mostrar mensaje de confirmación
    alert(`Se añadió ${cantidad} unidad(es) de "${nombre}" al carrito.`);
}


document.addEventListener('DOMContentLoaded', () => {
    // Función para mostrar los productos en el carrito
    const mostrarCarrito = () => {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const contenedorCarrito = document.getElementById('miCarritoDet');
        const totalesCarrito = document.getElementById('totales-carrito');

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

            // Convertir el precio a número para poder hacer operaciones matemáticas
            const precio = parseFloat(producto.precio.replace('$', '').trim());
            const precioTotalProducto = producto.cantidad * precio;
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

        // Crear y agregar el desglose de subtotal, IVA y total si no existen
        let subtotalDiv = document.getElementById('subtotal');
        if (!subtotalDiv) {
            subtotalDiv = document.createElement('div');
            subtotalDiv.id = 'subtotal';
            totalesCarrito.appendChild(subtotalDiv);
        }
        subtotalDiv.innerHTML = `<strong>Subtotal:</strong> $${subtotal.toFixed(2)}`;

        let ivaDiv = document.getElementById('iva');
        if (!ivaDiv) {
            ivaDiv = document.createElement('div');
            ivaDiv.id = 'iva';
            totalesCarrito.appendChild(ivaDiv);
        }
        ivaDiv.innerHTML = `<strong>IVA (15%):</strong> $${iva.toFixed(2)}`;

        let totalDiv = document.getElementById('total');
        if (!totalDiv) {
            totalDiv = document.createElement('div');
            totalDiv.id = 'total';
            totalesCarrito.appendChild(totalDiv);
        }
        totalDiv.innerHTML = `<strong>Total:</strong> $${total.toFixed(2)}`;

        // Agregar eventos a los botones de eliminar
        const eliminarBtns = document.querySelectorAll('.eliminar-btn');
        eliminarBtns.forEach(btn => {
            btn.addEventListener('click', (event) => {
                const index = event.target.dataset.index;
                carrito.splice(index, 1); // Eliminar el producto del carrito
                localStorage.setItem('carrito', JSON.stringify(carrito)); // Actualizar localStorage
                mostrarCarrito(); // Volver a mostrar el carrito
            });
        });
    };

    // Mostrar el carrito al cargar la página
    mostrarCarrito();
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
document.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(localStorage.getItem('usuario'));

    if (userData) {
        // Mostrar el mensaje de bienvenida con el nombre del usuario
        const welcomeMessage = document.getElementById('welcome-message');
        const userWelcome = document.getElementById('user-welcome');
        const logoutBtnItem = document.getElementById('logout-btn-item');

        userWelcome.textContent = `Hola, ${userData.usr_nombre}`; // Usar el nombre del usuario guardado en el localStorage
        welcomeMessage.style.display = 'block'; // Mostrar el mensaje
        logoutBtnItem.style.display = 'block'; // Mostrar el botón de cerrar sesión
    }

    // Añadir evento para cerrar sesión
    document.getElementById('logout-btn')?.addEventListener('click', function () {
        // Eliminar el usuario del localStorage
        localStorage.removeItem('usuario');
        // Redirigir a la página de login
        window.location.href = '/pages/login.html';
    });
});
document.getElementById('btn_continuar').addEventListener('click', function (event) {
    event.preventDefault(); // Evitar que el formulario se envíe por defecto

    // Verificar si el usuario está logueado
    const userData = JSON.parse(localStorage.getItem('usuario'));
    console.log(userData.id_usuario);

    if (userData) {
        document.getElementById('formularioFacturacion').style.display = 'block';
        document.getElementById('clientesDropdown').style.display = 'block';
        document.getElementById('btn_pagar').style.display = 'block';

        // Mostrar la lista de clientes si el usuario está logueado
        fetch(`/api/obtenerClientes/${userData.id_usuario}`) // Asegúrate de que este endpoint esté correcto en el backend
            .then(response => response.json())
            .then(clientes => {
                if (Array.isArray(clientes)) {
                    // Mostrar la lista de clientes
                    const clientesDropdown = document.getElementById('clientesDropdown');
                    clientesDropdown.innerHTML = ''; // Limpiar el dropdown antes de agregar los clientes

                    // Agregar un "option" por cada cliente
                    clientes.forEach(cliente => {
                        const option = document.createElement('option');
                        option.value = cliente.id_cliente;
                        option.textContent = `${cliente.cli_ced_ruc} ${cliente.cli_nombre} ${cliente.cli_apellido}`;
                        clientesDropdown.appendChild(option);
                    });

                    // Mostrar el contenedor de los clientes
                    document.getElementById('clientesList').style.display = 'block';
                } else {
                    console.error('La respuesta no es un array válido:', clientes);
                    alert("Hubo un problema al obtener los clientes.");
                }
            })
            .catch(error => {
                console.error('Error al obtener los clientes:', error);
                alert("Error al obtener los clientes.");
            });
    } else {
        // Si no hay usuario logueado, redirigir a la página de registro
        window.location.href = '/pages/cuenta.html';
    }
});


// Función para agregar un cliente
document.getElementById('facturacionForm').addEventListener('submit', function (event) {
    event.preventDefault();  // Prevenir el comportamiento por defecto del formulario

    // Obtener los datos del formulario
    const nombre = document.getElementById('nombreCliente').value;
    const apellido = document.getElementById('apellidoCliente').value;
    const cedulaRuc = document.getElementById('cedulaRuc').value;
    const telefono = document.getElementById('telefonoCliente').value;
    const direccion = document.getElementById('direccionCliente').value;
    const fechaNacimiento = document.getElementById('fechaNacimiento').value;

    // Verificar si el usuario está logueado
    const userData = JSON.parse(localStorage.getItem('usuario'));

    if (!userData) {
        alert("Por favor, inicie sesión primero.");
        return;
    }

    // Datos del cliente a enviar
    const clienteData = {
        nombre: nombre,
        apellido: apellido,
        cedulaRuc: cedulaRuc,
        telefono: telefono,
        direccion: direccion,
        fechaNacimiento: fechaNacimiento,
        idUsuario: userData.id_usuario  // Asociar el cliente con el usuario logueado
    };

    // Enviar los datos al servidor
    fetch('/api/crearCliente', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(clienteData)  // Enviar la variable clienteData
    })
        .then(response => response.json())
        .then(data => {
            console.log('Cliente agregado:', data);
        })
        .catch(error => {
            console.error('Error al agregar cliente:', error);
        });
});

document.getElementById('btn_pagar').addEventListener('click', function (event) {
    event.preventDefault();  // Prevenir el comportamiento por defecto

    const userData = JSON.parse(localStorage.getItem('usuario'));
    const clienteSeleccionado = document.getElementById('clientesDropdown').value;

    if (!userData) {
        alert("Por favor, inicie sesión primero.");
        return;
    }

    // Obtener los productos del carrito
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    const productos = carrito.map(item => ({
        id_Producto: item.id_producto,
        df_cant: item.cantidad,
        df_precio_venta: item.precio
    }));

    const facturaData = {
        idCliente: clienteSeleccionado,
        metodoPago: "Efectivo",  // O el método de pago elegido
        direccion: "Dirección de envío",  // Obtener la dirección si corresponde
        productos: productos
    };

    // Enviar los datos al backend para crear la factura
    fetch('/api/generarFactura', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(facturaData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.idFactura) {
            alert('Gracias por su compra. Su factura ha sido generada exitosamente!');
            // Vaciar el carrito
            localStorage.removeItem('carrito');
            // Redirigir o mostrar la factura generada
            window.location.href = '../index.html';
        }
    })
    .catch(error => {
        console.error('Error al generar la factura:', error);
        alert("Hubo un error al generar la factura.");
    });
});



// Guardar automáticamente en sessionStorage mientras el usuario escribe
document.querySelectorAll('#registroForm input').forEach(input => {
    input.addEventListener('input', (event) => {
        sessionStorage.setItem(event.target.id, event.target.value);
    });
});
// Verificar si el usuario está logueado
document.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(localStorage.getItem('usuario'));

    if (userData) {
        // Mostrar el mensaje de bienvenida con el nombre del usuario
        const welcomeMessage = document.getElementById('welcome-message');
        const userWelcome = document.getElementById('user-welcome');

        userWelcome.textContent = `Hola, ${userData.usr_nombre}`; // Usar el nombre del usuario guardado en el localStorage
        welcomeMessage.style.display = 'block'; // Mostrar el mensaje
    }
});

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

