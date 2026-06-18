import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Steps from "@/components/Steps";
import Features from "@/components/Features";
import Categories from "@/components/Categories";
import Faq from "@/components/Faq";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-clip">
        <Hero />
        <Steps />
        <Features />
        <Categories />
        <Faq />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
