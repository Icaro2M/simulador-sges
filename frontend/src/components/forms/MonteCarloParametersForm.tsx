import { monteCarloParameterOptions } from "../../utils/monteCarloParameters";

type ParameterRange = [number, number];

interface Props {
  parameterRanges: Record<string, ParameterRange>;
  onChange: (parameterRanges: Record<string, ParameterRange>) => void;
}

export function MonteCarloParametersForm({
  parameterRanges,
  onChange,
}: Props) {
  const selectedParameters = Object.keys(parameterRanges);

  const availableParameters = monteCarloParameterOptions.filter(
    (option) => !selectedParameters.includes(option.path)
  );

  function getParameterLabel(parameter: string) {
    return (
      monteCarloParameterOptions.find((option) => option.path === parameter)
        ?.label ?? parameter
    );
  }

  function updateRange(parameter: string, index: 0 | 1, value: number) {
    const currentRange = parameterRanges[parameter];

    if (!currentRange) {
      return;
    }

    onChange({
      ...parameterRanges,
      [parameter]: [
        index === 0 ? value : currentRange[0],
        index === 1 ? value : currentRange[1],
      ],
    });
  }

  function addParameter(parameterPath: string) {
    const option = monteCarloParameterOptions.find(
      (item) => item.path === parameterPath
    );

    if (!option) {
      return;
    }

    onChange({
      ...parameterRanges,
      [option.path]: [option.defaultMin, option.defaultMax],
    });
  }

  function removeParameter(parameter: string) {
    const updatedRanges = { ...parameterRanges };
    delete updatedRanges[parameter];

    onChange(updatedRanges);
  }

  return (
    <div className="monte-carlo-parameters">
      <div className="monte-carlo-add-row">
        <label>
          Adicionar parâmetro
          <select
            value=""
            onChange={(event) => {
              if (event.target.value) {
                addParameter(event.target.value);
              }
            }}
          >
            <option value="">Selecione um parâmetro</option>

            {availableParameters.map((option) => (
              <option key={option.path} value={option.path}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="monte-carlo-parameter-list">
        {Object.entries(parameterRanges).map(([parameter, range]) => {
          const isInvalidRange = range[0] >= range[1];

          return (
            <div key={parameter} className="monte-carlo-parameter-card">
              <div className="monte-carlo-parameter-header">
                <div>
                  <strong>{getParameterLabel(parameter)}</strong>
                  <small>{parameter}</small>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => removeParameter(parameter)}
                  disabled={selectedParameters.length <= 1}
                >
                  Remover
                </button>
              </div>

              <div className="form-grid">
                <label>
                  Valor mínimo
                  <input
                    type="number"
                    step="any"
                    value={range[0]}
                    onChange={(event) =>
                      updateRange(parameter, 0, Number(event.target.value))
                    }
                  />
                </label>

                <label>
                  Valor máximo
                  <input
                    type="number"
                    step="any"
                    value={range[1]}
                    onChange={(event) =>
                      updateRange(parameter, 1, Number(event.target.value))
                    }
                  />
                </label>
              </div>

              {isInvalidRange && (
                <p className="error-message">
                  O valor mínimo deve ser menor que o valor máximo.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}