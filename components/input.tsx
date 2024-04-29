
export interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
};
export function NumberInput({ label, value, onChange, className }: NumberInputProps) {
  return (
    <label className="relative text-black m-3 mb-0 text-white">
      <input
        type="number"
        className="w-full pl-2 pt-3 text-white bg-purple-700 focus:bg-purple-800"
        value={value.toPrecision(9)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="absolute top-0 left-0 transform -translate-y px-1 text-xs">{label}</span>
    </label>
  );
}