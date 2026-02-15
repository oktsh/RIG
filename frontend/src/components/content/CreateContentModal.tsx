"use client";

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateContentModal({
  isOpen,
  onClose,
}: CreateContentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-2xl bg-white border-2 border-black shadow-[10px_10px_0px_#000] flex flex-col">
        <div className="p-6 border-b-2 border-black flex justify-between items-center bg-black text-white">
          <h2 className="text-xl font-display font-bold uppercase">
            Создать Публикацию
          </h2>
          <button onClick={onClose} className="hover:text-[#FFE600]">
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

        <div className="p-8 space-y-6">
          <div>
            <label className="block font-mono text-[10px] font-bold uppercase mb-2">
              Название
            </label>
            <input
              type="text"
              className="w-full border-2 border-black p-3 font-display text-lg focus:outline-none focus:bg-[#FFE600]/10"
              placeholder="ENTER TITLE..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase mb-2">
                Тип
              </label>
              <select className="w-full border-2 border-black p-3 appearance-none bg-white font-bold uppercase text-xs focus:outline-none">
                <option>Промпт</option>
                <option>Гайд</option>
                <option>Агент</option>
                <option>Правила</option>
              </select>
            </div>
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase mb-2">
                Теги
              </label>
              <input
                type="text"
                className="w-full border-2 border-black p-3 text-xs focus:outline-none"
                placeholder="ARCH, CODE, PROD..."
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-bold uppercase mb-2">
              Содержимое (Markdown/Code)
            </label>
            <textarea
              rows={8}
              className="w-full border-2 border-black p-4 font-mono text-xs focus:outline-none resize-none"
              placeholder="INSERT CONTENT HERE..."
            />
          </div>
        </div>

        <div className="p-6 border-t-2 border-black flex justify-end gap-3 bg-[#FAFAFA]">
          <button
            onClick={onClose}
            className="px-6 py-3 text-xs font-bold uppercase border border-black bg-transparent text-black hover:bg-black hover:text-white transition-all"
          >
            Отмена
          </button>
          <button
            onClick={onClose}
            className="btn-primary px-6 py-3 text-xs font-bold"
          >
            Опубликовать
          </button>
        </div>
      </div>
    </div>
  );
}
