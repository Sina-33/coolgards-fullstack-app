import styles from "./home.module.scss";
import Link from "next/link";
import ImageGallery from "react-image-gallery";
import Image from "next/image";

export default function Home() {
  const images = [
    { original: "/1.jpg" },
    { original: "/2.jpg" },
    { original: "/3.jpg" },
    { original: "/4.jpg" },
    { original: "/5.jpg" },
    { original: "/6.jpg" },
    { original: "/7.jpg" },
  ];
  return (
    <main>
      {/*first hero start*/}
      <div className={styles.hero}>
        <div className={styles.heroText}>
          <div className="flex justify-center items-center ">
            <Image
                className="w-[15vw] h-auto"
                src="/logo-big.png"
                alt="coolgards big logo"
                width={200}
                height = {181}
            />
            <p className="text-logo">COOLGARDS</p></div>
          <p>Cold + Compression</p>
          <p>Therapy System</p>
          <p className={styles.heroTextSmall}>ENGINEERED FOR THE COMEBACK</p>
        </div>
      </div>
      <div className={styles.heroDetails}>
        <p>The equipment is used for postoperative and post-injury rehabilitation treatment, to alleviate inflammatory reaction, control swelling and relieve pain by applying pressure and providing cold compress treatment.
          <br/><br/>The goal of creating this product was to develop a safe, effective, affordable, and easy-to-use medical device that could be deployed in almost any setting.
        </p>

      </div>
      {/*first hero end*/}

      {/*slider start*/}
      <div className={styles.sliderContainer}>
        <div className={styles.details}>
          <h2 className="m-1 font-normal">
            Features of the CoolGards’s cold and compression system:
          </h2>
          <ul>
            <li>
              Intermittent cold compression accelerates the healing process and reduces pain and swelling;
            </li>
            <li>Preset flexible treatment options to achieve the best care for you;</li>

            <li>
              Perfect for athletic training rooms, clinics, and home use;
            </li>
            <li>Gives you a quiet environment during the treatment;</li>
            <li>Covers the ankle, shoulder, leg, and knee.</li>
          </ul>
          <div className="flex justify-center">
            <a
                className="inline-flex justify-center items-center gap-x-3 text-center bg-gradient-to-tl from-blue-600 to-violet-600 shadow-lg shadow-transparent hover:shadow-blue-700/50 border border-transparent text-white text-sm font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white py-3 px-6"
                href="/catalog.pdf"
            >
              Download Our Catalog
              <svg
                  className="w-2.5 h-2.5"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
              >
                <path
                    d="M5.27921 2L10.9257 7.64645C11.1209 7.84171 11.1209 8.15829 10.9257 8.35355L5.27921 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className={styles.slider}>
          <ImageGallery
            showPlayButton={false}
            showFullscreenButton={false}
            showBullets
            showNav={false}
            showThumbnails={false}
            autoPlay
            slideInterval={4000}
            items={images}
          />
        </div>
      </div>

      {/*slider end*/}

      {/*second hero start*/}
      <div className="bg-slate-900">
        <div className="bg-gradient-to-b from-violet-600/[.15] via-transparent">
          <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8">
            <div className="max-w-3xl text-center mx-auto">
              <h1 className="block font-medium text-gray-200 text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                How does it work?
              </h1>
            </div>

            <div className="max-w-3xl text-center mx-auto">
              <p className="text-lg text-gray-400">
                Cold compression therapy works by constricting the blood vessels, which in turn reduces swelling and inflammation. Calms muscle spasms, minimises bruising and soothes nerve endings, encouraging quick and effective healing for a variety of muscle, tendon and ligament injuries.
              </p>
            </div>

            <div className="text-center">
              <Link
                className="inline-flex justify-center items-center gap-x-3 text-center bg-gradient-to-tl from-blue-600 to-violet-600 shadow-lg shadow-transparent hover:shadow-blue-700/50 border border-transparent text-white text-sm font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white py-3 px-6"
                href="/news"
              >
                Visit our News to learn more
                <svg
                  className="w-2.5 h-2.5"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M5.27921 2L10.9257 7.64645C11.1209 7.84171 11.1209 8.15829 10.9257 8.35355L5.27921 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/*second hero end*/}

      <div className={styles.fdaSection}>
        <p className="w-80">All CoolGards devices are fully compliant with CE and FDA regulatory approval.</p>
       <div className="flex">
         <Image
             src="/ce.webp"
             alt="ce logo"
             width={112}
             height = {80}
         />
         <Image
             src="/fda.webp"
             alt="fda logo"
             width={82}
             height = {89}
         />
       </div>


      </div>

    </main>
  );
}
