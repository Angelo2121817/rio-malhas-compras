# Passo a passo: colocar a Rio Malhas Tecidos online

Siga a ordem abaixo. Antes de começar, tenha em mãos a **URL** e a **chave anon** do seu projeto no Supabase (Settings → API no dashboard).

---

## Supabase e GitHub: entenda a diferença

- **Supabase** = banco de dados na nuvem. Você **não** conecta o Supabase ao GitHub. Você só cria um projeto no Supabase, roda o SQL das tabelas e copia a **URL** e a **chave anon** para usar na aplicação.
- **GitHub** = onde fica o código do seu projeto (o repositório).
- **Railway** = serviço que **conecta ao GitHub**, baixa o código e coloca o site no ar. A opção “conectar ao GitHub” existe **no Railway**, não no Supabase.

Resumo: **Supabase** = dados; **Railway** = hospeda o site e é quem se conecta ao **GitHub**.

### O que fazer só no Supabase (sem GitHub)

1. Acesse [supabase.com](https://supabase.com) e crie um **projeto** (New Project).
2. No projeto, abra **SQL Editor** e execute todo o conteúdo do arquivo **`supabase/schema.sql`** do seu projeto (cria as tabelas).
3. Vá em **Settings** → **API** e anote:
   - **Project URL** (ex.: `https://xxxx.supabase.co`)
   - **anon public** (chave longa que começa com `eyJ...`).  
   Esses dois valores você vai colocar depois no **Railway** como variáveis de ambiente. No Supabase não existe opção “conectar GitHub”; ele só guarda os dados.

---

## Parte 1: Preparar o repositório no GitHub

### Passo 1.1 – Criar o repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login.
2. Clique em **“+”** no canto superior direito → **“New repository”**.
3. Preencha:
   - **Repository name:** por exemplo `rio-malhas-compras`
   - **Visibility:** Public (ou Private, como preferir)
   - **Não** marque “Add a README” (o projeto já tem arquivos).
4. Clique em **“Create repository”**.
5. Anote a URL do repositório (ex.: `https://github.com/SEU_USUARIO/rio-malhas-compras`).

### Passo 1.2 – Enviar o código do projeto

Abra o terminal na pasta do projeto e rode os comandos **na ordem** (troque a URL pelo seu repositório):

```bash
cd "c:\Users\Angelo\Meu Drive\HAZMAT_PORTATIL\Compras Rio Malhas"
```

Se o Git ainda não foi inicializado:

```bash
git init
git add .
git commit -m "Initial commit - Rio Malhas Tecidos"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/rio-malhas-compras.git
git push -u origin main
```

Se o repositório já tiver sido inicializado antes, basta enviar as alterações:

```bash
git add .
git commit -m "Preparar deploy"
git push origin main
```

- Substitua **SEU_USUARIO** e **rio-malhas-compras** pelo seu usuário e nome do repositório.
- Se o Git pedir usuário/senha, use um **Personal Access Token** do GitHub em vez da senha da conta.

---

## Parte 2: Configurar o Railway

### Passo 2.1 – Criar conta e conectar ao GitHub (é aqui que se conecta ao GitHub)

1. Acesse [railway.app](https://railway.app).
2. Clique em **“Login”** (ou **“Start a New Project”**).
3. **Entre com GitHub:** escolha **“Login with GitHub”** (ou “Continue with GitHub”). Isso é obrigatório para poder conectar um repositório depois.
4. Autorize o Railway quando o GitHub pedir permissão (acesso aos repositórios).
5. Depois de logado, você verá o **dashboard** do Railway (lista de projetos ou tela inicial).
6. Clique em **“New Project”** (botão roxo/azul).
7. Na tela de criação do projeto, procure uma destas opções:
   - **“Deploy from GitHub repo”**, ou  
   - **“GitHub Repo”**, ou  
   - Um botão **“Configure GitHub”** / **“Connect GitHub”** na primeira vez.  
   Se não aparecer “GitHub”, pode estar como **“Deploy from GitHub”** ou um ícone do GitHub.
8. Se for a primeira vez, o Railway pode pedir para **instalar o app Railway no GitHub**: escolha sua conta ou organização e autorize (só assim o Railway vê seus repositórios).
9. Depois de autorizar, **selecione o repositório** do projeto (ex.: `rio-malhas-compras`) na lista.
10. Clique em **“Deploy”** ou **“Add to Project”**. O Railway vai criar um serviço e fazer o primeiro deploy.

**Se ainda não aparecer opção de GitHub:** confira se você fez login com **“Login with GitHub”**. Se entrou com e-mail/senha, pode não haver opção de repo; nesse caso, desconecte e entre de novo usando **GitHub**. Se a interface tiver mudado, procure por **“New”** → **“GitHub Repo”** ou **“Deploy from GitHub”** no menu do projeto.

### Passo 2.2 – Definir Build e Start

1. Clique no **serviço** (retângulo do seu app) que apareceu no projeto.
2. Vá na aba **“Settings”** (ou **“Config”**, dependendo do layout).
3. Procure a seção **“Build”** / **“Build Command”**:
   - **Build Command:** `npm run build`
4. Procure **“Start”** / **“Start Command”** / **“Run”**:
   - **Start Command:** `npm run start`
5. **Root Directory** deixe em branco (raiz do repositório).
6. Salve as alterações se houver botão **“Save”** ou **“Update”**.

### Passo 2.3 – Variáveis de ambiente (Supabase)

O build do Vite usa as variáveis na hora de compilar, então elas **precisam** estar no Railway antes do próximo build.

1. No mesmo serviço, abra a aba **“Variables”** (ou **“Environment”**).
2. Clique em **“Add Variable”** ou **“New Variable”**.
3. Adicione **uma por uma**:

| Nome                    | Valor                                      |
|-------------------------|--------------------------------------------|
| `VITE_SUPABASE_URL`     | `https://xxxxx.supabase.co` (sua URL)      |
| `VITE_SUPABASE_ANON_KEY`| `eyJhbGc...` (sua chave anon/public)       |

- Os valores estão no **Supabase**: seu projeto → **Settings** → **API** → **Project URL** e **anon public**.
4. Salve. O Railway costuma fazer um **novo deploy** automaticamente ao salvar variáveis.

### Passo 2.4 – Gerar domínio público

1. Ainda no serviço, vá em **“Settings”** e procure **“Networking”** ou **“Domains”**.
2. Clique em **“Generate Domain”** ou **“Add Domain”**.
3. O Railway vai mostrar um link, por exemplo:  
   `https://rio-malhas-compras-production-xxxx.up.railway.app`
4. Use esse link para acessar a aplicação.

---

## Parte 3: Conferir se está tudo certo

### Passo 3.1 – Build e deploy

1. Na aba **“Deployments”** do serviço, veja se o último deploy está **“Success”** / **“Active”**.
2. Se aparecer **“Failed”**, clique no deploy e leia o log (erro de build, variável faltando, etc.).

### Passo 3.2 – Testar no navegador

1. Abra o link do domínio que você gerou.
2. Deve aparecer a tela inicial (logo) e, em cerca de 2 segundos, redirecionar para a **Lista de Compras**.
3. Adicione um item, marque como comprado e veja se risca e se no Supabase (Table Editor → `estatisticas_vendas`) aparece o registro.

### Passo 3.3 – Supabase

- Confirme que no Supabase você já rodou o **`supabase/schema.sql`** (tabelas `lista_compras` e `estatisticas_vendas`).
- As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no Railway devem ser **exatamente** as do mesmo projeto.

---

## Resumo rápido

| Onde        | O quê |
|------------|--------|
| **GitHub** | Repositório criado e código enviado (`git push`) |
| **Railway**| Projeto criado a partir do repo; Build = `npm run build`, Start = `npm run start` |
| **Railway**| Variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` preenchidas |
| **Railway**| Domínio público gerado |
| **Supabase**| Schema SQL executado; tabelas e políticas ativas |

---

## Problemas comuns

- **Página em branco ou erro ao carregar:** confira se as variáveis estão corretas no Railway e se o último deploy foi feito **depois** de adicioná-las.
- **Erro de build no Railway:** veja o log do deploy; muitas vezes é variável faltando ou nome errado (`VITE_` no início).
- **“Cannot GET /lista-compras” ao abrir o link direto:** o comando `npm run start` usa `serve -s dist`, que já manda rotas para o `index.html`; se ainda der problema, confira se o Start Command está exatamente `npm run start`.
- **Dados não aparecem / erro de rede:** confira URL e anon key do Supabase; confira no Supabase se as políticas RLS estão criadas (conteúdo do `schema.sql`).

Quando tudo estiver certo, sua loja **Rio Malhas Tecidos** estará online no link do Railway.
