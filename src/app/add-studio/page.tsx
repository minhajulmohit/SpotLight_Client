import AddStudioForm from "./AddStudioForm";

export const metadata = {
  title: "Add Studio — SpotLight",
  description: "List your production space on Spotlight.",
};

export default function AddStudioPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <AddStudioForm />
    </main>
  );
}
