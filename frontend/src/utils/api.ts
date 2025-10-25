export class ApiError extends Error {
  info: string | Record<string, any>;
  status: number;

  constructor(message: string, status: number, info: string | Record<string, any>) {
    super(message);
    this.status = status;
    this.info = info;
  }
}

const parseBody = (response: Response) => {
  const isJSON = response.headers.get('content-type')?.indexOf('application/json') !== -1;

  return isJSON ? response.json() : response.text();
};

/** SWR compatible fetcher. Throws on error. */
export const fetcher = async (url: string, opts?: RequestInit) => {
  const response = await fetch(url, opts);

  if (!response.ok) {
    const error = new ApiError('An error occurred while fetching the data', response.status, await parseBody(response));
    throw error;
  }

  return parseBody(response);
};

/** Do an external request. Throws on error. */
export const request = <Data = any>(url: string, options?: RequestInit) => {
  return fetcher(url, options) as Data;
};
