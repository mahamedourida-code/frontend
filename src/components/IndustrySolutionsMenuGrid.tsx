import Link from "next/link";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { industrySolutions } from "@/lib/industry-solutions";

export function IndustrySolutionsMenuGrid() {
  return (
    <div className="grid w-[860px] grid-cols-2 gap-3 p-5">
      {industrySolutions.map((solution) => (
        <NavigationMenuLink asChild key={solution.slug}>
          <Link
            href={`/solutions/${solution.slug}`}
            className="group flex min-h-[112px] select-none items-center gap-4 rounded-[22px] border border-transparent bg-white/35 p-4 leading-none no-underline outline-none transition-all hover:border-white/70 hover:bg-white/70 hover:shadow-[0_16px_45px_rgba(42,35,64,0.10)] focus:bg-white/70"
          >
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] border border-white/60 bg-white/55 p-2 shadow-sm">
              <img
                src={solution.cardAsset}
                alt=""
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-semibold leading-tight text-[#111827]">
                {solution.title}
              </span>
              <span className="mt-2 line-clamp-2 block text-sm leading-5 text-[#111827]/75">
                {solution.summary}
              </span>
            </span>
          </Link>
        </NavigationMenuLink>
      ))}
    </div>
  );
}
