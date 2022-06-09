import axios from "axios";

export const fetcher = async (url: string) => {
  const res = await axios.get(url, { withCredentials: true });
  if (!res.status.toString().startsWith("2")) {
    throw new Error(res.statusText);
  }
  return res.data;
};
