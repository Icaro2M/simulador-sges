interface ResultTableRow {
  label: string;
  value: string | number;
  unit?: string;
}

interface ResultTableProps {
  title: string;
  rows: ResultTableRow[];
}

export function ResultTable({ title, rows }: ResultTableProps) {
  return (
    <section className="result-table">
      <h3>{title}</h3>

      <table>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td>
                <strong>{row.value}</strong>
                {row.unit && <span> {row.unit}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}