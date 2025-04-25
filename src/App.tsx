import { useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./config/router";

function App() {
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
