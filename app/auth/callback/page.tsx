import { Suspense } from "react";
import CallbackClient from "./CallbackClient";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <CallbackClient />
    </Suspense>
  );
}