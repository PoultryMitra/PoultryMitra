import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Remove any initial loading state
const loadingElement = document.getElementById('loading');
if (loadingElement) {
  loadingElement.remove();
}

createRoot(document.getElementById("root")!).render(<App />);
