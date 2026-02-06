# NOW Security - Progressive Web App

## Sobre o PWA

Este projeto foi configurado como PWA (Progressive Web App) com suporte completo para:

- ✅ Instalação no dispositivo (Android, iOS, Desktop)
- ✅ Funcionamento offline via Service Worker
- ✅ Notificações push
- ✅ Sincronização em background
- ✅ Cache inteligente de assets
- ✅ Splash screens otimizadas
- ✅ Atalhos na home screen
- ✅ Share target API

## Testando o PWA

### 1. Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

### 2. Testar Instalação

**Chrome Desktop:**
1. Abra `http://localhost:3000`
2. Clique no ícone de instalação na barra de endereço
3. Ou vá em Menu > Mais ferramentas > Instalar aplicativo

**Chrome Android:**
1. Abra no navegador Chrome
2. Toque no menu (3 pontos)
3. Selecione "Adicionar à tela inicial"

**Safari iOS:**
1. Abra no Safari
2. Toque no botão Compartilhar
3. Selecione "Adicionar à Tela de Início"

### 3. Testar Offline

1. Instale o app
2. Abra as DevTools > Application > Service Workers
3. Marque "Offline"
4. Navegue pelo app - páginas visitadas funcionarão offline

### 4. Lighthouse Audit

```bash
# Via Chrome DevTools
1. Abra DevTools (F12)
2. Vá na aba Lighthouse
3. Selecione "Progressive Web App"
4. Clique em "Generate report"
```

Score esperado: 90+ em PWA

## Deploy para Produção

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Requisitos para PWA em Produção

1. **HTTPS obrigatório**
   - Vercel fornece automaticamente
   - Ou use Cloudflare/Let's Encrypt

2. **Service Worker registrado**
   - Já configurado em `app/layout.tsx`

3. **Manifest acessível**
   - Disponível em `/manifest.json`

4. **Ícones gerados**
   - Coloque seus ícones em `/public/icons/`
   - Tamanhos: 72, 96, 128, 144, 152, 192, 384, 512px

## Gerando Ícones

Use o [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator):

```bash
# Via CLI
npx pwa-asset-generator public/logo.svg public/icons --background "#0066cc" --padding "10%"
```

Ou manualmente:
1. Crie um ícone 512x512px
2. Use ferramentas online para gerar todos os tamanhos
3. Coloque em `/public/icons/`

## Notificações Push

### 1. Configurar VAPID Keys

```bash
# Gerar chaves VAPID
npx web-push generate-vapid-keys
```

### 2. Adicionar ao .env

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=sua_chave_publica
VAPID_PRIVATE_KEY=sua_chave_privada
```

### 3. Solicitar Permissão

```typescript
// Implementado no service worker (sw.js)
// Usuario será solicitado ao acessar o app
```

## TWA (Trusted Web Activity)

Para converter o PWA em app Android nativo, veja `TWA_SETUP.md`

### Opção Rápida: Bubblewrap

```bash
# Instalar Bubblewrap
npm i -g @bubblewrap/cli

# Inicializar TWA
bubblewrap init --manifest https://seu-dominio.com/manifest.json

# Build APK
bubblewrap build

# Resultado: app-release-signed.apk
```

## Métricas e Monitoramento

### Core Web Vitals

O app monitora automaticamente:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

### Analytics

Integrado com Vercel Analytics:
```typescript
import { Analytics } from '@vercel/analytics/react'

// Já incluído no layout
```

## Troubleshooting

### Service Worker não registra

1. Confirme que está em HTTPS (ou localhost)
2. Verifique console para erros
3. Limpe cache: DevTools > Application > Clear storage

### App não instala

1. Verifique manifest.json está acessível
2. Confirme todos os ícones existem
3. Rode Lighthouse audit para detalhes

### Offline não funciona

1. Verifique Service Worker está ativo
2. Confirme estratégia de cache em `sw.js`
3. Teste no modo anônimo (sem extensões)

## Recursos

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker Cookbook](https://serviceworke.rs/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
