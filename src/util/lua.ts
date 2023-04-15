type AnySchema<T> = { parse: (data: unknown) => T };

export function validated<T>(
  callback: (obj: T) => unknown,
  schema: AnySchema<T>
) {
  return (luaTbl: unknown) => {
    return callback(schema.parse(luaTbl));
  };
}
