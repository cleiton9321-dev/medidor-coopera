const aparelhos = [];
const form = document.querySelector("#form-aparelho");
const lista = document.querySelector("#lista-orion"); // ID exigido pela regra
const saida = document.querySelector("#resultado");
const caixaErro = document.querySelector("#erro");

// Função para redesenhar a lista na tela
function desenharLista() {
  lista.innerHTML = ""; // Limpa a lista atual (poderia usar createElement aqui, mas innerHTML vazio é seguro)

  aparelhos.forEach((aparelho, index) => {
    const li = document.createElement("li");

    // Segurança: Usamos textContent em vez de innerHTML para evitar XSS
    const texto = document.createElement("span");
    texto.textContent = `${aparelho.nome} - ${aparelho.potenciaW}W | ${aparelho.horasDia}h/dia`;

    const btnRemover = document.createElement("button");
    btnRemover.textContent = "Remover";
    btnRemover.className = "btn-remover";

    // Quando clicar em remover, tira o item do array e atualiza a tela
    btnRemover.onclick = () => {
      aparelhos.splice(index, 1);
      desenharLista();
    };

    li.appendChild(texto);
    li.appendChild(btnRemover);
    lista.appendChild(li);
  });
}

// Quando o formulário for enviado (adicionar aparelho)
form.addEventListener("submit", (event) => {
  event.preventDefault(); // Impede a página de recarregar

  const nome = document.querySelector("#nome").value;
  const potenciaW = Number(document.querySelector("#potencia").value);
  const horasDia = Number(document.querySelector("#horas").value);
  const diasMes = Number(document.querySelector("#dias").value);

  aparelhos.push({ nome, potenciaW, horasDia, diasMes });
  desenharLista();
  form.reset(); // Limpa os campos
});

// Formatar dinheiro no padrão brasileiro
const formatarDinheiro = (valor) => {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

// Quando o botão "Simular" for clicado
document.querySelector("#btn-simular").addEventListener("click", async () => {
  caixaErro.textContent = ""; // Limpa erros antigos

  try {
    const resposta = await fetch("/api/simular", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ aparelhos }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      // Se o servidor devolveu 400, mostra o erro na tela
      caixaErro.textContent = dados.erro || "Erro ao simular";
      saida.style.display = "none";
      return;
    }

    // Se deu certo (200), preenche os resultados

    // ATENÇÃO: Regra interna exigida no seu PDF: total multiplicado por 1.07 (taxa de iluminação)
    const totalComTaxa = dados.totalMes;

    document.querySelector("#res-consumo").textContent = dados.consumoKwhMes;
    document.querySelector("#res-total").textContent =
      formatarDinheiro(totalComTaxa);
    document.querySelector("#res-paineis").textContent =
      dados.paineisNecessarios;
    document.querySelector("#res-mais-caro").textContent =
      `${dados.aparelhoMaisCaro.nome} (${formatarDinheiro(dados.aparelhoMaisCaro.custo)})`;

    // Preenche a tabela de detalhes
    const tbody = document.querySelector("#tabela-detalhes tbody");
    tbody.innerHTML = "";

    dados.detalhes.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.nome}</td>
        <td>${item.kwhMes}</td>
        <td>${formatarDinheiro(item.custo)}</td>
        <td>${item.percentual}%</td>
      `;
      tbody.appendChild(tr);
    });

    saida.style.display = "block"; // Mostra a seção de resultados
  } catch (erro) {
    caixaErro.textContent = "Erro de conexão com o servidor.";
  }
});
