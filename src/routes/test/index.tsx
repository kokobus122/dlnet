import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/test/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container min-h-screen mx-auto bg-green-200">
      Hello "/test/"!
    </div>
  );
}
