const express = require('express');
const routes = require('./routes');
const path = require('path');


const app = express();

// Servir la carpeta "public" como estática
app.use(express.static('public'));

// Middleware para manejar JSON
app.use(express.json());

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Prefijo para todas las rutas de la API
app.use('/api', routes);

app.use('/images', express.static(path.join(__dirname, 'public/images')));


// Ruta por defecto (opcional)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html'); // Cargar el archivo HTML principal
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

/*const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const app = express();
const PORT = 3006;

// Servir archivos estáticos desde una carpeta específica
app.use(express.static('public')); //Para servir archivos estaticos
app.use(bodyParser.json());

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});



app.listen(3000, '172.16.0.122', () => {
    console.log('Servidor escuchando en http://172.16.0.122:3000');
  });
//Inicializa la base de datos SQL
const sqlConfig = {
    user : 'GesDBUsr',
    password : 'Passwd123',
    database: 'DBUsuarios',
    server: 'localhost',
    connectionTimeout: 30000,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        //Cuando estoy en desarrollo
        encrypt: false,
        trustServerCertificate: true
    }    
}

const poolPromise = sql.connect(sqlConfig);

// Manejo de la solicitud POST
app.post('/submit', async (req, res) => {
    const { nombre, email, numero, contrasena } = req.body; // Ajusta los nombres según la nueva tabla
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('nombre', sql.VarChar(100), nombre)
            .input('email', sql.VarChar(255), email)
            .input('numero', sql.VarChar(18), numero)
            .input('contrasena', sql.VarChar(255), contrasena)
            .query(`
                INSERT INTO Usuarios (Nombre, CorreoElectronico, NumeroTelefono, Contrasena) 
                VALUES (@nombre, @email, @numero, @contrasena)
            `);
        res.send({ message: 'Data saved successfully', result: result.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error saving data', error: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { nombre, contrasena } = req.body;
    console.log('Datos recibidos:', { nombre, contrasena }); // Log para verificar datos recibidos

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('nombre', sql.VarChar(255), nombre)
            .input('contrasena', sql.VarChar(255), contrasena)
            .query(`
                SELECT * 
                FROM Usuarios 
                WHERE Nombre = @nombre AND Contrasena = @contrasena
            `);

        if (result.recordset.length > 0) {
            res.json({ valid: true }); // Credenciales válidas
        } else {
            res.json({ valid: false }); // Credenciales inválidas
        }
    } catch (err) {
        console.error('Error en el servidor:', err);
        res.status(500).send({ message: 'Error en el servidor', error: err.message });
    }
});
*/




