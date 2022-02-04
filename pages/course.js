import { CourseHero, Keypoints, Curriculum } from "@components/course";
import { Modal } from "@components/common";
import { BaseLayout } from "@components/layout";

export default function Course() {
  return (
    <>
      <div className="py-4">
        <CourseHero />
      </div>
      <Keypoints />
      <Curriculum />
      <Modal />
    </>
  );
}

Course.Layout = BaseLayout;
