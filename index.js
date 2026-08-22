require('./main');

const path = require('path');
const express = require("express");
const app = express();
const port = 8888;

// Ruta principal (para que Render no apague el bot)
app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'index.html');
    res.sendFile(imagePath);
});

// Iniciar servidor web
app.listen(port, () => {
    console.log(`🔗 Bot activo en: http://localhost:${port}`);
});
