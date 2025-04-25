import { createBrowserRouter } from "react-router";
import { Home } from "../homepage/Home";
import { PostList } from "../postlist/Posts";
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

    {
        path: "/",
        element: <Home />,
    },

    {
        path: "/posts",
        element: <PostList />,
    },
  ]);
  