# 🔧 CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE

## 🛡️ **CLOUDFARE TURNSTILE (NOVO!)**

### **1. Obter Site Key:**
- Vá para [Cloudflare Dashboard](https://dash.cloudflare.com/)
- **Security** → **Turnstile**
- **Add site**
- **Domain:** `djpools.nexorrecords.com.br`
- **Widget type:** `Managed`
- **Copy Site Key**

### **2. Obter Secret Key:**
- Na mesma página do Turnstile
- **Copy Secret Key**

### **3. Variáveis Necessárias:**
```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAABkMYinukE8NnX
TURNSTILE_SECRET_KEY=sua_secret_key_aqui
```

---

## 🔐 **AUTENTICAÇÃO (NEXTAUTH)**

```env
NEXTAUTH_URL=https://djpools.nexorrecords.com.br
NEXTAUTH_SECRET=seu_secret_muito_seguro_aqui
```

---

## 🗄️ **BANCO DE DADOS (SUPABASE)**

```env
DATABASE_URL=postgresql://username:password@host:port/database
```

---

## ☁️ **SUPABASE**

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

---

## 🎵 **STORAGE (CONTABO)**

```env
CONTABO_ENDPOINT=https://usc1.contabostorage.com
CONTABO_REGION=usc1
CONTABO_ACCESS_KEY_ID=sua_access_key_id
CONTABO_SECRET_ACCESS_KEY=sua_secret_access_key
CONTABO_BUCKET_NAME=nome-do-seu-bucket
```

---

## 👑 **ADMIN MASTER**

```env
ADMIN_EMAIL=seu-email-admin@exemplo.com
ADMIN_PASSWORD=sua_senha_admin_aqui
```

---

## 🎵 **DEEZER DOWNLOADER**

```env
DEEZER_ARL=seu_arl_aqui_para_128kbps
```

---

## 🚀 **COMO CONFIGURAR NO CLOUDFARE PAGES:**

1. **Vá para:** `Pages` → Seu projeto → `Settings`
2. **Clique em:** `Environment variables`
3. **Adicione cada variável:**
   - **Name:** `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - **Value:** `0x4AAAAAAABkMYinukE8NnX`
   - **Environment:** `Production`

4. **Repita para todas as variáveis acima**

---

## ✅ **TESTE APÓS CONFIGURAÇÃO:**

1. **Acesse:** `/auth/sign-in`
2. **Verifique se o widget Turnstile aparece**
3. **Complete o captcha**
4. **Tente fazer login**

---

## 🆘 **PROBLEMAS COMUNS:**

- **Widget não aparece:** Verificar `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- **Erro de validação:** Verificar `TURNSTILE_SECRET_KEY`
- **Login não funciona:** Verificar todas as variáveis obrigatórias
