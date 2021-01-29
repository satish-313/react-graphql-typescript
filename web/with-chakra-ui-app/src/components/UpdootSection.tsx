import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  // p: PostsQuery["posts"]["posts"][0]
  p: PostSnippetFragment;
}

const UpdootSection: React.FC<UpdootSectionProps> = ({ p }) => {
  const [loadingState, setLoadingState] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();
  return (
    <Flex justifyContent="space-around" alignItems="center" direction="column">
      <IconButton
        aria-label="chevronUpIcon"
        icon={<ChevronUpIcon />}
        onClick={async () => {
          setLoadingState("updoot-loading");
          await vote({
            postId: p.id,
            value: 1,
          });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState==="updoot-loading"}
      />
      {p.points}
      <IconButton
        aria-label="chevronDownIcon"
        icon={
          <ChevronDownIcon
            onClick={ async() => {
              setLoadingState("downdoot-loading");
              await vote({
                postId: p.id,
                value: -1,
              });
              setLoadingState("not-loading");
            }}
          />
        }
        isLoading={loadingState==="downdoot-loading"}
      />
    </Flex>
  );
};

export default UpdootSection;
