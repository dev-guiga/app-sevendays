"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { sevendaysapi } from "@/lib/sevendaysapi";
import type { DiaryListResponse } from "@/types/diary";

const PER_PAGE = 12;

export function useDiaries() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [appliedSearchText, setAppliedSearchText] = useState("");

  const query = useQuery({
    queryKey: ["diaries", currentPage, PER_PAGE, appliedSearchText],
    queryFn: async () => {
      const result = await sevendaysapi.get<DiaryListResponse>("/diaries", {
        withCredentials: true,
        params: {
          page: currentPage,
          per_page: PER_PAGE,
          ...(appliedSearchText ? { query: appliedSearchText } : {}),
        },
      });

      if (
        result.error ||
        result.statusCode !== 200 ||
        !result.data?.success ||
        !Array.isArray(result.data.diaries)
      ) {
        throw new Error("Nao foi possivel carregar as agendas.");
      }

      const pagination = result.data.pagination;
      return {
        diaries: result.data.diaries,
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
    if (!query.isError) {
      return;
    }

    toast.error("Nao foi possivel carregar as agendas.");
  }, [query.isError, query.errorUpdatedAt]);

  useEffect(() => {
    if (!query.data) {
      return;
    }

    if (query.data.page !== currentPage) {
      setCurrentPage(query.data.page);
    }
  }, [currentPage, query.data]);

  const applySearch = (text: string) => {
    setAppliedSearchText(text.trim());
    setCurrentPage(1);
  };

  return {
    diaries: query.data?.diaries ?? [],
    totalPages: query.data?.totalPages ?? 1,
    totalCount: query.data?.totalCount ?? 0,
    hasPrev: query.data?.hasPrev ?? false,
    hasNext: query.data?.hasNext ?? false,
    isPending: query.isPending,
    currentPage,
    setCurrentPage,
    searchText,
    setSearchText,
    applySearch,
  };
}
