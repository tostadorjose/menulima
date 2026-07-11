"use client";

const NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export default function WhatsAppButton() {
  if (!NUMBER) return null;

  return (
    <a
      href={`https://wa.me/${NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current">
        <path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.25.62 4.36 1.7 6.17L4 29l7.98-1.65a12 12 0 0 0 4.06.7c6.64 0 12.04-5.4 12.04-12.04C28.08 8.4 22.68 3 16.04 3Zm0 21.8c-1.32 0-2.6-.28-3.77-.83l-.27-.13-4.73.98.98-4.6-.17-.28a9.75 9.75 0 0 1-1.5-5.2c0-5.4 4.4-9.8 9.8-9.8s9.8 4.4 9.8 9.8-4.4 9.8-9.8 9.8Zm5.38-7.34c-.29-.15-1.73-.85-2-.95-.27-.1-.47-.15-.66.15-.2.29-.76.95-.93 1.15-.17.2-.34.22-.63.07-.29-.15-1.23-.45-2.34-1.44-.87-.77-1.45-1.73-1.62-2.02-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.5.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.52-.07-.15-.66-1.59-.9-2.17-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.52.07-.79.37-.27.29-1.03 1.01-1.03 2.46 0 1.45 1.06 2.85 1.2 3.05.15.2 2.09 3.19 5.06 4.47.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.08 1.73-.71 1.97-1.39.24-.68.24-1.27.17-1.39-.07-.12-.27-.2-.56-.35Z" />
      </svg>
    </a>
  );
}
