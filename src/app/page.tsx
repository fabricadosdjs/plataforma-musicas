// src/app/page.tsx
import { redirect } from 'next/navigation';

// Este componente é a página raiz da sua aplicação.
// Ele simplesmente redireciona o usuário para a página '/new',
// que é definida como a homepage padrão do seu projeto.
export default function HomePage() {
  redirect('/new');
}
