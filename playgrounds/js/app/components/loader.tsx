type LoaderProps = {
  isLoading: boolean;
  children: React.ReactNode;
};

export function Loader({ isLoading, children }: LoaderProps) {
  if (isLoading) {
    return <div>loading...</div>;
  }
  return <>{children}</>;
}
