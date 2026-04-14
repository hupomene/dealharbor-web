type TopbarProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export default function Topbar({ title, description, actions }: TopbarProps) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          ) : null}
        </div>

        {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}