type Props = {
  children: React.ReactNode;
};
export function QueryPreview({ children }: Props) {
  return (
    <pre
      style={{
        fontFamily: "monospace",
        background: "#FFFFE6",
        color: "#4895BD",
        padding: "15px",
        borderRadius: "10px",
        width: "700px",
        height: "auto",
        maxHeight: "550px",
        overflow: "scroll",
      }}
    >
      {children}
    </pre>
  );
}
