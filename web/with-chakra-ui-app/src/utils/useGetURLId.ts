import { useRouter } from "next/router";

export const useGetURLId = () => {
  const router = useRouter();
  const idx =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  return idx
}