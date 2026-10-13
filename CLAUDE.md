# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Desenvolvimento local (padrão — usa environment.local.ts + backend em localhost:8094)
ng serve

# Build por ambiente
ng build --configuration=local
ng build --configuration=dev
ng build --configuration=hom
ng build --configuration=production

# Lint
ng lint

# Testes (Karma + Jasmine)
ng test
```

## Arquitetura

### Standalone Components (Angular 18)
Não há NgModule. A aplicação usa a API standalone via `bootstrapApplication` em `src/main.ts`. Providers globais (serviços, interceptors, guards) são registrados diretamente ali.

### Serviço único de API
Toda a comunicação com o backend está concentrada em `src/app/services/integra.service.ts`. Não há serviços por módulo — ao criar chamadas novas ao backend, adicione-as nele. O arquivo `src/app/services/storage.service.ts` cuida exclusivamente de upload/download/delete de arquivos via multipart.

### Autenticação e interceptor
- **OAuth2 password grant** → JWT armazenado em `localStorage('token')`.
- O `AppAuthInterceptor` (`src/app/app.auth/app.auth.interceptor.ts`) injeta o token em cada requisição. Atenção: requisições para `/storage/` recebem apenas o `Authorization: Bearer`, enquanto as demais recebem apenas `Content-Type: application/json` (o token interno está **comentado** no interceptor).
- Avaliador externo usa um segundo token independente: `localStorage('tokenIntegraAvaliadorExterno')`. Endpoints `avaliador-externo/avaliacoes` usam esse token; endpoints de login/alterar-senha/esqueci-senha do portal externo não recebem token nenhum.

### Fluxo de inicialização após login
1. `AppComponent.ngOnInit` verifica autenticação e redireciona por perfil (0 → dashboard, 1 → avaliacoes, 2 → avaliacoes-avaliado).
2. `InformacoesUsuarioResolver` (`src/app/resolver/informacoes-usuario.resolver.ts`) é executado antes de todas as rotas internas. Ele carrega dados do servidor, configuração e verifica se é avaliador ativo. Se o usuário tiver múltiplos papéis (admin/avaliado ou avaliador/avaliado), abre o dialog `SelecionaTipoUsuarioComponent` antes de liberar a navegação.
3. O perfil resolvido é gravado em `localStorage`: `permissaoUsuario`, `matricula`, `nomeUsuario`, `nomeUnidade`, `siglaUnidade`, `tipoUsuario`, `idUnidade`, `loginUsuario`.

### Portais distintos
- **Usuário interno** (`/`): protegido por `AuthGuard` + `AuthorizationGuard`, resolve dados via `InformacoesUsuarioResolver`.
- **Avaliador externo** (`/avaliador-externo/*`): rotas separadas, protegidas por `AuthGuardAvaliadorExterno`, sem resolver, token próprio.

### Environments
O `ng serve` padrão usa `local` (ver `angular.json` → `serve.defaultConfiguration`).

| Config | `integraAuth` | `integraHost` |
|---|---|---|
| `local` | `https://ca2-dev.web.stj.jus.br/...` | `http://localhost:8094/` |
| `dev` / `hom` / `production` | `https://ca2-AMBIENTE.web.stj.jus.br/...` | `/api/` |

### Login em modo desenvolvimento
`AppAuthService.loginDesenvolvimento()` gera um fake JWT local sem chamar o backend, pré-populando o `localStorage` com dados do servidor `smarcio` (matrícula `S043197`, permissão `0`/ADMIN). Útil quando o servidor de auth não está acessível.
