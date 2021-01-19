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

const REGISTER_MUTATION = `
mutation Register($username: String!, $password: String!){
  register(options:{username: $username, password: $password}){
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

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter()
  const [,register] = useMutation(REGISTER_MUTATION)
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={ async(values, {setErrors}) => {
          const responce = await register(values)
          if(responce.data?.register.errors){
            setErrors(toErrorMap(responce.data.register.errors))
          }
          else if(responce.data?.register.user){
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
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
