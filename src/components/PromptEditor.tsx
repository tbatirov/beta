import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';

const PromptEditor: React.FC = () => {
  const [prompts, setPrompts] = useState({
    cleaning: '',
    mapping: '',
    reconciliation: '',
    disclosures: '',
    validation: '',
  });
  const [temperatures, setTemperatures] = useState({
    cleaning: 0.3,
    mapping: 0.3,
    reconciliation: 0.3,
    disclosures: 0.5,
    validation: 0.3,
  });

  useEffect(() => {
    const fetchPrompts = async () => {
      // In a real application, you would fetch these from your backend or local storage
      const savedPrompts = {
        cleaning: localStorage.getItem('customCleaningPrompt') || defaultPrompts.cleaning,
        mapping: localStorage.getItem('customMappingPrompt') || defaultPrompts.mapping,
        reconciliation: localStorage.getItem('customReconciliationPrompt') || defaultPrompts.reconciliation,
        disclosures: localStorage.getItem('customDisclosuresPrompt') || defaultPrompts.disclosures,
        validation: localStorage.getItem('customValidationPrompt') || defaultPrompts.validation,
      };
      setPrompts(savedPrompts);

      const savedTemperatures = {
        cleaning: parseFloat(localStorage.getItem('cleaningTemperature') || '0.3'),
        mapping: parseFloat(localStorage.getItem('mappingTemperature') || '0.3'),
        reconciliation: parseFloat(localStorage.getItem('reconciliationTemperature') || '0.3'),
        disclosures: parseFloat(localStorage.getItem('disclosuresTemperature') || '0.5'),
        validation: parseFloat(localStorage.getItem('validationTemperature') || '0.3'),
      };
      setTemperatures(savedTemperatures);
    };

    fetchPrompts();
  }, []);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>, promptType: keyof typeof prompts) => {
    const newPrompt = e.target.value;
    setPrompts(prev => ({ ...prev, [promptType]: newPrompt }));
    localStorage.setItem(`custom${promptType.charAt(0).toUpperCase() + promptType.slice(1)}Prompt`, newPrompt);
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>, promptType: keyof typeof temperatures) => {
    const newTemperature = parseFloat(e.target.value);
    setTemperatures(prev => ({ ...prev, [promptType]: newTemperature }));
    localStorage.setItem(`${promptType}Temperature`, newTemperature.toString());
  };

  const handleSave = () => {
    Object.entries(prompts).forEach(([key, value]) => {
      localStorage.setItem(`custom${key.charAt(0).toUpperCase() + key.slice(1)}Prompt`, value);
    });
    Object.entries(temperatures).forEach(([key, value]) => {
      localStorage.setItem(`${key}Temperature`, value.toString());
    });
    logger.log(LogLevel.INFO, 'Prompts and temperatures saved successfully');
    alert('Prompts and temperatures saved successfully!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="page-title">IFRS Conversion Prompt Editor</h1>
      <p className="mb-4 text-[var(--text-color)]">
        Customize the prompts and temperature settings for each step of the IFRS conversion process. Use placeholders like {'{FINANCIAL_DATA}'} in your prompts.
      </p>

      {Object.entries(prompts).map(([key, value]) => (
        <div key={key} className="card mb-6">
          <h2 className="section-title capitalize">{key} Prompt</h2>
          <textarea
            className="input h-64 mb-2"
            value={value}
            onChange={(e) => handlePromptChange(e, key as keyof typeof prompts)}
            placeholder={`Enter your custom ${key} prompt here...`}
          />
          <div className="flex items-center">
            <label htmlFor={`${key}-temperature`} className="mr-2">Temperature:</label>
            <input
              type="range"
              id={`${key}-temperature`}
              min="0"
              max="1"
              step="0.1"
              value={temperatures[key as keyof typeof temperatures]}
              onChange={(e) => handleTemperatureChange(e, key as keyof typeof temperatures)}
              className="w-64"
            />
            <span className="ml-2">{temperatures[key as keyof typeof temperatures].toFixed(1)}</span>
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        className="btn-primary"
      >
        Save Prompts and Temperatures
      </button>
    </div>
  );
};

const defaultPrompts = {
  cleaning: `You are an expert in financial data cleaning and structuring. Please clean and structure the following financial data:

{FINANCIAL_DATA}

Respond with a JSON object containing the cleaned and structured financial data. Ensure that:
1. All numerical values are properly formatted as numbers.
2. Remove any unnecessary text or annotations.
3. Organize the data into a clear hierarchical structure.
4. Use consistent naming conventions for financial terms.
5. Include only relevant financial information.

The output should be a valid JSON object that can be parsed and used directly in a financial application.`,

  mapping: `You are an expert in International Financial Reporting Standards (IFRS) and financial account mapping. Given the following financial data:

{FINANCIAL_DATA}

Please map each account to its corresponding IFRS standard or category. Respond with a JSON object where each key is an original account name and its value is the corresponding IFRS standard or category. For example:

{
  "Revenue": "IFRS 15 - Revenue from Contracts with Customers",
  "Property, Plant and Equipment": "IAS 16 - Property, Plant and Equipment",
  "Leases": "IFRS 16 - Leases"
}

Ensure that:
1. All accounts are mapped to the most appropriate IFRS standard or category.
2. Use official IFRS standard names and numbers.
3. If an account doesn't directly correspond to a specific IFRS standard, map it to a general category (e.g., "Assets", "Liabilities", "Equity", "Income", "Expenses").
4. Provide explanations for any complex or ambiguous mappings.`,

  reconciliation: `You are an expert in financial reconciliation and IFRS conversion. Given the original financial data and the IFRS-mapped data:

Original Data:
{ORIGINAL_DATA}

IFRS-Mapped Data:
{IFRS_MAPPED_DATA}

Please perform a reconciliation between the original and IFRS-mapped data. Respond with a JSON object containing:
1. A "differences" array listing all accounts with discrepancies, including the original and new values.
2. An "adjustments" object suggesting necessary adjustments to align with IFRS standards.
3. A "notes" array providing explanations for significant changes or complex reconciliations.

Example structure:
{
  "differences": [
    {
      "account": "Revenue",
      "original": 1000000,
      "ifrs": 950000,
      "difference": -50000
    }
  ],
  "adjustments": {
    "Revenue": {
      "amount": -50000,
      "reason": "Recognition of contract liabilities under IFRS 15"
    }
  },
  "notes": [
    "Revenue adjustment: $50,000 decrease due to change in revenue recognition criteria under IFRS 15."
  ]
}

Ensure that all numerical values are consistent and that explanations are clear and concise.`,

  disclosures: `You are an expert in IFRS disclosures and financial reporting. Based on the following reconciled IFRS financial data:

{RECONCILED_DATA}

Generate the required IFRS disclosures. Respond with a JSON object containing disclosure sections for each relevant IFRS standard. Each section should include:
1. The disclosure requirements as per the IFRS standard.
2. The actual disclosure text based on the provided financial data.
3. Any additional notes or explanations necessary for clarity.

Example structure:
{
  "IFRS 15 - Revenue from Contracts with Customers": {
    "requirements": [
      "Disaggregation of revenue",
      "Information about contract balances",
      "Performance obligations"
    ],
    "disclosures": [
      "The company recognizes revenue from the transfer of goods and services over time and at a point in time in the following major product lines:",
      "... [detailed disclosure text] ..."
    ],
    "notes": [
      "The company has applied the practical expedient in IFRS 15.121 and does not disclose information about remaining performance obligations that have original expected durations of one year or less."
    ]
  }
}

Ensure that the disclosures are comprehensive, accurate, and comply with the latest IFRS standards.`,validation: `You are an expert in IFRS compliance and financial statement validation. Given the following IFRS-converted financial data and generated disclosures:

Financial Data:
{FINANCIAL_DATA}

Disclosures:
{DISCLOSURES}

Please validate the IFRS compliance of the financial statements and disclosures. Respond with a JSON object containing:
1. A "compliance" object indicating overall compliance status for each major section.
2. An "issues" array listing any compliance issues or inconsistencies found.
3. A "recommendations" array suggesting improvements or corrections.

Example structure:
{
  "compliance": {
    "financialStatements": {
      "status": "Partially Compliant",
      "score": 0.85
    },
    "disclosures": {
      "status": "Compliant",
      "score": 0.95
    }
  },
  "issues": [
    {
      "section": "Statement of Financial Position",
      "issue": "Deferred tax assets and liabilities are not offset as required by IAS 12",
      "severity": "Medium"
    }
  ],
  "recommendations": [
    "Offset deferred tax assets and liabilities in compliance with IAS 12",
    "Enhance disclosure on financial instruments to fully meet IFRS 7 requirements"
  ]
}

Ensure that the validation is thorough, covering all aspects of IFRS compliance, and that recommendations are specific and actionable.`
};

export default PromptEditor;