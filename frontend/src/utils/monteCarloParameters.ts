export const monteCarloParameterOptions = [
  {
    path: "technology.height_m",
    label: "Altura (m)",
    defaultMin: 50,
    defaultMax: 300,
  },
  {
    path: "technology.mass_kg",
    label: "Massa (kg)",
    defaultMin: 5000,
    defaultMax: 20000,
  },
  {
    path: "economics.cost_per_kw",
    label: "Custo por kW",
    defaultMin: 500,
    defaultMax: 1500,
  },
  {
    path: "economics.discount_rate",
    label: "Taxa de desconto",
    defaultMin: 0.04,
    defaultMax: 0.14,
  },
] as const;