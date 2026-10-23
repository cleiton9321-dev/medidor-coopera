const cfg = require("./config");

// 1. Consumo de UM aparelho em kWh/mês
// Fórmula: potenciaW × horasDia × diasMes ÷ 1000
function consumoMensalKwh(aparelho) {
  return (aparelho.potenciaW * aparelho.horasDia * aparelho.diasMes) / 1000;
}

// 2. Custo da energia (sem bandeira)
// Fórmula: kwh × TARIFA_KWH
function custoEnergia(kwh) {
  return kwh * cfg.TARIFA_KWH;
}

// 3. Adicional da bandeira tarifária
// Fórmula: (kwh ÷ 100) × valorBandeira
function adicionalBandeira(kwh) {
  return (kwh / 100) * cfg.VALORES_BANDEIRA[cfg.BANDEIRA];
}

// 4. Geração de 1 painel em kWh/mês
// Fórmula: (POTENCIA_PAINEL_W ÷ 1000) × HSP × 30 × 0,80
function geracaoPorPainel() {
  return (cfg.POTENCIA_PAINEL_W / 1000) * cfg.HSP * 30 * cfg.EFICIENCIA;
}

// 5. Quantidade de painéis necessários (arredonda PRA CIMA)
// Fórmula: Math.ceil(consumoTotal ÷ geraçãoPorPainel)
function paineisNecessarios(kwh) {
  return Math.ceil(kwh / geracaoPorPainel());
}

// 6. Função principal que monta a resposta da API
function simular(aparelhos) {
  const detalhes = aparelhos.map((a) => {
    const kwhMes = consumoMensalKwh(a);
    return {
      nome: a.nome,
      kwhMes: Math.round(kwhMes * 100) / 100,
      custo: Math.round(custoEnergia(kwhMes) * 100) / 100,
      percentual: 0, // Preenchido no próximo passo
    };
  });

  const consumoTotal = aparelhos.reduce(
    (soma, a) => soma + consumoMensalKwh(a),
    0,
  );

  // Calcula o percentual de cada aparelho
  detalhes.forEach((d) => {
    d.percentual = Math.round((d.kwhMes / consumoTotal) * 100 * 100) / 100;
  });

  const custo = custoEnergia(consumoTotal);
  const adicional = adicionalBandeira(consumoTotal);

  // Acha o aparelho mais caro
  const maisCaro = detalhes.reduce((maior, atual) =>
    atual.custo > maior.custo ? atual : maior,
  );

  // Arredondando tudo pra 2 casas decimais conforme o contrato
  return {
    consumoKwhMes: Math.round(consumoTotal * 100) / 100,
    custoEnergia: Math.round(custo * 100) / 100,
    adicionalBandeira: Math.round(adicional * 100) / 100,
    totalMes: Math.round((custo + adicional) * 100) / 100,
    paineisNecessarios: paineisNecessarios(consumoTotal),
    aparelhoMaisCaro: { nome: maisCaro.nome, custo: maisCaro.custo },
    detalhes,
  };
}

module.exports = {
  consumoMensalKwh,
  custoEnergia,
  adicionalBandeira,
  paineisNecessarios,
  simular,
};
