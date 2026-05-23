import { useEffect } from 'react';
import Hero from '../components/home/Hero';
import Healing from '../components/home/Healing';
import AboutMe from '../components/home/AboutMe';
import Quote from '../components/home/Quote';
import Testimonials from '../components/home/Testimonials';
import Program from '../components/home/Program';
import FinalCTA from '../components/home/FinalCTA';
import { useCmsStore } from '../store/cmsStore';

export default function Home() {
  const fetchCMS = useCmsStore(state => state.fetchCMS);

  useEffect(() => {
    fetchCMS();
  }, [fetchCMS]);

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

