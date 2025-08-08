# Exemplo de Implementação WHMCS

## Como Usar o Layout WHMCS

Para usar o novo layout WHMCS na página de perfil:

### 1. Substituir o arquivo atual
```bash
# Fazer backup da página atual
mv src/app/profile/page.tsx src/app/profile/page-original.tsx

# Usar a versão WHMCS
mv src/app/profile/page-whmcs.tsx src/app/profile/page.tsx
```

### 2. Ou importar apenas os componentes necessários

```typescript
import WHMCSLayout from "@/components/layout/WHMCSLayout";
import WHMCSHeader from "@/components/layout/WHMCSHeader";
import WHMCSFooter from "@/components/layout/WHMCSFooter";
import WHMCSSidebar from "@/components/layout/WHMCSSidebar";
import WHMCSBreadcrumb from "@/components/layout/WHMCSBreadcrumb";
```

### 3. Estrutura básica de uma página WHMCS

```typescript
const MyPage = () => {
  const breadcrumbs = [
    { label: "Minha Conta", href: "/profile" },
    { label: "Configurações" }
  ];

  return (
    <WHMCSLayout 
      title="Título da Página"
      breadcrumbs={breadcrumbs}
      showSidebar={true}
    >
      {/* Alertas */}
      <div className="whmcs-alert success">
        <CheckCircle className="h-5 w-5" />
        <div className="whmcs-alert-content">
          <h4 className="whmcs-alert-title">Sucesso!</h4>
          <p className="whmcs-alert-text">Operação realizada com sucesso.</p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="whmcs-profile-cards">
        <div className="whmcs-stat-card">
          <div className="whmcs-stat-header">
            <div className="whmcs-stat-icon primary">
              <Download className="h-6 w-6" />
            </div>
            <div className="whmcs-stat-content">
              <h3>150</h3>
              <p>Downloads</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Conteúdo */}
      <div className="whmcs-card">
        <div className="whmcs-card-header">
          <h3 className="whmcs-card-title">Informações</h3>
        </div>
        <div className="whmcs-card-body">
          <p>Conteúdo do card...</p>
        </div>
      </div>
    </WHMCSLayout>
  );
};
```

### 4. Classes CSS Disponíveis

#### Layout:
- `whmcs-layout` - Container principal
- `whmcs-container` - Container com largura máxima
- `whmcs-main` - Conteúdo principal

#### Componentes:
- `whmcs-card` - Cards básicos
- `whmcs-stat-card` - Cards de estatísticas
- `whmcs-alert` - Alertas (success, warning, danger, info)
- `whmcs-btn-primary` - Botões primários
- `whmcs-table` - Tabelas

#### Navegação:
- `whmcs-sidebar` - Barra lateral
- `whmcs-breadcrumb` - Breadcrumbs
- `whmcs-nav-item` - Itens de navegação

### 5. Cores e Variáveis Disponíveis

```css
:root {
  --whmcs-primary: #007cba;
  --whmcs-success: #28a745;
  --whmcs-warning: #ffc107;
  --whmcs-danger: #dc3545;
  --whmcs-info: #17a2b8;
}
```

### 6. Responsividade

O layout é totalmente responsivo:
- Desktop: Sidebar fixa ao lado
- Tablet: Sidebar acima do conteúdo
- Mobile: Navegação mobile otimizada

### 7. Atualizabilidade

Para manter a atualizabilidade:
- Todas as customizações estão em `whmcs-custom.css`
- Componentes são modulares e independentes
- Não modifica arquivos core da aplicação
- Usa sistema de child theme approach

