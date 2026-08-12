const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors()); // Permite requisições vindas do Netlify
app.use(express.json()); // Permite ler JSON no corpo das requisições

// Conexão com o MongoDB (Substitua pela sua URL do MongoDB Atlas no Render/Env)
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:suasenha@cluster.mongodb.net/cbmerj?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conectado com sucesso ao MongoDB!'))
    .catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));

// =========================================================================
// 1. SCHEMAS E MODELOS (Mongoose)
// =========================================================================

// Esquema de Militares
const MilitarSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    funcao: { type: String, required: true },
    rg: { type: String, required: true, unique: true },
    cpf: { type: String, required: true }
}, { timestamps: true });

// Esquema de Perguntas
const PerguntaSchema = new mongoose.Schema({
    type: { type: String, default: "mc" },
    q: { type: String, required: true },
    options: [{ type: String, required: true }],
    correct: { type: String, required: true },
    time: { type: Number, default: 120 }
}, { timestamps: true });

// Esquema de Respostas (Resultados)
const RespostaSchema = new mongoose.Schema({
    militarNome: String,
    rg: String,
    nota: Number,
    acertos: Number,
    total: Number,
    data: String,
    respostas: Array
}, { timestamps: true });

const Militar = mongoose.model('Militar', MilitarSchema);
const Pergunta = mongoose.model('Pergunta', PerguntaSchema);
const Resposta = mongoose.model('Resposta', RespostaSchema);

// =========================================================================
// 2. ROTAS DA API
// =========================================================================

// Rota Rota de teste/Status
app.get('/api', (req, res) => {
    res.json({ status: "API CBMERJ Operacional", timestamp: new Date() });
});

// --- MILITARES ---

// Listar todos os militares
app.get('/api/militares', async (req, res) => {
    try {
        const militares = await Militar.find().sort({ createdAt: -1 });
        res.json(militares);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar militares." });
    }
});

// Salvar novo militar
app.post('/api/militares', async (req, res) => {
    try {
        const novoMilitar = new Militar(req.body);
        await novoMilitar.save();
        res.status(201).json(novoMilitar);
    } catch (err) {
        res.status(400).json({ error: "Erro ao salvar militar (RG já cadastrado ou campos vazios)." });
    }
});

// Atualizar militar
app.put('/api/militares/:id', async (req, res) => {
    try {
        const militarAtualizado = await Militar.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(militarAtualizado);
    } catch (err) {
        res.status(400).json({ error: "Erro ao atualizar militar." });
    }
});

// Deletar militar
app.delete('/api/militares/:id', async (req, res) => {
    try {
        await Militar.findByIdAndDelete(req.params.id);
        res.json({ message: "Militar removido com sucesso." });
    } catch (err) {
        res.status(500).json({ error: "Erro ao deletar militar." });
    }
});

// --- PERGUNTAS ---

// Listar todas as perguntas
app.get('/api/perguntas', async (req, res) => {
    try {
        const perguntas = await Pergunta.find().sort({ createdAt: -1 });
        res.json(perguntas);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar perguntas." });
    }
});

// Salvar nova pergunta
app.post('/api/perguntas', async (req, res) => {
    try {
        const novaPergunta = new Pergunta(req.body);
        await novaPergunta.save();
        res.status(201).json(novaPergunta);
    } catch (err) {
        res.status(400).json({ error: "Erro ao cadastrar pergunta." });
    }
});

// Atualizar pergunta
app.put('/api/perguntas/:id', async (req, res) => {
    try {
        const perguntaAtualizada = await Pergunta.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(perguntaAtualizada);
    } catch (err) {
        res.status(400).json({ error: "Erro ao atualizar pergunta." });
    }
});

// Deletar pergunta
app.delete('/api/perguntas/:id', async (req, res) => {
    try {
        await Pergunta.findByIdAndDelete(req.params.id);
        res.json({ message: "Pergunta removida com sucesso." });
    } catch (err) {
        res.status(500).json({ error: "Erro ao deletar pergunta." });
    }
});

// --- RESPOSTAS / RESULTADOS ---

// Listar histórico de respostas
app.get('/api/respostas', async (req, res) => {
    try {
        const respostas = await Resposta.find().sort({ createdAt: -1 });
        res.json(respostas);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar histórico." });
    }
});

// Salvar resultado do Quiz
app.post('/api/respostas', async (req, res) => {
    try {
        const novaResposta = new Resposta(req.body);
        await novaResposta.save();
        res.status(201).json(novaResposta);
    } catch (err) {
        res.status(400).json({ error: "Erro ao salvar resultado da avaliação." });
    }
});

// Limpar todo histórico de respostas
app.delete('/api/respostas', async (req, res) => {
    try {
        await Resposta.deleteMany({});
        res.json({ message: "Histórico limpo com sucesso." });
    } catch (err) {
        res.status(500).json({ error: "Erro ao apagar histórico." });
    }
});

// =========================================================================
// 3. INICIALIZAÇÃO DO SERVIDOR
// =========================================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
