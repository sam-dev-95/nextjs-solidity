import { BaseLayout } from "@components/ui/layout";
import { MarketHeader } from "@components/ui/marketplace";
import { OwnedCourseCard } from "@components/ui/course";

export default function OwnedCourses() {
  return (
    <>
      <MarketHeader />

      <section className="grid grid-cols-1">
        <OwnedCourseCard />
      </section>
    </>
  );
}

OwnedCourses.Layout = BaseLayout;
