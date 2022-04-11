import { useAdmin, useManagedCourses } from "@components/hooks/web3";
import { useWeb3 } from "@components/providers";
import { Button, Message } from "@components/ui/common";
import { CourseFilter, ManagedCourseCard } from "@components/ui/course";
import { BaseLayout } from "@components/ui/layout";
import { MarketHeader } from "@components/ui/marketplace";
import { normalizeOwnedCourse } from "@utils/normalize";
import { useState } from "react";

const VerificationInput = ({ onVerify }) => {
  const [email, setEmail] = useState("");
  return (
    <div className="flex mr-2 relative rounded-md">
      <input
        value={email}
        onChange={({ target: { value } }) => setEmail(value)}
        type="text"
        name="account"
        id="account"
        className="w-96 focus:ring-indigo-500 shadow-md focus:border-indigo-500 block pl-7 p-4 sm:text-sm border-gray-300 rounded-md"
        placeholder="0x2341ab..."
      />
      <Button onClick={() => onVerify(email)}>Verify</Button>
    </div>
  );
};

export default function ManagedCourses() {
  const [proofedOwnership, setProofedOwnership] = useState({});
  const [searchedCourse, setSearchedCourse] = useState(null);
  const { web3, contract } = useWeb3();
  const { account } = useAdmin({ redirectTo: "/marketplace" });
  const { managedCourses } = useManagedCourses(account);

  const verifyCourse = (email, { hash, proof }) => {
    const emailHash = web3.utils.sha3(email);
    const proofToCheck = web3.utils.soliditySha3(
      { type: "bytes32", value: emailHash },
      { type: "bytes32", value: hash }
    );

    setProofedOwnership({
      ...proofedOwnership,
      [hash]: proofToCheck === proof,
    });
  };

  const changeCourseState = async (courseHash, method) => {
    try {
      await contract.methods[method](courseHash).send({ from: account.data });
    } catch (error) {
      console.error(error.message);
    }
  };

  const activateCourse = async (courseHash) => {
    changeCourseState(courseHash, "activateCourse");
  };
  const deactivateCourse = async (courseHash) => {
    changeCourseState(courseHash, "deactivateCourse");
  };

  const searchCourse = async (hash) => {
    const re = /[0-9A-Fa-f]{6}/g;

    if (hash && hash.length === 66 && re.test(hash)) {
      const course = await contract.methods.getCourseByHash(hash).call();

      if (course.owner !== "0x0000000000000000000000000000000000000000") {
        const normalized = normalizeOwnedCourse(web3)({ hash }, course);
        setSearchedCourse(normalized);
        return;
      }
    }

    setSearchedCourse(null);
  };

  const renderCard = (course, isSearched) => {
    return (
      <ManagedCourseCard
        key={course.ownedCourseId}
        course={course}
        isSearched={isSearched}
      >
        <VerificationInput
          onVerify={(email) => {
            verifyCourse(email, { hash: course.hash, proof: course.proof });
          }}
        />
        {proofedOwnership[course.hash] && (
          <div className="mt-2">
            <Message>Verified!</Message>
          </div>
        )}
        {!proofedOwnership[course.hash] && (
          <div className="mt-2">
            <Message type="danger">Wrong Proof!</Message>
          </div>
        )}
        {course.state === "purchased" && (
          <div className="mt-2">
            <Button variant="green" onClick={() => activateCourse(course.hash)}>
              Activate
            </Button>
            <Button onClick={() => deactivateCourse(course.hash)} variant="red">
              Deactivate
            </Button>
          </div>
        )}
      </ManagedCourseCard>
    );
  };

  if (!account.isAdmin) {
    return null;
  }

  return (
    <>
      <MarketHeader />
      <CourseFilter onSearchSubmit={searchCourse} />
      <section className="grid grid-cols-1">
        {searchedCourse && (
          <div>
            <h1 className="text-2xl font-bold p-5">Search</h1>
            {renderCard(searchedCourse, true)}
          </div>
        )}
        <h1 className="text-2xl font-bold p-5">All Courses</h1>
        {managedCourses.data?.map((course) => renderCard(course))}
      </section>
    </>
  );
}

ManagedCourses.Layout = BaseLayout;
