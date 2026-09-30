import type { DummyFixture } from './fixtures';
import screeningResults from '../../public/validation/results.json';

// Internet-sourced candidates; live results are not prefilled.
const candidates: DummyFixture[] = [
  {
    "id": "receipt-01",
    "title": "Receipt 01 · 1536px",
    "category": "Text & Regulatory Signs",
    "description": "Extract the final total. CC BY-SA 4.0; attribution in How it works. Screening candidate; drift is not guaranteed.",
    "filename": "receipt-01.jpg",
    "url": "/validation/receipt-01.jpg",
    "defaultCondition": {
      "taskType": "custom",
      "terms": "",
      "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
      "task": {
        "name": "Receipt total extraction",
        "instruction": "Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.",
        "fields": [
          {
            "key": "total",
            "label": "Final purchase total",
            "type": "string",
            "description": "Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable."
          }
        ]
      }
    },
    "conditionPresets": [
      {
        "name": "Extract final total",
        "taskType": "custom",
        "terms": "",
        "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
        "description": "Extract the printed final purchase total without an answer hint."
      }
    ]
  },
  {
    "id": "receipt-02",
    "title": "Receipt 02 · 867px",
    "category": "Text & Regulatory Signs",
    "description": "Extract the final total. CC BY-SA 4.0; attribution in How it works. Screening candidate; drift is not guaranteed.",
    "filename": "receipt-02.jpg",
    "url": "/validation/receipt-02.jpg",
    "defaultCondition": {
      "taskType": "custom",
      "terms": "",
      "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
      "task": {
        "name": "Receipt total extraction",
        "instruction": "Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.",
        "fields": [
          {
            "key": "total",
            "label": "Final purchase total",
            "type": "string",
            "description": "Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable."
          }
        ]
      }
    },
    "conditionPresets": [
      {
        "name": "Extract final total",
        "taskType": "custom",
        "terms": "",
        "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
        "description": "Extract the printed final purchase total without an answer hint."
      }
    ]
  },
  {
    "id": "receipt-03",
    "title": "Receipt 03 · 1216px",
    "category": "Text & Regulatory Signs",
    "description": "Extract the final total. Public domain; attribution in How it works. Screening candidate; drift is not guaranteed.",
    "filename": "receipt-03.jpg",
    "url": "/validation/receipt-03.jpg",
    "defaultCondition": {
      "taskType": "custom",
      "terms": "",
      "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
      "task": {
        "name": "Receipt total extraction",
        "instruction": "Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.",
        "fields": [
          {
            "key": "total",
            "label": "Final purchase total",
            "type": "string",
            "description": "Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable."
          }
        ]
      }
    },
    "conditionPresets": [
      {
        "name": "Extract final total",
        "taskType": "custom",
        "terms": "",
        "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
        "description": "Extract the printed final purchase total without an answer hint."
      }
    ]
  },
  {
    "id": "receipt-04",
    "title": "Receipt 04 · 740px",
    "category": "Text & Regulatory Signs",
    "description": "Extract the final total. CC BY-SA 3.0; attribution in How it works. Screening candidate; drift is not guaranteed.",
    "filename": "receipt-04.jpg",
    "url": "/validation/receipt-04.jpg",
    "defaultCondition": {
      "taskType": "custom",
      "terms": "",
      "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
      "task": {
        "name": "Receipt total extraction",
        "instruction": "Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.",
        "fields": [
          {
            "key": "total",
            "label": "Final purchase total",
            "type": "string",
            "description": "Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable."
          }
        ]
      }
    },
    "conditionPresets": [
      {
        "name": "Extract final total",
        "taskType": "custom",
        "terms": "",
        "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
        "description": "Extract the printed final purchase total without an answer hint."
      }
    ]
  },
  {
    "id": "receipt-05",
    "title": "Receipt 05 · 952px",
    "category": "Text & Regulatory Signs",
    "description": "Extract the final total. Public domain; attribution in How it works. Screening candidate; drift is not guaranteed.",
    "filename": "receipt-05.jpg",
    "url": "/validation/receipt-05.jpg",
    "defaultCondition": {
      "taskType": "custom",
      "terms": "",
      "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
      "task": {
        "name": "Receipt total extraction",
        "instruction": "Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.",
        "fields": [
          {
            "key": "total",
            "label": "Final purchase total",
            "type": "string",
            "description": "Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable."
          }
        ]
      }
    },
    "conditionPresets": [
      {
        "name": "Extract final total",
        "taskType": "custom",
        "terms": "",
        "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
        "description": "Extract the printed final purchase total without an answer hint."
      }
    ]
  },
  {
    "id": "receipt-06",
    "title": "Receipt 06 · 1000px",
    "category": "Text & Regulatory Signs",
    "description": "Extract the final total. Public domain; attribution in How it works. Screening candidate; drift is not guaranteed.",
    "filename": "receipt-06.jpg",
    "url": "/validation/receipt-06.jpg",
    "defaultCondition": {
      "taskType": "custom",
      "terms": "",
      "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
      "task": {
        "name": "Receipt total extraction",
        "instruction": "Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.",
        "fields": [
          {
            "key": "total",
            "label": "Final purchase total",
            "type": "string",
            "description": "Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable."
          }
        ]
      }
    },
    "conditionPresets": [
      {
        "name": "Extract final total",
        "taskType": "custom",
        "terms": "",
        "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
        "description": "Extract the printed final purchase total without an answer hint."
      }
    ]
  },
  {
    "id": "receipt-07",
    "title": "Receipt 07 · 1274px",
    "category": "Text & Regulatory Signs",
    "description": "Extract the final total. CC BY 4.0; attribution in How it works. Screening candidate; drift is not guaranteed.",
    "filename": "receipt-07.jpg",
    "url": "/validation/receipt-07.jpg",
    "defaultCondition": {
      "taskType": "custom",
      "terms": "",
      "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
      "task": {
        "name": "Receipt total extraction",
        "instruction": "Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.",
        "fields": [
          {
            "key": "total",
            "label": "Final purchase total",
            "type": "string",
            "description": "Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable."
          }
        ]
      }
    },
    "conditionPresets": [
      {
        "name": "Extract final total",
        "taskType": "custom",
        "terms": "",
        "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
        "description": "Extract the printed final purchase total without an answer hint."
      }
    ]
  },
  {
    "id": "receipt-08",
    "title": "Receipt 08 · 1425px",
    "category": "Text & Regulatory Signs",
    "description": "Extract the final total. CC BY-SA 4.0; attribution in How it works. Screening candidate; drift is not guaranteed.",
    "filename": "receipt-08.jpg",
    "url": "/validation/receipt-08.jpg",
    "defaultCondition": {
      "taskType": "custom",
      "terms": "",
      "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
      "task": {
        "name": "Receipt total extraction",
        "instruction": "Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.",
        "fields": [
          {
            "key": "total",
            "label": "Final purchase total",
            "type": "string",
            "description": "Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable."
          }
        ]
      }
    },
    "conditionPresets": [
      {
        "name": "Extract final total",
        "taskType": "custom",
        "terms": "",
        "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
        "description": "Extract the printed final purchase total without an answer hint."
      }
    ]
  },
  {
    "id": "receipt-09",
    "title": "Receipt 09 · 1080px",
    "category": "Text & Regulatory Signs",
    "description": "Extract the final total. CC BY-SA 4.0; attribution in How it works. Screening candidate; drift is not guaranteed.",
    "filename": "receipt-09.jpg",
    "url": "/validation/receipt-09.jpg",
    "defaultCondition": {
      "taskType": "custom",
      "terms": "",
      "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
      "task": {
        "name": "Receipt total extraction",
        "instruction": "Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.",
        "fields": [
          {
            "key": "total",
            "label": "Final purchase total",
            "type": "string",
            "description": "Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable."
          }
        ]
      }
    },
    "conditionPresets": [
      {
        "name": "Extract final total",
        "taskType": "custom",
        "terms": "",
        "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
        "description": "Extract the printed final purchase total without an answer hint."
      }
    ]
  },
  {
    "id": "receipt-10",
    "title": "Receipt 10 · 640px",
    "category": "Text & Regulatory Signs",
    "description": "Extract the final total. CC BY-SA 2.0; attribution in How it works. Screening candidate; drift is not guaranteed.",
    "filename": "receipt-10.jpg",
    "url": "/validation/receipt-10.jpg",
    "defaultCondition": {
      "taskType": "custom",
      "terms": "",
      "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
      "task": {
        "name": "Receipt total extraction",
        "instruction": "Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.",
        "fields": [
          {
            "key": "total",
            "label": "Final purchase total",
            "type": "string",
            "description": "Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable."
          }
        ]
      }
    },
    "conditionPresets": [
      {
        "name": "Extract final total",
        "taskType": "custom",
        "terms": "",
        "customJson": "{\n  \"name\": \"Receipt total extraction\",\n  \"instruction\": \"Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.\",\n  \"fields\": [\n    {\n      \"key\": \"total\",\n      \"label\": \"Final purchase total\",\n      \"type\": \"string\",\n      \"description\": \"Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.\"\n    }\n  ]\n}",
        "description": "Extract the printed final purchase total without an answer hint."
      }
    ]
  }
];

export const RECEIPT_FIXTURES: DummyFixture[] = candidates.map((fixture) => {
  const task = fixture.defaultCondition.task;
  task.fields = task.fields.map(field => ({ ...field, comparison: "money" as const }));
  const customJson = JSON.stringify(task, null, 2);
  const status = screeningResults.results.find(r => r.id === fixture.id)?.status;
  const screening = status === "SCREENED" ? "Screened · reference unverified" : status === "INCOMPLETE" ? "Screening incomplete" : "Not screened";
  return { ...fixture, screening, description: `${screening}. ${fixture.description}`, defaultCondition: { ...fixture.defaultCondition, task, customJson }, conditionPresets: fixture.conditionPresets.map(p => ({ ...p, customJson })) };
});
