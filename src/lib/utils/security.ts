import { createHash } from "crypto";
import { headers } from "next/headers";

/**
 * Gera hash SHA-256 do email fornecido
 * @param email - Email a ser hasheado
 * @returns Hash SHA-256 em hexadecimal
 */
export function hashEmail(email: string): string {
  return createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
}

/**
 * Extrai informações do dispositivo dos headers da requisição
 * @returns Objeto com IP, browser e OS
 */
export async function getDeviceInfo(): Promise<{
  ip: string;
  browser: string;
  os: string;
}> {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "Unknown";
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const cfConnectingIp = headersList.get("cf-connecting-ip"); // Cloudflare

  // Obter IP (prioridade: Cloudflare > X-Forwarded-For > X-Real-IP)
  let ip = "Unknown";
  if (cfConnectingIp) {
    ip = cfConnectingIp.split(",")[0].trim();
  } else if (forwardedFor) {
    ip = forwardedFor.split(",")[0].trim();
  } else if (realIp) {
    ip = realIp.trim();
  }

  // Parsing básico do User-Agent para browser
  let browser = "Unknown";
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    browser = "Chrome";
  } else if (userAgent.includes("Firefox")) {
    browser = "Firefox";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    browser = "Safari";
  } else if (userAgent.includes("Edg")) {
    browser = "Edge";
  } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
    browser = "Opera";
  }

  // Parsing básico do User-Agent para OS
  let os = "Unknown";
  if (userAgent.includes("Windows")) {
    os = "Windows";
  } else if (userAgent.includes("Mac OS X") || userAgent.includes("Macintosh")) {
    os = "macOS";
  } else if (userAgent.includes("Linux")) {
    os = "Linux";
  } else if (userAgent.includes("Android")) {
    os = "Android";
  } else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    os = "iOS";
  }

  return { ip, browser, os };
}

