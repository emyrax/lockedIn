import { QRCodeSVG } from "qrcode.react";
import type { Cadet } from "../types";

interface Props {
  cadet: Cadet;
  url: string;
  onClose: () => void;
}

export default function QRCodeModal({ cadet, url, onClose }: Props) {
  const handlePrint = () => {
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    printWin.document.write(`
      <html>
        <head><title>QR - ${cadet.firstName} ${cadet.lastName}</title></head>
        <body style="text-align:center;font-family:sans-serif;padding-top:40px;">
          <h2>CADET I - Enugu Nsukka Chapter</h2>
          <h3>${cadet.firstName} ${cadet.lastName}</h3>
          <p>${cadet.rank} &middot; ${cadet.cadetId}</p>
          <div id="qr">${document.getElementById("qr-content")?.innerHTML ?? ""}</div>
          <p style="margin-top:20px;color:#666;font-size:12px;">${url}</p>
          <script>
            window.onload = function() { window.print(); window.close(); };
          <\/script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-80 rounded-xl bg-white p-6 text-center shadow-2xl">
        <h3 className="mb-2 text-lg font-bold text-gray-800">QR Code</h3>
        <p className="mb-4 text-sm text-gray-500">
          {cadet.firstName} {cadet.lastName}
        </p>

        <div id="qr-content" className="mb-4 flex justify-center">
          <QRCodeSVG value={url} size={200} />
        </div>

        <p className="mb-4 break-all text-xs text-gray-400">{url}</p>

        <div className="flex justify-center gap-3">
          <button
            onClick={handlePrint}
            className="rounded-lg bg-purple-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-600"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
