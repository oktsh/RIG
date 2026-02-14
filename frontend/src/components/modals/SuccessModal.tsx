"use client";

interface SuccessModalProps {
  onClose: () => void;
}

export default function SuccessModal({ onClose }: SuccessModalProps) {
  return (
    <>
      <div className="flex items-start justify-between p-8 border-b-2 border-black bg-white">
        <div>
          <div className="flex gap-2 mb-4">
            <span className="bg-[#FFE600] text-black text-[10px] font-bold px-2 py-1 font-mono uppercase border border-black">
              УСПЕХ
            </span>
          </div>
          <h2 className="text-3xl font-bold text-black uppercase tracking-tight">
            Предложение Отправлено!
          </h2>
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

      <div className="p-16 bg-[#FAFAFA] text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-[#FFE600] border-2 border-black mx-auto mb-8 flex items-center justify-center shadow-[6px_6px_0px_#000]">
          <svg
            className="w-12 h-12 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h3 className="text-2xl font-bold text-black mb-4 uppercase tracking-tight">
          Отлично!
        </h3>
        <p className="text-base text-[#555] mb-8 font-medium max-w-md leading-relaxed">
          Спасибо за ваш вклад в сообщество RIG. Мы рассмотрим ваше предложение
          и свяжемся с вами по указанному email.
        </p>

        <div className="bg-white border-2 border-black p-6 mb-8 w-full max-w-md">
          <div className="text-xs font-mono font-bold text-black uppercase tracking-wider mb-2">
            Что дальше?
          </div>
          <ul className="text-sm text-[#444] font-medium space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-[#FFE600] font-bold">&rarr;</span>
              <span>Модерация в течение 24-48 часов</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFE600] font-bold">&rarr;</span>
              <span>Уведомление на email о статусе</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFE600] font-bold">&rarr;</span>
              <span>Публикация в библиотеке RIG</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-6 border-t-2 border-black bg-white flex justify-center">
        <button
          onClick={onClose}
          className="btn-primary px-10 py-3 text-xs font-bold"
        >
          Вернуться к Платформе
        </button>
      </div>
    </>
  );
}
