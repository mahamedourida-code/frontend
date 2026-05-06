const acceptedImageExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".svg",
  ".heic",
  ".heif",
];

export const acceptedUploadMimeTypes = "image/*,image/heic,image/heif,application/pdf,.pdf";

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function isAcceptedUploadFile(file: File): boolean {
  if (file.type?.startsWith("image/")) return true;
  if (isPdfFile(file)) return true;

  const fileName = file.name.toLowerCase();
  return acceptedImageExtensions.some((extension) => fileName.endsWith(extension));
}

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function createPdfPreviewDataUrl(filename: string): string {
  const shortName = escapeSvgText(filename.length > 26 ? `${filename.slice(0, 23)}...` : filename);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">
      <rect width="480" height="480" fill="#f6f0ff"/>
      <rect x="118" y="58" width="244" height="332" rx="28" fill="#ffffff" stroke="#d9c9fb" stroke-width="8"/>
      <path d="M304 58v78c0 16 13 29 29 29h29" fill="none" stroke="#a78bfa" stroke-width="8" stroke-linecap="round"/>
      <rect x="150" y="206" width="180" height="34" rx="17" fill="#441f84"/>
      <text x="240" y="230" text-anchor="middle" font-family="Arial, sans-serif" font-size="21" font-weight="700" fill="#ffffff">PDF</text>
      <rect x="154" y="274" width="172" height="12" rx="6" fill="#d9c9fb"/>
      <rect x="154" y="306" width="132" height="12" rx="6" fill="#d9c9fb"/>
      <text x="240" y="426" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="600" fill="#2f165e">${shortName}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
