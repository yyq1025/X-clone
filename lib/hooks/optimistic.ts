import { QueryKey, Updater } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export const optimiticUpdate = async (queryKey: QueryKey, updator: Updater<any, any>) => {
  await queryClient.cancelQueries({queryKey})

  const previousData = queryClient.getQueryData(queryKey)

  queryClient.setQueryData(queryKey, updator)

  return previousData;
};