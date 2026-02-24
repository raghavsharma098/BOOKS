import Navbar from './Navbar';
import Hero from './Hero';
import WhyChooseSection from './WhyChooseSection';
import Blogs from './Blogs';
import ReviewBook from './ReviewBook';
import Footer from './Footer';

export default function HomepageRoute() {
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
