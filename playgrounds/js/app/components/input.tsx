type Props = {
  onChange(value: string): void;
  placeholder: string;
  name: string;
};

export function Input({ onChange, placeholder, name }: Props) {
  return (
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      className="bg-white-100 border-gray-700 border text-black rounded-sm h-[30px] p-4 w-[350px] mr-2 text-xs"
      onKeyUp={(e) => onChange(e.currentTarget.value)}
    />
  );
}
