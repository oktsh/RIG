import CategoryFilter from "@/components/prompts/CategoryFilter";
import PromptCard from "@/components/prompts/PromptCard";
import { prompts } from "@/data/prompts";

export default function PromptsPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-10 py-10">
      <CategoryFilter />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-0 border-t-2 border-l-2 border-black bg-white">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </div>
  );
}
