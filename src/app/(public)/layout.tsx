import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { PatientAuthProvider } from "../../context/PatientAuthContext";
import { getCurrentPatient } from "../../lib/auth";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const patient = await getCurrentPatient();

  return (
    <PatientAuthProvider initialPatient={patient}>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </PatientAuthProvider>
  );
}
