export default function ServicesHero() {
    return (
      <div className="relative h-[250px] w-full flex items-center justify-center bg-black">
        <h1 className="text-white text-4xl font-bold z-10">Services</h1>
        <div className="absolute inset-0 bg-[url('/banner.jpg')] bg-cover bg-center opacity-40"></div>
      </div>
    );
  }
  