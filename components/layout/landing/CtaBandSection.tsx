import Image from "next/image";
import { AppImages } from "@/lib/app_images";

export function CtaBandSection() {
  return (
    <section className="w-full bg-[#F6F8F7]">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="hidden w-full md:block">
          <Image
            src={AppImages.ctaBandDesktop}
            alt="Start your next project on solid ground. Owners set up milestones in minutes. Providers accept the invite and see your money in escrow before you start."
            width={1600}
            height={520}
            className="h-auto w-full"
            sizes="(min-width: 768px) 100vw, 0px"
          />
        </div>
        <div className="block w-full md:hidden">
          <Image
            src={AppImages.ctaBandMobile}
            alt="Start your next project on solid ground. Owners set up milestones in minutes. Providers accept the invite and see your money in escrow before you start."
            width={800}
            height={900}
            className="h-auto w-full"
            sizes="(max-width: 767px) 100vw, 0px"
          />
        </div>
      </div>
    </section>
  );
}
