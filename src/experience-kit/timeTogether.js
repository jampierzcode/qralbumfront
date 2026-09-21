// "Desde el 21 de septiembre de 2023 · 2 años y 3 días": lo usan las plantillas con "fecha especial".
const dateFmt = new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function timeTogether(isoDate) {
  if (!isoDate) return null;
  const start = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime())) return null;
  const now = new Date();
  const label = dateFmt.format(start);
  if (start > now) {
    const days = Math.ceil((start - now) / 86400000);
    return { label, text: days === 1 ? "Falta 1 día" : `Faltan ${days} días` };
  }
  let years = now.getUTCFullYear() - start.getUTCFullYear();
  let months = now.getUTCMonth() - start.getUTCMonth();
  let days = now.getUTCDate() - start.getUTCDate();
  if (days < 0) {
    months -= 1;
    days += new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)).getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const parts = [
    years && `${years} ${years === 1 ? "año" : "años"}`,
    months && `${months} ${months === 1 ? "mes" : "meses"}`,
    days && `${days} ${days === 1 ? "día" : "días"}`,
  ].filter(Boolean);
  const text = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} y ${parts.at(-1)}` : parts[0] || "Hoy";
  return { label, text };
}
