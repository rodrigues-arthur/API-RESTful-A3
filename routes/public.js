// Importa os módulos necessários
import express from 'express'; // Framework para criar APIs e lidar com rotas HTTP.
import { PrismaClient } from '@prisma/client'; // Cliente Prisma para interagir com o banco de dados.
import bcrypt from 'bcrypt'; // Biblioteca para hashing de senhas
import jwt from 'jsonwebtoken'; // Importação do módulo jsonwebtoken para criação e verificação de tokens JWT.


// Instância do cliente do Prisma para interação com o banco de dados  / npx prisma studio   
const prisma = new PrismaClient();
// Criar um roteador do Express
const router = express.Router();

// Chave secreta para geração e validação de tokens JWT (deve ser configurada como variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET;

//Rota de Cadastro de Usuário
router.post('/cadastro', async (req, res) => {
  try {
    const user = req.body; // Dados enviados pelo c liente no corpo da requisição

    // Validação de campos obrigatórios
    if (!user.email || !user.password || !user.name) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    // Verificar se o email já está cadastrado no banco de dados
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email já registrado' });
    }

    // Gerar um hash para a senha utilizando bcrypt
    const salt = await bcrypt.genSalt(10); // Gera um salt com fator de custo 10
    const hashPassword = await bcrypt.hash(user.password, salt); // Gera o hash da senha

    // Criar o novo usuário no banco de dados
    const userDB = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: hashPassword, // Armazena apenas o hash da senha
      },
    });

    // Retorna os dados do usuário criado (sem incluir a senha)
    res.status(201).json({
      id: userDB.id,
      email: userDB.email,
      name: userDB.name,
    });
  } catch (err) {
    console.error(err); // Log do erro no servidor
    res.status(500).json({ message: 'Erro no Servidor, Tente novamente' });
  }
});

// Rota de Login do Usuário
router.post('/login', async (req, res) => {
  try {
    const userInfo = req.body; // Dados enviados pelo cliente no corpo da requisição

    // Busca o usuário no banco de dados pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Comparar a senha enviada com o hash armazenado no banco de dados
    const isMatch = await bcrypt.compare(userInfo.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Senha inválida' });
    }

    // Gerar um token JWT com duração de 1 dia
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

    // Retorna o token e os dados públicos do usuário
    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err); // Log do erro no servidor
    res.status(500).json({ message: 'Erro no Servidor, Tente novamente' });
  }
});

//Rota para Consultar um Usuário pelo ID
router.get('/user/:id', async (req, res) => {
  try {
    // Busca o usuário no banco de dados pelo ID recebido nos parâmetros da URL
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Retorna os dados do usuário encontrado
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error(err); // Log do erro no servidor
    res.status(500).json({ message: 'Erro no Servidor, Tente novamente' });
  }
});

export default router;
