import Hero from '../components/home/Hero';
import Healing from '../components/home/Healing';
import AboutMe from '../components/home/AboutMe';
import Quote from '../components/home/Quote';
import Testimonials from '../components/home/Testimonials';
import Program from '../components/home/Program';
import FinalCTA from '../components/home/FinalCTA';

export default function Home() {
  return (
    <>
      <Hero />
      <Healing />
      <AboutMe />
      <Quote />
      <Testimonials />
      <Program />
      <FinalCTA />
    </>
  );
}
