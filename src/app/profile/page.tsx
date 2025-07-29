"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  User,
  Mail,
  CreditCard,
  Shield,
  Loader2,
  LogOut,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  Download,
  Music,
  Star,
  Crown,
  TrendingUp,
  BellRing,
  Phone,
  AtSign,
  Check,
  QrCode,
  ExternalLink,
  Settings,
  MoveUpIcon as Upgrade,
  Key,
  Calendar,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const [showPixModal, setShowPixModal] = useState(false);

  useEffect(() => {
    async function fetchUserDetails() {
      if (!session?.user) return;
      try {
        const res = await fetch("/api/user-data");
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        }
      } catch (err) {
        setUserData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUserDetails();
  }, [session?.user]);


  // Funções utilitárias
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não definido";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };
  const getVencimentoStatus = (vencimento: string | null, status: string) => {
    if (!vencimento || status === "CANCELADO") return "normal";
    const hoje = new Date();
    const dataVencimento = new Date(vencimento);
    const diffTime = dataVencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "vencido";
    if (diffDays <= 5) return "vencendo";
    return "normal";
  };

  // ...restante do componente, return JSX...

}
