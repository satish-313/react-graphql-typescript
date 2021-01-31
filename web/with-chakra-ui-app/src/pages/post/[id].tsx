import { Box, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React from "react";
import { EditDeletePostButton } from "../../components/EditDeletePostButton";
import { Layout } from "../../components/Layout";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { UseGetPostURL } from "../../utils/UseGetPostURL";

const Post = ({}) => {
  const [{ data, fetching }] = UseGetPostURL();

  if (fetching) {
    return (
      <Layout variant="regular">
        <div>loading...</div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout variant="regular">
        <Box>could not find post</Box>
      </Layout>
    );
  }

  return (
    <Layout variant="regular">
      <Box textAlign="center" mb={4}>
        <EditDeletePostButton
          id={data.post.id}
          creator={data.post.creator.id}
        />
      </Box>
      <Heading textAlign="center" mb={4}>
        {data.post.title}
      </Heading>
      <Box>{data.post.text}</Box>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
