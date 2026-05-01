import { useState } from "react";

import { useDispatch } from "../hooks/useDispatch";
import { DispatchChart } from "../components/charts/DispatchChart";
import { DispatchTable } from "../components/results/DispatchTable";
import { DispatchSummary } from "../components/results/DispatchSummary";
import { DispatchPriceProfileForm } from "../components/forms/DispatchPriceProfileForm";
import {
  exportDispatchToCsv,
  exportDispatchToJson,
} from "../utils/exportDispatch";

import type {
  DispatchPricePoint,
  DispatchRequest,
} from "../types/dispatch";

import type {
  SimulationRequest,
  TechnologyType,
} from "../types/simulation";

const defaultScenario: SimulationRequest = {
  name: "Dispatch Scenario",

  technology_type: "tower",

  mass_kg: 100000,
  height_m: 100,
  nominal_power_kw: 500,

  motor_efficiency: 0.9,
  generator_efficiency: 0.9,
  mechanical_efficiency: 0.95,
  auxiliary_efficiency: 0.98,

  cycle_loss_fraction: 0.02,
  fixed_cycle_loss_kwh: 5,
  standby_loss_kwh_per_hour: 0.5,

  cost_per_kw: 1200,
  cost_per_kwh: 300,
  fixed_capex: 100000,
  fixed_annual_opex: 10000,
  variable_opex_per_mwh: 5,

  project_lifetime_years: 25,
  discount_rate: 0.08,
  cycles_per_year: 300,
};

const defaultPriceProfile: DispatchPricePoint[] = [
  { hour: 0, price: 120 },
  { hour: 1, price: 110 },
  { hour: 2, price: 95 },
  { hour: 3, price: 80 },
  { hour: 4, price: 75 },
  { hour: 5, price: 90 },
  { hour: 6, price: 140 },
  { hour: 7, price: 180 },
  { hour: 8, price: 220 },
  { hour: 9, price: 210 },
  { hour: 10, price: 160 },
  { hour: 11, price: 130 },
];

export function DispatchPage() {
  const { data, loading, error, executeDispatch } = useDispatch();

  const [scenario, setScenario] =
    useState<SimulationRequest>(defaultScenario);

  const [priceProfile, setPriceProfile] =
    useState<DispatchPricePoint[]>(defaultPriceProfile);

  const [lowPriceThreshold, setLowPriceThreshold] = useState(90);
  const [highPriceThreshold, setHighPriceThreshold] = useState(180);
  const [initialSocKwh, setInitialSocKwh] = useState(0);

  const [validationError, setValidationError] = useState<string | null>(null);

  function updateScenarioField<K extends keyof SimulationRequest>(
    field: K,
    value: SimulationRequest[K]
  ) {
    setScenario((currentScenario) => ({
      ...currentScenario,
      [field]: value,
    }));
  }

  function validateDispatchInput() {
    if (!scenario.name.trim()) {
      setValidationError("O nome do cenário é obrigatório.");
      return false;
    }

    if (scenario.mass_kg <= 0) {
      setValidationError("A massa precisa ser maior que zero.");
      return false;
    }

    if (scenario.height_m <= 0) {
      setValidationError("A altura precisa ser maior que zero.");
      return false;
    }

    if (scenario.nominal_power_kw <= 0) {
      setValidationError("A potência nominal precisa ser maior que zero.");
      return false;
    }

    if (priceProfile.length === 0) {
      setValidationError("O perfil de preços precisa ter pelo menos um ponto.");
      return false;
    }

    const hasInvalidPricePoint = priceProfile.some(
      (point) =>
        !Number.isFinite(point.hour) ||
        !Number.isFinite(point.price)
    );

    if (hasInvalidPricePoint) {
      setValidationError("Todas as horas e preços precisam ser números válidos.");
      return false;
    }

    if (lowPriceThreshold >= highPriceThreshold) {
      setValidationError(
        "O limite de preço baixo precisa ser menor que o limite de preço alto."
      );
      return false;
    }

    if (initialSocKwh < 0) {
      setValidationError("O SOC inicial não pode ser negativo.");
      return false;
    }

    setValidationError(null);
    return true;
  }

  function handleRunDispatch() {
    if (!validateDispatchInput()) {
      return;
    }

    const sortedPriceProfile = [...priceProfile].sort(
      (a, b) => a.hour - b.hour
    );

    const request: DispatchRequest = {
      scenario,
      price_profile: sortedPriceProfile,
      low_price_threshold: lowPriceThreshold,
      high_price_threshold: highPriceThreshold,
      initial_soc_kwh: initialSocKwh,
    };

    executeDispatch(request);
  }

  function resetScenario() {
    setScenario(defaultScenario);
  }

  function resetPriceProfile() {
    setPriceProfile(defaultPriceProfile);
  }

  return (
    <main className="page-container">
      <header className="page-header">
        <div>
          <h1>Dispatch</h1>
          <p>
            Análise temporal de carga, descarga e arbitragem energética para um
            cenário SGES.
          </p>
        </div>

        <button onClick={handleRunDispatch} disabled={loading}>
          {loading ? "Executando..." : "Executar dispatch"}
        </button>
      </header>

      <section className="section-card">
        <div className="section-header">
          <div>
            <h2>Cenário SGES</h2>
            <p>
              Configure o cenário técnico-econômico enviado ao backend para a
              análise de dispatch.
            </p>
          </div>

          <button type="button" onClick={resetScenario}>
            Resetar cenário
          </button>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Nome do cenário</span>
            <input
              type="text"
              value={scenario.name}
              onChange={(event) =>
                updateScenarioField("name", event.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Tecnologia</span>
            <select
              value={scenario.technology_type}
              onChange={(event) =>
                updateScenarioField(
                  "technology_type",
                  event.target.value as TechnologyType
                )
              }
            >
              <option value="tower">Tower</option>
              <option value="shaft">Shaft</option>
            </select>
          </label>

          <label className="field">
            <span>Massa kg</span>
            <input
              type="number"
              value={scenario.mass_kg}
              onChange={(event) =>
                updateScenarioField("mass_kg", Number(event.target.value))
              }
            />
          </label>

          <label className="field">
            <span>Altura m</span>
            <input
              type="number"
              value={scenario.height_m}
              onChange={(event) =>
                updateScenarioField("height_m", Number(event.target.value))
              }
            />
          </label>

          <label className="field">
            <span>Potência nominal kW</span>
            <input
              type="number"
              value={scenario.nominal_power_kw}
              onChange={(event) =>
                updateScenarioField(
                  "nominal_power_kw",
                  Number(event.target.value)
                )
              }
            />
          </label>
        </div>
      </section>

      <section className="section-card">
        <h2>Eficiências e perdas</h2>

        <div className="form-grid">
          <label className="field">
            <span>Eficiência do motor</span>
            <input
              type="number"
              step="0.01"
              value={scenario.motor_efficiency}
              onChange={(event) =>
                updateScenarioField(
                  "motor_efficiency",
                  Number(event.target.value)
                )
              }
            />
          </label>

          <label className="field">
            <span>Eficiência do gerador</span>
            <input
              type="number"
              step="0.01"
              value={scenario.generator_efficiency}
              onChange={(event) =>
                updateScenarioField(
                  "generator_efficiency",
                  Number(event.target.value)
                )
              }
            />
          </label>

          <label className="field">
            <span>Eficiência mecânica</span>
            <input
              type="number"
              step="0.01"
              value={scenario.mechanical_efficiency}
              onChange={(event) =>
                updateScenarioField(
                  "mechanical_efficiency",
                  Number(event.target.value)
                )
              }
            />
          </label>

          <label className="field">
            <span>Eficiência auxiliar</span>
            <input
              type="number"
              step="0.01"
              value={scenario.auxiliary_efficiency}
              onChange={(event) =>
                updateScenarioField(
                  "auxiliary_efficiency",
                  Number(event.target.value)
                )
              }
            />
          </label>

          <label className="field">
            <span>Perda por ciclo</span>
            <input
              type="number"
              step="0.01"
              value={scenario.cycle_loss_fraction}
              onChange={(event) =>
                updateScenarioField(
                  "cycle_loss_fraction",
                  Number(event.target.value)
                )
              }
            />
          </label>

          <label className="field">
            <span>Perda fixa por ciclo kWh</span>
            <input
              type="number"
              value={scenario.fixed_cycle_loss_kwh}
              onChange={(event) =>
                updateScenarioField(
                  "fixed_cycle_loss_kwh",
                  Number(event.target.value)
                )
              }
            />
          </label>

          <label className="field">
            <span>Perda standby kWh/h</span>
            <input
              type="number"
              value={scenario.standby_loss_kwh_per_hour}
              onChange={(event) =>
                updateScenarioField(
                  "standby_loss_kwh_per_hour",
                  Number(event.target.value)
                )
              }
            />
          </label>
        </div>
      </section>

      <section className="section-card">
        <h2>Economia</h2>

        <div className="form-grid">
          <label className="field">
            <span>Custo por kW</span>
            <input
              type="number"
              value={scenario.cost_per_kw}
              onChange={(event) =>
                updateScenarioField("cost_per_kw", Number(event.target.value))
              }
            />
          </label>

          <label className="field">
            <span>Custo por kWh</span>
            <input
              type="number"
              value={scenario.cost_per_kwh}
              onChange={(event) =>
                updateScenarioField("cost_per_kwh", Number(event.target.value))
              }
            />
          </label>

          <label className="field">
            <span>CAPEX fixo</span>
            <input
              type="number"
              value={scenario.fixed_capex}
              onChange={(event) =>
                updateScenarioField("fixed_capex", Number(event.target.value))
              }
            />
          </label>

          <label className="field">
            <span>OPEX anual fixo</span>
            <input
              type="number"
              value={scenario.fixed_annual_opex}
              onChange={(event) =>
                updateScenarioField(
                  "fixed_annual_opex",
                  Number(event.target.value)
                )
              }
            />
          </label>

          <label className="field">
            <span>OPEX variável por MWh</span>
            <input
              type="number"
              value={scenario.variable_opex_per_mwh}
              onChange={(event) =>
                updateScenarioField(
                  "variable_opex_per_mwh",
                  Number(event.target.value)
                )
              }
            />
          </label>

          <label className="field">
            <span>Vida útil anos</span>
            <input
              type="number"
              value={scenario.project_lifetime_years}
              onChange={(event) =>
                updateScenarioField(
                  "project_lifetime_years",
                  Number(event.target.value)
                )
              }
            />
          </label>

          <label className="field">
            <span>Taxa de desconto</span>
            <input
              type="number"
              step="0.01"
              value={scenario.discount_rate}
              onChange={(event) =>
                updateScenarioField("discount_rate", Number(event.target.value))
              }
            />
          </label>

          <label className="field">
            <span>Ciclos por ano</span>
            <input
              type="number"
              value={scenario.cycles_per_year}
              onChange={(event) =>
                updateScenarioField("cycles_per_year", Number(event.target.value))
              }
            />
          </label>
        </div>
      </section>

      <section className="section-card">
        <h2>Parâmetros de dispatch</h2>

        <p>
          Configure os limites de preço usados pelo backend para decidir os
          momentos de carga e descarga.
        </p>

        <div className="form-grid">
          <label className="field">
            <span>Limite de preço baixo</span>
            <input
              type="number"
              value={lowPriceThreshold}
              onChange={(event) =>
                setLowPriceThreshold(Number(event.target.value))
              }
            />
          </label>

          <label className="field">
            <span>Limite de preço alto</span>
            <input
              type="number"
              value={highPriceThreshold}
              onChange={(event) =>
                setHighPriceThreshold(Number(event.target.value))
              }
            />
          </label>

          <label className="field">
            <span>SOC inicial kWh</span>
            <input
              type="number"
              min={0}
              value={initialSocKwh}
              onChange={(event) =>
                setInitialSocKwh(Number(event.target.value))
              }
            />
          </label>
        </div>
      </section>

      <DispatchPriceProfileForm
        value={priceProfile}
        onChange={setPriceProfile}
        onReset={resetPriceProfile}
      />

      {validationError && <p className="error-message">{validationError}</p>}

      {error && <p className="error-message">{error}</p>}

      
        {data && data.results.length > 0 && (
          <>
            <DispatchSummary data={data.results} />

            <section className="section-card">
              <div className="section-header">
                <div>
                  <h2>Exportação</h2>
                  <p>Baixe os resultados temporais do dispatch em CSV ou JSON.</p>
                </div>

                <div className="actions-row">
                  <button
                    type="button"
                    onClick={() => exportDispatchToCsv(data.results)}
                  >
                    Exportar CSV
                  </button>

                  <button
                    type="button"
                    onClick={() => exportDispatchToJson(data.results)}
                  >
                    Exportar JSON
                  </button>
                </div>
              </div>
            </section>

            <DispatchChart data={data.results} />
            <DispatchTable data={data.results} />
          </>
        )}

      {data && data.results.length === 0 && (
        <section className="section-card">
          <p>Nenhum resultado retornado pelo dispatch.</p>
        </section>
      )}
    </main>
  );
}