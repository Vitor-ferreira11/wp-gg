# Revisão do WP.GG — 14/10/2026

## Encerramento — versão 1.0.0

As pendências descritas nos registros históricos abaixo foram concluídas. Início e perfil real foram verificados com largura efetiva de 390, 768, 1024, 1280 e 1920 pixels, sem transbordamento ou cartões cortados. A expansão das equipes por Enter mostrou dez jogadores no celular. O filtro respondeu pelo teclado com foco visível. As verificações pontuais de contraste dos textos e controles principais resultaram entre 5,05:1 e 15,22:1. O escopo é uma revisão funcional e visual do MVP, não uma certificação completa de acessibilidade. Consulte `CHANGELOG.md` para o estado final e as limitações preservadas.

## Conferência final realizada após o primeiro envio ao GitHub

- 25 testes passaram nesta rodada, sem falhas.
- Demonstração, catálogo e página da Jinx conferidos em 390, 768, 1024, 1280 e 1920 pixels, sem transbordamento horizontal da página. O perfil real e a página inicial foram conferidos em 1280 pixels; tentativas de redimensionar essas abas não mudaram a largura efetiva, portanto não contam como validação adicional.
- GoBacck carregou com dados reais. Outro jogador, Niloyv Zoklev, abriu pelo link da equipe e também carregou.
- Repetir a busca do mesmo perfil não deixou o botão bloqueado após concluir a navegação.
- Riot ID sem tag mostrou validação. Um Riot ID de teste inexistente mostrou “Não encontramos esse jogador” e ofereceu acesso à demonstração.
- Filtro ARAM exibiu quatro partidas na demonstração. No histórico real de GoBacck, o mesmo filtro exibiu o estado vazio esperado. Retornar a todos os modos restaurou o histórico.
- Expandir uma partida real e uma fictícia mostrou dez jogadores.
- Busca de campeão inexistente exibiu estado vazio; limpar filtros e buscar Jinx permitiu abrir sua página.
- Conferido foco visível em link com Tab. Isso é uma checagem básica de teclado, não uma auditoria completa de acessibilidade ou de contraste.
- Não foram encontradas falhas bloqueadoras nesses fluxos. Os testes de chave ausente/expirada, limite da API e perfil sem partidas continuam automatizados, com respostas simuladas; não foi alterada a chave real para provocar erros.

O modo de demonstração e o repositório privado, citados como pendências no registro inicial abaixo, já foram concluídos. Antes de chamar esta versão de v1.0, resta conferir visualmente o início e o perfil real nas demais larguras, além de uma revisão de contraste e teclado mais completa. Hospedagem permanece uma etapa separada.

---

## Registro da revisão inicial

## Resultado verificado

- 23 testes automatizados passaram, sem falhas.
- TypeScript passou sem erros.
- Compilação de produção do Next.js passou após as correções, em `.next-verify`, sem substituir o servidor de desenvolvimento.
- O navegador bloqueou a observação da página nesta rodada. Não foi possível confirmar novamente aparência, navegação por teclado, filtros interativos ou outros perfis reais. Verificações visuais anteriores não substituem essa revisão pendente.

## Correções realizadas

- A busca usa o estado da navegação do React, em vez de um estado manual que podia permanecer em “Buscando…” ao repetir a mesma rota. Nome e tag são normalizados antes de montar a URL.
- A página inicial deixou de anunciar o painel de histórico de elo removido do perfil.
- Atalhos explícitos para o perfil de teste deixaram de antecipar consultas ao passar pelo início.
- Regras contraditórias adicionadas durante os ajustes da caixa de campeões foram consolidadas. O título continua fora da caixa.
- README atualizado com marca WP.GG, gráfico, filtro, aliados/adversários e estado atual do histórico de elo.
- Adicionados testes de indisponibilidade de rede/Data Dragon, perfil sem classificação/partidas, partida removida e falha de consulta dos detalhes.

## Comportamentos cobertos pelos testes

Validação do Riot ID e servidor; cálculos de KDA, vitórias, farm e participação em abates; composição dos times; ordenação e contagem dos campeões aliados/adversários; deduplicação e persistência local; amostra dos campeões; ausência/expiração da chave, limite de chamadas e falhas de consulta. As integrações dos testes usam respostas simuladas, sem depender de uma chave real.

## Antes de apresentar o MVP

1. Concluir a revisão visual nas larguras 390, 1024, 1280 e 1920 pixels; conferir alinhamento, cabeçalho de filtro, gráfico e tabela expandida das partidas.
2. Validar novamente GoBacck e outro jogador real, voltar/avançar no navegador e repetir a busca do mesmo perfil. Conferir filtro com partidas e sem partidas, busca inválida e navegação por teclado.
3. Criar um modo de demonstração explicitamente identificado, para permitir avaliar o portfólio sem chave Riot.
4. Inicializar um repositório Git e revisar os arquivos antes de enviar. A pasta do projeto atualmente não é um repositório Git. `.env.local`, SQLite, dependências e compilações estão cobertos pelo `.gitignore`.

## Limites relevantes

- O filtro seleciona apenas dentre as últimas 20 partidas carregadas. Não busca outras partidas do modo escolhido.
- Os relacionamentos consideram todos os campeões das equipes, sem afirmar causalidade ou força global. Exigem duas partidas por campeão e excluem jogos com menos de cinco minutos.
- As estatísticas de campeões representam a amostra SQLite local, não todo o servidor.
- O módulo de persistência de elo permanece no servidor, embora seu painel tenha sido removido.
- Publicação, modo de demonstração e criação do repositório não foram realizados nesta revisão.
