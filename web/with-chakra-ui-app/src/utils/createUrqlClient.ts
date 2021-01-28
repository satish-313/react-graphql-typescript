import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables,
} from "urql";
import {
  LogoutMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  RegisterMutation,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import Router from "next/router";
import { pipe, tap } from "wonka";

const errorExchage: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes("not authenticated")) {
        Router.replace("/login");
      }
    })
  );
};

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    // console.log(entityKey,fieldName)
    const allFields = cache.inspectFields(entityKey);
    // console.log("allFields:",allFields)
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    // console.log("fieldArgs",fieldArgs)
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    // console.log("key we created", fieldKey)
    const isItInTheCache = cache.resolve(cache.resolve(entityKey, fieldKey) as string, "posts") ;
    // console.log("isItInTheCache",isItInTheCache)

    info.partial = !isItInTheCache;
    // console.log("info.partial",info.partial)
    const results = [] as string[];
    let hasMore = true;
    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const hasmore = cache.resolve(key,"hasMore")
      // console.log("data:", data);
      // console.log("HasMore",hasmore);
      if(!hasmore){
        hasMore = hasmore as boolean;
      }
      results.push(...data);
    });
    // console.log("results",results)
    return {
      hasMore,
      posts: results,
      __typename: "PaginatedPosts"
    };
  };
};

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4500/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          logout: (_result, args, cache, info) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => ({ me: null })
            );
          },
          login: (_result, args, cache, info) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user,
                  };
                }
              }
            );
          },
          register: (_result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    me: result.register.user,
                  };
                }
              }
            );
          },
        },
      },
    }),
    errorExchage,
    ssrExchange,
    fetchExchange,
  ],
});
