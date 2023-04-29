export interface Args {
  [x: string]: unknown;
  config: string | undefined;
  token: string | undefined;
  input: string | undefined;
  frontend: string;
  backend: string;
  verbosity: number;
  _: (string | number)[];
  $0: string;
}
