export const numericTransformer = {
  to: (value?: number) => value,
  from: (value?: string | null) => (value ? Number(value) : 0),
};
