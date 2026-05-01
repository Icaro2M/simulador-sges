export function formatNumber(value: unknown, decimals = 2): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(value: unknown): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatPercent(value: unknown, decimals = 2): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return `${(value * 100).toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}


export function formatEnergy(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
  })} kWh`;
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
  })}%`;
}