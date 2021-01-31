import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import { useUpdatePostMutation } from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { UseGetPostURL } from "../../../utils/UseGetPostURL";
import { useGetURLId } from "../../../utils/useGetURLId";

const EditPost = ({}) => {
  const router = useRouter()
  const intId = useGetURLId();
  const [{ data, fetching }] = UseGetPostURL();
  const [, updatePost] = useUpdatePostMutation();
  if (fetching) {
    <Layout variant="small">
      <Box>Loading...</Box>
    </Layout>;
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
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          await updatePost({id: intId, ...values});
          router.push("/")
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="title" label="title" />
            <Box mt={4}>
              <InputField
                textarea
                name="text"
                placeholder="text..."
                label="body"
                type="text"
              />
            </Box>
            <Button
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
              mt={4}
            >
              update Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
