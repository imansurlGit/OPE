import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navarbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Accueil from "./pages/Accueil";
import APropos from "./pages/APropos";
import Membres from "./pages/Membres";
import Categories from "./pages/Categories";
import Talents from "./pages/Talents";
import Actualites from "./pages/Actualites";
import Contact from "./pages/Contact";
import Sponsors from "./pages/Sponsors";
import Galerie from "./pages/Galerie";
import Formulaire from "./pages/Formulaire";

function Layout() {
  const location = useLocation();
  const hideFooter = location.pathname === "/formulaire";

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/apropos" element={<APropos />} />
          <Route path="/membres" element={<Membres />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/talents" element={<Talents />} />
          <Route path="/actualites" element={<Actualites />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/galerie" element={<Galerie />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/formulaire" element={<Formulaire />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
