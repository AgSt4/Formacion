"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type SearchInputProps = {
  defaultValue?: string;
};

export function SearchInput({ defaultValue = "" }: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }

      startTransition(() => {
        const queryString = params.toString();
        router.replace(queryString ? `${pathname}?${queryString}` : pathname);
      });
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [pathname, router, searchParams, value]);

  return (
    <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
      <Search className="h-4 w-4 text-stone-500" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buscar por nombre o apellido..."
        className="w-full bg-transparent text-base outline-none placeholder:text-stone-400"
      />
    </label>
  );
}
