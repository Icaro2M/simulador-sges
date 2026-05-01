import type { DispatchPricePoint } from "../../types/dispatch";

interface Props {
  value: DispatchPricePoint[];
  onChange: (value: DispatchPricePoint[]) => void;
  onReset?: () => void;
}

const inputClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60";

export function DispatchPriceProfileForm({ value, onChange, onReset }: Props) {
  function updatePoint(
    index: number,
    field: keyof DispatchPricePoint,
    newValue: number
  ) {
    const updated = value.map((point, currentIndex) => {
      if (currentIndex !== index) {
        return point;
      }

      return {
        ...point,
        [field]: newValue,
      };
    });

    onChange(updated);
  }

  function addPoint() {
    const lastPoint = value[value.length - 1];
    const nextHour = lastPoint ? lastPoint.hour + 1 : 0;

    onChange([
      ...value,
      {
        hour: nextHour,
        price: 0,
      },
    ]);
  }

  function removePoint(index: number) {
    const updated = value.filter((_, currentIndex) => currentIndex !== index);
    onChange(updated);
  }

  function sortByHour() {
    const sorted = [...value].sort((a, b) => a.hour - b.hour);
    onChange(sorted);
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Perfil de preços
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Edite a série temporal de preços usada pelo backend para decidir
            carga e descarga.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className={secondaryButtonClass} type="button" onClick={sortByHour}>
            Ordenar
          </button>

          {onReset && (
            <button className={secondaryButtonClass} type="button" onClick={onReset}>
              Resetar
            </button>
          )}

          <button className={secondaryButtonClass} type="button" onClick={addPoint}>
            Adicionar hora
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-3 font-semibold text-slate-500">Hora</th>
              <th className="px-6 py-3 font-semibold text-slate-500">Preço</th>
              <th className="px-6 py-3 font-semibold text-slate-500">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {value.map((point, index) => (
              <tr key={`${point.hour}-${index}`}>
                <td className="px-6 py-3">
                  <input
                    className={inputClass}
                    type="number"
                    value={point.hour}
                    onChange={(event) =>
                      updatePoint(index, "hour", Number(event.target.value))
                    }
                  />
                </td>

                <td className="px-6 py-3">
                  <input
                    className={inputClass}
                    type="number"
                    value={point.price}
                    onChange={(event) =>
                      updatePoint(index, "price", Number(event.target.value))
                    }
                  />
                </td>

                <td className="px-6 py-3">
                  <button
                    className="inline-flex h-9 items-center justify-center rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    onClick={() => removePoint(index)}
                    disabled={value.length <= 1}
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
