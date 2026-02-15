"use client";

import { useState } from "react";
import { submitProposal } from "@/lib/api";

interface JoinModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const contentTypes = [
  { type: "prompt", label: "Промпт", icon: "\u{1F4AC}" },
  { type: "agent", label: "Агент", icon: "\u{1F916}" },
  { type: "skill", label: "Скилл", icon: "\u26A1" },
  { type: "guide", label: "Гайд", icon: "\u{1F4D6}" },
];

export default function JoinModal({ onClose, onSuccess }: JoinModalProps) {
  const [selectedContentType, setSelectedContentType] = useState<string | null>(
    null,
  );
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    email: "",
    tags: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedContentType) {
      alert("Пожалуйста, выберите тип контента");
      return;
    }

    if (
      !formData.title ||
      !formData.description ||
      !formData.content ||
      !formData.email
    ) {
      alert("Пожалуйста, заполните все обязательные поля");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Пожалуйста, введите корректный email");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const tagsArray = formData.tags
      ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    try {
      await submitProposal({
        type: selectedContentType,
        title: formData.title,
        description: formData.description,
        content: formData.content,
        email: formData.email,
        tags: tagsArray,
      });

      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Не удалось отправить предложение";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <div className="flex items-start justify-between p-8 border-b-2 border-black bg-white">
        <div>
          <div className="flex gap-2 mb-4">
            <span className="bg-black text-white text-[10px] font-bold px-2 py-1 font-mono uppercase">
              ВКЛАД
            </span>
            <span className="bg-[#FFE600] text-black text-[10px] font-bold px-2 py-1 font-mono uppercase border border-black">
              СООБЩЕСТВО
            </span>
          </div>
          <h2 className="text-3xl font-bold text-black uppercase tracking-tight">
            Предложить Контент
          </h2>
          <p className="text-sm text-[#555] mt-2 font-medium">
            Поделитесь своим промптом, агентом, скиллом или гайдом с сообществом
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-black hover:bg-[#F0F0F0] p-2 border border-transparent hover:border-black transition-all"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-8 overflow-y-auto max-h-[65vh] bg-[#FAFAFA] space-y-6">
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-3">
            Тип Контента
          </label>
          <div className="grid grid-cols-4 gap-3">
            {contentTypes.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => setSelectedContentType(type)}
                className={`${selectedContentType === type ? "border-4 bg-[#FFE600]" : "border-2 bg-white"} border-black px-4 py-3 text-xs font-bold uppercase hover:bg-[#FFE600] transition-colors`}
              >
                <div className="text-xl mb-1">{icon}</div>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-2">
            Название
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Введите название..."
            className="w-full bg-white border-2 border-black text-black text-sm px-4 py-3 font-medium focus:outline-none focus:border-black focus:ring-2 focus:ring-[#FFE600]"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-2">
            Описание
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
            placeholder="Краткое описание вашего предложения..."
            className="w-full bg-white border-2 border-black text-black text-sm px-4 py-3 font-medium focus:outline-none focus:border-black focus:ring-2 focus:ring-[#FFE600] resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-2">
            Контент / Код
          </label>
          <div className="bg-white border-2 border-black">
            <div className="bg-[#F0F0F0] border-b border-black px-4 py-2 flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold uppercase">
                CONTENT.MD
              </span>
              <span className="text-[9px] font-mono text-[#666]">
                MARKDOWN / CODE
              </span>
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              rows={8}
              placeholder="Вставьте ваш промпт, код агента, или содержимое гайда..."
              className="w-full bg-white text-black text-sm px-4 py-3 font-mono focus:outline-none resize-none border-0"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-white border-2 border-black text-black text-sm px-4 py-3 font-medium focus:outline-none focus:border-black focus:ring-2 focus:ring-[#FFE600]"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-2">
            Теги{" "}
            <span className="text-[#999] font-normal">(опционально)</span>
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => handleInputChange("tags", e.target.value)}
            placeholder="разработка, python, архитектура..."
            className="w-full bg-white border-2 border-black text-black text-sm px-4 py-3 font-medium focus:outline-none focus:border-black focus:ring-2 focus:ring-[#FFE600]"
          />
        </div>
      </div>

      <div className="p-6 border-t-2 border-black bg-white flex justify-between items-center">
        <div className="text-xs text-[#666] font-mono">
          {error ? (
            <span className="text-red-600 font-bold">{error}</span>
          ) : (
            <>
              <span className="font-bold text-black">Примечание:</span> Все
              предложения проходят модерацию
            </>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="btn-outline px-6 py-3 text-xs font-bold"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary px-8 py-3 text-xs font-bold disabled:opacity-50"
          >
            {isSubmitting ? "Отправка..." : "Отправить Предложение"}
          </button>
        </div>
      </div>
    </>
  );
}
