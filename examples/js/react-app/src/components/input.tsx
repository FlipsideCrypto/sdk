type Props = {
  onChange(value: string): void;
  placeholder: string;
  name: string;
  label?: string;
  defaultValue: string | number | readonly string[] | undefined;
};

export function Input({
  onChange,
  placeholder,
  name,
  defaultValue,
  label,
}: Props) {
  return (
    <div className="flex flex-col">
      {label && <label htmlFor={name}>{label}</label>}
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="bg-white-100 border-gray-700 border text-black rounded-sm h-[30px] p-4 w-[350px] mr-2 text-xs"
        onKeyUp={(e) => onChange(e.currentTarget.value)}
      />
    </div>
  );
}
