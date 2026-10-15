# Histórico de versões

## 1.0.0 — 14/10/2026

Primeira versão do MVP de portfólio WP.GG.

### Funcionalidades

- Busca de perfis por Riot ID completo e servidor, com integração server-side à Riot API.
- Elo Solo/Duo e Flex, estatísticas recentes, gráfico de vitórias e campeão mais jogado.
- Histórico de até 20 partidas, filtro por modo e detalhes das equipes.
- Campeões aliados com mais vitórias e adversários com mais derrotas na amostra.
- Catálogo Data Dragon e análise dos campeões com dados locais em SQLite.
- Demonstração com dados fictícios identificados e independente de chave Riot.
- Layout responsivo, estados de carregamento e mensagens de erro.

### Verificação final

- Início, perfil real, demonstração, catálogo e página de campeão conferidos em 390, 768, 1024, 1280 e 1920 pixels, sem transbordamento horizontal da página.
- Consultas reais de GoBacck e de outro jogador; busca repetida; jogador inexistente; filtro sem resultados e equipes com dez jogadores.
- Busca e estado vazio do catálogo; navegação e controles básicos pelo teclado.
- Contraste pontual de textos e controles principais: razões entre 5,05:1 e 15,22:1. Não equivale a uma certificação completa de acessibilidade.
- Testes automatizados, verificação de tipos e compilação de produção.

### Limitações conhecidas

- O site continua local; hospedagem não faz parte desta entrega.
- Consultas reais dependem de chave Riot válida e estão sujeitas aos limites da API.
- O histórico e os relacionamentos usam as partidas carregadas, sem inferência de desempenho global.
- SQLite requer armazenamento persistente na futura hospedagem.
- Imagens da demonstração ainda precisam de internet.
