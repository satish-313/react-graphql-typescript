import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, IconButton, Link } from "@chakra-ui/react";
import NextLink from 'next/link';
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonProps {
  id: number,
  creator: number
}

export const EditDeletePostButton: React.FC<EditDeletePostButtonProps> = ({id,creator}) => {
  const [, deletePost] = useDeletePostMutation();
  const [{ data: meData }] = useMeQuery();
  if(meData?.me?.id !== creator){
    return null
  }
  return (
    <Box >
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          mr={8}
          as={Link}
          aria-label="EditPost"
          colorScheme="gray"
          icon={<EditIcon />}
        />
      </NextLink>
      <IconButton
        aria-label="delete"
        colorScheme="red"
        icon={<DeleteIcon />}
        onClick={() => {
          deletePost({ id });
        }}
      />
    </Box>
  );
};
