"use client";

import { UserProfile } from "@clerk/nextjs";
import React from 'react';

// Este componente simplesmente renderiza a interface de gerenciamento de perfil do Clerk.
// Ele será envolvido pelo seu layout principal (RootLayout) automaticamente.
const UserProfilePage = () => (
  <div className="flex justify-center items-center py-12">
    <UserProfile path="/manage-profile" routing="path" />
  </div>
);

export default UserProfilePage;
