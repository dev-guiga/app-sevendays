"use client";

import { useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { DatePickerSimple } from "@/components/DatePickerSimple";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react";
import { addDays, format } from "date-fns";
import { toast } from "sonner";

type OwnerSchedulingStatus = "available" | "marked" | "pending" | "cancelled";
type OwnerSchedulingFilterStatus = "all" | "marked" | "pending" | "cancelled";
type SortDirection = "asc" | "desc";
type SortField = "user_name" | "user_email" | "date" | "time";

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
const DEFAULT_SORT_FIELD: SortField = "date";
const DEFAULT_SORT_DIRECTION: SortDirection = "desc";
const DEFAULT_STATUS_FILTER: OwnerSchedulingFilterStatus = "all";

function buildDefaultStartDate() {
  return new Date();
}

function buildDefaultEndDate() {
  return addDays(new Date(), 30);
}

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

  if (status === "pending") {
    return "pendente";
  }

  if (status === "cancelled") {
    return "cancelado";
  }

  if (status === "available") {
    return "disponivel";
  }

  return "desconhecido";
}

function getStatusDotClassName(status?: OwnerSchedulingStatus) {
  if (status === "marked") {
    return "bg-green-500";
  }

  if (status === "pending") {
    return "bg-blue-500";
  }

  if (status === "cancelled") {
    return "bg-red-500";
  }

  if (status === "available") {
    return "bg-amber-500";
  }

  return "bg-muted-foreground";
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

interface TableClientsProps {
  reloadToken?: number;
}

export function TableClients({ reloadToken = 0 }: TableClientsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>(DEFAULT_SORT_FIELD);
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_SORT_DIRECTION);
  const [statusFilter, setStatusFilter] = useState<OwnerSchedulingFilterStatus>(
    DEFAULT_STATUS_FILTER,
  );
  const [searchText, setSearchText] = useState("");
  const [appliedSearchText, setAppliedSearchText] = useState("");
  const [startDateFilter, setStartDateFilter] = useState<Date>(buildDefaultStartDate);
  const [endDateFilter, setEndDateFilter] = useState<Date>(buildDefaultEndDate);

  const startDateFilterValue = useMemo(
    () => format(startDateFilter, "yyyy-MM-dd"),
    [startDateFilter],
  );
  const endDateFilterValue = useMemo(
    () => format(endDateFilter, "yyyy-MM-dd"),
    [endDateFilter],
  );

  const ownerSchedulingsQuery = useQuery({
    queryKey: [
      "owner-schedulings",
      reloadToken,
      currentPage,
      PER_PAGE,
      sortField,
      sortDirection,
      statusFilter,
      appliedSearchText,
      startDateFilterValue,
      endDateFilterValue,
    ],
    queryFn: async () => {
      const result = await sevendaysapi.get<PaginatedOwnerSchedulingsResponse>(
        "/owner/diary/schedulings",
        {
          withCredentials: true,
          params: {
            page: currentPage,
            per_page: PER_PAGE,
            sort_by: sortField,
            sort_direction: sortDirection,
            status: statusFilter,
            ...(appliedSearchText ? { query: appliedSearchText } : {}),
            ...(startDateFilter ? { date_from: startDateFilterValue } : {}),
            ...(endDateFilter ? { date_to: endDateFilterValue } : {}),
          },
        },
      );

      if (result.statusCode === 404) {
        return {
          schedulings: [],
          page: 1,
          totalPages: 1,
          totalCount: 0,
          hasPrev: false,
          hasNext: false,
        };
      }

      if (
        result.error ||
        result.statusCode !== 200 ||
        !result.data?.success ||
        !Array.isArray(result.data.schedulings)
      ) {
        throw new Error("Não foi possível carregar os horários agendados.");
      }

      const pagination = result.data.pagination;
      return {
        schedulings: result.data.schedulings,
        page: Math.max(1, Number(pagination?.page) || currentPage),
        totalPages: Math.max(1, Number(pagination?.total_pages) || 1),
        totalCount: Math.max(0, Number(pagination?.total_count) || 0),
        hasPrev: Boolean(pagination?.has_prev),
        hasNext: Boolean(pagination?.has_next),
      };
    },
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!ownerSchedulingsQuery.isError) {
      return;
    }

    toast.error("Não foi possível carregar os horários agendados.");
  }, [ownerSchedulingsQuery.isError, ownerSchedulingsQuery.errorUpdatedAt]);

  const schedulings = useMemo(
    () => ownerSchedulingsQuery.data?.schedulings ?? [],
    [ownerSchedulingsQuery.data?.schedulings],
  );
  const resolvedCurrentPage = ownerSchedulingsQuery.data?.page ?? currentPage;
  const totalPages = ownerSchedulingsQuery.data?.totalPages ?? 1;
  const totalCount = ownerSchedulingsQuery.data?.totalCount ?? 0;
  const hasPrev = ownerSchedulingsQuery.data?.hasPrev ?? false;
  const hasNext = ownerSchedulingsQuery.data?.hasNext ?? false;
  const isLoading = ownerSchedulingsQuery.isPending;

  const paginationItems = useMemo(
    () => buildPaginationItems(resolvedCurrentPage, totalPages),
    [resolvedCurrentPage, totalPages],
  );

  const handleGoToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === resolvedCurrentPage) {
      return;
    }

    setCurrentPage(page);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setCurrentPage(1);
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
    setCurrentPage(1);
  };

  const getCaretClassName = (field: SortField) => {
    const isActive = sortField === field;
    const directionClass = isActive && sortDirection === "asc" ? "rotate-180" : "rotate-0";

    return `transition-transform ${directionClass} ${isActive ? "opacity-100" : "opacity-45"}`;
  };

  const isEmptyState = !isLoading && schedulings.length === 0;

  return (
    <div className="w-full flex flex-col gap-4">
      <form
        className="w-full flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setAppliedSearchText(searchText.trim());
          setCurrentPage(1);
        }}
      >
        <div className="flex w-full items-center gap-2 sm:max-w-md">
          <Input
            placeholder="Buscar por nome ou e-mail"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="w-full"
          />
          <Button type="submit" className="h-10 w-10 shrink-0 p-0" aria-label="Pesquisar">
            <MagnifyingGlass size={16} />
          </Button>
        </div>
        <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2">
          <DatePickerSimple
            id="table-filter-start-date"
            label="Data inicial"
            labelClassName="sr-only"
            placeholder="Data inicial"
            className="w-full sm:w-44"
            value={startDateFilter}
            onChange={(nextDate) => {
              if (!nextDate) {
                setStartDateFilter(buildDefaultStartDate());
                setCurrentPage(1);
                return;
              }

              setStartDateFilter(nextDate);
              setCurrentPage(1);
            }}
          />
          <DatePickerSimple
            id="table-filter-end-date"
            label="Data final"
            labelClassName="sr-only"
            placeholder="Data final"
            className="w-full sm:w-44"
            value={endDateFilter}
            onChange={(nextDate) => {
              if (!nextDate) {
                setEndDateFilter(buildDefaultEndDate());
                setCurrentPage(1);
                return;
              }

              setEndDateFilter(nextDate);
              setCurrentPage(1);
            }}
          />
        </div>
      </form>

      <Table className="[&_thead_tr]:border-border [&_tbody_tr]:border-border [&_tbody_td]:text-foreground [&_tbody_td]:text-sm">
        <TableHeader>
          <TableRow>
            <TableHead>
              <button
                type="button"
                className="inline-flex w-full items-center justify-between text-xs font-medium uppercase tracking-wide text-foreground"
                onClick={() => handleSort("user_name")}
              >
                Nome
                <CaretDown size={12} className={getCaretClassName("user_name")} />
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                className="inline-flex w-full items-center justify-between text-xs font-medium uppercase tracking-wide text-foreground"
                onClick={() => handleSort("user_email")}
              >
                Email
                <CaretDown size={12} className={getCaretClassName("user_email")} />
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                className="inline-flex w-full items-center justify-between text-xs font-medium uppercase tracking-wide text-foreground"
                onClick={() => handleSort("date")}
              >
                Data
                <CaretDown size={12} className={getCaretClassName("date")} />
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                className="inline-flex w-full items-center justify-between text-xs font-medium uppercase tracking-wide text-foreground"
                onClick={() => handleSort("time")}
              >
                Hora
                <CaretDown size={12} className={getCaretClassName("time")} />
              </button>
            </TableHead>
            <TableHead>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-between text-xs font-medium uppercase tracking-wide text-foreground"
                    aria-label="Filtrar status"
                  >
                    Status
                    <CaretDown size={12} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)]"
                >
                  <DropdownMenuRadioGroup
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value as OwnerSchedulingFilterStatus);
                      setCurrentPage(1);
                    }}
                  >
                    <DropdownMenuRadioItem value="all">
                      Todos
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="marked">
                      Agendado
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="pending">
                      Pendente
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="cancelled">
                      Cancelado
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableHead>
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
                        <p className="text-muted-foreground">Sem horários para os filtros aplicados.</p>
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
                    <TableCell className="text-foreground">
                      <div className="inline-flex items-center gap-2">
                        <span
                          className={`inline-block h-1 w-1 rounded-full ${getStatusDotClassName(scheduling.status)}`}
                        />
                        <span className="text-sm capitalize text-foreground">
                          {getStatusLabel(scheduling.status)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
        </TableBody>
      </Table>

      {!isLoading && !isEmptyState ? (
        <div className="w-full flex flex-col gap-2">
          <p className="text-sm text-muted-foreground text-center">
            Página {currentPage} de {totalPages} • {totalCount} agendamento(s)
            Página {resolvedCurrentPage} de {totalPages} • {totalCount} agendamento(s)
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
                    handleGoToPage(resolvedCurrentPage - 1);
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
                      isActive={item === resolvedCurrentPage}
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
                    handleGoToPage(resolvedCurrentPage + 1);
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
