interface FilterChipsProps {
  options: { value: string; label: string }[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}

const FilterChips = ({
  options,
  active,
  onChange,
  className,
}: FilterChipsProps) => {
  return (
    <div className={`flex gap-2 flex-wrap ${className ?? ""}`}>
      {options.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-3.5 py-[7px] rounded-full text-[13px] border-none cursor-pointer transition-all ${
            active === value
              ? "bg-[#1c1c1e] dark:bg-white text-white dark:text-[#1c1c1e] font-semibold"
              : "bg-[var(--fill)] text-[#1c1c1e] dark:text-white font-medium"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default FilterChips;
