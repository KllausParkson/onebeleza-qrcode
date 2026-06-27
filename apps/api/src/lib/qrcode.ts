import QRCode from "qrcode";

export async function generateQRCodePNG(url: string): Promise<Buffer> {
  const buffer = await QRCode.toBuffer(url, {
    type: "png",
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  });
  return buffer;
}

export async function generateQRCodeSVG(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    margin: 2,
    errorCorrectionLevel: "M",
  });
}

export async function generateQRCodeDataURL(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    type: "image/png",
    width: 300,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}
