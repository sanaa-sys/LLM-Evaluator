import Image from "next/image";
import LLMComparison from '../components/LLMComparison'
export default function Home() {
  return (
      <main className="container mx-auto p-4">
          <LLMComparison />
      </main>
  );
}
