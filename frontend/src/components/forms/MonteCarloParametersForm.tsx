import { monteCarloParameterOptions } from "../../utils/monteCarloParameters";

type ParameterRange = [number, number];

interface Props {
  parameterRanges: Record<string, ParameterRange>;
  onChange: (parameterRanges: Record<string, ParameterRange>) => void;
}

const controlClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

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
    <div className="space-y-6">
      <label className="grid max-w-xl gap-2 text-sm font-semibold text-slate-700">
        Adicionar parâmetro
        <select
          className={controlClass}
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

      <div className="grid gap-4">
        {Object.entries(parameterRanges).map(([parameter, range]) => {
          const isInvalidRange = range[0] >= range[1];

          return (
            <article
              key={parameter}
              className="rounded-lg border border-slate-200 bg-slate-50 p-5"
            >
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <strong className="block text-sm font-semibold text-slate-950">
                    {getParameterLabel(parameter)}
                  </strong>
                  <small className="mt-1 block text-xs text-slate-500">
                    {parameter}
                  </small>
                </div>

                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => removeParameter(parameter)}
                  disabled={selectedParameters.length <= 1}
                >
                  Remover
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Valor mínimo
                  <input
                    className={controlClass}
                    type="number"
                    step="any"
                    value={range[0]}
                    onChange={(event) =>
                      updateRange(parameter, 0, Number(event.target.value))
                    }
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Valor máximo
                  <input
                    className={controlClass}
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
                <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  O valor mínimo deve ser menor que o valor máximo.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
