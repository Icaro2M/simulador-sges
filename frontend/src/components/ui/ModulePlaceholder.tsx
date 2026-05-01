interface ModulePlaceholderProps {
  title: string;
  description: string;
  nextSteps: string[];
}

export function ModulePlaceholder({
  title,
  description,
  nextSteps,
}: ModulePlaceholderProps) {
  return (
    <section className="module-placeholder">
      <h2>{title}</h2>
      <p>{description}</p>

      <div className="module-placeholder-box">
        <strong>Próximas etapas</strong>

        <ul>
          {nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}