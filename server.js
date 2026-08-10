const express = require('express');
const cors = require('cors');

const app = express();

// Libera o CORS para o seu site no Netlify conseguir acessar
app.use(cors());
app.use(express.json());

// Banco de dados em memória (para testes)
// DICA: Em produção, você pode conectar com Supabase, MongoDB ou PostgreSQL
let militares = [
    { nome: "João Silva", funcao: "Operador 193", rg: "12345", cpf: "000.000.000-00" }
];
let respostasAvaliacao = [];

// --- ROTAS DA API ---

// 1. Listar Militares
app.get('/api/militares', (req, res) => {
    res.json(militares);
});

// 2. Cadastrar Novo Militar
app.post('/api/militares', (req, res) => {
    const { nome, funcao, rg, cpf } = req.body;
    
    if (!nome || !funcao || !rg || !cpf) {
        return res.status(400).json({ error: "Preencha todos os campos!" });
    }

    // Verifica se RG já existe
    if (militares.some(m => m.rg === rg)) {
        return res.status(400).json({ error: "Militar com este RG já cadastrado!" });
    }

    const novoMilitar = { nome, funcao, rg, cpf };
    militares.push(novoMilitar);
    res.status(201).json({ message: "Militar cadastrado com sucesso!", militar: novoMilitar });
});

// 3. Editar Militar
app.put('/api/militares/:rg', (req, res) => {
    const { rg } = req.params;
    const { nome, funcao, cpf } = req.body;

    const index = militares.findIndex(m => m.rg === rg);
    if (index === -1) {
        return res.status(404).json({ error: "Militar não encontrado!" });
    }

    militares[index] = { ...militares[index], nome, funcao, cpf };
    res.json({ message: "Cadastro atualizado com sucesso!" });
});

// 4. Excluir Militar
app.delete('/api/militares/:rg', (req, res) => {
    const { rg } = req.params;
    const initialLength = militares.length;
    
    militares = militares.filter(m => m.rg !== rg);

    if (militares.length === initialLength) {
        return res.status(404).json({ error: "Militar não encontrado!" });
    }

    res.json({ message: "Militar excluído com sucesso!" });
});

// 5. Salvar Respostas do Quiz
app.post('/api/respostas', (req, res) => {
    const { rg, respostas } = req.body;
    respostasAvaliacao.push({ rg, respostas, data: new Date() });
    res.json({ message: "Respostas gravadas com sucesso!" });
});

// Inicialização do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});