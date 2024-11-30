import express from 'express'
import publicRoutes from './routes/public.js'
import privateRoutes from './routes/private.js'
import auth from './middlewares/auth.js'

// Criação de uma instância do aplicativo Express.
const app = express();

// Configura o middleware para que o aplicativo consiga interpretar dados em formato JSON.
app.use(express.json());

// Adiciona um conjunto de rotas públicas (sem autenticação necessária) ao aplicativo.
// Essas rotas são acessíveis por qualquer usuário, independentemente de estar autenticado.
app.use('/', publicRoutes);

// Adiciona um conjunto de rotas privadas ao aplicativo. 
// Essas rotas são protegidas por um middleware de autenticação (`auth`).
// O middleware `auth` verifica se o usuário possui um token válido antes de acessar as rotas privadas.
app.use('/', auth, privateRoutes);


// Inicia o servidor na porta 3000.
app.listen(3000, () => console.log("Servidor Rodando"));