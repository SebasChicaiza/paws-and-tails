const express = require('express');
const { query } = require('./db');
const router = express.Router();
const client = require('./db');  // Asegúrate de que esta ruta esté correctamente configurada

// Ruta para obtener los productos con sus imágenes
router.get('/productos', async (req, res) => {
  try {
    // Obtener productos y sus imágenes relacionadas
    const result = await query(`
      SELECT p.id_producto, p.prod_nombre, p.prod_desc, p.prod_precio, p.prod_stock, 
             i.img_url, i.img_tipo
      FROM producto p
      LEFT JOIN imagenes i ON p.id_producto = i.id_producto
      WHERE i.img_tipo = 'PRI' OR i.img_tipo = 'SEC'`);

    const productos = result.rows;

    // Agrupar las imágenes de cada producto
    const productosConImagenes = productos.reduce((acc, producto) => {
      const { id_producto, prod_nombre, prod_desc, prod_precio, prod_stock, img_url, img_tipo } = producto;

      // Asegurarse de que cada producto esté bien inicializado en el objeto acumulador
      if (!acc[id_producto]) {
        acc[id_producto] = {
          id_producto, // Aseguramos que esté incluido
          prod_nombre,
          prod_desc,
          prod_precio,
          prod_stock,
          imagenes: [],
        };
      }

      // Corregir la URL de la imagen eliminando el prefijo "pages/" si está presente
      const imgUrlCorregida = img_url.replace('pages/', ''); // Eliminar "pages/" si es necesario

      // Si la imagen es principal (PRI), la agregamos como img_principal
      if (img_tipo === 'PRI') {
        acc[id_producto].img_principal = imgUrlCorregida;
      }
      // Si la imagen es secundaria (SEC), la agregamos al array de imagenes
      if (img_tipo === 'SEC') {
        acc[id_producto].imagenes.push(imgUrlCorregida);
      }

      return acc;
    }, {});

    // Convertir el objeto a un array y devolverlo como JSON
    res.json(Object.values(productosConImagenes));
  } catch (err) {
    console.error('Error al obtener productos con imágenes:', err);
    res.status(500).send('Error al obtener productos');
  }
});



// Insertar un nuevo producto
router.post('/productos', async (req, res) => {
  const { prod_Nombre, prod_Desc, prod_Precio, prod_Stock } = req.body;
  try {
    const result = await query(
      'INSERT INTO PRODUCTO (prod_Nombre, prod_Desc, prod_Precio, prod_Stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [prod_Nombre, prod_Desc, prod_Precio, prod_Stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send('Error al insertar producto');
  }
});

// Obtener todos los clientes
router.get('/clientes', async (req, res) => {
  try {
    const result = await query('SELECT * FROM CLIENTE');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Error al obtener clientes');
  }
});

// Insertar un cliente
router.post('/clientes', async (req, res) => {
  const { cli_Nombre, cli_Apellido, cli_Ced_Ruc, cli_Telefono, cli_FechaNac } = req.body;
  try {
    const result = await query(
      'INSERT INTO CLIENTE (cli_Nombre, cli_Apellido, cli_Ced_Ruc, cli_Telefono, cli_FechaNac) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [cli_Nombre, cli_Apellido, cli_Ced_Ruc, cli_Telefono, cli_FechaNac]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send('Error al insertar cliente');
  }
});

// Ruta para registrar un usuario
router.post('/registrar', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;

  // Verificar que los campos estén completos
  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ message: 'Faltan datos' });
  }

  try {
    // Insertar el nuevo usuario en la base de datos con el rol de id 1
    const query = 'INSERT INTO usuario (id_rol, usr_nombre, usr_correo, usr_passwd, usr_fecha_registro) VALUES ($1, $2, $3, $4, NOW())';
    await client.query(query, [1, nombre, correo, contrasena]);  // Aquí se agrega el '1' para el id_rol

    // Enviar una respuesta exitosa
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
});

// Endpoint para obtener los clientes de un usuario
router.get('/obtenerClientes/:idUsuario', async (req, res) => {
  // Obtenemos el idUsuario desde los parámetros de la ruta
  const { idUsuario } = req.params;

  // Verificamos que el parámetro idUsuario no esté vacío o sea null
  if (!idUsuario) {
    return res.status(400).json({ message: 'El parámetro idUsuario es requerido' });
  }

  try {
    // Realizamos la consulta a la base de datos para obtener los clientes
    const result = await query('SELECT * FROM cliente WHERE id_usuario = $1', [idUsuario]);

    // Si hay resultados, los enviamos
    if (result.rows.length > 0) {
      res.json(result.rows);
    } else {
      res.status(404).json({ message: 'No se encontraron clientes para este usuario' });
    }
  } catch (err) {
    console.error('Error al obtener los clientes:', err);
    res.status(500).json({ message: 'Error al obtener los clientes' });
  }
});

const pool = require('./db');  // Asegúrate de tener la conexión a la base de datos configurada correctamente

// Endpoint para generar factura y detalle de la factura
router.post('/generarFactura', async (req, res) => {
  const { idCliente, metodoPago, direccion, productos } = req.body;  // productos es un array con el detalle del carrito

  if (!idCliente || !metodoPago || !direccion || !productos || productos.length === 0) {
    return res.status(400).json({ message: "Todos los campos son requeridos." });
  }

  try {
    // Calcular el subtotal, IVA y total
    let subtotal = 0;
    productos.forEach(producto => {
      subtotal += producto.df_precio_venta * producto.df_cant;
    });

    const iva = subtotal * 0.15; // 15% de IVA
    const total = subtotal + iva;

    const direccionQuery = `
    SELECT cli_direccion 
    FROM cliente 
    WHERE id_cliente = $1;
  `;
    const direccionResult = await pool.query(direccionQuery, [idCliente]);
    const direccion = direccionResult.rows[0]?.cli_direccion || 'Dirección no disponible';

    // Insertar la factura
    const insertFacturaQuery = `
          INSERT INTO factura (id_cliente, fac_fechahora, fac_metodo_pago, fac_direccion, fac_subtotal, fac_iva, fac_total, fac_estado)
          VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, $5, $6, 'Pendiente') RETURNING id_factura;
      `;
    const resultFactura = await pool.query(insertFacturaQuery, [idCliente, metodoPago, direccion, subtotal, iva, total]);
    console.log("Resultado de la inserción de la factura:", resultFactura);

    // Obtener el ID de la factura generada
    const idFactura = parseInt(resultFactura.rows[0].id_factura, 10);  // Convertir el id_factura a un entero
    console.log("ID de la factura generada:", idFactura);

    // Insertar los detalles de la factura
    const insertDetalleQuery = `
          INSERT INTO detalle_factura (id_Factura, id_Producto, df_cant, df_precio_venta)
          VALUES ($1, $2, $3, $4);
      `;

    for (const producto of productos) {
      console.log(producto);
      await pool.query(insertDetalleQuery, [idFactura, producto.id_Producto, producto.df_cant, producto.df_precio_venta]);
    }

    // Responder con éxito
    res.status(201).json({ message: "Factura generada exitosamente.", idFactura });    
  } catch (err) {
    console.error('Error al generar la factura:', err);
    res.status(500).json({ message: "Error al generar la factura." });
  }
});




// Endpoint para agregar un nuevo cliente
router.post('/crearCliente', async (req, res) => {
  console.log(req.body);

  const { nombre, apellido, cedulaRuc, telefono, direccion, fechaNacimiento, idUsuario } = req.body;

  /*console.log(nombre);
  
  console.log(apellido);
  
  console.log(cedulaRuc);
  
  console.log(telefono);

  console.log(direccion);
  
  console.log(fechaNacimiento);

  console.log(idUsuario);*/

  /*if (!nombre || !apellido || !cedulaRuc || !telefono || !direccion || !fechaNacimiento || !idUsuario) {
    console.log(req.body);
    return res.status(400).json({ message: "Todos los campos son requeridos." });
  }*/

  try {
    // Insertar el nuevo cliente en la base de datos
    const query = `
          INSERT INTO cliente (id_usuario, cli_nombre, cli_apellido, cli_ced_ruc, cli_telefono, cli_direccion, cli_fechanac)
          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_Cliente;
      `;

    const result = await client.query(query, [idUsuario, nombre, apellido, cedulaRuc, telefono, direccion, fechaNacimiento]);
    console.log(query);
    // Devolver el ID del cliente insertado
    res.json({ success: true, idCliente: result.rows[0].id_Cliente });
  } catch (err) {
    console.error('Error al crear cliente:', err);
    res.status(500).json({ message: "Error al crear el cliente." });
  }
});


router.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  // Verificar que los campos no estén vacíos
  if (!correo || !contrasena) {
    return res.status(400).json({ message: 'Correo y contraseña son requeridos.' });
  }

  try {
    // Buscar el usuario por correo
    const result = await query('SELECT * FROM usuario WHERE usr_correo = $1', [correo]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado.' });
    }

    const usuario = result.rows[0];

    // Verificar si la contraseña es correcta
    if (usuario.usr_passwd !== contrasena) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    // Si las credenciales son correctas, enviar la información del usuario
    res.status(200).json({ usuario });

  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

module.exports = router;