import Link from "next/link";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { industrySolutions } from "@/lib/industry-solutions";

export function IndustrySolutionsMenuGrid() {
  return (
    <div className="grid w-[520px] grid-cols-4 gap-x-4 gap-y-5 p-5">
      {industrySolutions.map((solution) => (
        <NavigationMenuLink asChild key={solution.slug}>
          <Link
            href={`/solutions/${solution.slug}`}
            className="group flex select-none flex-col items-center gap-2 rounded-[16px] p-2 text-center leading-none no-underline outline-none transition-colors hover:bg-white/45 focus:bg-white/45"
          >
            <img
              src={solution.cardAsset}
              alt=""
              className="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="min-h-[34px] text-sm font-semibold leading-[1.2] text-[#111827]">
              {solution.title}
            </span>
          </Link>
        </NavigationMenuLink>
      ))}
    </div>
  );
}
