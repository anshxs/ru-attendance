import { LoaderPinwheel } from "lucide-react";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <>
      <div className="flex items-center justify-center h-screen">
        <LoaderPinwheel className="animate-spin rounded-full h-32 w-32 text-black border-white" />
      </div>
    </>
  );
}
