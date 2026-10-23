const express = require("express");
const { simular } = require("./calculos");

const app = express();

// Permite que o Express entenda JSON que vem do navegador
app.use(express.json());

// Diz pro Express servir os arquivos da pasta 'public' (onde ficará o HTML/CSS)
app.use(express.static("public"));

app.post("/api/simular", (req, res) => {
  const aparelhos = req.body && req.body.aparelhos;

  // 1. Validação: a lista não pode estar vazia
  if (!Array.isArray(aparelhos) || aparelhos.length === 0) {
    return res
      .status(400)
      .json({ erro: "A lista de aparelhos não pode estar vazia" });
  }

  // 2. Validação: checar cada aparelho
  for (let i = 0; i < aparelhos.length; i++) {
    const a = aparelhos[i];
    const numAparelho = i + 1;

    if (typeof a.nome !== "string" || a.nome.trim() === "") {
      return res
        .status(400)
        .json({ erro: `nome deve ser um texto (aparelho ${numAparelho})` });
    }
    if (
      typeof a.potenciaW !== "number" ||
      a.potenciaW < 1 ||
      a.potenciaW > 10000
    ) {
      return res
        .status(400)
        .json({
          erro: `potenciaW deve estar entre 1 e 10000 (aparelho ${numAparelho})`,
        });
    }
    if (typeof a.horasDia !== "number" || a.horasDia < 0 || a.horasDia > 24) {
      return res
        .status(400)
        .json({
          erro: `horasDia deve estar entre 0 e 24 (aparelho ${numAparelho})`,
        });
    }
    if (!Number.isInteger(a.diasMes) || a.diasMes < 1 || a.diasMes > 31) {
      return res
        .status(400)
        .json({
          erro: `diasMes deve ser inteiro entre 1 e 31 (aparelho ${numAparelho})`,
        });
    }
  }

  // 3. Se passou por todas as validações, calcula e responde
  res.json(simular(aparelhos));
});

// Liga o servidor na porta 3000
app.listen(3000, () => {
  console.log("Medidor Coopera rodando em http://localhost:3000");
});
