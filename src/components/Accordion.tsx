'use client';

import { useState } from 'react';

export type AccordionItemData = {
  id: string;
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
};

type AccordionProps = {
  items: AccordionItemData[];
};

export default function Accordion({ items }: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    new Set(items.filter((item) => item.defaultOpen).map((item) => item.id))
  );

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="product-accordion mt-16 border-t border-neutral-100">
      {items.map((item) => {
        const isOpen = openIds.has(item.id);

        return (
          <div key={item.id} className="product-accordion-item border-b border-neutral-100 py-5">
            <button
              type="button"
              className="flex justify-between items-center w-full text-left cursor-pointer"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
            >
              <span className="font-semibold">{item.title}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="transition-transform duration-200"
                style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
              >
                <path
                  d="M9 6l6 6-6 6"
                  stroke="#1a1a1a"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isOpen && <div className="mt-5 text-base leading-[22.4px] font-normal text-neutral-950">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}