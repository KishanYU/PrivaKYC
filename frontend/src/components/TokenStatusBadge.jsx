export function TokenStatusBadge({ status }) {
  const statusMap = {
    ACTIVE: {
      label: 'Active',
      classes: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    },
    REVOKED: {
      label: 'Revoked',
      classes: 'border-rose-100 bg-rose-50 text-rose-700',
    },
    EXPIRED: {
      label: 'Expired',
      classes: 'border-amber-100 bg-amber-50 text-amber-700',
    },
  };

  const { label, classes } = statusMap[status] || {
    label: status || 'Unknown',
    classes: 'border-slate-200 bg-slate-50 text-slate-700',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}
