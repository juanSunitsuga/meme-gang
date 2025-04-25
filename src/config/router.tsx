import { createBrowserRouter } from "react-router";
import { Home } from "../homepage/Home";
import { Login } from "../loginregister/Login";
import { Register } from "../loginregister/Register";


export const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
  ]);
  