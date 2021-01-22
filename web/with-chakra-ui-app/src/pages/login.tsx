import React from "react";
import {useRouter} from 'next/router'
import { Form, Formik } from "formik";
import {
  Box,
  Button,
} from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { toErrorMap } from "../utils/toErrorMap";
import { useLoginMutation } from "../generated/graphql";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

interface registerProps {}

const Login: React.FC<{}> = ({}) => {
  const router = useRouter()
  const [,login] = useLoginMutation()
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={ async(values, {setErrors}) => {
          const responce = await login(values)
          if(responce.data?.login.errors){
            setErrors(toErrorMap(responce.data.login.errors))
          }
          else if(responce.data?.login.user){
            // worked
            router.push("/")
          }
        }}
      >
        {({ values, handleChange,isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="username Or Email"
              label="username Or Email"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="password"
                type="password"
              />
            </Box>
            <Button mt={4} type="submit" isLoading={isSubmitting} colorScheme="teal">
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
