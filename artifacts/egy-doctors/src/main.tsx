import { createRoot } from "react-dom/client";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";

setAuthTokenGetter(() => localStorage.getItem("egy_token"));

createRoot(document.getElementById("root")!).render(<App />);
