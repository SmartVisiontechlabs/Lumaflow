import Hero from '../components/home/Hero';
import TrustBar from '../components/home/TrustBar';
import AboutMe from '../components/home/AboutMe';
import Healing from '../components/home/Healing';
import Program from '../components/home/Program';
import VideoMessage from '../components/home/VideoMessage';
import Pricing from '../components/home/Pricing';
import FinalCTA from '../components/home/FinalCTA';

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <AboutMe />
      <Healing />
      <Program />
      <VideoMessage />
      <Pricing />
      <FinalCTA />
    </>
  );
}
