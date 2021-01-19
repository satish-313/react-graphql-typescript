import React from "react"
import { Navbar } from "../components/Navbar"
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => (
  <>
    <Navbar/>
    <div>
      hello
    </div>
  </>
)

export default withUrqlClient(createUrqlClient)(Index)
