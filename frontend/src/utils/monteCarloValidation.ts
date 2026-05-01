type ParameterRange = [number, number];

interface ValidateMonteCarloInputParams {
  iterations: number;
  parameterRanges: Record<string, ParameterRange>;
}

export function validateMonteCarloInput({
  iterations,
  parameterRanges,
}: ValidateMonteCarloInputParams): string | null {
  if (!Number.isFinite(iterations) || iterations <= 0) {
    return "O número de iterações deve ser maior que zero.";
  }

  for (const [parameter, [min, max]] of Object.entries(parameterRanges)) {
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return `O intervalo de ${parameter} possui valores inválidos.`;
    }

    if (min >= max) {
      return `O valor mínimo de ${parameter} deve ser menor que o valor máximo.`;
    }
  }

  return null;
}