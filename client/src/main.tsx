import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add styles for loading animation
const style = document.createElement('style');
style.textContent = `
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;
document.head.appendChild(style);

// Set page title
document.title = "Top Warplet Traders";

createRoot(document.getElementById("root")!).render(<App />);
