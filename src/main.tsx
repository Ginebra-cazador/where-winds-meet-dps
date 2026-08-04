import React from "react"
import ReactDOM from "react-dom/client"
// Must precede the App import: same-specificity component rules need to win the cascade.
import "./styles/base.scss"
import "./styles/primitives.scss"
import { App } from "./app/App"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
