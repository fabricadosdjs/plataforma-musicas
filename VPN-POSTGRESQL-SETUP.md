# 🔌 Configuração PostgreSQL na VPN - Passo a Passo

## 📋 Pré-requisitos
- Acesso SSH/console à máquina da VPN (69.10.53.84)
- Permissões de sudo na máquina da VPN
- PostgreSQL instalado na máquina da VPN

---

## 🚀 **PASSO 1: Verificar Status do PostgreSQL**

```bash
# Conectar na máquina da VPN
ssh usuario@69.10.53.84

# Verificar se o PostgreSQL está rodando
sudo systemctl status postgresql

# Se não estiver rodando, inicie:
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**✅ Resultado esperado:** `Active: active (running)`

---

## 🔥 **PASSO 2: Configurar Firewall**

```bash
# Liberar porta 5432 no UFW
sudo ufw allow 5432/tcp

# Verificar status
sudo ufw status

# OU se usar iptables:
sudo iptables -A INPUT -p tcp --dport 5432 -j ACCEPT
sudo iptables-save
```

**✅ Resultado esperado:** `5432/tcp ALLOW Anywhere`

---

## 📝 **PASSO 3: Configurar postgresql.conf**

```bash
# Editar arquivo de configuração
sudo nano /etc/postgresql/*/main/postgresql.conf
```

**🔧 Alterar estas linhas:**
```ini
# Permitir conexões de qualquer IP
listen_addresses = '*'

# Confirmar porta
port = 5432

# Configurações de performance (opcional)
max_connections = 100
shared_buffers = 128MB
```

**💾 Salvar:** `Ctrl+X` → `Y` → `Enter`

---

## 🔐 **PASSO 4: Configurar pg_hba.conf**

```bash
# Editar arquivo de autenticação
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

**🔧 Adicionar esta linha no final:**
```ini
# Permitir conexões externas com senha
host    all             all             0.0.0.0/0               md5
```

**💾 Salvar:** `Ctrl+X` → `Y` → `Enter`

---

## 🔄 **PASSO 5: Reiniciar PostgreSQL**

```bash
# Reiniciar serviço
sudo systemctl restart postgresql

# Verificar status
sudo systemctl status postgresql

# Verificar se está escutando na porta
sudo netstat -tlnp | grep 5432
```

**✅ Resultado esperado:** `tcp 0 0 0.0.0.0:5432 0.0.0.0:* LISTEN`

---

## 👤 **PASSO 6: Criar Usuário e Banco**

```bash
# Conectar como usuário postgres
sudo -u postgres psql

# No prompt do PostgreSQL, execute:
CREATE USER edersonleonardo WITH PASSWORD 'Eclipse2025*';
CREATE DATABASE "plataforma-musicas";
GRANT ALL PRIVILEGES ON DATABASE "plataforma-musicas" TO edersonleonardo;
GRANT ALL ON SCHEMA public TO edersonleonardo;

# Verificar usuários criados
\du

# Verificar bancos criados
\l

# Sair
\q
```

**✅ Resultado esperado:** `CREATE USER` e `CREATE DATABASE`

---

## 🌐 **PASSO 7: Testar Conexão Externa**

```bash
# Da sua máquina local, teste:
ping 69.10.53.84

# Teste da porta
telnet 69.10.53.84 5432

# Teste com Prisma
npx prisma db pull
```

---

## 🔍 **Troubleshooting**

### ❌ **PostgreSQL não inicia:**
```bash
# Ver logs detalhados
sudo journalctl -u postgresql -f

# Verificar permissões
sudo chown -R postgres:postgres /var/lib/postgresql
sudo chmod 700 /var/lib/postgresql/*/main
```

### ❌ **Firewall bloqueia:**
```bash
# Verificar status UFW
sudo ufw status

# Verificar iptables
sudo iptables -L | grep 5432

# Testar porta localmente
sudo netstat -tlnp | grep 5432
```

### ❌ **Erro de permissão:**
```bash
# Verificar arquivos de configuração
sudo ls -la /etc/postgresql/*/main/

# Verificar logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

---

## 📊 **Verificação Final**

```bash
# 1. Status do serviço
sudo systemctl status postgresql

# 2. Porta escutando
sudo netstat -tlnp | grep 5432

# 3. Configurações ativas
sudo -u postgres psql -c "SHOW listen_addresses;"
sudo -u postgres psql -c "SHOW port;"

# 4. Usuários criados
sudo -u postgres psql -c "\du"
```

---

## 🎯 **Comandos Rápidos (Copy & Paste)**

```bash
# Sequência completa para executar:
sudo systemctl start postgresql
sudo ufw allow 5432/tcp
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf
echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql
sudo -u postgres psql -c "CREATE USER edersonleonardo WITH PASSWORD 'Eclipse2025*';"
sudo -u postgres psql -c "CREATE DATABASE \"plataforma-musicas\";"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE \"plataforma-musicas\" TO edersonleonardo;"
```

---

## 📞 **Suporte**

**Se encontrar problemas:**
1. Verifique os logs: `sudo journalctl -u postgresql -f`
2. Confirme permissões: `sudo ls -la /etc/postgresql/*/main/`
3. Teste localmente: `sudo -u postgres psql -d "plataforma-musicas"`
4. Verifique firewall: `sudo ufw status`

**✅ Após configurar tudo, teste da sua máquina:**
```bash
npx prisma db pull
```