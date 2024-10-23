import { Document } from 'langchain/document';

export const ifrsStandards: Document[] = [
  new Document({
    pageContent: `IFRS 1 - First-time Adoption of International Financial Reporting Standards
    This standard sets out the procedures that an entity must follow when it adopts IFRSs for the first time as the basis for preparing its general purpose financial statements.`,
    metadata: { standard: 'IFRS 1' }
  }),
  new Document({
    pageContent: `IFRS 2 - Share-based Payment
    This standard requires an entity to recognize share-based payment transactions in its financial statements, including transactions with employees or other parties to be settled in cash, other assets, or equity instruments of the entity.`,
    metadata: { standard: 'IFRS 2' }
  }),
  new Document({
    pageContent: `IFRS 3 - Business Combinations
    This standard outlines the accounting when an acquirer obtains control of a business. It requires assets acquired and liabilities assumed to be measured at their fair values at the acquisition date.`,
    metadata: { standard: 'IFRS 3' }
  }),
  new Document({
    pageContent: `IFRS 9 - Financial Instruments
    This standard establishes principles for the financial reporting of financial assets and financial liabilities. It replaces IAS 39 Financial Instruments: Recognition and Measurement.`,
    metadata: { standard: 'IFRS 9' }
  }),
  new Document({
    pageContent: `IFRS 15 - Revenue from Contracts with Customers
    This standard specifies how and when an IFRS reporter will recognize revenue as well as requiring such entities to provide users of financial statements with more informative, relevant disclosures.`,
    metadata: { standard: 'IFRS 15' }
  }),
  new Document({
    pageContent: `IFRS 16 - Leases
    This standard sets out the principles for the recognition, measurement, presentation and disclosure of leases. The objective is to ensure that lessees and lessors provide relevant information in a manner that faithfully represents those transactions.`,
    metadata: { standard: 'IFRS 16' }
  }),
  // Add more IFRS standards as needed
];