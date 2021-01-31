import { usePostQuery } from "../generated/graphql";
import { useGetURLId } from "./useGetURLId";

export const UseGetPostURL = () => {
  const idx = useGetURLId()
  return usePostQuery({
    pause: idx === -1,
    variables: {
      id: idx,
    },
  });
};
