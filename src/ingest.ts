// src/main.ts
import "dotenv/config";
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
    ".sql": (path) => new TextLoader(path), // ← เพิ่มแค่นี้
  });
  const docs = await loader.load();
  console.log(`✅ โหลดได้ ${docs.length} เอกสาร`);

  // แบ่งชิ้น
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  const chunks = await splitter.splitDocuments(docs);
  console.log(`✂️  แบ่งได้ ${chunks.length} chunks`);

  // สร้าง vector store ใน memory (ไม่ต้อง Docker)
  console.log("🧠 กำลังสร้าง embeddings...");
  const embeddings = new OllamaEmbeddings({ model: "nomic-embed-text" });
  const vectorstore = await MemoryVectorStore.fromDocuments(chunks, embeddings);
  console.log("✅ พร้อมแล้ว!");

  // ถามคำถาม
  const chain = RetrievalQAChain.fromLLM(
    new ChatOllama({ model: "llama3.2" }),
    vectorstore.asRetriever({ k: 3 }),
  );

  const question = "สรุปเนื้อหาหลักของเอกสารนี้";
  console.log(`\n❓ คำถาม: ${question}`);
  const result = await chain.call({ query: question });
  console.log(`💡 คำตอบ: ${result.text}`);
}

main();
