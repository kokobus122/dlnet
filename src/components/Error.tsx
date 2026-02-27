import { Button } from "./ui/button";

export const Error = ({ error }: { error?: string }) => {
  return (
    <div className="flex flex-col text-center w-fit mx-auto mt-[20%] min-h-1/2">
      <h1 className="text-2xl font-bold text-cream">404 - Not Found</h1>
      <p className="text-neutral-200">
        {error || "The page you are looking for does not exist."}
      </p>
      <Button
        variant="accent"
        className="mt-4"
        onClick={() => window.history.back()}
      >
        Go Back
      </Button>
    </div>
  );
};
