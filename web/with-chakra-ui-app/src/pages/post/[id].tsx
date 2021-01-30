import { Box, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { Layout } from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";

const Post = ({}) => {
  const router = useRouter();
  const idx = typeof router.query.id === "string" ? parseInt(router.query.id): -1
  const [{data,fetching}] = usePostQuery({
    pause: idx === -1,
    variables:{
      id: idx
    }
  })

  if(fetching){
    return (
      <Layout variant="regular">
        <div>loading...</div>
      </Layout>
    );
  }

  if(!data?.post){
    return(
      <Layout variant="regular">
        <Box>could not find post</Box>
      </Layout>
    )
  }

  return (
    <Layout variant="regular">
      <Heading mb={4}>{data.post.title}</Heading>
      {data.post.text}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient,{ssr:true})(Post);
