import { Suspense } from "react";
import { PersonalSpace, PersonalSpaceSkeleton } from "./personal-space";

export default function MySpacePage() {
  return (
    <Suspense fallback={<PersonalSpaceSkeleton />}>
      <PersonalSpace />
    </Suspense>
  );
}
