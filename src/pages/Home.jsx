import Hero from "../components/home/Hero";
import ProductsPreview from "../components/home/ProductsPreview";
import NutritionBenefits from "../components/home/NutritionBenefits";
import FarmStory from "../components/home/FarmStory";
import WhyKadaknath from "../components/home/WhyKadaknath";
import HowWeFarm from "../components/home/HowWeFarm";
import GalleryPreview from "../components/home/GalleryPreview";
import Reviews from "../components/home/Reviews";
import DeliveryArea from "../components/home/DeliveryArea";
import ContactCTA from "../components/home/ContactCTA";

const Home = () => {
  return (
    <>
      <Hero />
      <ProductsPreview />
      <NutritionBenefits />
      <FarmStory />
      <WhyKadaknath />
      <HowWeFarm />
      <GalleryPreview />
      <Reviews />
      <DeliveryArea />
      <ContactCTA />
    </>
  );
};

export default Home;
