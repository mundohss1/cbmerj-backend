const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o Supabase via Variáveis de Ambiente
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Rota padrão para teste
app.get('/api', (req, res) => {
    res.json({ status: "API CBMERJ Operacional com Supabase", timestamp: new Date() });
});

// ==========================================
// 1. MILITARES
// ==========================================
app.get('/api/militares', async (req, res) => {
    const { data, error } = await supabase.from('militares').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/militares', async (req, res) => {
    const { nome, funcao, rg, cpf } = req.body;
    const { data, error } = await supabase.from('militares').insert([{ nome, funcao, rg, cpf }]).select();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data[0]);
});

app.put('/api/militares/:id', async (req, res) => {
    const { nome, funcao, rg, cpf } = req.body;
    const { data, error } = await supabase.from('militares').update({ nome, funcao, rg, cpf }).eq('id', req.params.id).select();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
});

app.delete('/api/militares/:id', async (req, res) => {
    const { error } = await supabase.from('militares').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Militar removido com sucesso." });
});

// ==========================================
// 2. PERGUNTAS
// ==========================================
app.get('/api/perguntas', async (req, res) => {
    const { data, error } = await supabase.from('perguntas').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/perguntas', async (req, res) => {
    const { type, q, options, correct, time } = req.body;
    const { data, error } = await supabase.from('perguntas').insert([{ type, q, options, correct, time }]).select();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data[0]);
});

app.put('/api/perguntas/:id', async (req, res) => {
    const { type, q, options, correct, time } = req.body;
    const { data, error } = await supabase.from('perguntas').update({ type, q, options, correct, time }).eq('id', req.params.id).select();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
});

app.delete('/api/perguntas/:id', async (req, res) => {
    const { error } = await supabase.from('perguntas').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Pergunta removida com sucesso." });
});

// ==========================================
// 3. RESPOSTAS
// ==========================================
app.get('/api/respostas', async (req, res) => {
    const { data, error } = await supabase.from('respostas').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    
    const formatado = data.map(r => ({
        _id: r.id,
        militarNome: r.militar_nome,
        rg: r.rg,
        nota: r.nota,
        acertos: r.acertos,
        total: r.total,
        data: r.data,
        respostas: r.respostas
    }));
    res.json(formatado);
});

app.post('/api/respostas', async (req, res) => {
    const { militarNome, rg, nota, acertos, total, data, respostas } = req.body;
    const { data: result, error } = await supabase.from('respostas').insert([{
        militar_nome: militarNome,
        rg, nota, acertos, total, data, respostas
    }]).select();
    
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(result[0]);
});

app.delete('/api/respostas', async (req, res) => {
    const { error } = await supabase.from('respostas').delete().gte('id', 0);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Histórico limpo." });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
