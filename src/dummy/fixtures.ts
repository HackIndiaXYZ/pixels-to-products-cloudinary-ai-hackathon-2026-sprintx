import { countTask, taskSchema, textTask, type Task } from "../lib/domain";
import { RECEIPT_FIXTURES } from "./receipt-fixtures";

export type DummyConditionPreset = {
  name: string;
  taskType: "text" | "count" | "custom";
  terms: string;
  customJson?: string;
  description: string;
};

export type DummyFixture = {
  screening?: string;
  id: string;
  title: string;
  category: "Text & Regulatory Signs" | "Object Counting & Inventory" | "Product Quality & Inspection";
  description: string;
  filename: string;
  url: string;
  defaultCondition: {
    taskType: "text" | "count" | "custom";
    terms: string;
    customJson?: string;
    task: Task;
  };
  conditionPresets: DummyConditionPreset[];
};

export const DUMMY_FIXTURES: DummyFixture[] = [
  ...RECEIPT_FIXTURES,
  {
    id: "safety-sign",
    title: "ANSI Safety Signage",
    category: "Text & Regulatory Signs",
    description: "High-contrast regulatory hazard sign. Tests whether mandatory safety warnings survive compression.",
    filename: "safety-sign.jpg",
    url: "/dummy/safety-sign.jpg",
    defaultCondition: {
      taskType: "text",
      terms: "CAUTION, NO SMOKING, MATCHES, OPEN LIGHTS",
      task: textTask(["CAUTION", "NO SMOKING", "MATCHES", "OPEN LIGHTS"]),
    },
    conditionPresets: [
      {
        name: "Full Safety Warning",
        taskType: "text",
        terms: "CAUTION, NO SMOKING, MATCHES, OPEN LIGHTS",
        description: "Checks all 4 key warning phrases for readability.",
      },
      {
        name: "Primary Directives",
        taskType: "text",
        terms: "CAUTION, NO SMOKING",
        description: "Checks only the primary hazard level and main prohibition.",
      },
      {
        name: "Ignition Sources",
        taskType: "text",
        terms: "MATCHES, OPEN LIGHTS",
        description: "Checks secondary smaller ignition source terms.",
      },
    ],
  },
  {
    id: "storefront-signage",
    title: "Storefront Window Signage",
    category: "Text & Regulatory Signs",
    description: "Real-world commercial glazing with variable font sizes and contrast. Tests small door notices vs bold branding.",
    filename: "storefront-signage.jpg",
    url: "/dummy/storefront-signage.jpg",
    defaultCondition: {
      taskType: "text",
      terms: "CHOO, TEA, OPEN, NO SMOKING, NO VAPING",
      task: textTask(["CHOO", "TEA", "OPEN", "NO SMOKING", "NO VAPING"]),
    },
    conditionPresets: [
      {
        name: "All Commercial Phrases",
        taskType: "text",
        terms: "CHOO, TEA, OPEN, NO SMOKING, NO VAPING",
        description: "Full suite of brand text, operational status, and entrance policies.",
      },
      {
        name: "Store Policy Notices",
        taskType: "text",
        terms: "NO SMOKING, NO VAPING",
        description: "Smaller policy decals located near the door handle.",
      },
      {
        name: "Store Identity & Status",
        taskType: "text",
        terms: "CHOO, TEA, OPEN",
        description: "Prominent upper typography indicating store brand and opening status.",
      },
    ],
  },
  {
    id: "desk-workspace",
    title: "Desk Workspace Inventory",
    category: "Object Counting & Inventory"
    ,description: "Overhead tabletop workspace scene. Tests if downsampling merges or loses count of small, adjacent items.",
    filename: "desk-workspace.jpg",
    url: "/dummy/desk-workspace.jpg",
    defaultCondition: {
      taskType: "count",
      terms: "pens, notebooks, laptops",
      task: countTask(["pens", "notebooks", "laptops"]),
    },
    conditionPresets: [
      {
        name: "Office Supplies Inventory",
        taskType: "count",
        terms: "pens, notebooks, laptops",
        description: "Count writing utensils, notebooks, and electronics on the work surface.",
      },
      {
        name: "Writing Utensils Only",
        taskType: "count",
        terms: "pens",
        description: "Specifically isolates fine pen count consistency across resolutions.",
      },
      {
        name: "Key Devices",
        taskType: "count",
        terms: "laptops, notebooks",
        description: "Tracks macroscopic surface objects.",
      },
    ],
  },
  {
    id: "urban-cyclists",
    title: "Urban Cyclist Mobility",
    category: "Object Counting & Inventory",
    description: "Complex dynamic street scene. Evaluates crowd counting and bicycle detection fidelity under media optimization.",
    filename: "urban-cyclists.jpg",
    url: "/dummy/urban-cyclists.jpg",
    defaultCondition: {
      taskType: "count",
      terms: "bicycles, people, helmets",
      task: countTask(["bicycles", "people", "helmets"]),
    },
    conditionPresets: [
      {
        name: "Cyclists & Equipment",
        taskType: "count",
        terms: "bicycles, people, helmets",
        description: "Counts bikes, riders, and safety gear in traffic flow.",
      },
      {
        name: "Vehicle Count",
        taskType: "count",
        terms: "bicycles",
        description: "Monitors vehicle count invariance across variants.",
      },
      {
        name: "Pedestrians & Commuters",
        taskType: "count",
        terms: "people",
        description: "Counts visible human figures in the scene.",
      },
    ],
  },
  {
    id: "product-packaging",
    title: "Cosmetic Product Packaging",
    category: "Product Quality & Inspection",
    description: "Structured e-commerce packaging inspection. Tests multi-attribute verification (brand, batch code, barcode, seal).",
    filename: "product-packaging.jpg",
    url: "/dummy/product-packaging.jpg",
    defaultCondition: {
      taskType: "custom",
      terms: "",
      customJson: JSON.stringify(
        {
          name: "Lumina Cosmetic Inspection",
          instruction: "Inspect the product packaging and verify that required brand, safety, batch, and barcode details are clearly identifiable.",
          fields: [
            { key: "brand_name", label: "Brand 'Lumina Biotech'", type: "boolean", description: "Is the brand name 'Lumina Biotech' clearly legible?" },
            { key: "product_title", label: "Product 'Hydrating Facial Serum'", type: "boolean", description: "Is the text 'Hydrating Facial Serum' visible?" },
            { key: "batch_visible", label: "Batch Code #LB-2026-X9", type: "boolean", description: "Is the batch code clearly readable?" },
            { key: "tamper_seal", label: "Tamper Evident Seal", type: "boolean", description: "Is the tamper-evident seal indicator visible?" },
            { key: "barcode_present", label: "Barcode Legibility", type: "boolean", description: "Is the product barcode clearly visible at the bottom?" },
          ],
        },
        null,
        2
      ),
      task: taskSchema.parse({
        name: "Lumina Cosmetic Inspection",
        instruction: "Inspect the product packaging and verify that required brand, safety, batch, and barcode details are clearly identifiable.",
        fields: [
          { key: "brand_name", label: "Brand 'Lumina Biotech'", type: "boolean", description: "Is the brand name 'Lumina Biotech' clearly legible?" },
          { key: "product_title", label: "Product 'Hydrating Facial Serum'", type: "boolean", description: "Is the text 'Hydrating Facial Serum' visible?" },
          { key: "batch_visible", label: "Batch Code #LB-2026-X9", type: "boolean", description: "Is the batch code clearly readable?" },
          { key: "tamper_seal", label: "Tamper Evident Seal", type: "boolean", description: "Is the tamper-evident seal indicator visible?" },
          { key: "barcode_present", label: "Barcode Legibility", type: "boolean", description: "Is the product barcode clearly visible at the bottom?" },
        ],
      }),
    },
    conditionPresets: [
      {
        name: "Comprehensive Compliance Inspection",
        taskType: "custom",
        terms: "",
        customJson: JSON.stringify(
          {
            name: "Lumina Cosmetic Inspection",
            instruction: "Inspect the product packaging and verify that required brand, safety, batch, and barcode details are clearly identifiable.",
            fields: [
              { key: "brand_name", label: "Brand 'Lumina Biotech'", type: "boolean", description: "Is the brand name 'Lumina Biotech' clearly legible?" },
              { key: "product_title", label: "Product 'Hydrating Facial Serum'", type: "boolean", description: "Is the text 'Hydrating Facial Serum' visible?" },
              { key: "batch_visible", label: "Batch Code #LB-2026-X9", type: "boolean", description: "Is the batch code clearly readable?" },
              { key: "tamper_seal", label: "Tamper Evident Seal", type: "boolean", description: "Is the tamper-evident seal indicator visible?" },
              { key: "barcode_present", label: "Barcode Legibility", type: "boolean", description: "Is the product barcode clearly visible at the bottom?" },
            ],
          },
          null,
          2
        ),
        description: "Checks brand, product title, batch code, tamper seal, and barcode.",
      },
      {
        name: "Text Quality Only",
        taskType: "text",
        terms: "LUMINA BIOTECH, HYDRATING FACIAL SERUM, DERMATOLOGICALLY TESTED",
        description: "Simple text preservation for the primary packaging typography.",
      },
    ],
  },
];
