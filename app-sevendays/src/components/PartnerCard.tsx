"use client";

import { useParams } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";

import DiaryCard from "@/components/DiaryCard";
import DiaryCardSkeleton from "@/components/skeletons/DiaryCardSkeleton";
import PaginationNav from "@/components/PaginationNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useDiaries } from "@/hooks/useDiaries";

const SKELETON_CARDS = 6;

export default function PartnersCard() {
  const params = useParams<{ user?: string | string[] }>();
  const userSlug = Array.isArray(params?.user) ? params.user[0] : params?.user;

  const {
    diaries,
    totalPages,
    totalCount,
    hasPrev,
    hasNext,
    isPending,
    currentPage,
    setCurrentPage,
    searchText,
    setSearchText,
    applySearch,
  } = useDiaries();

  const isEmptyState = !isPending && diaries.length === 0;

  return (
    <div className="w-full max-w-7xl flex flex-col items-start justify-center gap-10 sm:mx-auto mx-0 px-4 p-15">
      <div className="w-full flex flex-col gap-3">
        <h1 className="text-2xl font-bold">Escolha a agenda que deseja acessar</h1>
        <form
          className="w-full flex items-center gap-2 sm:max-w-md"
          onSubmit={(event) => {
            event.preventDefault();
            applySearch(searchText);
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

      {isPending ? (
        <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: SKELETON_CARDS }).map((_, index) => (
            <DiaryCardSkeleton key={`diary-skeleton-${index}`} />
          ))}
        </div>
      ) : isEmptyState ? (
        <div className="w-full py-20 flex items-center justify-center text-muted-foreground">
          Nenhuma agenda encontrada.
        </div>
      ) : (
        <>
          <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {diaries.map((diary) => (
              <DiaryCard
                key={diary.id}
                diary={diary}
                href={userSlug ? `/${userSlug}/portal/e/${diary.id}` : "#"}
              />
            ))}
          </div>

          <PaginationNav
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
