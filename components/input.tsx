
export interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
};
export function NumberInput({ label, value, onChange, className }: NumberInputProps) {
  const extraClasses = className ? " " + className : "";

  return (
    <label className={"relative text-black text-white whitespace-nowrap" + extraClasses}>
      <input
        type="number"
        className="w-full pl-2 pt-3 text-white bg-purple-800 focus:bg-purple-600"
        value={value.toPrecision(9)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="absolute top-0 left-1 text-xs ">{label}</span>
    </label>
  );
}

type SelectionInputDatum = { toString(): string };
export interface SelectionInputProps<Datum extends SelectionInputDatum> {
  label: string;
  value: Datum;
  options: Datum[];
  onChange: (value: string) => void;
  className?: string;
};
export function SelectionInput<Datum extends SelectionInputDatum>({ label, value, options, onChange, className }: SelectionInputProps<Datum>) {
  const extraClasses = className ? " " + className : "";

  return (
    <label className={"relative text-black text-white whitespace-nowrap" + extraClasses}
      >
      <select
        className="w-full pl-2 pt-3 text-white bg-purple-800 focus:bg-purple-600"
        value={value.toString()}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.toString()} value={option.toString()}>{option.toString()}</option>
        ))}
      </select>
      <span className="absolute top-0 left-1 text-xs">{label}</span>
    </label>
  );
}