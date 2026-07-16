import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { PatientAuthProvider } from "../../context/PatientAuthContext";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PatientAuthProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </PatientAuthProvider>
  );
}
