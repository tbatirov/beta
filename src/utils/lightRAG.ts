import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { FaissStore } from 'langchain/vectorstores/faiss';
import { OpenAI } from 'langchain/llms/openai';
import { RetrievalQAChain, loadQAStuffChain } from 'langchain/chains';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';
import { convert } from 'html-to-text';
import { split } from 'sentence-splitter';

export class LightRAG {
  private vectorStore: FaissStore | null = null;
  private embeddings: OpenAIEmbeddings;
  private llm: OpenAI;

  constructor(apiKey: string, modelName: string = 'gpt-3.5-turbo') {
    this.embeddings = new OpenAIEmbeddings({ openAIApiKey: apiKey });
    this.llm = new OpenAI({ openAIApiKey: apiKey, modelName: modelName });
  }

  async loadFromUrl(url: string): Promise<void> {
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();
    const processedDocs = this.processDocuments(docs);
    await this.loadDocuments(processedDocs);
  }

  async loadFromText(text: string): Promise<void> {
    const doc = new Document({ pageContent: text });
    const processedDocs = this.processDocuments([doc]);
    await this.loadDocuments(processedDocs);
  }

  private processDocuments(docs: Document[]): Document[] {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    return docs.flatMap(doc => {
      const cleanText = convert(doc.pageContent, { wordwrap: false });
      const sentences = split(cleanText);
      return sentences.map(sentence => new Document({
        pageContent: sentence.raw,
        metadata: { ...doc.metadata, source: doc.metadata.source || 'unknown' }
      }));
    });
  }

  private async loadDocuments(docs: Document[]): Promise<void> {
    if (!this.vectorStore) {
      this.vectorStore = await FaissStore.fromDocuments(docs, this.embeddings);
    } else {
      await this.vectorStore.addDocuments(docs);
    }
  }

  async query(question: string): Promise<string> {
    if (!this.vectorStore) {
      throw new Error('No documents loaded. Please load documents before querying.');
    }

    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(this.llm),
      retriever: this.vectorStore.asRetriever(),
    });

    const response = await chain.call({ query: question });
    return response.text;
  }
}