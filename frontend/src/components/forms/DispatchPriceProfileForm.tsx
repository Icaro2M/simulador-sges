import type { DispatchPricePoint } from "../../types/dispatch";

interface Props {
  value: DispatchPricePoint[];
  onChange: (value: DispatchPricePoint[]) => void;
  onReset?: () => void;
}

export function DispatchPriceProfileForm({ value, onChange, onReset }: Props) {
  function updatePoint(index: number, field: keyof DispatchPricePoint, newValue: number) {
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
    <section className="section-card">
      <div className="section-header">
        <div>
          <h2>Perfil de preços</h2>
          <p>
            Edite a série temporal de preços usada pelo backend para decidir
            carga e descarga.
          </p>
        </div>

        <div className="actions-row">
          <button type="button" onClick={sortByHour}>
            Ordenar
          </button>

          {onReset && (
            <button type="button" onClick={onReset}>
              Resetar
            </button>
          )}

          <button type="button" onClick={addPoint}>
            Adicionar hora
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="result-table">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Preço</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {value.map((point, index) => (
              <tr key={`${point.hour}-${index}`}>
                <td>
                  <input
                    type="number"
                    value={point.hour}
                    onChange={(event) =>
                      updatePoint(index, "hour", Number(event.target.value))
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={point.price}
                    onChange={(event) =>
                      updatePoint(index, "price", Number(event.target.value))
                    }
                  />
                </td>

                <td>
                  <button
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