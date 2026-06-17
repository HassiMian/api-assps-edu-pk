export default function ResponsiveTableWrap({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`responsive-table-wrap w-full max-w-full overflow-x-auto ${className}`}>
      {children}
    </div>
  );
}
