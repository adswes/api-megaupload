import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;
const token = process.env.UPLOAD_TOKEN;

// Configuração do Multer para salvar os arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = '/app/uploads';
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Usa o nome original do arquivo
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Middleware para verificar o Token de segurança
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.query.token;
    if (!token) return next(); // Se não tiver token configurado, deixa passar (CUIDADO)
    if (authHeader === token) {
        next();
    } else {
        res.status(403).json({ error: 'Acesso negado. Token invalido.' });
    }
};

app.get('/', (req, res) => {
    res.send('MegaUpload API Online 🚀');
});

// Rota de Upload
app.post('/upload', authenticate, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }
    const fileUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    res.json({ 
        message: 'Arquivo enviado com sucesso!',
        filename: req.file.filename,
        url: fileUrl
    });
});

// Servir os arquivos estáticos (para poder baixar depois)
app.use('/uploads', express.static('/app/uploads'));

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});