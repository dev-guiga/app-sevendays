"use client";
import { PencilSimple, Trash } from "@phosphor-icons/react/dist/ssr";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddOrRemoveModal } from "./ChangeOrRemoveModal";
import { useState } from "react";

type Date = {
  data: string;
  hora: string;
};

interface client {
  nome: string;
  email: string;
  date: Date;
  status: string;
}

const clientes = [
  {
    nome: "Ana Silva",
    email: "ana.silva@email.com",
    date: { data: "2025-11-12", hora: "09:00" },
    status: "agendado",
  },
  {
    nome: "Bruno Costa",
    email: "bruno.costa@email.com",
    date: { data: "2025-11-12", hora: "10:30" },
    status: "finalizado",
  },
  {
    nome: "Carla Oliveira",
    email: "carla.oliveira@email.com",
    date: { data: "2025-11-13", hora: "14:00" },
    status: "desmarcado",
  },
  {
    nome: "Diego Rocha",
    email: "diego.rocha@email.com",
    date: { data: "2025-11-13", hora: "15:30" },
    status: "nao compareceu",
  },
  {
    nome: "Eduarda Lima",
    email: "eduarda.lima@email.com",
    date: { data: "2025-11-14", hora: "11:00" },
    status: "agendado",
  },
  {
    nome: "Felipe Martins",
    email: "felipe.martins@email.com",
    date: { data: "2025-11-14", hora: "13:00" },
    status: "finalizado",
  },
  {
    nome: "Gabriela Nunes",
    email: "gabriela.nunes@email.com",
    date: { data: "2025-11-15", hora: "09:30" },
    status: "desmarcado",
  },
  {
    nome: "Henrique Souza",
    email: "henrique.souza@email.com",
    date: { data: "2025-11-15", hora: "16:00" },
    status: "nao compareceu",
  },
  {
    nome: "Isabela Mendes",
    email: "isabela.mendes@email.com",
    date: { data: "2025-11-16", hora: "10:00" },
    status: "agendado",
  },
  {
    nome: "João Pereira",
    email: "joao.pereira@email.com",
    date: { data: "2025-11-16", hora: "17:30" },
    status: "finalizado",
  },
] as client[];

const statusColors = {
  finalizado: "#16A34A", // verde
  "nao compareceu": "#DC2626", // vermelho
  desmarcado: "#EA580C", // laranja
  agendado: "#7C3AED", // roxo
};

type OpenModal = {
  checkOpen: boolean;
  title: string;
  type: "editar" | "remover";
};

export function TableClients() {
  const [client, setClient] = useState<client | null>(null);
  const [openModal, setOpenModal] = useState<OpenModal>({
    checkOpen: false,
    title: "",
    type: "editar",
  });

  const onCloseModal = () => {
    setOpenModal((prev) => ({
      ...prev,
      checkOpen: false,
      type: "editar",
    }));
  };

  const editDateClient = (client: client) => {
    setOpenModal((prev) => ({
      ...prev,
      checkOpen: true,
      title: "Editar Hórario",
      type: "remover",
    }));
    setClient(client);
  };

  const RemoveDateClient = (client: client) => {
    setOpenModal((prev) => ({
      ...prev,
      checkOpen: true,
      title: "Remover Hórario",
    }));
    setClient(client);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Hora</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Remover</TableHead>
          <TableHead>Editar</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clientes.map((cliente, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{cliente.nome}</TableCell>
            <TableCell>{cliente.email}</TableCell>
            <TableCell>{cliente.date.data}</TableCell>
            <TableCell>{cliente.date.hora}</TableCell>
            <TableCell
              className="capitalize"
              style={{ color: statusColors[cliente.status] }}
            >
              {cliente.status}
            </TableCell>
            <TableCell className="capitalize">
              <button
                className="cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={
                  cliente?.status === "finalizado" ||
                  cliente?.status === "desmarcado" ||
                  cliente?.status === "nao compareceu"
                }
                onClick={() => RemoveDateClient(cliente)}
              >
                <Trash size={18} fill="#dc2626" />
              </button>
            </TableCell>
            <TableCell className="capitalize">
              <button
                className="cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={
                  cliente?.status === "finalizado" ||
                  cliente?.status === "desmarcado" ||
                  cliente?.status === "nao compareceu"
                }
                onClick={() => editDateClient(cliente)}
              >
                <PencilSimple size={18} fill="#e5e5e5" />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <AddOrRemoveModal
        openModal={openModal.checkOpen}
        title={openModal.title}
        type={openModal.type}
        client={client!}
        onCloseModal={onCloseModal}
      />
    </Table>
  );
}
