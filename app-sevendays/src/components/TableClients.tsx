"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { sevendaysapi } from "@/lib/sevendaysapi";
import { toast } from "sonner";

type OwnerSchedulingStatus = "available" | "marked" | "cancelled";

type OwnerScheduling = {
  id: number;
  user_name?: string;
  user_email?: string;
  date?: string;
  time?: string;
  status?: OwnerSchedulingStatus;
  description?: string;
};

type PaginatedOwnerSchedulingsResponse = {
  success?: boolean;
  schedulings?: OwnerScheduling[];
  pagination?: {
    page?: number;
    per_page?: number;
    total_count?: number;
    total_pages?: number;
    has_prev?: boolean;
    has_next?: boolean;
  };
};

const PER_PAGE = 20;
const SKELETON_ROWS = 20;

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const isoDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return `${day}/${month}/${year}`;
  }

  const timestampDateMatch = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (timestampDateMatch) {
    const [, year, month, day] = timestampDateMatch;
    return `${day}/${month}/${year}`;
  }

  return value;
}

function formatTime(value?: string) {
  if (!value) {
    return "-";
  }

  const match = value.match(/(\d{2}):(\d{2})/);
  if (!match) {
    return value;
  }

  return `${match[1]}:${match[2]}`;
}

function getStatusLabel(status?: OwnerSchedulingStatus) {
  if (status === "marked") {
    return "agendado";
  }

  if (status === "cancelled") {
    return "cancelado";
  }

  if (status === "available") {
    return "disponivel";
  }

  return "desconhecido";
}

function getStatusClassName(status?: OwnerSchedulingStatus) {
  if (status === "marked") {
    return "text-green-500";
  }

  if (status === "cancelled") {
    return "text-red-500";
  }

  if (status === "available") {
    return "text-amber-500";
  }

  return "text-muted-foreground";
}

function buildPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "left-ellipsis" | "right-ellipsis"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    items.push("left-ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < totalPages - 1) {
    items.push("right-ellipsis");
  }

  items.push(totalPages);
  return items;
}

export function TableClients() {
  const [schedulings, setSchedulings] = useState<OwnerScheduling[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadOwnerSchedulings() {
      setIsLoading(true);

      const result = await sevendaysapi.get<PaginatedOwnerSchedulingsResponse>(
        "/owner/diary/schedulings",
        {
          withCredentials: true,
          params: {
            page: currentPage,
            per_page: PER_PAGE,
          },
        },
      );

      if (ignore) {
        return;
      }

      if (
        result.error ||
        result.statusCode !== 200 ||
        !result.data?.success ||
        !Array.isArray(result.data.schedulings)
      ) {
        toast.error("Não foi possível carregar os horários agendados.");
        setSchedulings([]);
        setTotalPages(1);
        setTotalCount(0);
        setHasPrev(false);
        setHasNext(false);
        setIsLoading(false);
        return;
      }

      const pagination = result.data.pagination;
      const serverPage = Math.max(1, Number(pagination?.page) || currentPage);

      setSchedulings(result.data.schedulings);
      if (serverPage !== currentPage) {
        setCurrentPage(serverPage);
      }
      setTotalPages(Math.max(1, Number(pagination?.total_pages) || 1));
      setTotalCount(Math.max(0, Number(pagination?.total_count) || 0));
      setHasPrev(Boolean(pagination?.has_prev));
      setHasNext(Boolean(pagination?.has_next));
      setIsLoading(false);
    }

    void loadOwnerSchedulings();

    return () => {
      ignore = true;
    };
  }, [currentPage]);

  const paginationItems = useMemo(
    () => buildPaginationItems(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const handleGoToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setCurrentPage(page);
  };

  const isEmptyState = !isLoading && schedulings.length === 0;

  return (
    <div className="w-full flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-44" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                </TableRow>
              ))
            : isEmptyState
              ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <div className="h-[700px] w-full flex items-center justify-center">
                        <p className="text-muted-foreground">Sem horários agendados.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              : schedulings.map((scheduling) => (
                  <TableRow key={scheduling.id}>
                    <TableCell className="font-medium">
                      {scheduling.user_name || "Paciente"}
                    </TableCell>
                    <TableCell>{scheduling.user_email || "-"}</TableCell>
                    <TableCell>{formatDate(scheduling.date)}</TableCell>
                    <TableCell>{formatTime(scheduling.time)}</TableCell>
                    <TableCell
                      className={`capitalize ${getStatusClassName(scheduling.status)}`}
                    >
                      {getStatusLabel(scheduling.status)}
                    </TableCell>
                  </TableRow>
                ))}
        </TableBody>
      </Table>

      {!isLoading && !isEmptyState ? (
        <div className="w-full flex flex-col gap-2">
          <p className="text-sm text-muted-foreground text-center">
            Página {currentPage} de {totalPages} • {totalCount} agendamento(s)
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (!hasPrev) {
                      return;
                    }
                    handleGoToPage(currentPage - 1);
                  }}
                  className={!hasPrev ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>

              {paginationItems.map((item, index) => {
                if (item === "left-ellipsis" || item === "right-ellipsis") {
                  return (
                    <PaginationItem key={`${item}-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#"
                      isActive={item === currentPage}
                      onClick={(event) => {
                        event.preventDefault();
                        handleGoToPage(item);
                      }}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (!hasNext) {
                      return;
                    }
                    handleGoToPage(currentPage + 1);
                  }}
                  className={!hasNext ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  );
}
