import {
  Box,
  Button,
  Flex,
  Heading,

  Link,
  Stack,
  Text
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useState } from "react";
import { Layout } from "../components/Layout";
import UpdootSection from "../components/UpdootSection";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return <div> you got query failed for some reason!!</div>;
  }

  // console.log(variables)

  return (
    <Layout variant="regular">
      <Flex justify="space-around" align="center">
        <Heading>Lireddit</Heading>
        <NextLink href="/create-post">
          <Link>create post</Link>
        </NextLink>
      </Flex>

      <br />
      {!data && fetching ? (
        <div>Loading..</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) => (
            <Flex key={p.id} p={5} shadow="md" borderWidth={1}>
              <UpdootSection p={p}/>
              <Box ml={4}>
                <Heading fontSize="xl">{p.title}</Heading>
                <Text mt={4}>Created by :&nbsp;{p.creator.username}</Text>
                <Text mt={4}>{p.textSnippet}</Text>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex isLoad justify="center" align="center">
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            isLoading={fetching}
            my={8}
          >
            load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
