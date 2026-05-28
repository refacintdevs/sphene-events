"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function HeroSearchForm() {
  const router = useRouter();
  const [category, setCategory] = useState("ALL");
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category !== "ALL") params.set("category", category);
    if (query.trim()) params.set("q", query.trim());
    const qs = params.toString();
    router.push(qs ? `/vendors?${qs}` : "/vendors");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-2 shadow-lg"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger
            className="h-11 min-w-0 border-0 bg-transparent shadow-none focus:ring-0 focus-visible:ring-0 sm:w-48 sm:shrink-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            <SelectItem value="CATERING">Catering</SelectItem>
            <SelectItem value="DECORATION">Decoration</SelectItem>
            <SelectItem value="PHOTOGRAPHY">Photography</SelectItem>
          </SelectContent>
        </Select>

        <div className="hidden h-8 w-px bg-border sm:block" aria-hidden="true" />

        <div className="flex flex-1 items-center gap-2">
          <Input
            type="text"
            placeholder="Location or keyword…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <Button type="submit" className="h-11 shrink-0 px-5">
            <Search className="mr-2 h-4 w-4" aria-hidden="true" />
            Find vendors
          </Button>
        </div>
      </div>
    </form>
  );
}
