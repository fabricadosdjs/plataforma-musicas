// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redireciona imediatamente para a página de músicas novas
  redirect('/new');

  // Não é necessário retornar nenhum JSX.
  return null;
}
