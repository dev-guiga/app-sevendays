"use client";

import { useMemo } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PaginationNavProps = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
};

function buildPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "left-ellipsis" | "right-ellipsis"> = [1];
  const start = Math.max(2, currentPage - 1);
  const ending = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    items.push("left-ellipsis");
  }

  for (let page = start; page <= ending; page += 1) {
    items.push(page);
  }

  if (ending < totalPages - 1) {
    items.push("right-ellipsis");
  }

  items.push(totalPages);
  return items;
}

export default function PaginationNav({
  currentPage,
  totalPages,
  totalCount,
  hasPrev,
  hasNext,
  onPageChange,
}: PaginationNavProps) {
  const paginationItems = useMemo(
    () => buildPaginationItems(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const handleGoToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    onPageChange(page);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <p className="text-sm text-muted-foreground text-center">
        Pagina {currentPage} de {totalPages} • {totalCount} agenda(s)
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
  );
}
