# 🏛️ CIVICUX

<div align="center">

![CivicUX Logo](https://i.imgur.com/NMBGegT.jpeg)

**Plataforma de Engajamento Cívico com Gamificação**

***DDaaS (Defense Democracy as a Service)***

Uma Progressive Web App (PWA) que transforma cidadãos em auditores ativos, permitindo fiscalização urbana, acompanhamento legislativo e participação democrática através de gamificação e inteligência artificial.

[📸 Ver Screenshots](https://imgur.com/a/MPiVDnY) | [🌐 Demo ao Vivo](https://civicux.vercel.app/) | [📖 Documentação](#-funcionalidades)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Demo ao Vivo](#-demo-ao-vivo)
- [Funcionalidades](#-funcionalidades)
- [Implementação de Inteligência Artificial](#-implementação-de-inteligência-artificial)
- [Fontes de Dados Abertos](#-fontes-de-dados-abertos)
- [Tecnologias](#%EF%B8%8F-tecnologias)
- [Instalação Local](#-instalação-local)
- [Deploy no Vercel](#%EF%B8%8F-deploy-no-vercel)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Licença](#-licença)
- [Contribuindo](#-contribuindo)

---

## 🎯 Sobre o Projeto

O **CIVICUX** é uma plataforma inovadora que democratiza o acesso à fiscalização pública e ao acompanhamento legislativo. Através de gamificação e IA, transformamos a participação cívica em uma experiência engajadora e recompensadora.

### Problema que Resolvemos

- **Baixo engajamento cívico**: Cidadãos não sabem como ou onde reportar problemas urbanos
- **Falta de transparência**: Dificuldade em acompanhar projetos de lei e atos oficiais
- **Desconexão democrática**: Ausência de canais efetivos de participação popular

### Nossa Solução

Uma plataforma gamificada que:
- Facilita denúncias urbanas com análise de IA
- Permite acompanhamento de proposições legislativas
- Recompensa participação com CiviCoins e conquistas
- Conecta cidadãos com representantes políticos

---

## 🎮 Demo ao Vivo

Experimente a plataforma em funcionamento:

**🌐 URL:** [https://civicux.vercel.app/](https://civicux.vercel.app/)

### Credenciais de Teste

Para acessar a demo, utilize as seguintes credenciais:

```
Usuário: cidadao@exemplo.com
Senha: senha123
```

> **💡 Dica:** Explore todas as funcionalidades, crie denúncias, vote em proposições e acumule CiviCoins para trocar por recompensas!

---

## 🤖 Implementação de Inteligência Artificial

A IA é o coração do Civicux, tornando a participação cívica mais inteligente e acessível.

### Groq (Llama 3)

Utilizamos o **Groq** com o modelo **Llama 3** para processamento de linguagem natural em tempo real.

#### Casos de Uso:

**1. Análise de Imagens de Denúncias**
- **Entrada:** Foto de problema urbano (buraco, lixo, sinalização, etc.)
- **Processamento:** Visão computacional identifica o tipo de problema
- **Saída:** 
  - Categoria automática (ex: "Infraestrutura", "Limpeza Urbana")
  - Nível de severidade (Baixo, Médio, Alto)
  - Título técnico descritivo
  - Departamento responsável sugerido

**Exemplo:**
```
Foto: Buraco na pista
→ IA detecta: "Buraco na pista"
→ Categoria: Infraestrutura
→ Severidade: Alto
→ Título: "Buraco na pista com exposição de solo e fragmentos de asfalto"
→ Responsável: Secretaria de Obras
```

**2. Resumo de Proposições Legislativas**
- **Entrada:** Ementa completa de projeto de lei (texto técnico e extenso)
- **Processamento:** NLP extrai pontos principais e impactos
- **Saída:** Resumo em linguagem cidadã com:
  - Objetivo principal
  - Principais mudanças
  - Impacto esperado
  - Pontos de atenção

**Exemplo:**
```
Ementa: "Altera o Decreto-Lei nº 2.848, de 7 de dezembro de 1940 (Código Penal)..."
→ Resumo IA: "Este projeto aumenta a pena para crimes de violência doméstica 
contra mulheres, de 3 meses a 3 anos para 6 meses a 5 anos de detenção."
```

**3. Resumo do Diário Oficial**
- **Entrada:** Atos oficiais publicados no DOU (linguagem jurídica complexa)
- **Processamento:** Extração de informações relevantes
- **Saída:** Resumo simplificado e contextualizado

**4. Chatbot Mentor Cívico**
- **Entrada:** Perguntas do cidadão sobre processos, leis, direitos
- **Processamento:** Busca contextual e geração de resposta
- **Saída:** Orientação clara e acionável

### Benefícios da IA

✅ **Acessibilidade:** Traduz jargão técnico para linguagem cidadã  
✅ **Eficiência:** Processamento instantâneo de grandes volumes de texto  
✅ **Precisão:** Classificação automática reduz erros humanos  
✅ **Engajamento:** Torna informação complexa consumível  
✅ **Escalabilidade:** Atende milhares de usuários simultaneamente  

### Arquitetura de IA

```
┌─────────────────┐
│  Usuário Input  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend (React)│
└────────┬────────┘
         │ API Call
         ▼
┌─────────────────┐
│  Backend (Node) │
└────────┬────────┘
         │ Groq SDK
         ▼
┌─────────────────┐
│  Groq API       │
│  (Llama 3)      │
└────────┬────────┘
         │ Response
         ▼
┌─────────────────┐
│  Processamento  │
│  & Formatação   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Usuário Output │
└─────────────────┘
```

---

## 📊 Fontes de Dados Abertos

O Civicux é construído sobre dados públicos e transparentes.

### 1. API Dados Abertos da Câmara dos Deputados

**🔗 URL:** [https://dadosabertos.camara.leg.br/](https://dadosabertos.camara.leg.br/)

**Dados Utilizados:**
- **Proposições Legislativas** (`/api/v2/proposicoes`)
  - Projetos de Lei (PL)
  - Propostas de Emenda à Constituição (PEC)
  - Medidas Provisórias (MPV)
  - Emendas, Requerimentos, etc.
  
- **Autores e Relatores** (`/api/v2/proposicoes/{id}/autores`)
  - Nome do deputado
  - Partido e UF
  - Email e telefone do gabinete
  
- **Tramitação** (`/api/v2/proposicoes/{id}/tramitacoes`)
  - Histórico de movimentações
  - Status atual
  - Órgãos responsáveis

**Endpoints Principais:**
```
GET /api/v2/proposicoes?ordem=DESC&ordenarPor=id
GET /api/v2/proposicoes/{id}
GET /api/v2/proposicoes/{id}/autores
GET /api/v2/deputados/{id}
```

**Atualização:** Dados atualizados em tempo real pela Câmara

### 2. Diário Oficial da União (DOU)

**🔗 URL:** [https://www.in.gov.br/](https://www.in.gov.br/)

**Dados Utilizados:**
- Atos do Poder Executivo
- Atos do Poder Legislativo  
- Atos do Poder Judiciário
- Editais e Avisos

**Método de Coleta:** Web scraping com Cheerio

**Seções:**
- Seção 1: Leis, decretos, portarias
- Seção 2: Atos de pessoal
- Seção 3: Contratos, editais, avisos

### 3. OpenStreetMap

**🔗 URL:** [https://www.openstreetmap.org/](https://www.openstreetmap.org/)

**Dados Utilizados:**
- Mapas base para visualização
- Geocodificação de endereços
- Dados de ruas e bairros
- Pontos de interesse

**Biblioteca:** Leaflet.js para renderização

### 4. Dados Internos (Gerados por Usuários)

**Armazenamento:** PostgreSQL (Supabase)

**Tipos de Dados:**
- Denúncias de problemas urbanos
- Votos em proposições
- Validações de denúncias
- Perfis de usuários
- Histórico de atividades

### Compromisso com Transparência

✅ **Código Aberto:** Todo o código é público (MIT License)  
✅ **APIs Públicas:** Utilizamos apenas fontes oficiais e abertas  
✅ **Dados Anonimizados:** Privacidade dos usuários é prioridade  
✅ **Auditável:** Qualquer pessoa pode verificar nossas fontes  

---

## ✨ Funcionalidades

### 1. 🏠 Dashboard Home

![Dashboard Home](https://i.imgur.com/VKqLd5l.png)

Painel principal que centraliza todas as informações e ações do cidadão.

**Características:**
- **Estatísticas pessoais** em destaque (Nível, XP, CiviCoins)
- **Barra de progresso** visual para próximo nível
- **Ações rápidas** para Nova Denúncia e Validar
- **Feed de atividades recentes** da comunidade
- **Conquistas desbloqueadas** em destaque
- **Status do sistema** em tempo real

**Elementos do Dashboard:**
- **Card de Nível**: Mostra nível atual, XP acumulado e progresso para próximo nível
- **Card de CiviCoins**: Saldo disponível com botão para ver recompensas
- **Notificações**: Toast de proposições que correspondem aos interesses do usuário
- **Atividade Recente**: Timeline com denúncias e votos da comunidade

### 2. 🔍 Nova Auditoria (Visual Audit)

![Nova Auditoria](https://i.imgur.com/K5gqsld.png)

Permite aos cidadãos reportar problemas urbanos através de fotos e localização geográfica.

**Características:**
- **Upload de foto** com análise automática via IA (Groq/Llama 3)
- **Geolocalização precisa** com integração OpenStreetMap
- **Classificação inteligente** de severidade e departamento responsável
- **Título técnico automático** gerado por IA
- **Enriquecimento de dados** com informações contextuais

**Fluxo:**
1. Usuário tira foto do problema
2. IA analisa a imagem e sugere categoria
3. Sistema captura localização no mapa
4. Denúncia é criada e enviada para validação

### 3. ✅ Feed de Validação (The "Jury")

![Feed de Validação](https://i.imgur.com/Jna0WZd.png)

Sistema de validação comunitária onde cidadãos avaliam denúncias de outros usuários.

**Características:**
- **Votação binária** (Validar/Falso)
- **Sistema de reputação** baseado em consenso
- **Recompensas em CiviCoins** por participação
- **Prevenção de spam** através de validação cruzada
- **Visualização de detalhes** completos da denúncia

**Gamificação:**
- +10 CiviCoins por validação
- +50 XP por voto
- Conquistas desbloqueáveis ("Guardião Urbano", "Legislador")

### 4. 👤 Perfil do Usuário

![Perfil](https://i.imgur.com/48nyjbP.png)

Dashboard personalizado com estatísticas e conquistas do cidadão.

**Características:**
- **Sistema de níveis** baseado em XP
- **Saldo de CiviCoins** para troca por recompensas
- **Conquistas desbloqueáveis** com diferentes raridades
- **Dados pessoais** editáveis (idade, profissão, interesses)
- **Preferências de notificação** (WhatsApp/Telegram)
- **Histórico de atividades** (denúncias e votos)

**Conquistas Disponíveis:**
- 🌟 **Olho de Águia**: Primeira denúncia enviada
- 🏆 **Legislador**: Votar em 3 projetos de lei
- 👨‍⚖️ **Guardião Urbano**: Alcançar nível 5
- 🎖️ **Sentinela**: Votar em 5 denúncias

### 5. 🗳️ Votação de Projetos de Lei

![Votação de Projetos](https://i.imgur.com/gvXnJzA.png)

Acompanhamento e votação em proposições legislativas da Câmara dos Deputados.

**Características:**
- **Integração com API da Câmara** (Dados Abertos)
- **Resumo com IA** de proposições complexas
- **Votação cidadã** (Aprovar/Reprovar) com justificativa
- **Informações de autores e relatores** com contatos
- **Pressão política** via email para deputados
- **Compartilhamento social** de proposições

**Funcionalidades Especiais:**
- Notificações de propostas que correspondem aos interesses do usuário
- Link direto para a proposta no site da Câmara
- Exibição de tramitação e status atual
- Histórico de votos do usuário

#### 📄 Página Interna da Proposição

![Print da Página Interna](https://i.imgur.com/1lqVzri.png)

A página interna apresenta todas as informações relevantes sobre uma proposição legislativa, permitindo consulta pública, verificação da tramitação e ferramentas de participação cidadã.

🏛️ **Informações da Proposição**

- Identificação
- Status

**Descrição:**
Resumo da ementa

🤖 **Ferramentas Disponíveis**

-  Resumir com IA – gera automaticamente um resumo da proposição.
-  Gerar pressão política – cria mensagens para engajamento público.
-  Enviar e-mail aos autores – disponibiliza um texto padrão de cobrança.

👤 **Informações de Contato**

**Autores**

-  Origem
-  E-mail

**Relator**

-  E-mail
-  Telefone

📌 **Tramitação Atual**

-  Situação
-  Despacho
-  Órgão atual
-  Regime

📑 **Documentos**

- Ver inteiro teor
- Ficha de tramitação

### 6. 📰 Diário Oficial da União

![Diário Oficial](https://i.imgur.com/O2X82zb.png)

Acesso simplificado aos atos oficiais publicados no DOU.

**Características:**
- **Scraping automatizado** do Diário Oficial
- **Resumo com IA** de atos complexos
- **Filtros por seção** (Executivo, Legislativo, Judiciário)
- **Compartilhamento facilitado** em redes sociais
- **Links para documentos originais**

### 7. 🎁 Sistema de Recompensas

![Recompensas](https://i.imgur.com/jRegaXR.png)

Troca de CiviCoins por benefícios reais em estabelecimentos parceiros.

**Categorias de Recompensas:**

**Alimentação & Transporte:**
- Cupom iFood R$ 20 (500 CiviCoins)
- Crédito Uber R$ 15 (400 CiviCoins)

**Saúde & Bem-estar:**
- Mensalidade SmartFit (1500 CiviCoins)
- Avaliação física gratuita (800 CiviCoins)
- Desconto em farmácias (300 CiviCoins)

**Educação & Tecnologia:**
- Curso Udemy (1000 CiviCoins)
- Duolingo Plus 3 meses (1200 CiviCoins)
- Mentoria de carreira (2000 CiviCoins)

**Comércio Local:**
- Corte de cabelo (600 CiviCoins)
- Lava rápido (500 CiviCoins)
- Vale compras R$ 50 (1200 CiviCoins)

**Lazer & Entretenimento:**
- Ingresso cinema (600 CiviCoins)
- City tour SP (1500 CiviCoins)
- Kart indoor (1800 CiviCoins)

**Interface:**
- **Filtros por categoria** para navegação rápida
- **Indicador de saldo** sempre visível
- **Botão de resgate** com validação de saldo
- **Feedback visual** de saldo insuficiente

### 8. 🏆 Ranking

![Ranking](https://i.imgur.com/kazgJRF.png)

Classificação dos cidadãos mais ativos e engajados da plataforma.

**Características:**
- **Top 10 cidadãos** com maior pontuação
- **Posição do usuário** destacada
- **Pontuação total** (XP + CiviCoins)
- **Badges de conquistas** visíveis
- **Atualização em tempo real**

**Critérios de Ranking:**
- Denúncias validadas
- Votos em proposições
- Validações corretas
- Conquistas desbloqueadas
- Tempo de participação

**Gamificação:**
- 🥇 **1º Lugar**: Badge "Líder Cívico" + 1000 CiviCoins bônus
- 🥈 **2º Lugar**: Badge "Vice-Líder" + 500 CiviCoins bônus
- 🥉 **3º Lugar**: Badge "Destaque" + 250 CiviCoins bônus
- 🏅 **Top 10**: Badge "Elite Cívica"

### 9. 🤖 Mentor Cívico (Chatbot)

![Mentor Cívico](https://i.imgur.com/uvoxqMs.png)

Assistente de IA para educação cívica e orientação jurídica.

**Características:**
- **Respostas em tempo real** via Groq (Llama 3)
- **Orientação sobre processos** administrativos e judiciais
- **Explicação de termos jurídicos** em linguagem simples
- **Sugestões de ações cívicas** personalizadas
- **Histórico de conversas** salvo

**Casos de Uso:**
- "Como faço para denunciar um buraco na rua?"
- "O que é uma PEC?"
- "Como acompanhar um projeto de lei?"
- "Quais são meus direitos como cidadão?"
- "Como entrar em contato com meu deputado?"

**Funcionalidades:**
- Interface de chat intuitiva
- Sugestões de perguntas frequentes
- Links para recursos relevantes
- Integração com outras funcionalidades da plataforma

---

## 🛠️ Tecnologias

### Frontend
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **TailwindCSS** - Estilização
- **Zustand** - Gerenciamento de estado
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **Leaflet** - Mapas interativos
- **Lucide React** - Ícones

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **Prisma** - ORM
- **PostgreSQL** - Banco de dados (Supabase)
- **JWT** - Autenticação
- **Bcrypt** - Hashing de senhas

### IA & APIs Externas
- **Groq (Llama 3)** - Análise de imagens e texto
- **API Câmara dos Deputados** - Dados legislativos
- **OpenStreetMap** - Geolocalização
- **Cheerio** - Web scraping (DOU)

### Infraestrutura
- **Vercel** - Hospedagem frontend
- **Supabase** - Banco de dados PostgreSQL
- **Multer** - Upload de arquivos

---

## 🚀 Instalação Local

### Pré-requisitos

- Node.js 18+ e npm/yarn
- PostgreSQL (ou conta Supabase)
- Conta Groq para API de IA

### Passo a Passo

1. **Clone o repositório**

```bash
git clone https://github.com/brunochucky/civicux.git
cd civicux
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cidadao_auditor"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Groq AI
VITE_GROQ_API_KEY="your-groq-api-key-here"

# API Base URL (para desenvolvimento local)
VITE_API_URL="http://localhost:3000"
```

4. **Configure o banco de dados**

```bash
# Gerar cliente Prisma
npx prisma generate --schema=./api/prisma/schema.prisma

# Executar migrations
npx prisma migrate dev --schema=./api/prisma/schema.prisma

# (Opcional) Popular com dados de exemplo
npx prisma db seed --schema=./api/prisma/schema.prisma
```

5. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

---

## ☁️ Deploy no Vercel

### Configuração Automática

1. **Conecte seu repositório ao Vercel**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

2. **Configure as variáveis de ambiente no Vercel**

No painel do Vercel, vá em **Settings → Environment Variables** e adicione:

```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-production-jwt-secret
VITE_GROQ_API_KEY=your-groq-api-key
VITE_API_URL=https://your-api-domain.com
```

3. **Configure o build**

O Vercel detectará automaticamente as configurações do `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate --schema=./api/prisma/schema.prisma && vite build",
    "vercel-build": "prisma generate --schema=./api/prisma/schema.prisma && vite build"
  }
}
```

4. **Deploy**

```bash
vercel --prod
```

### Configuração do Banco de Dados (Supabase)

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie a connection string do PostgreSQL
3. Adicione ao `.env` e às variáveis do Vercel
4. Execute as migrations:

```bash
npx prisma migrate deploy --schema=./api/prisma/schema.prisma
```

---

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Exemplo | Obrigatória |
|----------|-----------|---------|-------------|
| `DATABASE_URL` | Connection string do PostgreSQL | `postgresql://user:pass@host:5432/db` | ✅ |
| `JWT_SECRET` | Chave secreta para tokens JWT | `my-super-secret-key-123` | ✅ |
| `VITE_GROQ_API_KEY` | API key do Groq para IA | `gsk_xxxxxxxxxxxxx` | ✅ |
| `VITE_API_URL` | URL base da API | `http://localhost:3000` | ✅ |
| `PORT` | Porta do servidor (produção) | `3000` | ❌ |

> **⚠️ Segurança:** Nunca commite o arquivo `.env` no Git. Use `.env.example` como template.

---

## 📁 Estrutura do Projeto

```
cidadao-auditor/
├── api/
│   ├── prisma/
│   │   ├── schema.prisma      # Schema do banco de dados
│   │   └── seed.ts            # Dados de exemplo
│   ├── routes/                # Rotas da API
│   └── server.js              # Servidor Express
├── public/
│   ├── logo-civicux.webp      # Logo da aplicação
│   └── manifest.json          # PWA manifest
├── src/
│   ├── components/            # Componentes React
│   │   ├── ui/                # Componentes de UI base
│   │   ├── Layout.tsx         # Layout principal
│   │   ├── NotificationToast.tsx
│   │   └── ...
│   ├── pages/                 # Páginas da aplicação
│   │   ├── Home.tsx           # Dashboard principal
│   │   ├── Audit.tsx          # Nova auditoria
│   │   ├── Feed.tsx           # Feed de validação
│   │   ├── Propositions.tsx   # Projetos de lei
│   │   ├── PropositionDetails.tsx
│   │   ├── OfficialDiary.tsx  # Diário oficial
│   │   ├── Rewards.tsx        # Recompensas
│   │   ├── Profile.tsx        # Perfil do usuário
│   │   └── ...
│   ├── store/                 # Zustand stores
│   │   ├── useAuthStore.ts    # Autenticação
│   │   └── useGameStore.ts    # Gamificação
│   ├── lib/                   # Utilitários
│   │   └── axios.ts           # Cliente HTTP
│   ├── App.tsx                # Componente raiz
│   └── main.tsx               # Entry point
├── .env.example               # Template de variáveis
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 📜 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes

- Siga o padrão de código existente
- Escreva testes para novas funcionalidades
- Atualize a documentação conforme necessário
- Seja respeitoso e construtivo nos code reviews

---

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/brunochucky/civicux/issues)
- **Discussões**: [GitHub Discussions](https://github.com/brunochucky/civicux/discussions)
- **Email**: hello@ruptureculture.com

---

## 🙏 Agradecimentos

- [Câmara dos Deputados](https://dadosabertos.camara.leg.br/) - API de Dados Abertos
- [Groq](https://groq.com/) - Infraestrutura de IA
- [OpenStreetMap](https://www.openstreetmap.org/) - Dados geográficos
- Comunidade open-source

---

<div align="center">

**Feito com ❤️ pela comunidade Civicux**

[⬆ Voltar ao topo](#%EF%B8%8F-civicux)

</div>
