// src/main.ts
import "dotenv/config";
import * as readline from "readline";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OllamaEmbeddings, ChatOllama } from "@langchain/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";

async function main() {
  // โหลดไฟล์
  console.log("📂 กำลังโหลดไฟล์...");
  const loader = new DirectoryLoader("./docs", {
    ".pdf": (path) => new PDFLoader(path),
    ".txt": (path) => new TextLoader(path),
    ".md": (path) => new TextLoader(path),
    ".docx": (path) => new DocxLoader(path),
  });
  const docs = await loader.load();
  console.log(`✅ โหลดได้ ${docs.length} เอกสาร`);

  // แบ่งชิ้น
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  const chunks = await splitter.splitDocuments(docs);

  // สร้าง vector store
  console.log("🧠 กำลังสร้าง embeddings...");
  const vectorstore = await MemoryVectorStore.fromDocuments(
    chunks,
    new OllamaEmbeddings({ model: "nomic-embed-text" }),
  );
  console.log("✅ พร้อมแล้ว! พิมพ์คำถามได้เลย (พิมพ์ 'exit' เพื่อออก)\n");

  // สร้าง chain
  const chain = RetrievalQAChain.fromLLM(
    new ChatOllama({ model: "llama3.2" }),
    vectorstore.asRetriever({ k: 3 }),
  );

  // รับคำถามจาก terminal
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = () => {
    rl.question("❓ คำถาม: ", async (question) => {
      if (question === "exit") {
        console.log("👋 ออกจากโปรแกรม");
        rl.close();
        return;
      }
      const result = await chain.call({ query: question });
      console.log(`💡 คำตอบ: ${result.text}\n`);
      ask(); // ถามต่อได้เรื่อยๆ
    });
  };

  ask();
}

main();
