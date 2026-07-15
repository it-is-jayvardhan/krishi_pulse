"use client";

import * as React from "react";
import { Star, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";



export function Navbar() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className=" z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <nav className="section-container flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sprout className="h-4.5 w-4.5" />
          </div>
          <span className="font-[var(--font-jakarta)] text-base font-bold leading-none">
            Krishi<span className="text-primary">Pulse</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* <div className="relative"> */}
            {/* <Button
              variant="ghost"
              size="icon"
              aria-label="Favorites"
              onClick={() => setOpen((o) => !o)}
            >
              <Star className={cn(favorites.length > 0 && "fill-primary text-primary")} />
            </Button> */}
            {/* {open && (
              <div className="absolute right-0 top-10 w-52 rounded-xl border border-border bg-card p-2 text-sm shadow-lg ring-1 ring-foreground/10">
                {favorites.length === 0 ? (
                  <p className="p-2 text-muted-foreground">
                    No favorites yet. Star a commodity from the filter bar.
                  </p>
                ) : (
                  favorites.map((f) => (
                    <div key={f} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      {f}
                    </div>
                  ))
                )}
              </div>
            )} */}
          {/* </div> */}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
