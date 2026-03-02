"use client";

import { useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { DatePickerSimple } from "@/components/DatePickerSimple";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sevendaysapi } from "@/lib/sevendaysapi";
import { CaretDown, MagnifyingGlass, Trash } from "@phosphor-icons/react";
import { addDays, format } from "date-fns";
import { toast } from "sonner";

type UserSchedulingStatus = "available" | "marked" | "pending" | "cancelled";
type UserSchedulingFilterStatus = "all" | "marked" | "cancelled";
type SortDirection = "asc" | "desc";
type SortField = "professional_name" | "diary_title" | "date" | "time";

type UserScheduling = {
  id: number;
  diary_id: number;
  diary_title?: string;
  professional_name?: string;
  professional_email?: string;
  date?: string;
  time?: string;
  status?: UserSchedulingStatus;
};

type PaginatedUserSchedulingsResponse = {
  success?: boolean;
  schedulings?: UserScheduling[];
  pagination?: {
    page?: number;
    per_page?: number;
    total_count?: number;
    total_pages?: number;
    has_prev?: boolean;
    has_next?: boolean;
  };
};

type CancelSchedulingResponse = {
  success?: boolean;
};

const PER_PAGE = 20;
const SKELETON_ROWS = 20;
const DEFAULT_SORT_FIELD: SortField = "date";
const DEFAULT_SORT_DIRECTION: SortDirection = "desc";
const DEFAULT_STATUS_FILTER: UserSchedulingFilterStatus = "marked";

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

function getStatusLabel(status?: UserSchedulingStatus) {
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

function getStatusDotClassName(status?: UserSchedulingStatus) {
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

function extractApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error && typeof error === "object") {
    const candidate = error as {
      error?: {
        message?: string;
      };
      message?: string;
    };

    if (
      typeof candidate.error?.message === "string" &&
      candidate.error.message.trim().length > 0
    ) {
      return candidate.error.message;
    }

    if (
      typeof candidate.message === "string" &&
      candidate.message.trim().length > 0
    ) {
      return candidate.message;
    }
  }

  return fallback;
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

export function TableUserSchedulings() {
  const [isCancelling, setIsCancelling] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>(DEFAULT_SORT_FIELD);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    DEFAULT_SORT_DIRECTION,
  );
  const [searchText, setSearchText] = useState("");
  const [appliedSearchText, setAppliedSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserSchedulingFilterStatus>(
    DEFAULT_STATUS_FILTER,
  );
  const [startDateFilter, setStartDateFilter] = useState<Date>(
    buildDefaultStartDate,
  );
  const [endDateFilter, setEndDateFilter] = useState<Date>(buildDefaultEndDate);

  const [cancellingScheduling, setCancellingScheduling] =
    useState<UserScheduling | null>(null);

  const startDateFilterValue = useMemo(
    () => format(startDateFilter, "yyyy-MM-dd"),
    [startDateFilter],
  );
  const endDateFilterValue = useMemo(
    () => format(endDateFilter, "yyyy-MM-dd"),
    [endDateFilter],
  );

  const userSchedulingsQuery = useQuery({
    queryKey: [
      "user-schedulings",
      reloadToken,
      currentPage,
      PER_PAGE,
      statusFilter,
      appliedSearchText,
      startDateFilterValue,
      endDateFilterValue,
    ],
    queryFn: async () => {
      const result = await sevendaysapi.get<PaginatedUserSchedulingsResponse>(
        "/user/schedulings",
        {
          withCredentials: true,
          params: {
            page: currentPage,
            per_page: PER_PAGE,
            ...(statusFilter ? { status: statusFilter } : {}),
            ...(appliedSearchText ? { query: appliedSearchText } : {}),
            ...(startDateFilter ? { date_from: startDateFilterValue } : {}),
            ...(endDateFilter ? { date_to: endDateFilterValue } : {}),
          },
        },
      );

      if (
        result.error ||
        result.statusCode !== 200 ||
        !result.data?.success ||
        !Array.isArray(result.data.schedulings)
      ) {
        throw new Error("Nao foi possivel carregar seus horarios agendados.");
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
    if (!userSchedulingsQuery.isError) {
      return;
    }

    toast.error("Nao foi possivel carregar seus horarios agendados.");
  }, [userSchedulingsQuery.isError, userSchedulingsQuery.errorUpdatedAt]);

  useEffect(() => {
    if (!userSchedulingsQuery.data) {
      return;
    }

    if (userSchedulingsQuery.data.page !== currentPage) {
      setCurrentPage(userSchedulingsQuery.data.page);
    }
  }, [currentPage, userSchedulingsQuery.data]);

  const schedulings = useMemo(
    () => userSchedulingsQuery.data?.schedulings ?? [],
    [userSchedulingsQuery.data?.schedulings],
  );
  const totalPages = userSchedulingsQuery.data?.totalPages ?? 1;
  const totalCount = userSchedulingsQuery.data?.totalCount ?? 0;
  const hasPrev = userSchedulingsQuery.data?.hasPrev ?? false;
  const hasNext = userSchedulingsQuery.data?.hasNext ?? false;
  const isLoading = userSchedulingsQuery.isPending;

  const sortedSchedulings = useMemo(() => {
    const items = [...schedulings];
    const factor = sortDirection === "asc" ? 1 : -1;

    const normalizeText = (value?: string) => value?.trim().toLowerCase() ?? "";
    const normalizeDate = (value?: string) => {
      if (!value) {
        return "";
      }

      const isoDateMatch = value.match(/^\d{4}-\d{2}-\d{2}$/);
      return isoDateMatch ? value : value.slice(0, 10);
    };
    const normalizeTime = (value?: string) => {
      if (!value) {
        return -1;
      }

      const match = value.match(/(\d{2}):(\d{2})/);
      if (!match) {
        return -1;
      }

      return Number(match[1]) * 60 + Number(match[2]);
    };

    items.sort((left, right) => {
      if (sortField === "date") {
        const leftValue = normalizeDate(left.date);
        const rightValue = normalizeDate(right.date);
        return leftValue.localeCompare(rightValue) * factor;
      }

      if (sortField === "time") {
        return (normalizeTime(left.time) - normalizeTime(right.time)) * factor;
      }

      if (sortField === "diary_title") {
        return (
          normalizeText(left.diary_title).localeCompare(
            normalizeText(right.diary_title),
          ) * factor
        );
      }

      return (
        normalizeText(left.professional_name).localeCompare(
          normalizeText(right.professional_name),
        ) * factor
      );
    });

    return items;
  }, [schedulings, sortDirection, sortField]);

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  };

  const getCaretClassName = (field: SortField) => {
    const isActive = sortField === field;
    const directionClass =
      isActive && sortDirection === "asc" ? "rotate-180" : "rotate-0";

    return `transition-transform ${directionClass} ${isActive ? "opacity-100" : "opacity-45"}`;
  };

  const isEmptyState = !isLoading && schedulings.length === 0;

  const closeCancelDialog = () => {
    if (isCancelling) {
      return;
    }

    setCancellingScheduling(null);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingScheduling) {
      return;
    }

    setIsCancelling(true);

    const result = await sevendaysapi.delete<CancelSchedulingResponse>(
      `/diaries/${cancellingScheduling.diary_id}/schedulings/${cancellingScheduling.id}`,
      undefined,
      {
        withCredentials: true,
      },
    );

    if (result.error || result.statusCode !== 200 || !result.data?.success) {
      toast.error(
        extractApiErrorMessage(
          result.error,
          "Nao foi possivel excluir o horario agendado.",
        ),
      );
      setIsCancelling(false);
      return;
    }

    toast.success("Horario agendado excluido com sucesso.");
    setIsCancelling(false);
    closeCancelDialog();
    setReloadToken((previous) => previous + 1);
  };

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
            placeholder="Buscar por profissional, e-mail ou agenda"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="w-full"
          />
          <Button
            type="submit"
            className="h-10 w-10 shrink-0 p-0"
            aria-label="Pesquisar"
          >
            <MagnifyingGlass size={16} />
          </Button>
        </div>

        <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2">
          <DatePickerSimple
            id="user-table-filter-start-date"
            label="Data inicial"
            labelClassName="sr-only"
            placeholder="Data inicial"
            className="w-full sm:w-40"
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
            id="user-table-filter-end-date"
            label="Data final"
            labelClassName="sr-only"
            placeholder="Data final"
            className="w-full sm:w-40"
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

      <Table className="[&_thead_tr]:border-border [&_tbody_tr]:border-border [&_tbody_td]:text-foreground">
        <TableHeader>
          <TableRow>
            <TableHead>
              <button
                type="button"
                className="inline-flex w-full items-center justify-between text-xs font-medium uppercase tracking-wide text-foreground"
                onClick={() => handleSort("professional_name")}
              >
                Profissional
                <CaretDown
                  size={12}
                  className={getCaretClassName("professional_name")}
                />
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                className="inline-flex w-full items-center justify-between text-xs font-medium uppercase tracking-wide text-foreground"
                onClick={() => handleSort("diary_title")}
              >
                Agenda
                <CaretDown
                  size={12}
                  className={getCaretClassName("diary_title")}
                />
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
            <TableHead className="w-36">
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
                      setStatusFilter(value as UserSchedulingFilterStatus);
                      setCurrentPage(1);
                    }}
                  >
                    <DropdownMenuRadioItem value="all">
                      Todos
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="marked">
                      Agendado
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="cancelled">
                      Cancelado
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableHead>
            <TableHead>
              <span
                className="inline-flex w-full items-center justify-end text-xs font-medium uppercase tracking-wide text-foreground"
                style={{ fontFamily: "var(--rationale-font)" }}
              >
                Ações
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
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
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : isEmptyState ? (
            <TableRow>
              <TableCell colSpan={6} className="p-0">
                <div className="h-60 w-full flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Sem horarios agendados para os filtros aplicados.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            sortedSchedulings.map((scheduling) => {
              const canDelete = scheduling.status === "marked";

              return (
                <TableRow key={scheduling.id}>
                  <TableCell className="font-medium text-foreground">
                    <div className="flex flex-col">
                      <span className="text-foreground">
                        {scheduling.professional_name || "Profissional"}
                      </span>
                      <span className="text-xs text-foreground">
                        {scheduling.professional_email || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{scheduling.diary_title || "Agenda"}</TableCell>
                  <TableCell>{formatDate(scheduling.date)}</TableCell>
                  <TableCell>{formatTime(scheduling.time)}</TableCell>
                  <TableCell className="w-36 text-foreground">
                    <div className="inline-flex items-center gap-2">
                      <span
                        className={`inline-block h-1 w-1 rounded-full ${getStatusDotClassName(scheduling.status)}`}
                      />
                      <span className="capitalize text-foreground">
                        {getStatusLabel(scheduling.status)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Excluir horario agendado"
                        onClick={() => setCancellingScheduling(scheduling)}
                        disabled={!canDelete}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {!isLoading && !isEmptyState ? (
        <div className="w-full flex flex-col gap-2">
          <p className="text-sm text-muted-foreground text-center">
            Pagina {currentPage} de {totalPages} • {totalCount} agendamento(s)
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
                  className={
                    !hasPrev ? "pointer-events-none opacity-50" : undefined
                  }
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
                  className={
                    !hasNext ? "pointer-events-none opacity-50" : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}

      <Dialog
        open={Boolean(cancellingScheduling)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeCancelDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir horario agendado</DialogTitle>
            <DialogDescription>
              Deseja excluir este horario? O status sera alterado para
              cancelado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeCancelDialog}
              disabled={isCancelling}
            >
              Nao
            </Button>
            <Button onClick={handleConfirmCancel} disabled={isCancelling}>
              {isCancelling ? "Excluindo..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
