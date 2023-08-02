import React from "react";
import ReactDOMClient from "react-dom/client";
import { Window } from "./screens/Window";

const app = document.getElementById("app");
const root = ReactDOMClient.createRoot(app);

root.render(<Window />);
