import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home/Home";
import Conferences from "./pages/Conferences/Conferences";
import ConferenceDetail from "./pages/Conferences/ConferenceDetail";
import Speakers from "./pages/Speakers/Speakers";
import SpeakerDetail from "./pages/Speakers/SpeakerDetail";
import SubmitPaper from "./pages/SubmitPaper/SubmitPaper";
import TrackSubmission from "./pages/TrackSubmission/TrackSubmission";
import VerifyCertificate from "./pages/VerifyCertificate/VerifyCertificate";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/conferences" element={<Conferences />} />
          <Route path="/conferences/:id" element={<ConferenceDetail />} />
          <Route path="/speakers" element={<Speakers />} />
          <Route path="/speakers/:id" element={<SpeakerDetail />} />
          <Route path="/submit-paper" element={<SubmitPaper />} />
          <Route path="/track-submission" element={<TrackSubmission />} />
          <Route path="/verify-certificate" element={<VerifyCertificate />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
