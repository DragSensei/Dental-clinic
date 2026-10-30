import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { NotFoundBody } from "@/components/not-found-body";

// Unmatched URLs and signed-out dashboard visits render outside both route groups, so restore the public chrome here.
export default function NotFound() {
  return (
    <>
      <SiteNav />
      <NotFoundBody />
      <SiteFooter />
    </>
  );
}
