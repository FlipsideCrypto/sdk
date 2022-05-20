type Props = {
  cta: string;
};
export function Button({ cta }: Props) {
  return (
    <button
      type="submit"
      className="border-gray-700 border p-2 text-xs cursor-point rounded-sm"
    >
      {cta}
    </button>
  );
}
