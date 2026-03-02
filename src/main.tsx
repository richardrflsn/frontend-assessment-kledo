import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import FilterPage from "./FilterPage";
import { FilterDataStructure } from "./types";

let router = createBrowserRouter([
  {
    path: "/",
    element: <FilterPage />,
    loader: async (): Promise<FilterDataStructure> => {
      const response = await fetch("/data/indonesia.regions.json");
      return response.json();
    },
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />,
);
