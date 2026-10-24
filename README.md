# TaskFlow Web — baseado no HTML fornecido

A página principal `index.html` foi construída diretamente a partir do arquivo `taskflow_painel_principal_de_tarefas/code.html` enviado pelo usuário, preservando a estrutura do painel, o tema Tailwind, a tipografia e a organização visual. Os scripts de demonstração foram substituídos por funcionalidades locais.

## Executar

Extraia o ZIP e dê dois cliques em `INICIAR.cmd`. O iniciador usa Node.js (instalado neste computador) e abre http://127.0.0.1:4173. Mantenha a janela do servidor aberta durante o teste. Para encerrar, use Ctrl+C nessa janela. Também é possível executar `node server.cjs` nesta pasta. Não é necessário instalar pacotes.

O HTML original usa Tailwind via CDN, fontes Google e uma imagem remota. É necessário acesso à internet para carregar esses recursos visuais. Não há etapa de build.

## Funcionalidades

- Painel com tarefas iniciais importadas do HTML original.
- Criação e edição em três etapas: detalhes, organização e revisão.
- Validação de título obrigatório e data, navegação sem perda dos campos.
- Busca por título/descrição, filtros por status, prioridade e tarefas locais.
- Conclusão, reabertura e exclusão com confirmação.
- Contadores e progresso calculados com base nas tarefas existentes.
- Persistência em localStorage, incluindo uma lista vazia após excluir todas as tarefas. Se indisponível, o estado continua em memória e a notificação informa a limitação.
- Atalhos N para criar, / para buscar e Esc para limpar filtros fora dos campos. Dentro do modal, Esc fecha o diálogo.
- Criação rápida inicia o fluxo com o título preenchido.
- O botão de relatório exibe um resumo dos números atuais.

Todos os registros criados nesta versão pertencem ao usuário local. Não há autenticação, sincronização entre dispositivos ou banco de dados remoto.

## Arquivos

- `index.html`: painel baseado no HTML enviado.
- `dashboard.js`: estado, ações, persistência e fluxo de tarefas.
- `dashboard.css`: complementos responsivos, modal e acessibilidade.
- `cadastro.html`, `style.css`, `script.js`, `validation.js`: formulário anterior de configuração de conta em quatro etapas, acessível pelo painel.
- `validation.test.cjs`: testes das validações do cadastro (`node validation.test.cjs`).

O cadastro é demonstrativo e mantém dados apenas em memória, sem criar uma conta real. As tarefas ficam no navegador até serem removidas ou os dados do site serem limpos. Conteúdo dos registros é inserido com textContent para não interpretar HTML do usuário.

## Validação realizada

Testado no navegador integrado: bloqueio de título vazio; navegação com preservação de dados; revisão; criação; persistência após recarregar; edição; alteração de status; atualização de contadores; busca; filtros de prioridade e status. Sintaxe JavaScript e 13 verificações das regras do cadastro também passaram. Exclusão exige confirmação; o cadastro continua sendo uma demonstração sem backend.


## Fluxo focado para teste

Acesse http://127.0.0.1:4173/?nova=1 para abrir o formulário diretamente. As etapas Detalhes, Organização e Revisão exibem barra de progresso e stepper. Próximo valida o título e a data; Voltar preserva os campos. O rascunho fica em memória e só é incluído nas tarefas/localStorage ao clicar em Finalizar. Não há envio para servidor nesta versão local.

## Relatório em PDF

O botão Gerar relatório em PDF baixa um relatório A4 com todas as tarefas salvas (independente dos filtros), totais, solicitante, status, prioridade, prazo e descrição. A geração é local, sem bibliotecas externas ou transmissão de dados. Textos extensos continuam nas páginas seguintes. A fonte suporta caracteres latinos; símbolos fora desse conjunto são substituídos por ?. O arquivo vai para os downloads do navegador.
