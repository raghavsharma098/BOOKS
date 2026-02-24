import Navbar from './homepage/Navbar';
import Hero from './homepage/Hero';
import WhyChooseSection from './homepage/WhyChooseSection';
import Blogs from './homepage/Blogs';
import ReviewBook from './homepage/ReviewBook';
import Footer from './homepage/Footer';

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <WhyChooseSection />
      <Blogs />
      <ReviewBook />
      <Footer />
    </main>
  );
}
