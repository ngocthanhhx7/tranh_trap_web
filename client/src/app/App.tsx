import { RouterProvider } from "react-router-dom";
import { router } from "../routes/router";
import { MediaProtection } from "./MediaProtection";

export function App() {
  return (
    <>
      <MediaProtection />
      <RouterProvider router={router} />
    </>
  );
}
