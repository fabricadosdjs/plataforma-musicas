import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      is_vip?: boolean
      isAdmin?: boolean
      valor?: number
      vencimento?: Date | null
      deezerPremium?: boolean
      deezerEmail?: string | null
      deezerPassword?: string | null
      deemix?: boolean
      isUploader?: boolean
      planName?: string | null
      planType?: string | null
      status?: string
      dataPagamento?: Date | null
      whatsapp?: string | null
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    is_vip?: boolean
    isAdmin?: boolean
    valor?: number
    vencimento?: Date | null
    deezerPremium?: boolean
    deezerEmail?: string | null
    deezerPassword?: string | null
    deemix?: boolean
    isUploader?: boolean
    planName?: string | null
    planType?: string | null
    status?: string
    dataPagamento?: Date | null
    whatsapp?: string | null
  }
}
