import React from "react";
import {useRouter} from 'next/router'
import { Form, Formik } from "formik";
import {
  Box,
  Button,
} from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useMutation } from "urql";
import { toErrorMap } from "../utils/toErrorMap";

interface registerProps {}

const LOGIN_MUTATION = `
mutation Login($options: UsernamePasswordInput!){
  login(options: $options){
    errors{
      field
      message
    }
    user{
      id
      username
    }
  }
}
`

const Login: React.FC<{}> = ({}) => {
  const router = useRouter()
  const [,login] = useMutation(LOGIN_MUTATION)
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={ async(values, {setErrors}) => {
          const responce = await login({options: values})
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
              name="username"
              placeholder="username"
              label="username"
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

export default Login;
