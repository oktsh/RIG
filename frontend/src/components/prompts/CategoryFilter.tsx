"use client";

import { useState } from "react";

const categories = [
  "Все",
  "Исследование",
  "Код",
  "Архитектура",
  "Тестирование",
  "Продукт",
];

export default function CategoryFilter() {
  const [active, setActive] = useState("Все");

  return (
    <div className="flex gap-0 mb-8 border-b-2 border-black">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${
            active === cat
              ? "bg-black text-white border-r border-white"
              : "bg-white border-r border-black text-[#444] hover:bg-[#FFE600] hover:text-black"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
