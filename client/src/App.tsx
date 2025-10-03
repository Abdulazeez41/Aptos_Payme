import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletContextProvider } from "./contexts/WalletContext";
import { Layout } from "./components/Layout";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { Home } from "./pages/Home";
import { CreateRequest } from "./pages/CreateRequest";
import { PaymentPage } from "./pages/PaymentPage";
import { History } from "./pages/History";
import { NotFound } from "./pages/NotFound";
import Send from "./pages/Send";

function App() {
  return (
    <WalletContextProvider>
      <Router>
        <Suspense
          fallback={<LoadingSpinner message="Loading Aptos PayMe..." />}
        >
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="request" element={<CreateRequest />} />
              <Route path="history" element={<History />} />
              <Route path="send" element={<Send />} />
            </Route>
            <Route path="/pay/:requestId" element={<PaymentPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </WalletContextProvider>
  );
}

export default App;
