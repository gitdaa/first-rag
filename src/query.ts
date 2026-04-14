import "dotenv/config";
import { OllamaEmbeddings, ChatOllama } from "@langchain/ollama"; // ← เปลี่ยน
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RetrievalQAChain } from "langchain/chains";

async function query(question: string) {
  const vectorstore = await Chroma.fromExistingCollection(
    new OllamaEmbeddings({ model: "nomic-embed-text" }), // ← เปลี่ยน
    { collectionName: "my-rag", url: "http://localhost:8000" },
  );

  const chain = RetrievalQAChain.fromLLM(
    new ChatOllama({ model: "llama3.2" }), // ← เปลี่ยน
    vectorstore.asRetriever({ k: 3 }),
  );

  console.log(`❓ คำถาม: ${question}`);
  const result = await chain.call({ query: question });
  console.log(`💡 คำตอบ: ${result.text}`);
}

query("สรุปเนื้อหาหลักของเอกสารนี้");
