import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/hooks/use-theme";
import type { Language } from "@/i18n/i18n";
import {
  EXIT_INTENT_DISMISSED_KEY,
  EXIT_INTENT_POPPED_KEY,
  shouldSuppressExitIntent,
} from "@/lib/exit-intent";
import type { Dictionary } from "@/lib/types";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

interface ExitIntentProps {
  lang: Language;
  t: Dictionary;
}

export function ExitIntent({ lang, t }: ExitIntentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (shouldSuppressExitIntent()) return;

    const handleMouseLeave = (event: MouseEvent) => {
      if (event.clientY >= 20) return;
      if (shouldSuppressExitIntent()) return;

      sessionStorage.setItem(EXIT_INTENT_POPPED_KEY, "true");
      setIsOpen(true);
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      sessionStorage.setItem(EXIT_INTENT_DISMISSED_KEY, "true");
    }
  };

  const handleLinkClick = () => {
    sessionStorage.setItem(EXIT_INTENT_DISMISSED_KEY, "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <div className="hidden" aria-hidden="true">
        <img
          src={`/exit-cat-${theme}.webp`}
          alt=""
          width={300}
          height={300}
          fetchPriority="high"
        />
      </div>
      <DialogContent className="sm:max-w-[25rem]">
        <div className="pointer-events-none absolute top-0 -left-26 z-10 flex size-28 items-center justify-center">
          <img
            src={`/exit-cat-${theme}.webp`}
            alt={t["Sad cat waiting for your doodle"]}
            width={300}
            height={300}
            className="h-full w-full object-contain drop-shadow-2xl"
          />
        </div>

        <DialogHeader className="flex flex-col items-center gap-3 text-center">
          <DialogTitle className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
            {t["Leave a mark"]}
          </DialogTitle>
          <DialogDescription className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {
              t[
                "Hundreds of visitors have scribbled on the wall. Your turn — draw, write, or just leave a weird little mark."
              ]
            }
          </DialogDescription>
        </DialogHeader>

        <Button
          className="group"
          nativeButton={false}
          render={<a href={`/${lang}/visitors`} onClick={handleLinkClick} />}
        >
          {t["add yours"]}
          <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
