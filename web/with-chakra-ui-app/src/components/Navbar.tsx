import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
  const [{fetching: logoutFetching},logout] = useLogoutMutation()
  const [{data,fetching}] = useMeQuery({
    pause: isServer()
  })

  let body = null

  // console.log("data: ",data)

  if(fetching) {
    
  }
  else if (!data?.me){
    body = (
      <>
      <NextLink href="/login">
          <Link color="white" mr={2}>
            Login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link color="white">Register</Link>
        </NextLink>
      </>
    )
  }
  else {
    body = (
      <Flex>
        <Box mr={2}>{data.me.username}</Box>
        <Button onClick={() => logout()} isLoading={logoutFetching} variant="link">logout</Button>
      </Flex>
    )
  }

  return (
    <Flex bg="tan" p={4} position="sticky" top={0} zIndex={1}>
      <Box ml={"auto"}>
        {body}
      </Box>
    </Flex>
  );
};
