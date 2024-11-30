//Autenticação e Permissão 

// Importa o módulo jsonwebtoken, utilizado para manipular tokens JWT.
import jwt from 'jsonwebtoken';

// Obtém a chave secreta usada para assinar os tokens JWT.
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware de autenticação.
const auth = (req, res, next) => {
    // Obtém o token do cabeçalho de autorização da requisição.
    const token = req.headers.authorization;

    // Verifica se o token foi fornecido no cabeçalho.
    if (!token) {
        // Caso não haja token, retorna status 401 (não autorizado) com uma mensagem de erro.
        return res.status(401).json({ message: 'Acesso Negado' });
    }

    try {
        // Remove o prefixo "Bearer " do token, caso esteja presente.
        const cleanToken = token.replace('Bearer ', '');

        // Verifica e decodifica o token usando a chave secreta.
        const decoded = jwt.verify(cleanToken, JWT_SECRET);

        // Adiciona o ID do usuário (extraído do token) à requisição para uso posterior.
        req.userId = decoded.id;

        // Chama o próximo middleware ou rota, permitindo que a requisição continue.
        next();
    } catch (err) {
        // Em caso de erro (token inválido ou expirado), retorna status 401 (não autorizado) com uma mensagem de erro.
        return res.status(401).json({ message: 'Token inválido' });
    }
};

// Exporta o middleware para que possa ser usado em outras partes do sistema.
export default auth;
