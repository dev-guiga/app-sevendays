"use client";

import { useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import AvatarProfile from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { sevendaysapi } from "@/lib/sevendaysapi";
import { Info, MagnifyingGlass, MapPin, UserCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

type DiaryListItem = {
  id: number;
  title?: string;
  description?: string;
  professional?: {
    professional_description?: string;
    description?: string;
  };
  user_name?: string;
  user_email?: string;
  address?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  professional_branch?: string;
  professional_document?: string;
  professional_document_type?: string;
  professional_description?: string;
};

type DiaryListResponse = {
  success?: boolean;
  diaries?: DiaryListItem[];
  pagination?: {
    page?: number;
    per_page?: number;
    total_count?: number;
    total_pages?: number;
    has_prev?: boolean;
    has_next?: boolean;
  };
};

const PER_PAGE = 12;
const SKELETON_CARDS = 6;

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

function buildAddressText(diary: DiaryListItem) {
  const street = diary.address?.trim();
  const city = diary.city?.trim();
  const state = diary.state?.trim();

  if (street && city && state) {
    return `${street} • ${city}, ${state}`;
  }

  if (street) {
    return street;
  }

  if (city && state) {
    return `${city}, ${state}`;
  }

  return "Endereco nao informado";
}

function getProfessionalDescription(diary: DiaryListItem) {
  return (
    diary.professional_description?.trim() ||
    diary.professional?.professional_description?.trim() ||
    diary.professional?.description?.trim() ||
    "Sem descricao profissional informada."
  );
}

export default function PartnersCard() {
  const params = useParams<{ user?: string | string[] }>();
  const userSlug = Array.isArray(params?.user) ? params.user[0] : params?.user;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [appliedSearchText, setAppliedSearchText] = useState("");

  const diariesQuery = useQuery({
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
    if (!diariesQuery.isError) {
      return;
    }

    toast.error("Nao foi possivel carregar as agendas.");
  }, [diariesQuery.isError, diariesQuery.errorUpdatedAt]);

  useEffect(() => {
    if (!diariesQuery.data) {
      return;
    }

    if (diariesQuery.data.page !== currentPage) {
      setCurrentPage(diariesQuery.data.page);
    }
  }, [currentPage, diariesQuery.data]);

  const diaries = diariesQuery.data?.diaries ?? [];
  const totalPages = diariesQuery.data?.totalPages ?? 1;
  const totalCount = diariesQuery.data?.totalCount ?? 0;
  const hasPrev = diariesQuery.data?.hasPrev ?? false;
  const hasNext = diariesQuery.data?.hasNext ?? false;
  const isLoading = diariesQuery.isPending;

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

  const isEmptyState = !isLoading && diaries.length === 0;

  return (
    <div className="w-full max-w-7xl flex flex-col items-start justify-center gap-10 sm:mx-auto mx-0 px-4 p-15">
      <div className="w-full flex flex-col gap-3">
        <h1 className="text-2xl font-bold">Escolha a agenda que deseja acessar</h1>
        <form
          className="w-full flex items-center gap-2 sm:max-w-md"
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedSearchText(searchText.trim());
            setCurrentPage(1);
          }}
        >
          <Input
            placeholder="Buscar agenda por nome ou e-mail"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="w-full"
          />
          <Button type="submit" className="h-10 w-10 shrink-0 p-0" aria-label="Pesquisar agenda">
            <MagnifyingGlass size={16} />
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: SKELETON_CARDS }).map((_, index) => (
            <Card
              key={`diary-skeleton-${index}`}
              className="w-full border-solid border border-border rounded-md py-5"
            >
              <CardHeader className="flex flex-row items-center justify-center pb-2">
                <Skeleton className="h-28 w-28 rounded-full" />
              </CardHeader>
              <Separator className="w-full h-[1px] bg-border" />
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <Separator className="w-full h-[1px] bg-border" />
              <CardFooter className="pt-4">
                <Skeleton className="h-12 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : isEmptyState ? (
        <div className="w-full py-20 flex items-center justify-center text-muted-foreground">
          Nenhuma agenda encontrada.
        </div>
      ) : (
        <>
          <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {diaries.map((diary) => {
              const href = userSlug ? `/${userSlug}/portal/e/${diary.id}` : "#";
              const ownerName = diary.user_name?.trim() || diary.title?.trim() || "Agenda";

              return (
                <Link
                  href={href}
                  key={diary.id}
                  className="flex w-full justify-center"
                >
                  <Card className="w-full max-w-[300px] min-h-[290px] flex flex-col gap-2 border-solid border border-border rounded-md py-5 hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-center pb-2">
                      <AvatarProfile
                        src="https://github.com/shadcn.png"
                        className="w-24 rounded-full border-solid border-2 border-primary/50"
                      />
                    </CardHeader>

                    <Separator className="w-full h-[1px] bg-border" />

                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-row items-center gap-2">
                          <UserCircle size={20} className="text-primary" />
                          <span className="text-sm font-light text-muted-foreground">
                            {ownerName}
                          </span>
                        </div>

                        <div className="flex flex-row items-start gap-2">
                          <MapPin size={20} className="text-primary mt-0.5 shrink-0" />
                          <span className="text-sm font-light text-muted-foreground">
                            {buildAddressText(diary)}
                          </span>
                        </div>
                      </div>
                    </CardContent>

                    <Separator className="w-full h-[1px] bg-border" />

                    <CardFooter className="min-h-[100px] flex flex-col gap-2 items-start justify-start">
                      <CardDescription className="flex flex-row gap-2 items-start justify-start">
                        <Info size={20} className="text-primary mt-0.5 shrink-0" />
                        <span className="w-full text-sm font-light text-muted-foreground">
                          {getProfessionalDescription(diary)}
                        </span>
                      </CardDescription>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>

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
        </>
      )}
    </div>
  );
}
