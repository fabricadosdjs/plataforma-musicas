// src/app/page.tsx
// A única função deste arquivo é redirecionar o usuário para a página /new.

import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redireciona imediatamente para a página de músicas novas
  redirect('/new');

}
