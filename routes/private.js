// Importa os módulos necessários
import express from 'express'; // Framework para criar APIs e lidar com rotas HTTP.
import { PrismaClient } from '@prisma/client'; // Cliente Prisma para interagir com o banco de dados.
import bcrypt from 'bcrypt'; // Biblioteca para hashing de senhas.

const router = express.Router(); // Criação de um roteador para definir rotas.
const prisma = new PrismaClient(); // Inicialização do cliente Prisma.


// Rota para listar todos os usuários cadastrados.
router.get('/listar-usuarios', async (req, res) => {
    try {
        // Faz a busca de todos os usuários no banco de dados usando o Prisma.
        const users = await prisma.user.findMany();

        // Retorna uma resposta com status 200 (sucesso) e os dados dos usuários.
        res.status(200).json({
            Message: "Usuários listados com sucesso",
            users
        });
    } catch (err) {
        // Em caso de erro, retorna status 500 (erro interno do servidor) e uma mensagem genérica.
        res.status(500).json({ Message: "Falha no servidor" });
    }
});

// Rota para atualizar os dados de um usuário específico.
// :id é um parâmetro dinâmico que representa o ID do usuário.
router.put('/user/:id', async (req, res) => {
    try {
        // Obtém o ID do usuário dos parâmetros da URL.
        const userId = req.params.id.toString();

        // Verifica se o usuário com o ID fornecido existe no banco de dados.
        const userExists = await prisma.user.findUnique({
            where: { id: userId }, // Condição de busca pelo ID.
        });

        // Se o usuário não existir, retorna status 404 (não encontrado) e uma mensagem.
        if (!userExists) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Objeto para armazenar os dados atualizados do usuário.
        let updatedData = {
            name: req.body.name, // Atualiza o nome do usuário (se fornecido).
        };

        // Verifica se o e-mail foi fornecido no corpo da requisição.
        if (req.body.email) {
            // Verifica se o e-mail já está em uso por outro usuário.
            const emailExists = await prisma.user.findUnique({
                where: { email: req.body.email },
            });

            // Se o e-mail já estiver em uso por outro usuário, retorna status 400 (bad request).
            if (emailExists && emailExists.id !== userId) {
                return res.status(400).json({ message: 'Email já está em uso' });
            }

            // Adiciona o e-mail aos dados a serem atualizados.
            updatedData.email = req.body.email;
        }

        // Verifica se a senha foi fornecida no corpo da requisição.
        if (req.body.password) {
            // Gera um "salt" para aumentar a segurança do hash da senha.
            const salt = await bcrypt.genSalt(10);
            // Hash da senha fornecida e armazena no objeto de atualização.
            updatedData.password = await bcrypt.hash(req.body.password, salt);
        }

        // Atualiza os dados do usuário no banco de dados.
        const updatedUser = await prisma.user.update({
            where: { id: userId }, // Localiza o usuário pelo ID.
            data: updatedData, // Dados atualizados.
        });

        // Retorna status 200 (sucesso) e os dados atualizados do usuário.
        res.status(200).json(updatedUser);
    } catch (err) {
        // Em caso de erro, exibe o erro no console e retorna status 500 (erro interno do servidor).
        console.error(err);
        res.status(500).json({ message: 'Erro no Servidor, Tente novamente' });
    }
});

export default router;
