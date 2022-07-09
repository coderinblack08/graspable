import { TRPCClientErrorLike } from "@trpc/client";
import { inferSubscriptionOutput, inferHandlerInput } from "@trpc/server";
import { useEffect } from "react";
import { hashQueryKey } from "react-query";
import { AppRouter } from "../server/routers/_app";
import { trpc } from "./trpc";

type TSubscriptions = AppRouter["_def"]["subscriptions"];

export function useCustomSubscription<
  TPath extends keyof TSubscriptions & string,
  TOutput extends inferSubscriptionOutput<AppRouter, TPath>
>(
  pathAndInput: [
    path: TPath,
    ...args: inferHandlerInput<TSubscriptions[TPath]>
  ],
  opts: {
    enabled?: boolean;
    onError?: (err: TRPCClientErrorLike<AppRouter>) => void;
    onNext: (data: TOutput) => void;
  },
  deps: any[] = []
) {
  const enabled = opts?.enabled ?? true;
  const queryKey = hashQueryKey(pathAndInput);
  const { client } = trpc.useContext();

  return useEffect(() => {
    if (!enabled) {
      return;
    }
    const [path, input] = pathAndInput;
    let isStopped = false;
    const unsubscribe = client.subscription(path, (input ?? undefined) as any, {
      onError: (err) => {
        if (!isStopped) {
          opts.onError?.(err);
        }
      },
      onNext: (res) => {
        if (res.type === "data" && !isStopped) {
          opts.onNext(res.data as any);
        }
      },
    });
    return () => {
      isStopped = true;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, enabled, ...deps]);
}
