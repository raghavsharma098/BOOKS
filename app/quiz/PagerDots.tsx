'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Admin panel content interface
interface PageContent {
  routes: string[];
}

const defaultContent: PageContent = {
  routes: ['/quiz', '/quiz/quiz2', '/quiz/quiz3'],
};

export default function PagerDots(): JSX.Element {
  const pathname = usePathname() ?? '/quiz';
  const router = useRouter();
  const [content] = React.useState<PageContent>(defaultContent);
  const activeIndex = Math.max(0, content.routes.indexOf(pathname));

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {content.routes.map((route, i) => {
        const isActive = i === activeIndex;
        return (
          <span
            key={route}
            role="button"
            tabIndex={0}
            onClick={() => router.push(route)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') router.push(route);
            }}
            className={`
              block cursor-pointer transition-all duration-200
              ${isActive
                ? 'w-5 sm:w-6 h-2.5 sm:h-3 rounded-full bg-[#5C2F1E]'
                : 'w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#D9CFC4] hover:bg-[#C5B9AC]'
              }
            `}
            aria-current={isActive ? 'step' : undefined}
            aria-label={`Go to step ${i + 1}`}
          />
        );
      })}
    </div>
  );
}
