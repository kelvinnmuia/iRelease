import { useState, useEffect, useRef, ChangeEvent } from "react"
import { ChevronDown, Download, MoreVertical, ChevronLeft, ChevronRight, FileText, FileSpreadsheet, Columns3, RefreshCcw, Search, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

const allColumns = [
  { key: "releaseId", label: "Release ID", width: "w-32" },
  { key: "systemName", label: "System Name", width: "w-40" },
  { key: "systemId", label: "System ID", width: "w-28" },
  { key: "releaseVersion", label: "Release Version", width: "w-32" },
  { key: "iteration", label: "Iteration", width: "w-28" },
  { key: "releaseDescription", label: "Release Description", width: "w-48" },
  { key: "functionalityDelivered", label: "Functionality Delivered", width: "w-48" },
  { key: "deliveredDate", label: "Date Delivered", width: "w-32" },
  { key: "tdNoticeDate", label: "TD Notice Date", width: "w-32" },
  { key: "testDeployDate", label: "Test Deploy Date", width: "w-32" },
  { key: "testStartDate", label: "Test Start Date", width: "w-32" },
  { key: "testEndDate", label: "Test End Date", width: "w-32" },
  { key: "prodDeployDate", label: "Prod Deploy Date", width: "w-32" },
  { key: "testStatus", label: "Test Status", width: "w-28" },
  { key: "deploymentStatus", label: "Deployment Status", width: "w-32" },
  { key: "outstandingIssues", label: "Outstanding Issues", width: "w-48" },
  { key: "comments", label: "Comments", width: "w-48" },
  { key: "releaseType", label: "Release Type", width: "w-28" },
  { key: "month", label: "Month", width: "w-28" },
  { key: "financialYear", label: "Financial Year", width: "w-32" },
]

const staticData = [
  {
    id: 1,
    releaseId: "REL-2024-001",
    systemName: "Core Banking System",
    systemId: "CBS-001",
    releaseVersion: "3.9.282.1",
    iteration: "1",
    releaseDescription: "iCMS release_ver_WSO2_PREPROD_PATCH_2.133_Integration_20241122_SCT_ECITIZEN DSL No#1290",
    functionalityDelivered: "Advanced analytics dashboard, Real-time reporting, Enhanced security protocols",
    deliveredDate: "12 Dec 2024",
    tdNoticeDate: "5 Dec 2024",
    testDeployDate: "8 Dec 2024",
    testStartDate: "9 Dec 2024",
    testEndDate: "11 Dec 2024",
    prodDeployDate: "13 Dec 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to Production",
    outstandingIssues: "1. UI alignment issues in dashboard\n2. Performance degradation under high load\n3. Pending security review for new authentication module",
    comments: "Minor UI issues to be fixed in next patch",
    releaseType: "Major",
    month: "December",
    financialYear: "FY2024",
  },
  {
    id: 2,
    releaseId: "REL-2024-002",
    systemName: "Payment Gateway",
    systemId: "PGW-002",
    releaseVersion: "v1.3.0",
    iteration: "Sprint 25",
    releaseDescription: "Security patch and performance improvements focusing on transaction processing",
    functionalityDelivered: "Enhanced encryption, Faster transaction processing, Updated compliance",
    deliveredDate: "10 Dec 2024",
    tdNoticeDate: "3 Dec 2024",
    testDeployDate: "5 Dec 2024",
    testStartDate: "6 Dec 2024",
    testEndDate: "9 Dec 2024",
    prodDeployDate: "11 Dec 2024",
    testStatus: "Active",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "All test cases passed successfully, no outstanding issues identified during testing phase.",
    comments: "All test cases passed successfully",
    releaseType: "Patch",
    month: "December",
    financialYear: "FY2024",
  },
  {
    id: 3,
    releaseId: "REL-2024-003",
    systemName: "Mobile Banking App",
    systemId: "MBA-003",
    releaseVersion: "v3.2.0",
    iteration: "Sprint 26",
    releaseDescription: "New biometric authentication and UI refresh with enhanced user experience",
    functionalityDelivered: "Face ID login, Dark mode, Enhanced navigation, Voice commands",
    deliveredDate: "25 Nov 2024",
    tdNoticeDate: "18 Nov 2024",
    testDeployDate: "20 Nov 2024",
    testStartDate: "21 Nov 2024",
    testEndDate: "24 Nov 2024",
    prodDeployDate: "26 Nov 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to Pre-Prod",
    outstandingIssues: "1. Biometric authentication failing on older devices\n2. Dark mode causing contrast issues in transaction history\n3. Voice command accuracy below target threshold\n4. Memory leaks detected during extended usage\n5. Compatibility issues with iOS 15 and below",
    comments: "Performance testing ongoing with some compatibility issues",
    releaseType: "Major",
    month: "November",
    financialYear: "FY2024",
  },
  {
    id: 4,
    releaseId: "REL-2024-004",
    systemName: "CRM System",
    systemId: "CRM-004",
    releaseVersion: "v4.1.2",
    iteration: "Sprint 27",
    releaseDescription: "Customer segmentation and communication enhancements for better targeting",
    functionalityDelivered: "Advanced segmentation, Bulk messaging, Improved analytics",
    deliveredDate: "25 Nov 2024",
    tdNoticeDate: "18 Nov 2024",
    testDeployDate: "20 Nov 2024",
    testStartDate: "21 Nov 2024",
    testEndDate: "24 Nov 2024",
    prodDeployDate: "26 Nov 2024",
    testStatus: "Closed",
    deploymentStatus: "Rolled Back",
    outstandingIssues: "Critical bug in segmentation algorithm causing incorrect customer grouping. Rollback initiated to maintain data integrity.",
    comments: "Critical bug found in production, rolled back to previous version",
    releaseType: "Minor",
    month: "November",
    financialYear: "FY2024",
  },
  {
    id: 5,
    releaseId: "REL-2024-005",
    systemName: "Loan Management",
    systemId: "LMS-005",
    releaseVersion: "v2.0.0",
    iteration: "Sprint 28",
    releaseDescription: "Complete system overhaul with new risk assessment engine and automated approvals",
    functionalityDelivered: "New risk engine, Automated approvals, Enhanced reporting",
    deliveredDate: "18 Nov 2024",
    tdNoticeDate: "11 Nov 2024",
    testDeployDate: "13 Nov 2024",
    testStartDate: "14 Nov 2024",
    testEndDate: "17 Nov 2024",
    prodDeployDate: "19 Nov 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to Post-Prod",
    outstandingIssues: "1. Risk assessment algorithm producing inconsistent results for small business loans\n2. Automated approval system requiring manual override in 15% of cases\n3. Reporting module missing critical financial metrics\n4. Integration issues with legacy credit scoring system\n5. Performance degradation when processing bulk loan applications\n6. Data migration incomplete for historical loan records\n7. Regulatory compliance documentation pending review\n8. User training materials not yet finalized",
    comments: "Awaiting regulatory approval before production deployment",
    releaseType: "Major",
    month: "November",
    financialYear: "FY2024",
  },
  {
    id: 6,
    releaseId: "REL-2024-006",
    systemName: "HR Management",
    systemId: "HRM-006",
    releaseVersion: "v1.5.0",
    iteration: "Sprint 29",
    releaseDescription: "Employee self-service portal and performance management enhancements",
    functionalityDelivered: "Self-service portal, Performance tracking, Leave management",
    deliveredDate: "14 Nov 2024",
    tdNoticeDate: "7 Nov 2024",
    testDeployDate: "9 Nov 2024",
    testStartDate: "10 Nov 2024",
    testEndDate: "13 Nov 2024",
    prodDeployDate: "15 Nov 2024",
    testStatus: "Deleted",
    deploymentStatus: "Not Deployed",
    outstandingIssues: "Project cancelled due to budget constraints. All development work halted and resources reallocated to higher priority initiatives.",
    comments: "Project cancelled due to budget constraints",
    releaseType: "Minor",
    month: "November",
    financialYear: "FY2024",
  },
  {
    id: 7,
    releaseId: "REL-2024-007",
    systemName: "Fraud Detection Engine",
    systemId: "FDE-007",
    releaseVersion: "v5.0.0",
    iteration: "Sprint 30",
    releaseDescription: "Major upgrade introducing machine-learning-based anomaly detection, real-time fraud scoring, and integration with the national ID verification gateway.",
    functionalityDelivered: "AI-driven anomaly detection, Real-time fraud scoring, ID gateway integration, Enhanced risk models",
    deliveredDate: "10 Nov 2024",
    tdNoticeDate: "3 Nov 2024",
    testDeployDate: "5 Nov 2024",
    testStartDate: "6 Nov 2024",
    testEndDate: "9 Nov 2024",
    prodDeployDate: "11 Nov 2024",
    testStatus: "Active",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "1. Fraud score threshold miscalibration causing false positives\n2. ID verification API timeout under load\n3. ML model accuracy below expected benchmark\n4. Dashboard latency when loading large datasets\n5. Audit trail logs occasionally not capturing user actions\n6. Model retraining pipeline failing intermittently\n7. Real-time alerts duplicated in some cases",
    comments: "Accuracy improvements required before production rollout",
    releaseType: "Major",
    month: "November",
    financialYear: "FY2024"
  },

  {
    id: 8,
    releaseId: "REL-2024-008",
    systemName: "Treasury Management System",
    systemId: "TMS-008",
    releaseVersion: "v3.4.1",
    iteration: "Sprint 30",
    releaseDescription: "Enhancements to FX rate automation, multi-currency settlement module, and liquidity forecasting models.",
    functionalityDelivered: "FX automation, Multi-currency settlement, Liquidity forecasting improvements",
    deliveredDate: "9 Nov 2024",
    tdNoticeDate: "2 Nov 2024",
    testDeployDate: "4 Nov 2024",
    testStartDate: "5 Nov 2024",
    testEndDate: "8 Nov 2024",
    prodDeployDate: "10 Nov 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to Pre-Prod",
    outstandingIssues: "1. FX rate feed inconsistencies during peak hours\n2. Settlement mismatch in multi-currency module\n3. Liquidity forecast deviates by up to 10% in stress tests\n4. UI freeze when generating quarterly reports\n5. Notification emails not triggering for failed settlements",
    comments: "Waiting for regression testing on FX automation",
    releaseType: "Minor",
    month: "November",
    financialYear: "FY2024"
  },

  {
    id: 9,
    releaseId: "REL-2024-009",
    systemName: "Credit Scoring System",
    systemId: "CSS-009",
    releaseVersion: "v2.8.9",
    iteration: "Sprint 31",
    releaseDescription: "Integration with third-party credit bureaus, rules engine updates, improved borrower risk metrics, and new scoring visualization tools.",
    functionalityDelivered: "Credit bureau integration, Updated scoring engine, Risk visualization",
    deliveredDate: "5 Nov 2024",
    tdNoticeDate: "29 Oct 2024",
    testDeployDate: "1 Nov 2024",
    testStartDate: "2 Nov 2024",
    testEndDate: "4 Nov 2024",
    prodDeployDate: "6 Nov 2024",
    testStatus: "Closed",
    deploymentStatus: "Deployed to Production",
    outstandingIssues: "1. Risk weight calculation sometimes produces negative values\n2. Third-party API latency higher than acceptable threshold\n3. Visualization charts failing on older browsers",
    comments: "Release stable; minor enhancements planned for next sprint",
    releaseType: "Major",
    month: "November",
    financialYear: "FY2024"
  },

  {
    id: 10,
    releaseId: "REL-2024-010",
    systemName: "Service Desk Portal",
    systemId: "SDP-010",
    releaseVersion: "v1.9.0",
    iteration: "Sprint 31",
    releaseDescription: "UI refresh, ticket workflow automation, self-service knowledge base improvements, and agent productivity tools.",
    functionalityDelivered: "Workflow automation, Knowledge base update, UI refresh",
    deliveredDate: "3 Nov 2024",
    tdNoticeDate: "27 Oct 2024",
    testDeployDate: "29 Oct 2024",
    testStartDate: "30 Oct 2024",
    testEndDate: "2 Nov 2024",
    prodDeployDate: "4 Nov 2024",
    testStatus: "Active",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "1. Ticket auto-routing misclassifies priority cases\n2. Knowledge base search indexing incomplete\n3. Response time metrics inaccurate for escalated tickets\n4. UI overlap issues on mobile\n5. Email-to-ticket conversion failing intermittently\n6. Agent productivity dashboard shows incorrect averages",
    comments: "Team working on routing logic fix",
    releaseType: "Minor",
    month: "November",
    financialYear: "FY2024"
  },

  {
    id: 11,
    releaseId: "REL-2024-011",
    systemName: "Document Management System",
    systemId: "DMS-011",
    releaseVersion: "v4.0.0",
    iteration: "Sprint 32",
    releaseDescription: "Complete backend migration to cloud-based document repository with OCR improvements and secure sharing functionality.",
    functionalityDelivered: "Cloud migration, OCR enhancements, Secure sharing module",
    deliveredDate: "1 Nov 2024",
    tdNoticeDate: "25 Oct 2024",
    testDeployDate: "27 Oct 2024",
    testStartDate: "28 Oct 2024",
    testEndDate: "31 Oct 2024",
    prodDeployDate: "2 Nov 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to Pre-Prod",
    outstandingIssues: "1. OCR fails on handwritten documents\n2. Cloud storage latency during large batch uploads\n3. Sharing permissions not syncing across linked accounts\n4. Full-text search results missing archived files\n5. Watermarking tool produces low-resolution output\n6. Version history mismatching after edits",
    comments: "OCR vendor engaged for enhancements",
    releaseType: "Major",
    month: "November",
    financialYear: "FY2024"
  },
  {
    id: 12,
    releaseId: "REL-2024-012",
    systemName: "Workflow Automation Engine",
    systemId: "WAE-012",
    releaseVersion: "v6.2.0",
    iteration: "Sprint 32",
    releaseDescription: "Expanded rule builder capabilities, new automation triggers, enhanced reporting, and integration with HR onboarding workflows.",
    functionalityDelivered: "Rule builder enhancements, New automation triggers, Workflow integrations",
    deliveredDate: "30 Oct 2024",
    tdNoticeDate: "23 Oct 2024",
    testDeployDate: "25 Oct 2024",
    testStartDate: "26 Oct 2024",
    testEndDate: "29 Oct 2024",
    prodDeployDate: "31 Oct 2024",
    testStatus: "Closed",
    deploymentStatus: "Deployed to Production",
    outstandingIssues: "1. Conditional triggers firing multiple times\n2. Workflow audit logs not showing all path transitions\n3. Reporting dashboard intermittently failing to export to PDF",
    comments: "Production stable with minor follow-up fixes planned",
    releaseType: "Major",
    month: "October",
    financialYear: "FY2024"
  },
  {
    id: 13,
    releaseId: "REL-2024-013",
    systemName: "Enterprise Messaging Bus",
    systemId: "EMB-013",
    releaseVersion: "v3.7.5",
    iteration: "Sprint 33",
    releaseDescription: "Improved message queue resilience, throughput enhancements, new retry mechanics, and cross-region failover logic.",
    functionalityDelivered: "Queue resilience, Retry logic, Cross-region failover",
    deliveredDate: "28 Oct 2024",
    tdNoticeDate: "21 Oct 2024",
    testDeployDate: "23 Oct 2024",
    testStartDate: "24 Oct 2024",
    testEndDate: "27 Oct 2024",
    prodDeployDate: "29 Oct 2024",
    testStatus: "Active",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "1. Message duplication at high loads\n2. Failover delay exceeds expected SLA\n3. Queue depth monitoring graphs not updating\n4. Intermittent socket disconnects\n5. Retry logic occasionally bypassed for high-priority messages",
    comments: "Failover refinements under review",
    releaseType: "Minor",
    month: "October",
    financialYear: "FY2024"
  },
  {
    id: 14,
    releaseId: "REL-2024-014",
    systemName: "Customer Insights Platform",
    systemId: "CIP-014",
    releaseVersion: "v2.5.1",
    iteration: "Sprint 33",
    releaseDescription: "Enhanced analytics widgets, customer segmentation improvements, and new behavior tracking module with event scoring.",
    functionalityDelivered: "Segmentation updates, Analytics widgets, Behavior scoring",
    deliveredDate: "26 Oct 2024",
    tdNoticeDate: "19 Oct 2024",
    testDeployDate: "21 Oct 2024",
    testStartDate: "22 Oct 2024",
    testEndDate: "25 Oct 2024",
    prodDeployDate: "27 Oct 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to Pre-Prod",
    outstandingIssues: "1. Widget load times inconsistent\n2. Event scoring not applied to all tracked actions\n3. Segmentation rules engine timing out on large datasets\n4. Filtering not persistent across sessions",
    comments: "Pending final review on segmentation module",
    releaseType: "Minor",
    month: "October",
    financialYear: "FY2024"
  },
  {
    id: 15,
    releaseId: "REL-2024-015",
    systemName: "ATM Switch System",
    systemId: "ATS-015",
    releaseVersion: "v7.0.0",
    iteration: "Sprint 34",
    releaseDescription: "Core switch upgrade with EMV enhancements, improved settlement logic, and high-availability clustering.",
    functionalityDelivered: "EMV improvements, Settlement logic, HA clustering",
    deliveredDate: "24 Oct 2024",
    tdNoticeDate: "17 Oct 2024",
    testDeployDate: "19 Oct 2024",
    testStartDate: "20 Oct 2024",
    testEndDate: "23 Oct 2024",
    prodDeployDate: "25 Oct 2024",
    testStatus: "Closed",
    deploymentStatus: "Deployed to Production",
    outstandingIssues: "1. Settlement delays during high transaction periods\n2. EMV fallback transactions misrouted\n3. Audit logs missing terminal ID for select entries",
    comments: "Monitoring EMV fallback cases post-production",
    releaseType: "Major",
    month: "October",
    financialYear: "FY2024"
  },
  {
    id: 16,
    releaseId: "REL-2024-016",
    systemName: "API Gateway",
    systemId: "APG-016",
    releaseVersion: "v5.9.0",
    iteration: "Sprint 34",
    releaseDescription: "API traffic shaping, new developer portal updates, request throttling improvements, and enhanced authentication workflows.",
    functionalityDelivered: "Traffic shaping, Developer portal updates, Throttling improvements",
    deliveredDate: "23 Oct 2024",
    tdNoticeDate: "16 Oct 2024",
    testDeployDate: "18 Oct 2024",
    testStartDate: "19 Oct 2024",
    testEndDate: "22 Oct 2024",
    prodDeployDate: "24 Oct 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to Pre-Prod",
    outstandingIssues: "1. Throttling rules inconsistent under spikes\n2. Portal login slow during peak usage\n3. API key regeneration delays\n4. Traffic analytics missing hourly aggregates",
    comments: "Performance tuning needed before production",
    releaseType: "Major",
    month: "October",
    financialYear: "FY2024"
  },
  {
    id: 17,
    releaseId: "REL-2024-017",
    systemName: "Procurement System",
    systemId: "PCS-017",
    releaseVersion: "v3.1.0",
    iteration: "Sprint 35",
    releaseDescription: "Vendor management module improvements, contract lifecycle automation, and purchase order validation rules update.",
    functionalityDelivered: "Vendor enhancements, Contract automation, PO validation",
    deliveredDate: "20 Oct 2024",
    tdNoticeDate: "13 Oct 2024",
    testDeployDate: "15 Oct 2024",
    testStartDate: "16 Oct 2024",
    testEndDate: "19 Oct 2024",
    prodDeployDate: "21 Oct 2024",
    testStatus: "Active",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "1. Contract renewal notifications not triggering\n2. Duplicate vendor entries after sync\n3. PO validation missing tax rule updates\n4. Attachment uploads failing intermittently",
    comments: "Contract workflows being revalidated",
    releaseType: "Minor",
    month: "October",
    financialYear: "FY2024"
  },
  {
    id: 18,
    releaseId: "REL-2024-018",
    systemName: "Call Center Platform",
    systemId: "CCP-018",
    releaseVersion: "v4.6.3",
    iteration: "Sprint 35",
    releaseDescription: "IVR enhancements, call routing optimization, real-time monitoring dashboard updates, and chatbot integration hooks.",
    functionalityDelivered: "IVR enhancements, Routing optimization, Chatbot integration",
    deliveredDate: "18 Oct 2024",
    tdNoticeDate: "11 Oct 2024",
    testDeployDate: "13 Oct 2024",
    testStartDate: "14 Oct 2024",
    testEndDate: "17 Oct 2024",
    prodDeployDate: "19 Oct 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to Pre-Prod",
    outstandingIssues: "1. IVR menu freeze on low bandwidth connections\n2. Routing rules incorrectly assigning agents\n3. Real-time queue metrics lag by 30–60 seconds\n4. Chatbot handoff logs missing context",
    comments: "IVR fix planned for next sprint",
    releaseType: "Minor",
    month: "October",
    financialYear: "FY2024"
  },
  {
    id: 19,
    releaseId: "REL-2024-019",
    systemName: "E-Statement Generator",
    systemId: "ESG-019",
    releaseVersion: "v2.3.0",
    iteration: "Sprint 36",
    releaseDescription: "New PDF rendering engine, improved email distribution pipeline, and customizable statement templates.",
    functionalityDelivered: "PDF rendering, Template customization, Email distribution",
    deliveredDate: "15 Oct 2024",
    tdNoticeDate: "8 Oct 2024",
    testDeployDate: "10 Oct 2024",
    testStartDate: "11 Oct 2024",
    testEndDate: "14 Oct 2024",
    prodDeployDate: "16 Oct 2024",
    testStatus: "Closed",
    deploymentStatus: "Deployed to Production",
    outstandingIssues: "1. Rendering engine slow on large data sets\n2. Email bounce rate higher than expected\n3. Template editor not saving custom fonts",
    comments: "Monitoring email performance post-deployment",
    releaseType: "Minor",
    month: "October",
    financialYear: "FY2024"
  },

  {
    id: 20,
    releaseId: "REL-2024-020",
    systemName: "User Access Management",
    systemId: "UAM-020",
    releaseVersion: "v1.5.4",
    iteration: "Sprint 36",
    releaseDescription: "Streamlined access provisioning, multi-level approval workflows, and updated password rotation rules.",
    functionalityDelivered: "Access workflows, Password rules, Request automation",
    deliveredDate: "12 Oct 2024",
    tdNoticeDate: "5 Oct 2024",
    testDeployDate: "7 Oct 2024",
    testStartDate: "8 Oct 2024",
    testEndDate: "11 Oct 2024",
    prodDeployDate: "13 Oct 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "1. Approval workflows not assigned correctly\n2. Password rotation notifications delayed\n3. Role provisioning taking too long under load\n4. Audit logs missing requester info",
    comments: "Review underway for role provisioning delays",
    releaseType: "Minor",
    month: "October",
    financialYear: "FY2024"
  },

  {
    id: 21,
    releaseId: "REL-2024-021",
    systemName: "Digital Onboarding",
    systemId: "DOB-021",
    releaseVersion: "v3.0.0",
    iteration: "Sprint 37",
    releaseDescription: "Major update introducing facial recognition onboarding, enhanced KYC workflows, and improved document validation engine.",
    functionalityDelivered: "Facial recognition, KYC enhancements, Document validation",
    deliveredDate: "10 Oct 2024",
    tdNoticeDate: "3 Oct 2024",
    testDeployDate: "5 Oct 2024",
    testStartDate: "6 Oct 2024",
    testEndDate: "9 Oct 2024",
    prodDeployDate: "11 Oct 2024",
    testStatus: "Active",
    deploymentStatus: "Deployed to Pre-Prod",
    outstandingIssues: "1. Facial recognition accuracy reduced in low light\n2. Document validation failing for specific ID formats\n3. KYC approval workflow repetitive steps\n4. Duplicate onboarding sessions created occasionally\n5. High-resolution images causing upload delays",
    comments: "Awaiting accuracy improvements from biometrics vendor",
    releaseType: "Major",
    month: "October",
    financialYear: "FY2024"
  },

  {
    id: 22,
    releaseId: "REL-2024-022",
    systemName: "Enterprise CRM Analytics",
    systemId: "ECA-022",
    releaseVersion: "v2.2.0",
    iteration: "Sprint 37",
    releaseDescription: "New sales funnel analytics, customer churn prediction model, and improved regional segmentation statistics.",
    functionalityDelivered: "Funnel analytics, Churn prediction, Segmentation stats",
    deliveredDate: "8 Oct 2024",
    tdNoticeDate: "1 Oct 2024",
    testDeployDate: "3 Oct 2024",
    testStartDate: "4 Oct 2024",
    testEndDate: "7 Oct 2024",
    prodDeployDate: "9 Oct 2024",
    testStatus: "Closed",
    deploymentStatus: "Deployed to Production",
    outstandingIssues: "1. Churn prediction confidence scores unusually low\n2. Funnel conversion metrics inaccurate for custom stages",
    comments: "Churn model improvements expected next sprint",
    releaseType: "Minor",
    month: "October",
    financialYear: "FY2024"
  },

  {
    id: 23,
    releaseId: "REL-2024-023",
    systemName: "Loan Origination System",
    systemId: "LOS-023",
    releaseVersion: "v4.8.1",
    iteration: "Sprint 38",
    releaseDescription: "Credit rule updates, automated document collection workflows, and revised scoring matrices.",
    functionalityDelivered: "Rule updates, Doc automation, Scoring revisions",
    deliveredDate: "5 Oct 2024",
    tdNoticeDate: "28 Sep 2024",
    testDeployDate: "30 Sep 2024",
    testStartDate: "1 Oct 2024",
    testEndDate: "4 Oct 2024",
    prodDeployDate: "6 Oct 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "1. Scoring matrices misaligned with new policy\n2. Document collection workflow stuck on verification step\n3. Loan rule override not triggered",
    comments: "Policy team reviewing scoring matrix alignment",
    releaseType: "Major",
    month: "October",
    financialYear: "FY2024"
  },

  {
    id: 24,
    releaseId: "REL-2024-024",
    systemName: "Card Management System",
    systemId: "CMS-024",
    releaseVersion: "v6.1.0",
    iteration: "Sprint 38",
    releaseDescription: "Contactless card support expansion, PIN retry mechanism updates, and fraud monitoring rules addition.",
    functionalityDelivered: "Contactless support, PIN retry logic, Fraud rules",
    deliveredDate: "3 Oct 2024",
    tdNoticeDate: "26 Sep 2024",
    testDeployDate: "28 Sep 2024",
    testStartDate: "29 Sep 2024",
    testEndDate: "2 Oct 2024",
    prodDeployDate: "4 Oct 2024",
    testStatus: "Closed",
    deploymentStatus: "Deployed to Production",
    outstandingIssues: "1. PIN retry count not resetting for some card ranges\n2. Contactless limits not applied correctly",
    comments: "Minor fraud rule tuning planned",
    releaseType: "Minor",
    month: "October",
    financialYear: "FY2024"
  },

  {
    id: 25,
    releaseId: "REL-2024-025",
    systemName: "Regulatory Reporting System",
    systemId: "RRS-025",
    releaseVersion: "v7.4.0",
    iteration: "Sprint 39",
    releaseDescription: "Updated compliance reporting templates, new validation rules, and improved regulatory audit exports.",
    functionalityDelivered: "Template updates, Validation rules, Audit exports",
    deliveredDate: "1 Oct 2024",
    tdNoticeDate: "24 Sep 2024",
    testDeployDate: "26 Sep 2024",
    testStartDate: "27 Sep 2024",
    testEndDate: "30 Sep 2024",
    prodDeployDate: "2 Oct 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "1. Validation rule conflicts causing report rejection\n2. Audit export CSV missing column headers\n3. High memory usage during monthly batch generation",
    comments: "Regulatory team reviewing validation logic",
    releaseType: "Major",
    month: "October",
    financialYear: "FY2024"
  },

  {
    id: 26,
    releaseId: "REL-2024-026",
    systemName: "Inventory System",
    systemId: "IVS-026",
    releaseVersion: "v3.3.3",
    iteration: "Sprint 39",
    releaseDescription: "New stock reconciliation workflows, barcode scanning integration, and warehouse analytics reporting.",
    functionalityDelivered: "Reconciliation workflows, Barcode integration, Warehouse analytics",
    deliveredDate: "29 Sep 2024",
    tdNoticeDate: "22 Sep 2024",
    testDeployDate: "24 Sep 2024",
    testStartDate: "25 Sep 2024",
    testEndDate: "28 Sep 2024",
    prodDeployDate: "30 Sep 2024",
    testStatus: "Closed",
    deploymentStatus: "Deployed to Production",
    outstandingIssues: "1. Barcode scanner timeout under low WiFi\n2. Analytics report incorrect for multi-warehouse setups",
    comments: "Feature stable with minor issues",
    releaseType: "Minor",
    month: "September",
    financialYear: "FY2024"
  },

  {
    id: 27,
    releaseId: "REL-2024-027",
    systemName: "Document Verification Engine",
    systemId: "DVE-027",
    releaseVersion: "v2.7.0",
    iteration: "Sprint 40",
    releaseDescription: "Image preprocessing improvements, real-time ID validation enhancements, and fraud pattern detection.",
    functionalityDelivered: "Preprocessing, ID validation, Pattern detection",
    deliveredDate: "27 Sep 2024",
    tdNoticeDate: "20 Sep 2024",
    testDeployDate: "22 Sep 2024",
    testStartDate: "23 Sep 2024",
    testEndDate: "26 Sep 2024",
    prodDeployDate: "28 Sep 2024",
    testStatus: "Active",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "1. ID validation inaccurate for worn-out documents\n2. Fraud detection model producing too many false positives\n3. Preprocessing pipeline slowing down OCR",
    comments: "Working on reducing false positives",
    releaseType: "Major",
    month: "September",
    financialYear: "FY2024"
  },

  {
    id: 28,
    releaseId: "REL-2024-028",
    systemName: "Customer Rewards System",
    systemId: "CRS-028",
    releaseVersion: "v1.9.0",
    iteration: "Sprint 40",
    releaseDescription: "Reward point expiry rules update, partner integration API, and new promotional campaign scheduler.",
    functionalityDelivered: "Expiry rules, Partner API, Campaign scheduler",
    deliveredDate: "25 Sep 2024",
    tdNoticeDate: "18 Sep 2024",
    testDeployDate: "20 Sep 2024",
    testStartDate: "21 Sep 2024",
    testEndDate: "24 Sep 2024",
    prodDeployDate: "26 Sep 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to Pre-Prod",
    outstandingIssues: "1. Expiry rule misfiring\n2. Partner API authentication failure\n3. Scheduler triggering duplicate campaigns",
    comments: "Partner API testing ongoing",
    releaseType: "Minor",
    month: "September",
    financialYear: "FY2024"
  },

  {
    id: 29,
    releaseId: "REL-2024-029",
    systemName: "Payment Settlement Hub",
    systemId: "PSH-029",
    releaseVersion: "v3.5.0",
    iteration: "Sprint 41",
    releaseDescription: "Settlement engine improvements, new batch reconciliation logic, and SWIFT message automation updates.",
    functionalityDelivered: "Reconciliation logic, SWIFT updates, Settlement improvements",
    deliveredDate: "22 Sep 2024",
    tdNoticeDate: "15 Sep 2024",
    testDeployDate: "17 Sep 2024",
    testStartDate: "18 Sep 2024",
    testEndDate: "21 Sep 2024",
    prodDeployDate: "23 Sep 2024",
    testStatus: "Closed",
    deploymentStatus: "Deployed to Production",
    outstandingIssues: "1. SWIFT messages misformatted for rare transaction types\n2. Reconciliation mismatches in cross-border batches",
    comments: "Minor patch planned",
    releaseType: "Major",
    month: "September",
    financialYear: "FY2024"
  },

  {
    id: 30,
    releaseId: "REL-2024-030",
    systemName: "HR Payroll Engine",
    systemId: "HPE-030",
    releaseVersion: "v2.2.2",
    iteration: "Sprint 41",
    releaseDescription: "Payroll calculation adjustments, benefit deduction formulas update, and bonus computation automation.",
    functionalityDelivered: "Calculation updates, Deduction formulas, Bonus automation",
    deliveredDate: "20 Sep 2024",
    tdNoticeDate: "13 Sep 2024",
    testDeployDate: "15 Sep 2024",
    testStartDate: "16 Sep 2024",
    testEndDate: "19 Sep 2024",
    prodDeployDate: "21 Sep 2024",
    testStatus: "Active",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "1. Incorrect bonus calculation rounding\n2. Overlapping deduction categories\n3. High computation time for large payroll groups",
    comments: "Awaiting finance approval on new formulas",
    releaseType: "Minor",
    month: "September",
    financialYear: "FY2024"
  },
{
    id: 31,
    releaseId: "REL-2024-031",
    systemName: "Internal Audit System",
    systemId: "IAS-031",
    releaseVersion: "v3.0.0",
    iteration: "Sprint 42",
    releaseDescription: "Redesigned audit planning workflow, automated checklist generation, and updated audit trail logging.",
    functionalityDelivered: "Planning workflow, Checklist automation, Trail updates",
    deliveredDate: "18 Sep 2024",
    tdNoticeDate: "11 Sep 2024",
    testDeployDate: "13 Sep 2024",
    testStartDate: "14 Sep 2024",
    testEndDate: "17 Sep 2024",
    prodDeployDate: "19 Sep 2024",
    testStatus: "Closed",
    deploymentStatus: "Deployed to Production",
    outstandingIssues: "1. Checklist version mismatch\n2. Audit trail occasionally not capturing sub-events",
    comments: "Stable with minor anomalies",
    releaseType: "Major",
    month: "September",
    financialYear: "FY2024"
  },

  {
    id: 32,
    releaseId: "REL-2024-032",
    systemName: "KYC Verification Portal",
    systemId: "KVP-032",
    releaseVersion: "v1.4.0",
    iteration: "Sprint 42",
    releaseDescription: "Improved national ID validation API, address verification module update, and KRA PIN verification integration.",
    functionalityDelivered: "ID validation, Address verification, PIN validation",
    deliveredDate: "15 Sep 2024",
    tdNoticeDate: "8 Sep 2024",
    testDeployDate: "10 Sep 2024",
    testStartDate: "11 Sep 2024",
    testEndDate: "14 Sep 2024",
    prodDeployDate: "16 Sep 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to Pre-Prod",
    outstandingIssues: "1. ID verification timeout\n2. Address verification mismatches county data\n3. PIN verification API rate limiting errors",
    comments: "Awaiting API performance improvements",
    releaseType: "Minor",
    month: "September",
    financialYear: "FY2024"
  },

  {
    id: 33,
    releaseId: "REL-2024-033",
    systemName: "Cheque Clearing Hub",
    systemId: "CCH-033",
    releaseVersion: "v5.2.1",
    iteration: "Sprint 43",
    releaseDescription: "New clearing rules, improved cheque imaging clarity, and reconciliation updates for interbank flows.",
    functionalityDelivered: "Clearing rules, Imaging improvements, Reconciliation updates",
    deliveredDate: "13 Sep 2024",
    tdNoticeDate: "6 Sep 2024",
    testDeployDate: "8 Sep 2024",
    testStartDate: "9 Sep 2024",
    testEndDate: "12 Sep 2024",
    prodDeployDate: "14 Sep 2024",
    testStatus: "Active",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "1. Blurry cheque images for certain scanners\n2. Reconciliation mismatches from batch 4\n3. Clearing rule exceptions not applied consistently",
    comments: "Image processing vendor engaged",
    releaseType: "Minor",
    month: "September",
    financialYear: "FY2024"
  },

  {
    id: 34,
    releaseId: "REL-2024-034",
    systemName: "Risk Management Portal",
    systemId: "RMP-034",
    releaseVersion: "v4.4.4",
    iteration: "Sprint 43",
    releaseDescription: "New risk scoring templates, enhanced scenario simulation engine, and updated control assessment workflows.",
    functionalityDelivered: "Scoring templates, Simulation engine, Control assessments",
    deliveredDate: "10 Sep 2024",
    tdNoticeDate: "3 Sep 2024",
    testDeployDate: "5 Sep 2024",
    testStartDate: "6 Sep 2024",
    testEndDate: "9 Sep 2024",
    prodDeployDate: "11 Sep 2024",
    testStatus: "Closed",
    deploymentStatus: "Deployed to Production",
    outstandingIssues: "1. Simulation results vary between runs\n2. Control assessment results not synced across reviewers",
    comments: "Simulation stabilization needed later",
    releaseType: "Major",
    month: "September",
    financialYear: "FY2024"
  },

  {
    id: 35,
    releaseId: "REL-2024-035",
    systemName: "Data Warehouse",
    systemId: "DWH-035",
    releaseVersion: "v10.0.0",
    iteration: "Sprint 44",
    releaseDescription: "Massive ETL pipeline redesign, improved partition logic, and new analytics marts for operations and finance.",
    functionalityDelivered: "ETL redesign, Partition logic, Analytics marts",
    deliveredDate: "8 Sep 2024",
    tdNoticeDate: "1 Sep 2024",
    testDeployDate: "3 Sep 2024",
    testStartDate: "4 Sep 2024",
    testEndDate: "7 Sep 2024",
    prodDeployDate: "9 Sep 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to Pre-Prod",
    outstandingIssues: "1. ETL jobs running 40% slower than expected\n2. Partition pruning not working for old tables\n3. Finance mart missing month-end aggregates\n4. Data drift detected in Operations mart",
    comments: "ETL optimization ongoing",
    releaseType: "Major",
    month: "September",
    financialYear: "FY2024"
  },

  {
    id: 36,
    releaseId: "REL-2024-036",
    systemName: "CRM Chatbot",
    systemId: "BOT-036",
    releaseVersion: "v1.6.2",
    iteration: "Sprint 44",
    releaseDescription: "Improved NLP understanding, multilingual support for Swahili, and new agent handover logic.",
    functionalityDelivered: "NLP updates, Multilingual support, Handover logic",
    deliveredDate: "5 Sep 2024",
    tdNoticeDate: "29 Aug 2024",
    testDeployDate: "31 Aug 2024",
    testStartDate: "1 Sep 2024",
    testEndDate: "4 Sep 2024",
    prodDeployDate: "6 Sep 2024",
    testStatus: "Active",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "1. Swahili responses occasionally incorrect\n2. NLP misinterpreting complex queries\n3. Handover loses context 20% of the time",
    comments: "Language pack upgrade planned",
    releaseType: "Minor",
    month: "September",
    financialYear: "FY2024"
  },

  {
    id: 37,
    releaseId: "REL-2024-037",
    systemName: "Audit Evidence Archive",
    systemId: "AEA-037",
    releaseVersion: "v2.1.0",
    iteration: "Sprint 45",
    releaseDescription: "Improved evidence categorization, encrypted backup stream, and multi-year storage optimization.",
    functionalityDelivered: "Categorization, Encryption, Storage optimization",
    deliveredDate: "3 Sep 2024",
    tdNoticeDate: "27 Aug 2024",
    testDeployDate: "29 Aug 2024",
    testStartDate: "30 Aug 2024",
    testEndDate: "2 Sep 2024",
    prodDeployDate: "4 Sep 2024",
    testStatus: "Closed",
    deploymentStatus: "Deployed to Production",
    outstandingIssues: "1. Some files missing category metadata\n2. Archive search slow for old documents",
    comments: "Optimization review scheduled",
    releaseType: "Minor",
    month: "September",
    financialYear: "FY2024"
  },

  {
    id: 38,
    releaseId: "REL-2024-038",
    systemName: "Compliance Workflow Engine",
    systemId: "CWE-038",
    releaseVersion: "v3.9.1",
    iteration: "Sprint 45",
    releaseDescription: "Regulatory requirement updates, workflow escalation improvements, and real-time compliance status dashboard.",
    functionalityDelivered: "Escalation logic, Requirement updates, Compliance dashboard",
    deliveredDate: "1 Sep 2024",
    tdNoticeDate: "25 Aug 2024",
    testDeployDate: "27 Aug 2024",
    testStartDate: "28 Aug 2024",
    testEndDate: "31 Aug 2024",
    prodDeployDate: "2 Sep 2024",
    testStatus: "Active",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "1. Escalations delayed by 10 minutes\n2. Dashboard intermittent data refresh failures\n3. Compliance metrics not updated after workflow reassignments",
    comments: "Pending dashboard stabilization",
    releaseType: "Major",
    month: "September",
    financialYear: "FY2024"
  },

  {
    id: 39,
    releaseId: "REL-2024-039",
    systemName: "Bulk Payments Engine",
    systemId: "BPE-039",
    releaseVersion: "v1.8.0",
    iteration: "Sprint 46",
    releaseDescription: "Bulk file validation improvements, beneficiary grouping logic, and multi-bank payment routing module.",
    functionalityDelivered: "Validation updates, Beneficiary grouping, Routing logic",
    deliveredDate: "30 Aug 2024",
    tdNoticeDate: "23 Aug 2024",
    testDeployDate: "25 Aug 2024",
    testStartDate: "26 Aug 2024",
    testEndDate: "29 Aug 2024",
    prodDeployDate: "31 Aug 2024",
    testStatus: "Closed",
    deploymentStatus: "Deployed to Production",
    outstandingIssues: "1. Routing incorrect for some banks\n2. Beneficiary grouping not applied for small batches",
    comments: "Routing fix scheduled",
    releaseType: "Minor",
    month: "August",
    financialYear: "FY2024"
  },

  {
    id: 40,
    releaseId: "REL-2024-040",
    systemName: "ATM Monitoring Suite",
    systemId: "AMS-040",
    releaseVersion: "v3.3.0",
    iteration: "Sprint 46",
    releaseDescription: "Enhanced terminal health monitoring, real-time performance alerts, and improved cash forecasting models.",
    functionalityDelivered: "Terminal health, Alerts, Cash forecasting",
    deliveredDate: "28 Aug 2024",
    tdNoticeDate: "21 Aug 2024",
    testDeployDate: "23 Aug 2024",
    testStartDate: "24 Aug 2024",
    testEndDate: "27 Aug 2024",
    prodDeployDate: "29 Aug 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "1. Forecasting model inaccurate for rural ATMs\n2. Alerts duplicated during offline periods\n3. Terminal health dashboard slow to load",
    comments: "Pending model recalibration",
    releaseType: "Minor",
    month: "August",
    financialYear: "FY2024"
  },
  {
    id: 41,
    releaseId: "REL-2024-041",
    systemName: "ATM Monitoring System",
    systemId: "ATMM-041",
    releaseVersion: "v4.0.1",
    iteration: "Sprint 51",
    releaseDescription: "Critical enhancements to remote ATM monitoring engine, including predictive failure algorithms, live cash-level tracking, and core banking alert integration for faster incident resolution.",
    functionalityDelivered: "Predictive failure detection, Cash-level analytics, Core alert integration",
    deliveredDate: "14 Jul 2024",
    tdNoticeDate: "8 Jul 2024",
    testDeployDate: "10 Jul 2024",
    testStartDate: "11 Jul 2024",
    testEndDate: "13 Jul 2024",
    prodDeployDate: "15 Jul 2024",
    testStatus: "Active",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "1. Predictive engine generating false positives for low-cash warnings\n2. ATM device health metrics missing for certain branches\n3. Alert duplication observed during peak hours\n4. Real-time feed delayed by up to 10 seconds on slow networks\n5. API timeout between telemetry gateway and monitoring core",
    comments: "Predictive model recalibration in progress",
    releaseType: "Major",
    month: "July",
    financialYear: "FY2024"
  },
  {
    id: 42,
    releaseId: "REL-2024-042",
    systemName: "Internal Audit System",
    systemId: "IAS-042",
    releaseVersion: "v2.5.9",
    iteration: "Sprint 51",
    releaseDescription: "Enhancements to audit workflow engine with new compliance templates, automated flagging rules, and detailed cross-department audit comparison dashboards.",
    functionalityDelivered: "New compliance templates, Automated flagging rules, Comparative dashboards",
    deliveredDate: "12 Jul 2024",
    tdNoticeDate: "6 Jul 2024",
    testDeployDate: "8 Jul 2024",
    testStartDate: "9 Jul 2024",
    testEndDate: "11 Jul 2024",
    prodDeployDate: "13 Jul 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to Pre-Prod",
    outstandingIssues: "1. Flagging rules incorrectly marking valid entries as anomalies\n2. Dashboard export to Excel missing chart components\n3. Template versioning not syncing to mobile view\n4. Approval workflow slows when handling more than 200 items",
    comments: "Awaiting compliance sign-off for rule adjustments",
    releaseType: "Minor",
    month: "July",
    financialYear: "FY2024"
  },
  {
    id: 43,
    releaseId: "REL-2024-043",
    systemName: "API Gateway",
    systemId: "APIG-043",
    releaseVersion: "v7.0.0",
    iteration: "Sprint 52",
    releaseDescription: "High-impact API gateway overhaul introducing multi-tenant routing, improved throttling rules, version-based access control, and developer analytics telemetry.",
    functionalityDelivered: "Multi-tenant routing, Enhanced throttling, API version controls, Telemetry analytics",
    deliveredDate: "10 Jul 2024",
    tdNoticeDate: "3 Jul 2024",
    testDeployDate: "5 Jul 2024",
    testStartDate: "6 Jul 2024",
    testEndDate: "9 Jul 2024",
    prodDeployDate: "11 Jul 2024",
    testStatus: "Closed",
    deploymentStatus: "Deployed to Production",
    outstandingIssues: "1. Developer telemetry events slightly delayed\n2. Some legacy integrations require remapping",
    comments: "Successful rollout with minimal disruption",
    releaseType: "Major",
    month: "July",
    financialYear: "FY2024"
  },
  {
    id: 44,
    releaseId: "REL-2024-044",
    systemName: "Dispute Management System",
    systemId: "DMS-044",
    releaseVersion: "v3.6.2",
    iteration: "Sprint 52",
    releaseDescription: "Workflow enhancements for faster dispute categorization, automated evidence collection, and integration with external card networks for real-time updates.",
    functionalityDelivered: "Faster categorization engine, Automated evidence collection, Card network integration",
    deliveredDate: "8 Jul 2024",
    tdNoticeDate: "2 Jul 2024",
    testDeployDate: "4 Jul 2024",
    testStartDate: "5 Jul 2024",
    testEndDate: "7 Jul 2024",
    prodDeployDate: "9 Jul 2024",
    testStatus: "Active",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "1. Evidence capture tool missing attachments on mobile upload\n2. SLA timer not resetting after reclassification\n3. Integration events occasionally duplicated\n4. Customer notification emails not localized",
    comments: "Mobile upload fix in pipeline",
    releaseType: "Minor",
    month: "July",
    financialYear: "FY2024"
  },

  {
    id: 45,
    releaseId: "REL-2024-045",
    systemName: "Contact Center Suite",
    systemId: "CCS-045",
    releaseVersion: "v2.4.0",
    iteration: "Sprint 53",
    releaseDescription: "New agent assistance module powered by NLP, sentiment detection for calls, call categorization AI, and real-time queue prioritization features.",
    functionalityDelivered: "NLP agent assistant, Sentiment detection, Queue prioritization AI",
    deliveredDate: "6 Jul 2024",
    tdNoticeDate: "29 Jun 2024",
    testDeployDate: "1 Jul 2024",
    testStartDate: "2 Jul 2024",
    testEndDate: "5 Jul 2024",
    prodDeployDate: "7 Jul 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to Pre-Prod",
    outstandingIssues: "1. Sentiment model misinterprets mixed-language calls\n2. Queue prioritization not respecting VIP flags\n3. Call categorization accuracy inconsistent\n4. Whisper transcript missing punctuation\n5. UI freezing in agent dashboard",
    comments: "AI vendor reviewing training datasets",
    releaseType: "Major",
    month: "July",
    financialYear: "FY2024"
  },

  {
    id: 46,
    releaseId: "REL-2024-046",
    systemName: "Internal Messaging Platform",
    systemId: "IMP-046",
    releaseVersion: "v1.8.1",
    iteration: "Sprint 53",
    releaseDescription: "Security update improving encryption, delivery receipts, multi-user chat stability, and offline message syncing across devices.",
    functionalityDelivered: "Encryption improvements, Group chat stability, Offline sync",
    deliveredDate: "4 Jul 2024",
    tdNoticeDate: "27 Jun 2024",
    testDeployDate: "29 Jun 2024",
    testStartDate: "30 Jun 2024",
    testEndDate: "3 Jul 2024",
    prodDeployDate: "5 Jul 2024",
    testStatus: "Active",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "1. Offline message sync missing timestamps\n2. Delivery receipt inconsistencies\n3. Group chat latency spikes\n4. Push notifications delayed for iOS users",
    comments: "Push notification queue under review",
    releaseType: "Patch",
    month: "July",
    financialYear: "FY2024"
  },

  {
    id: 47,
    releaseId: "REL-2024-047",
    systemName: "Check Clearing System",
    systemId: "CCS-047",
    releaseVersion: "v5.1.0",
    iteration: "Sprint 54",
    releaseDescription: "Enhancement of clearing logic for interbank check processing, image validation improvements, and new fraud detection heuristics.",
    functionalityDelivered: "Improved clearing engine, Image validation, Fraud heuristics",
    deliveredDate: "2 Jul 2024",
    tdNoticeDate: "25 Jun 2024",
    testDeployDate: "27 Jun 2024",
    testStartDate: "28 Jun 2024",
    testEndDate: "1 Jul 2024",
    prodDeployDate: "3 Jul 2024",
    testStatus: "Closed",
    deploymentStatus: "Deployed to Production",
    outstandingIssues: "1. Low-resolution check images rejected incorrectly\n2. Fraud heuristics produce inconsistent scoring for corporate checks",
    comments: "Stable release with minor tuning planned",
    releaseType: "Major",
    month: "July",
    financialYear: "FY2024"
  },

  {
    id: 48,
    releaseId: "REL-2024-048",
    systemName: "Asset Finance Portal",
    systemId: "AFP-048",
    releaseVersion: "v3.1.4",
    iteration: "Sprint 54",
    releaseDescription: "UI upgrade and rule-engine update for customer asset financing with automated eligibility scoring and partner dealer integration.",
    functionalityDelivered: "Eligibility scoring, Dealer integration, UI upgrade",
    deliveredDate: "30 Jun 2024",
    tdNoticeDate: "23 Jun 2024",
    testDeployDate: "25 Jun 2024",
    testStartDate: "26 Jun 2024",
    testEndDate: "29 Jun 2024",
    prodDeployDate: "1 Jul 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to Pre-Prod",
    outstandingIssues: "1. Eligibility scoring miscalculating vehicle depreciation values\n2. Dealer API tokens expiring prematurely\n3. Customer application form validation errors\n4. Asset valuation engine returns inconsistent results",
    comments: "Pending dealer-side fixes",
    releaseType: "Minor",
    month: "June",
    financialYear: "FY2024"
  },

  {
    id: 49,
    releaseId: "REL-2024-049",
    systemName: "Payment Reconciliation Engine",
    systemId: "PRE-049",
    releaseVersion: "v6.0.0",
    iteration: "Sprint 55",
    releaseDescription: "Major overhaul of the reconciliation engine with multi-source matching logic, mismatch resolution workflows, and automated exception cleanup.",
    functionalityDelivered: "Multi-source matching, Automated cleanup, Exception workflows",
    deliveredDate: "28 Jun 2024",
    tdNoticeDate: "21 Jun 2024",
    testDeployDate: "23 Jun 2024",
    testStartDate: "24 Jun 2024",
    testEndDate: "27 Jun 2024",
    prodDeployDate: "29 Jun 2024",
    testStatus: "Active",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "1. Matching engine producing duplicate entries\n2. Exception cleanup not triggering for older data\n3. Mismatch summary report missing footer\n4. CSV export failing for large datasets\n5. Workflow stuck when reassigned",
    comments: "Engine reindexing required",
    releaseType: "Major",
    month: "June",
    financialYear: "FY2024"
  },

  {
    id: 50,
    releaseId: "REL-2024-050",
    systemName: "Corporate Onboarding System",
    systemId: "COS-050",
    releaseVersion: "v4.3.7",
    iteration: "Sprint 55",
    releaseDescription: "Enhancements to onboarding workflow, risk scoring automation, KYC document scanning, and multi-approver authorization.",
    functionalityDelivered: "Risk automation, Multi-approver workflow, KYC scanning",
    deliveredDate: "26 Jun 2024",
    tdNoticeDate: "19 Jun 2024",
    testDeployDate: "21 Jun 2024",
    testStartDate: "22 Jun 2024",
    testEndDate: "25 Jun 2024",
    prodDeployDate: "27 Jun 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to Pre-Prod",
    outstandingIssues: "1. Multi-approver workflow crashes on reassignment\n2. KYC scans blurry for some formats\n3. Risk engine scoring lower than expected\n4. PDF export missing some required fields",
    comments: "Risk engine calibration underway",
    releaseType: "Minor",
    month: "June",
    financialYear: "FY2024"
  },
{
  id: 51,
  releaseId: "REL-2025-051",
  systemName: "Mobile Banking App",
  systemId: "MBA-051",
  releaseVersion: "v3.4.0",
  iteration: "Sprint 40",
  releaseDescription: "UI improvements and payment verification workflow optimization for faster user flows.",
  functionalityDelivered: "Streamlined payment flow, UI spacing fixes, Faster verification screens",
  deliveredDate: "08 Jan 2025",
  tdNoticeDate: "02 Jan 2025",
  testDeployDate: "03 Jan 2025",
  testStartDate: "04 Jan 2025",
  testEndDate: "07 Jan 2025",
  prodDeployDate: "09 Jan 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "None identified during testing.",
  comments: "Successful rollout with positive internal feedback",
  releaseType: "Minor",
  month: "January",
  financialYear: "FY2025"
},
{
  id: 52,
  releaseId: "REL-2025-052",
  systemName: "Payment Gateway",
  systemId: "PGW-052",
  releaseVersion: "v2.0.5",
  iteration: "Sprint 41",
  releaseDescription: "Enhancements to settlement reconciliation accuracy and integration with new partner networks.",
  functionalityDelivered: "Partner network integration, Reconciliation logic improvements",
  deliveredDate: "10 Jan 2025",
  tdNoticeDate: "04 Jan 2025",
  testDeployDate: "05 Jan 2025",
  testStartDate: "06 Jan 2025",
  testEndDate: "09 Jan 2025",
  prodDeployDate: "11 Jan 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "1. Network timeout for partner API\n2. Reconciliation mismatch observed for cross-border transactions",
  comments: "Partner network team engaged",
  releaseType: "Patch",
  month: "January",
  financialYear: "FY2025"
},
{
  id: 53,
  releaseId: "REL-2025-053",
  systemName: "Fraud Detection Engine",
  systemId: "FDE-053",
  releaseVersion: "v4.9.2",
  iteration: "Sprint 42",
  releaseDescription: "Improvements to real-time scoring algorithms with updated behavioral rule sets.",
  functionalityDelivered: "New behavioral rule sets, Improved scoring latency",
  deliveredDate: "12 Jan 2025",
  tdNoticeDate: "06 Jan 2025",
  testDeployDate: "07 Jan 2025",
  testStartDate: "08 Jan 2025",
  testEndDate: "11 Jan 2025",
  prodDeployDate: "13 Jan 2025",
  testStatus: "Pending",
  deploymentStatus: "Deployed to Pre-Prod",
  outstandingIssues: "1. Scorecard drift detected under heavy user traffic\n2. Alert duplication for high-risk categories",
  comments: "Tuning model thresholds",
  releaseType: "Minor",
  month: "January",
  financialYear: "FY2025"
},
{
  id: 54,
  releaseId: "REL-2025-054",
  systemName: "CRM System",
  systemId: "CRM-054",
  releaseVersion: "v4.3.0",
  iteration: "Sprint 43",
  releaseDescription: "Enhancements to customer segmentation and automation of follow-up workflows.",
  functionalityDelivered: "Segment builder improvements, Automated follow-up workflows",
  deliveredDate: "15 Jan 2025",
  tdNoticeDate: "09 Jan 2025",
  testDeployDate: "10 Jan 2025",
  testStartDate: "11 Jan 2025",
  testEndDate: "14 Jan 2025",
  prodDeployDate: "16 Jan 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "Minor delay in follow-up workflow triggers.",
  comments: "Business team monitoring performance",
  releaseType: "Minor",
  month: "January",
  financialYear: "FY2025"
},
{
  id: 55,
  releaseId: "REL-2025-055",
  systemName: "Loan Management",
  systemId: "LMS-055",
  releaseVersion: "v2.1.0",
  iteration: "Sprint 44",
  releaseDescription: "Major rearchitecture of loan decisioning engine with updated scoring inputs.",
  functionalityDelivered: "New decisioning algorithm, Expanded scoring dataset, Fraud flags integration",
  deliveredDate: "18 Jan 2025",
  tdNoticeDate: "12 Jan 2025",
  testDeployDate: "13 Jan 2025",
  testStartDate: "14 Jan 2025",
  testEndDate: "17 Jan 2025",
  prodDeployDate: "19 Jan 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "1. Missing credit score data for SME clients\n2. Risk overrides triggering incorrectly\n3. Legacy loan workflows not mapping correctly",
  comments: "Integration with scoring service ongoing",
  releaseType: "Major",
  month: "January",
  financialYear: "FY2025"
},
{
  id: 56,
  releaseId: "REL-2025-056",
  systemName: "HR Management",
  systemId: "HRM-056",
  releaseVersion: "v1.7.1",
  iteration: "Sprint 45",
  releaseDescription: "Performance management module improvements and KPI automation.",
  functionalityDelivered: "KPI auto-calculation, Improved performance dashboards",
  deliveredDate: "20 Jan 2025",
  tdNoticeDate: "14 Jan 2025",
  testDeployDate: "15 Jan 2025",
  testStartDate: "16 Jan 2025",
  testEndDate: "19 Jan 2025",
  prodDeployDate: "21 Jan 2025",
  testStatus: "Pending",
  deploymentStatus: "Deployed to Pre-Prod",
  outstandingIssues: "KPI metrics failing under load testing.",
  comments: "Performance team conducting stress tests",
  releaseType: "Minor",
  month: "January",
  financialYear: "FY2025"
},
{
  id: 57,
  releaseId: "REL-2025-057",
  systemName: "Core Banking System",
  systemId: "CBS-057",
  releaseVersion: "4.0.2",
  iteration: "Sprint 46",
  releaseDescription: "Fixes to transaction posting module and improvements to batch processing time.",
  functionalityDelivered: "Batch performance improvements, Posting validation fixes",
  deliveredDate: "22 Jan 2025",
  tdNoticeDate: "16 Jan 2025",
  testDeployDate: "17 Jan 2025",
  testStartDate: "18 Jan 2025",
  testEndDate: "21 Jan 2025",
  prodDeployDate: "23 Jan 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "Minor batch timestamp mismatch reported.",
  comments: "Monitoring batch results",
  releaseType: "Patch",
  month: "January",
  financialYear: "FY2025"
},
{
  id: 58,
  releaseId: "REL-2025-058",
  systemName: "API Gateway",
  systemId: "APG-058",
  releaseVersion: "v3.0.1",
  iteration: "Sprint 47",
  releaseDescription: "Security improvements with API signature validation updates.",
  functionalityDelivered: "Signature validation enhancement, API token hardening",
  deliveredDate: "25 Jan 2025",
  tdNoticeDate: "20 Jan 2025",
  testDeployDate: "21 Jan 2025",
  testStartDate: "22 Jan 2025",
  testEndDate: "24 Jan 2025",
  prodDeployDate: "26 Jan 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "1. Signature mismatch for large file uploads\n2. Token renewal delay under peak traffic",
  comments: "Security team reviewing policy alignment",
  releaseType: "Minor",
  month: "January",
  financialYear: "FY2025"
},
{
  id: 59,
  releaseId: "REL-2025-059",
  systemName: "Data Warehouse",
  systemId: "DWH-059",
  releaseVersion: "v7.5.0",
  iteration: "Sprint 48",
  releaseDescription: "ETL optimization for monthly financial consolidation and reporting.",
  functionalityDelivered: "Optimized ETL pipelines, Consolidation reporting enhancements",
  deliveredDate: "28 Jan 2025",
  tdNoticeDate: "22 Jan 2025",
  testDeployDate: "23 Jan 2025",
  testStartDate: "24 Jan 2025",
  testEndDate: "27 Jan 2025",
  prodDeployDate: "29 Jan 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "Both nightly and weekly ETL cycles generating verbose warning logs.",
  comments: "Monitoring ETL cycles for anomalies",
  releaseType: "Minor",
  month: "January",
  financialYear: "FY2025"
},
{
  id: 60,
  releaseId: "REL-2025-060",
  systemName: "Document Management System",
  systemId: "DMS-060",
  releaseVersion: "v2.7.0",
  iteration: "Sprint 49",
  releaseDescription: "Metadata validation enhancements + large document upload improvements.",
  functionalityDelivered: "Metadata improvements, Large file upload reliability",
  deliveredDate: "30 Jan 2025",
  tdNoticeDate: "24 Jan 2025",
  testDeployDate: "25 Jan 2025",
  testStartDate: "26 Jan 2025",
  testEndDate: "29 Jan 2025",
  prodDeployDate: "31 Jan 2025",
  testStatus: "Pending",
  deploymentStatus: "Deployed to Pre-Prod",
  outstandingIssues: "Large PDF files fail with timeout after 120 seconds.",
  comments: "Infrastructure team investigating file streaming",
  releaseType: "Minor",
  month: "January",
  financialYear: "FY2025"
},
{
  id: 61,
  releaseId: "REL-2025-061",
  systemName: "Customer Support Portal",
  systemId: "CSP-061",
  releaseVersion: "v1.1.0",
  iteration: "Sprint 50",
  releaseDescription: "Introduction of automated email responses + SLA timers.",
  functionalityDelivered: "Automated email responses, SLA countdown timers",
  deliveredDate: "02 Feb 2025",
  tdNoticeDate: "27 Jan 2025",
  testDeployDate: "28 Jan 2025",
  testStartDate: "29 Jan 2025",
  testEndDate: "01 Feb 2025",
  prodDeployDate: "03 Feb 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "Email templates fail with special characters.",
  comments: "Template rendering engine fix pending",
  releaseType: "Minor",
  month: "February",
  financialYear: "FY2025"
},
{
  id: 62,
  releaseId: "REL-2025-062",
  systemName: "Internal Audit Tool",
  systemId: "IAT-062",
  releaseVersion: "v1.2.0",
  iteration: "Sprint 51",
  releaseDescription: "Audit workflow automation with enhanced reviewer tracking.",
  functionalityDelivered: "Reviewer tracking, Workflow automation, Report versioning",
  deliveredDate: "04 Feb 2025",
  tdNoticeDate: "29 Jan 2025",
  testDeployDate: "30 Jan 2025",
  testStartDate: "31 Jan 2025",
  testEndDate: "03 Feb 2025",
  prodDeployDate: "05 Feb 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "Notification delays observed during peak audit cycles.",
  comments: "Next patch planned for notification optimization",
  releaseType: "Major",
  month: "February",
  financialYear: "FY2025"
},
{
  id: 63,
  releaseId: "REL-2025-063",
  systemName: "API Gateway",
  systemId: "APG-063",
  releaseVersion: "v3.1.0",
  iteration: "Sprint 52",
  releaseDescription: "Advanced throttling controls and token bucket improvements.",
  functionalityDelivered: "Token bucket updates, Custom throttling rules",
  deliveredDate: "06 Feb 2025",
  tdNoticeDate: "01 Feb 2025",
  testDeployDate: "02 Feb 2025",
  testStartDate: "03 Feb 2025",
  testEndDate: "05 Feb 2025",
  prodDeployDate: "07 Feb 2025",
  testStatus: "Pending",
  deploymentStatus: "Deployed to Pre-Prod",
  outstandingIssues: "Throttling rules not applying to internal API consumers.",
  comments: "Rule mapping logic under review",
  releaseType: "Minor",
  month: "February",
  financialYear: "FY2025"
},
{
  id: 64,
  releaseId: "REL-2025-064",
  systemName: "Business Intelligence Suite",
  systemId: "BI-064",
  releaseVersion: "v4.0.0",
  iteration: "Sprint 53",
  releaseDescription: "New executive dashboard with drill-down functionality and improved data models.",
  functionalityDelivered: "Executive dashboard, Drill-down reports, Data model redesign",
  deliveredDate: "08 Feb 2025",
  tdNoticeDate: "03 Feb 2025",
  testDeployDate: "04 Feb 2025",
  testStartDate: "05 Feb 2025",
  testEndDate: "07 Feb 2025",
  prodDeployDate: "09 Feb 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "Drill-down chart filters reset intermittently.",
  comments: "UI team working on charting bug",
  releaseType: "Major",
  month: "February",
  financialYear: "FY2025"
},
{
  id: 65,
  releaseId: "REL-2025-065",
  systemName: "Finance Reconciliation Engine",
  systemId: "FRE-065",
  releaseVersion: "v1.0.0",
  iteration: "Sprint 54",
  releaseDescription: "First release of financial reconciliation engine supporting multi-ledger sync.",
  functionalityDelivered: "Ledger sync, Reconciliation reports, Rule-based matching",
  deliveredDate: "10 Feb 2025",
  tdNoticeDate: "05 Feb 2025",
  testDeployDate: "06 Feb 2025",
  testStartDate: "07 Feb 2025",
  testEndDate: "09 Feb 2025",
  prodDeployDate: "11 Feb 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "Minor mismatch logs for specific ledger types.",
  comments: "Successful first deployment",
  releaseType: "Major",
  month: "February",
  financialYear: "FY2025"
},
{
  id: 66,
  releaseId: "REL-2025-066",
  systemName: "Core Banking System",
  systemId: "CBS-066",
  releaseVersion: "4.1.0",
  iteration: "Sprint 55",
  releaseDescription: "Enhancements to deposit module and automated interest calculations.",
  functionalityDelivered: "Interest calculation automation, Deposit module optimizations",
  deliveredDate: "13 Feb 2025",
  tdNoticeDate: "07 Feb 2025",
  testDeployDate: "08 Feb 2025",
  testStartDate: "09 Feb 2025",
  testEndDate: "12 Feb 2025",
  prodDeployDate: "14 Feb 2025",
  testStatus: "Pending",
  deploymentStatus: "Deployed to Pre-Prod",
  outstandingIssues: "Interest recalculation for legacy accounts shows minor discrepancies.",
  comments: "Pending validation for historical accounts",
  releaseType: "Major",
  month: "February",
  financialYear: "FY2025"
},
{
  id: 67,
  releaseId: "REL-2025-067",
  systemName: "Payment Gateway",
  systemId: "PGW-067",
  releaseVersion: "v2.1.0",
  iteration: "Sprint 56",
  releaseDescription: "Improved transaction failure alerts and retry mechanism for failed transactions.",
  functionalityDelivered: "Retry mechanism, Enhanced alert notifications",
  deliveredDate: "15 Feb 2025",
  tdNoticeDate: "09 Feb 2025",
  testDeployDate: "10 Feb 2025",
  testStartDate: "11 Feb 2025",
  testEndDate: "14 Feb 2025",
  prodDeployDate: "16 Feb 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "1. Delayed alerts under high load\n2. Retry logic fails intermittently for cross-border transactions",
  comments: "Monitoring live transaction performance",
  releaseType: "Patch",
  month: "February",
  financialYear: "FY2025"
},
{
  id: 68,
  releaseId: "REL-2025-068",
  systemName: "Mobile Banking App",
  systemId: "MBA-068",
  releaseVersion: "v3.5.0",
  iteration: "Sprint 57",
  releaseDescription: "Integration of peer-to-peer transfer enhancements and improved security checks.",
  functionalityDelivered: "P2P transfer speed improvement, Security verification enhancements",
  deliveredDate: "18 Feb 2025",
  tdNoticeDate: "12 Feb 2025",
  testDeployDate: "13 Feb 2025",
  testStartDate: "14 Feb 2025",
  testEndDate: "17 Feb 2025",
  prodDeployDate: "19 Feb 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "Minor UI lag in transaction history page during peak hours.",
  comments: "Performance optimization planned for next sprint",
  releaseType: "Minor",
  month: "February",
  financialYear: "FY2025"
},
{
  id: 69,
  releaseId: "REL-2025-069",
  systemName: "HR Management",
  systemId: "HRM-069",
  releaseVersion: "v1.8.0",
  iteration: "Sprint 58",
  releaseDescription: "Onboarding workflow enhancements and leave balance automation.",
  functionalityDelivered: "Automated leave calculations, Improved onboarding checklist",
  deliveredDate: "20 Feb 2025",
  tdNoticeDate: "14 Feb 2025",
  testDeployDate: "15 Feb 2025",
  testStartDate: "16 Feb 2025",
  testEndDate: "19 Feb 2025",
  prodDeployDate: "21 Feb 2025",
  testStatus: "Pending",
  deploymentStatus: "Deployed to Pre-Prod",
  outstandingIssues: "Leave balance recalculation fails for part-time employees.",
  comments: "HR team reviewing logic",
  releaseType: "Minor",
  month: "February",
  financialYear: "FY2025"
},
{
  id: 70,
  releaseId: "REL-2025-070",
  systemName: "CRM System",
  systemId: "CRM-070",
  releaseVersion: "v4.4.0",
  iteration: "Sprint 59",
  releaseDescription: "Automated campaign reporting and improved lead scoring model.",
  functionalityDelivered: "Lead scoring update, Campaign report automation",
  deliveredDate: "23 Feb 2025",
  tdNoticeDate: "17 Feb 2025",
  testDeployDate: "18 Feb 2025",
  testStartDate: "19 Feb 2025",
  testEndDate: "22 Feb 2025",
  prodDeployDate: "24 Feb 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "Minor delay in automated reports generation.",
  comments: "Business team satisfied with performance",
  releaseType: "Major",
  month: "February",
  financialYear: "FY2025"
},
{
  id: 71,
  releaseId: "REL-2025-071",
  systemName: "Data Warehouse",
  systemId: "DWH-071",
  releaseVersion: "v7.6.0",
  iteration: "Sprint 60",
  releaseDescription: "New data marts for retail banking insights and reporting dashboards.",
  functionalityDelivered: "Retail banking data marts, Dashboard enhancements",
  deliveredDate: "25 Feb 2025",
  tdNoticeDate: "19 Feb 2025",
  testDeployDate: "20 Feb 2025",
  testStartDate: "21 Feb 2025",
  testEndDate: "24 Feb 2025",
  prodDeployDate: "26 Feb 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "ETL loading for new marts is slower than expected.",
  comments: "Performance tuning in progress",
  releaseType: "Minor",
  month: "February",
  financialYear: "FY2025"
},
{
  id: 72,
  releaseId: "REL-2025-072",
  systemName: "API Gateway",
  systemId: "APG-072",
  releaseVersion: "v3.2.0",
  iteration: "Sprint 61",
  releaseDescription: "Enhanced monitoring and analytics for API consumption patterns.",
  functionalityDelivered: "Consumption analytics, Real-time monitoring dashboards",
  deliveredDate: "28 Feb 2025",
  tdNoticeDate: "22 Feb 2025",
  testDeployDate: "23 Feb 2025",
  testStartDate: "24 Feb 2025",
  testEndDate: "27 Feb 2025",
  prodDeployDate: "01 Mar 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "Analytics dashboards show delayed metrics under high load.",
  comments: "Monitoring improvements scheduled",
  releaseType: "Minor",
  month: "February",
  financialYear: "FY2025"
},
{
  id: 73,
  releaseId: "REL-2025-073",
  systemName: "Finance Reconciliation Engine",
  systemId: "FRE-073",
  releaseVersion: "v1.1.0",
  iteration: "Sprint 62",
  releaseDescription: "Bug fixes and performance improvements in reconciliation processing.",
  functionalityDelivered: "Bug fixes, Optimized reconciliation engine",
  deliveredDate: "03 Mar 2025",
  tdNoticeDate: "25 Feb 2025",
  testDeployDate: "26 Feb 2025",
  testStartDate: "27 Feb 2025",
  testEndDate: "02 Mar 2025",
  prodDeployDate: "04 Mar 2025",
  testStatus: "Pending",
  deploymentStatus: "Deployed to Pre-Prod",
  outstandingIssues: "High memory usage under bulk ledger reconciliation.",
  comments: "Engineering team investigating",
  releaseType: "Patch",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 74,
  releaseId: "REL-2025-074",
  systemName: "Customer Support Portal",
  systemId: "CSP-074",
  releaseVersion: "v1.2.0",
  iteration: "Sprint 63",
  releaseDescription: "Chatbot integration for automated query resolution and SLA tracking.",
  functionalityDelivered: "Chatbot integration, SLA reporting",
  deliveredDate: "05 Mar 2025",
  tdNoticeDate: "27 Feb 2025",
  testDeployDate: "28 Feb 2025",
  testStartDate: "01 Mar 2025",
  testEndDate: "04 Mar 2025",
  prodDeployDate: "06 Mar 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "Chatbot fails for multilingual queries.",
  comments: "NLP team tuning response engine",
  releaseType: "Minor",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 75,
  releaseId: "REL-2025-075",
  systemName: "Internal Audit Tool",
  systemId: "IAT-075",
  releaseVersion: "v1.3.0",
  iteration: "Sprint 64",
  releaseDescription: "Enhanced audit trail reporting and compliance checks.",
  functionalityDelivered: "Audit trail enhancements, Compliance validation automation",
  deliveredDate: "08 Mar 2025",
  tdNoticeDate: "02 Mar 2025",
  testDeployDate: "03 Mar 2025",
  testStartDate: "04 Mar 2025",
  testEndDate: "07 Mar 2025",
  prodDeployDate: "09 Mar 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "Minor discrepancies in historical audit logs.",
  comments: "Next patch scheduled for log reconciliation",
  releaseType: "Major",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 76,
  releaseId: "REL-2025-076",
  systemName: "Business Intelligence Suite",
  systemId: "BI-076",
  releaseVersion: "v4.1.0",
  iteration: "Sprint 65",
  releaseDescription: "New KPI widgets and automated alerts for executive dashboards.",
  functionalityDelivered: "KPI widgets, Automated alert system",
  deliveredDate: "11 Mar 2025",
  tdNoticeDate: "05 Mar 2025",
  testDeployDate: "06 Mar 2025",
  testStartDate: "07 Mar 2025",
  testEndDate: "10 Mar 2025",
  prodDeployDate: "12 Mar 2025",
  testStatus: "Pending",
  deploymentStatus: "Deployed to Pre-Prod",
  outstandingIssues: "Alert notifications delayed under high dashboard traffic.",
  comments: "Monitoring system performance",
  releaseType: "Minor",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 77,
  releaseId: "REL-2025-077",
  systemName: "Loan Management",
  systemId: "LMS-077",
  releaseVersion: "v2.2.0",
  iteration: "Sprint 66",
  releaseDescription: "Integration with credit bureau API and enhanced loan approval logic.",
  functionalityDelivered: "Credit bureau API integration, Approval logic optimization",
  deliveredDate: "13 Mar 2025",
  tdNoticeDate: "07 Mar 2025",
  testDeployDate: "08 Mar 2025",
  testStartDate: "09 Mar 2025",
  testEndDate: "12 Mar 2025",
  prodDeployDate: "14 Mar 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "Delayed credit bureau responses affecting approval times.",
  comments: "Monitoring API latency",
  releaseType: "Major",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 78,
  releaseId: "REL-2025-078",
  systemName: "HR Management",
  systemId: "HRM-078",
  releaseVersion: "v1.9.0",
  iteration: "Sprint 67",
  releaseDescription: "Performance review cycle automation and goal tracking improvements.",
  functionalityDelivered: "Automated review cycles, Goal tracking dashboards",
  deliveredDate: "16 Mar 2025",
  tdNoticeDate: "10 Mar 2025",
  testDeployDate: "11 Mar 2025",
  testStartDate: "12 Mar 2025",
  testEndDate: "15 Mar 2025",
  prodDeployDate: "17 Mar 2025",
  testStatus: "Pending",
  deploymentStatus: "Deployed to Pre-Prod",
  outstandingIssues: "Delayed goal completion notifications for employees.",
  comments: "Fix scheduled in next sprint",
  releaseType: "Minor",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 79,
  releaseId: "REL-2025-079",
  systemName: "CRM System",
  systemId: "CRM-079",
  releaseVersion: "v4.5.0",
  iteration: "Sprint 68",
  releaseDescription: "Predictive lead scoring enhancements and automated follow-up campaigns.",
  functionalityDelivered: "Predictive scoring, Automated follow-ups",
  deliveredDate: "18 Mar 2025",
  tdNoticeDate: "12 Mar 2025",
  testDeployDate: "13 Mar 2025",
  testStartDate: "14 Mar 2025",
  testEndDate: "17 Mar 2025",
  prodDeployDate: "19 Mar 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "Lead scoring occasionally misclassifies low-value leads.",
  comments: "Monitoring and adjustments ongoing",
  releaseType: "Major",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 80,
  releaseId: "REL-2025-080",
  systemName: "Data Warehouse",
  systemId: "DWH-080",
  releaseVersion: "v7.7.0",
  iteration: "Sprint 69",
  releaseDescription: "Quarterly consolidation ETL enhancements and archive data indexing.",
  functionalityDelivered: "ETL optimization, Archive indexing improvements",
  deliveredDate: "21 Mar 2025",
  tdNoticeDate: "15 Mar 2025",
  testDeployDate: "16 Mar 2025",
  testStartDate: "17 Mar 2025",
  testEndDate: "20 Mar 2025",
  prodDeployDate: "22 Mar 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "Long ETL jobs occasionally time out during peak processing.",
  comments: "ETL optimization work scheduled",
  releaseType: "Minor",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 81,
  releaseId: "REL-2025-081",
  systemName: "Fraud Detection Engine",
  systemId: "FDE-081",
  releaseVersion: "v5.0.0",
  iteration: "Sprint 51",
  releaseDescription: "New AI-powered fraud scoring model with adaptive detection algorithms.",
  functionalityDelivered: "Real-time anomaly scoring, Adaptive ML rules, Improved alert routing",
  deliveredDate: "12 Feb 2025",
  tdNoticeDate: "7 Feb 2025",
  testDeployDate: "9 Feb 2025",
  testStartDate: "10 Feb 2025",
  testEndDate: "11 Feb 2025",
  prodDeployDate: "13 Feb 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "1. ML threshold instability\n2. False positives under heavy load\n3. Delayed routing for complex fraud cases",
  comments: "Model tuning in progress",
  releaseType: "Major",
  month: "February",
  financialYear: "FY2025"
},
{
  id: 82,
  releaseId: "REL-2025-082",
  systemName: "Core Banking System",
  systemId: "CBS-082",
  releaseVersion: "4.2.1",
  iteration: "Sprint 52",
  releaseDescription: "Regulatory compliance update: IFRS9 reporting enhancements.",
  functionalityDelivered: "Updated IFRS9 forms, Advanced export, Compliance alerts",
  deliveredDate: "14 Feb 2025",
  tdNoticeDate: "8 Feb 2025",
  testDeployDate: "10 Feb 2025",
  testStartDate: "11 Feb 2025",
  testEndDate: "13 Feb 2025",
  prodDeployDate: "15 Feb 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "Minor formatting misalignment in exported forms.",
  comments: "Approved by compliance",
  releaseType: "Minor",
  month: "February",
  financialYear: "FY2025"
},
{
  id: 83,
  releaseId: "REL-2025-083",
  systemName: "CRM System",
  systemId: "CRM-083",
  releaseVersion: "v4.5.0",
  iteration: "Sprint 53",
  releaseDescription: "Lead management automation upgrade with intelligent scoring.",
  functionalityDelivered: "AI scoring, Re-engagement triggers, Funnel analytics",
  deliveredDate: "11 Jan 2025",
  tdNoticeDate: "6 Jan 2025",
  testDeployDate: "8 Jan 2025",
  testStartDate: "9 Jan 2025",
  testEndDate: "10 Jan 2025",
  prodDeployDate: "12 Jan 2025",
  testStatus: "Pending",
  deploymentStatus: "Deployed to Pre-Prod",
  outstandingIssues: "1. Lead score mismatch for enterprise accounts\n2. Duplicate automated triggers observed",
  comments: "Awaiting business UAT",
  releaseType: "Major",
  month: "January",
  financialYear: "FY2025"
},
{
  id: 84,
  releaseId: "REL-2025-084",
  systemName: "HR Management",
  systemId: "HRM-084",
  releaseVersion: "v2.0.2",
  iteration: "Sprint 54",
  releaseDescription: "Employee onboarding workflow simplification and UI refresh.",
  functionalityDelivered: "Simplified onboarding, UI refresh, Autosave",
  deliveredDate: "18 Jan 2025",
  tdNoticeDate: "12 Jan 2025",
  testDeployDate: "14 Jan 2025",
  testStartDate: "15 Jan 2025",
  testEndDate: "17 Jan 2025",
  prodDeployDate: "19 Jan 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "Autosave wipes mandatory fields occasionally.",
  comments: "UI polishing ongoing",
  releaseType: "Patch",
  month: "January",
  financialYear: "FY2025"
},
{
  id: 85,
  releaseId: "REL-2025-085",
  systemName: "Payment Gateway",
  systemId: "PGW-085",
  releaseVersion: "v2.2.0",
  iteration: "Sprint 55",
  releaseDescription: "Transaction settlement improvements and reconciliation mapping fixes.",
  functionalityDelivered: "Optimized settlement logic, Reconciliation mapping engine",
  deliveredDate: "22 Feb 2025",
  tdNoticeDate: "17 Feb 2025",
  testDeployDate: "18 Feb 2025",
  testStartDate: "19 Feb 2025",
  testEndDate: "21 Feb 2025",
  prodDeployDate: "23 Feb 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "None.",
  comments: "Stable deployment",
  releaseType: "Minor",
  month: "February",
  financialYear: "FY2025"
},
{
  id: 86,
  releaseId: "REL-2025-086",
  systemName: "Loan Management",
  systemId: "LMS-086",
  releaseVersion: "v2.3.1",
  iteration: "Sprint 56",
  releaseDescription: "SME loan process restructuring with checklist automation.",
  functionalityDelivered: "SME workflow, Automated checklist engine",
  deliveredDate: "20 Feb 2025",
  tdNoticeDate: "15 Feb 2025",
  testDeployDate: "17 Feb 2025",
  testStartDate: "18 Feb 2025",
  testEndDate: "19 Feb 2025",
  prodDeployDate: "21 Feb 2025",
  testStatus: "Pending",
  deploymentStatus: "Deployed to Pre-Prod",
  outstandingIssues: "Missing validation logic for guarantor document upload.",
  comments: "Fix scheduled for next sprint",
  releaseType: "Minor",
  month: "February",
  financialYear: "FY2025"
},
{
  id: 87,
  releaseId: "REL-2025-087",
  systemName: "Mobile Banking App",
  systemId: "MBA-087",
  releaseVersion: "v3.6.4",
  iteration: "Sprint 57",
  releaseDescription: "Push notification stability improvements and accessibility mode.",
  functionalityDelivered: "Improved notifications, Voice navigation, Contrast controls",
  deliveredDate: "15 Feb 2025",
  tdNoticeDate: "10 Feb 2025",
  testDeployDate: "11 Feb 2025",
  testStartDate: "12 Feb 2025",
  testEndDate: "14 Feb 2025",
  prodDeployDate: "16 Feb 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "None.",
  comments: "Accessibility tests passed",
  releaseType: "Major",
  month: "February",
  financialYear: "FY2025"
},
{
  id: 88,
  releaseId: "REL-2025-088",
  systemName: "Fraud Detection Engine",
  systemId: "FDE-088",
  releaseVersion: "v5.1.0",
  iteration: "Sprint 58",
  releaseDescription: "Introduction of behavioral biometric fraud scoring.",
  functionalityDelivered: "Typing pattern detection, Mouse dynamics scoring, Session anomaly tracking",
  deliveredDate: "28 Feb 2025",
  tdNoticeDate: "23 Feb 2025",
  testDeployDate: "24 Feb 2025",
  testStartDate: "25 Feb 2025",
  testEndDate: "27 Feb 2025",
  prodDeployDate: "1 Mar 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "Touchscreen interactions produce inaccurate scores.",
  comments: "Model requires device-specific tuning",
  releaseType: "Major",
  month: "February",
  financialYear: "FY2025"
},
{
  id: 89,
  releaseId: "REL-2025-089",
  systemName: "Customer Support Portal",
  systemId: "CSP-089",
  releaseVersion: "v1.0.0",
  iteration: "Sprint 59",
  releaseDescription: "Initial launch of ticketing and customer chat system.",
  functionalityDelivered: "Ticket module, SLA tracking, Chat interface",
  deliveredDate: "5 Mar 2025",
  tdNoticeDate: "1 Mar 2025",
  testDeployDate: "2 Mar 2025",
  testStartDate: "3 Mar 2025",
  testEndDate: "4 Mar 2025",
  prodDeployDate: "6 Mar 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "Occasional lag in ticket filters.",
  comments: "MVP rollout successful",
  releaseType: "Major",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 90,
  releaseId: "REL-2025-090",
  systemName: "Internal Audit Tool",
  systemId: "IAT-090",
  releaseVersion: "v1.2.1",
  iteration: "Sprint 60",
  releaseDescription: "Scheduler and audit template automation update.",
  functionalityDelivered: "Audit templates, Auto scheduling, Workflow enhancements",
  deliveredDate: "6 Mar 2025",
  tdNoticeDate: "2 Mar 2025",
  testDeployDate: "3 Mar 2025",
  testStartDate: "4 Mar 2025",
  testEndDate: "5 Mar 2025",
  prodDeployDate: "7 Mar 2025",
  testStatus: "Pending",
  deploymentStatus: "Deployed to Pre-Prod",
  outstandingIssues: "Reviewer workflow misbehaves under simultaneous edits.",
  comments: "Concurrency patch pending",
  releaseType: "Minor",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 91,
  releaseId: "REL-2025-091",
  systemName: "API Gateway",
  systemId: "APG-091",
  releaseVersion: "v3.1.0",
  iteration: "Sprint 61",
  releaseDescription: "New throttling policies with advanced rate-limiting engine.",
  functionalityDelivered: "Custom throttle rules, Token bucket enhancements, IP-based limits",
  deliveredDate: "8 Mar 2025",
  tdNoticeDate: "3 Mar 2025",
  testDeployDate: "4 Mar 2025",
  testStartDate: "5 Mar 2025",
  testEndDate: "7 Mar 2025",
  prodDeployDate: "9 Mar 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "Inconsistent throttling during traffic spikes.",
  comments: "Perf testing underway",
  releaseType: "Major",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 92,
  releaseId: "REL-2025-092",
  systemName: "Data Warehouse",
  systemId: "DWH-092",
  releaseVersion: "v7.8.2",
  iteration: "Sprint 62",
  releaseDescription: "ETL job optimization and new KPI dashboards.",
  functionalityDelivered: "Optimized ETL, Monthly KPIs, Data lake sync",
  deliveredDate: "12 Mar 2025",
  tdNoticeDate: "7 Mar 2025",
  testDeployDate: "8 Mar 2025",
  testStartDate: "9 Mar 2025",
  testEndDate: "11 Mar 2025",
  prodDeployDate: "13 Mar 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "Intermittent ETL warning messages.",
  comments: "Performance significantly improved",
  releaseType: "Minor",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 93,
  releaseId: "REL-2025-093",
  systemName: "BI Reporting Tool",
  systemId: "BIR-093",
  releaseVersion: "v3.9.0",
  iteration: "Sprint 63",
  releaseDescription: "Drill-down analytics and automated email reporting.",
  functionalityDelivered: "Drill-down charts, Auto scheduling, Advanced filters",
  deliveredDate: "14 Mar 2025",
  tdNoticeDate: "10 Mar 2025",
  testDeployDate: "11 Mar 2025",
  testStartDate: "12 Mar 2025",
  testEndDate: "13 Mar 2025",
  prodDeployDate: "15 Mar 2025",
  testStatus: "Pending",
  deploymentStatus: "Deployed to Pre-Prod",
  outstandingIssues: "Email scheduler fails with >10 recipients.",
  comments: "Patch planned",
  releaseType: "Major",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 94,
  releaseId: "REL-2025-094",
  systemName: "Document Management System",
  systemId: "DMS-094",
  releaseVersion: "v2.8.5",
  iteration: "Sprint 64",
  releaseDescription: "Refinements to audit trail and document revision tracking.",
  functionalityDelivered: "Version history, Audit logs, Metadata checks",
  deliveredDate: "16 Mar 2025",
  tdNoticeDate: "12 Mar 2025",
  testDeployDate: "13 Mar 2025",
  testStartDate: "14 Mar 2025",
  testEndDate: "15 Mar 2025",
  prodDeployDate: "17 Mar 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "Audit logs appear out of sequence.",
  comments: "Team validating fix",
  releaseType: "Minor",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 95,
  releaseId: "REL-2025-095",
  systemName: "Compliance Reporting",
  systemId: "CRP-095",
  releaseVersion: "v1.4.0",
  iteration: "Sprint 65",
  releaseDescription: "New AML reporting enhancements and export automation.",
  functionalityDelivered: "AML suspicious activity module, Export automation",
  deliveredDate: "18 Mar 2025",
  tdNoticeDate: "14 Mar 2025",
  testDeployDate: "15 Mar 2025",
  testStartDate: "16 Mar 2025",
  testEndDate: "17 Mar 2025",
  prodDeployDate: "19 Mar 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "Minor export latency.",
  comments: "Compliance approved",
  releaseType: "Major",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 96,
  releaseId: "REL-2025-096",
  systemName: "Vendor Management",
  systemId: "VMS-096",
  releaseVersion: "v2.1.0",
  iteration: "Sprint 66",
  releaseDescription: "Vendor performance insight dashboards.",
  functionalityDelivered: "Performance scorecards, SLA trend graphs",
  deliveredDate: "20 Mar 2025",
  tdNoticeDate: "16 Mar 2025",
  testDeployDate: "17 Mar 2025",
  testStartDate: "18 Mar 2025",
  testEndDate: "19 Mar 2025",
  prodDeployDate: "21 Mar 2025",
  testStatus: "Pending",
  deploymentStatus: "Deployed to Pre-Prod",
  outstandingIssues: "SLA trend calculation inaccurate.",
  comments: "Fix in development",
  releaseType: "Minor",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 97,
  releaseId: "REL-2025-097",
  systemName: "Treasury System",
  systemId: "TRY-097",
  releaseVersion: "v5.4.1",
  iteration: "Sprint 67",
  releaseDescription: "Liquidity management enhancements and FX revaluation fixes.",
  functionalityDelivered: "FX reval automation, Liquidity insights",
  deliveredDate: "23 Mar 2025",
  tdNoticeDate: "18 Mar 2025",
  testDeployDate: "19 Mar 2025",
  testStartDate: "20 Mar 2025",
  testEndDate: "22 Mar 2025",
  prodDeployDate: "24 Mar 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "FX revaluation rounding errors observed.",
  comments: "Finance reviewing",
  releaseType: "Major",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 98,
  releaseId: "REL-2025-098",
  systemName: "Loan Origination",
  systemId: "LOS-098",
  releaseVersion: "v3.0.0",
  iteration: "Sprint 68",
  releaseDescription: "New loan product builder engine.",
  functionalityDelivered: "Product templates, Dynamic interest rules",
  deliveredDate: "25 Mar 2025",
  tdNoticeDate: "20 Mar 2025",
  testDeployDate: "21 Mar 2025",
  testStartDate: "22 Mar 2025",
  testEndDate: "24 Mar 2025",
  prodDeployDate: "26 Mar 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "None.",
  comments: "Business approved product builder",
  releaseType: "Major",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 99,
  releaseId: "REL-2025-099",
  systemName: "User Access Management",
  systemId: "UAM-099",
  releaseVersion: "v2.7.3",
  iteration: "Sprint 69",
  releaseDescription: "RBAC improvements and role cloning feature.",
  functionalityDelivered: "Role cloning, Permission insights",
  deliveredDate: "28 Mar 2025",
  tdNoticeDate: "24 Mar 2025",
  testDeployDate: "25 Mar 2025",
  testStartDate: "26 Mar 2025",
  testEndDate: "27 Mar 2025",
  prodDeployDate: "29 Mar 2025",
  testStatus: "Pending",
  deploymentStatus: "Deployed to Pre-Prod",
  outstandingIssues: "Role cloning sometimes omits optional permissions.",
  comments: "Fix in progress",
  releaseType: "Minor",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 100,
  releaseId: "REL-2025-100",
  systemName: "Bulk Messaging Engine",
  systemId: "BME-100",
  releaseVersion: "v1.9.0",
  iteration: "Sprint 70",
  releaseDescription: "Bulk SMS and email throughput optimization.",
  functionalityDelivered: "Optimized queues, Retry engine improvements",
  deliveredDate: "30 Mar 2025",
  tdNoticeDate: "26 Mar 2025",
  testDeployDate: "27 Mar 2025",
  testStartDate: "28 Mar 2025",
  testEndDate: "29 Mar 2025",
  prodDeployDate: "31 Mar 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "Occasional duplication of messages under retries.",
  comments: "Retry engine recalibration ongoing",
  releaseType: "Major",
  month: "March",
  financialYear: "FY2025"
},
{
  id: 101,
  releaseId: "REL-2025-101",
  systemName: "ATM Switch",
  systemId: "ATMS-101",
  releaseVersion: "v4.0.3",
  iteration: "Sprint 71",
  releaseDescription: "Card transaction routing and dispute workflow update.",
  functionalityDelivered: "Routing optimization, Dispute workflows",
  deliveredDate: "2 Apr 2025",
  tdNoticeDate: "28 Mar 2025",
  testDeployDate: "30 Mar 2025",
  testStartDate: "31 Mar 2025",
  testEndDate: "1 Apr 2025",
  prodDeployDate: "3 Apr 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "Minor latency in routing.",
  comments: "ATM performance improved",
  releaseType: "Minor",
  month: "April",
  financialYear: "FY2025"
},
{
  id: 102,
  releaseId: "REL-2025-102",
  systemName: "Notifications Service",
  systemId: "NFS-102",
  releaseVersion: "v3.3.0",
  iteration: "Sprint 72",
  releaseDescription: "Unified notification template manager.",
  functionalityDelivered: "Template builder, Multi-channel routing",
  deliveredDate: "4 Apr 2025",
  tdNoticeDate: "30 Mar 2025",
  testDeployDate: "31 Mar 2025",
  testStartDate: "1 Apr 2025",
  testEndDate: "3 Apr 2025",
  prodDeployDate: "5 Apr 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "Channel routing inconsistencies.",
  comments: "Refinement ongoing",
  releaseType: "Major",
  month: "April",
  financialYear: "FY2025"
},
{
  id: 103,
  releaseId: "REL-2025-103",
  systemName: "Finance GL Engine",
  systemId: "GLE-103",
  releaseVersion: "v6.1.0",
  iteration: "Sprint 73",
  releaseDescription: "General ledger sync optimization and error recovery module.",
  functionalityDelivered: "GL sync optimizer, Recovery engine, Batch reconciliation",
  deliveredDate: "7 Apr 2025",
  tdNoticeDate: "2 Apr 2025",
  testDeployDate: "3 Apr 2025",
  testStartDate: "4 Apr 2025",
  testEndDate: "6 Apr 2025",
  prodDeployDate: "8 Apr 2025",
  testStatus: "Pending",
  deploymentStatus: "Deployed to Pre-Prod",
  outstandingIssues: "Minor GL mapping failures.",
  comments: "Accounting validating",
  releaseType: "Major",
  month: "April",
  financialYear: "FY2025"
},
{
  id: 104,
  releaseId: "REL-2025-104",
  systemName: "API Analytics",
  systemId: "APAN-104",
  releaseVersion: "v2.0.0",
  iteration: "Sprint 74",
  releaseDescription: "API traffic heatmaps and endpoint latency dashboards.",
  functionalityDelivered: "Traffic heatmaps, Latency dashboards, Error visualization",
  deliveredDate: "9 Apr 2025",
  tdNoticeDate: "4 Apr 2025",
  testDeployDate: "5 Apr 2025",
  testStartDate: "6 Apr 2025",
  testEndDate: "8 Apr 2025",
  prodDeployDate: "10 Apr 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "Heatmap color rendering incorrect in dark mode.",
  comments: "UI team informed",
  releaseType: "Major",
  month: "April",
  financialYear: "FY2025"
},
{
  id: 105,
  releaseId: "REL-2025-105",
  systemName: "ATM Monitoring System",
  systemId: "ATMM-105",
  releaseVersion: "v1.6.0",
  iteration: "Sprint 75",
  releaseDescription: "ATM uptime dashboard and component failure prediction.",
  functionalityDelivered: "Uptime insights, Predictive failure alerts",
  deliveredDate: "11 Apr 2025",
  tdNoticeDate: "6 Apr 2025",
  testDeployDate: "7 Apr 2025",
  testStartDate: "8 Apr 2025",
  testEndDate: "10 Apr 2025",
  prodDeployDate: "12 Apr 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "None.",
  comments: "Monitoring significantly improved",
  releaseType: "Minor",
  month: "April",
  financialYear: "FY2025"
},
{
  id: 106,
  releaseId: "REL-2025-106",
  systemName: "Credit Scoring Engine",
  systemId: "CRE-106",
  releaseVersion: "v3.8.0",
  iteration: "Sprint 76",
  releaseDescription: "Revamped credit scoring model with dynamic risk bands.",
  functionalityDelivered: "Dynamic risk models, Predictive scoring",
  deliveredDate: "14 Apr 2025",
  tdNoticeDate: "9 Apr 2025",
  testDeployDate: "10 Apr 2025",
  testStartDate: "11 Apr 2025",
  testEndDate: "13 Apr 2025",
  prodDeployDate: "15 Apr 2025",
  testStatus: "Pending",
  deploymentStatus: "Deployed to Pre-Prod",
  outstandingIssues: "Risk band thresholds inaccurate for new clients.",
  comments: "Data science team adjusting models",
  releaseType: "Major",
  month: "April",
  financialYear: "FY2025"
},
{
  id: 107,
  releaseId: "REL-2025-107",
  systemName: "LDAP Authentication",
  systemId: "LDAP-107",
  releaseVersion: "v2.1.4",
  iteration: "Sprint 77",
  releaseDescription: "Directory sync improvements and failover stability fixes.",
  functionalityDelivered: "Sync optimization, Failover routing",
  deliveredDate: "16 Apr 2025",
  tdNoticeDate: "11 Apr 2025",
  testDeployDate: "12 Apr 2025",
  testStartDate: "13 Apr 2025",
  testEndDate: "15 Apr 2025",
  prodDeployDate: "17 Apr 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "Failover takes 2–3s longer than expected.",
  comments: "Infra tuning in progress",
  releaseType: "Patch",
  month: "April",
  financialYear: "FY2025"
},
{
  id: 108,
  releaseId: "REL-2025-108",
  systemName: "Branch Operations Tool",
  systemId: "BOT-108",
  releaseVersion: "v1.3.2",
  iteration: "Sprint 78",
  releaseDescription: "Queue management optimization and branch-level analytics.",
  functionalityDelivered: "Queue optimizer, Branch dashboards",
  deliveredDate: "18 Apr 2025",
  tdNoticeDate: "13 Apr 2025",
  testDeployDate: "14 Apr 2025",
  testStartDate: "15 Apr 2025",
  testEndDate: "17 Apr 2025",
  prodDeployDate: "19 Apr 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "None.",
  comments: "Branches reported improved service flow",
  releaseType: "Minor",
  month: "April",
  financialYear: "FY2025"
},
{
  id: 109,
  releaseId: "REL-2025-109",
  systemName: "Cheque Clearing System",
  systemId: "CCS-109",
  releaseVersion: "v3.2.5",
  iteration: "Sprint 79",
  releaseDescription: "Clearing cycle optimization and dual-verification enhancement.",
  functionalityDelivered: "Dual verification, Cycle optimization",
  deliveredDate: "21 Apr 2025",
  tdNoticeDate: "16 Apr 2025",
  testDeployDate: "17 Apr 2025",
  testStartDate: "18 Apr 2025",
  testEndDate: "20 Apr 2025",
  prodDeployDate: "22 Apr 2025",
  testStatus: "Active",
  deploymentStatus: "Deployed to QA",
  outstandingIssues: "Dual verification fails intermittently.",
  comments: "Patch being tested",
  releaseType: "Minor",
  month: "April",
  financialYear: "FY2025"
},
{
  id: 110,
  releaseId: "REL-2025-110",
  systemName: "Online Account Opening",
  systemId: "OAO-110",
  releaseVersion: "v1.0.0",
  iteration: "Sprint 80",
  releaseDescription: "New digital onboarding platform for account creation.",
  functionalityDelivered: "Digital KYC, E-signature, Document upload checks",
  deliveredDate: "25 Apr 2025",
  tdNoticeDate: "19 Apr 2025",
  testDeployDate: "20 Apr 2025",
  testStartDate: "21 Apr 2025",
  testEndDate: "23 Apr 2025",
  prodDeployDate: "26 Apr 2025",
  testStatus: "Closed",
  deploymentStatus: "Deployed to Production",
  outstandingIssues: "None.",
  comments: "Successful rollout of onboarding module",
  releaseType: "Major",
  month: "April",
  financialYear: "FY2025"
}

]

const statusConfig: Record<string, { color: string; dot: string }> = {
  "Pending": { color: "text-gray-600", dot: "bg-yellow-400" },
  "Active": { color: "text-gray-600", dot: "bg-green-500" },
  "Closed": { color: "text-gray-600", dot: "bg-slate-500" },
  "Deleted": { color: "text-gray-600", dot: "bg-red-500" },
  "Passed": { color: "text-gray-600", dot: "bg-green-500" },
}

const deploymentStatusConfig: Record<string, { color: string; dot: string }> = {
  "Deployed to QA": { color: "text-gray-600", dot: "bg-blue-500" },
  "Deployed to Pre-Prod": { color: "text-gray-600", dot: "bg-purple-500" },
  "Deployed to Production": { color: "text-gray-600", dot: "bg-green-500" },
  "Deployed to Post-Prod": { color: "text-gray-600", dot: "bg-teal-500" },
  "Rolled Back": { color: "text-gray-600", dot: "bg-red-500" },
  "Not Deployed": { color: "text-gray-600", dot: "bg-gray-400" },
  "Deployment Failed": { color: "text-gray-600", dot: "bg-orange-500" },
  "Scheduled for Deployment": { color: "text-gray-600", dot: "bg-yellow-400" },
}

const testStatusOptions = ["Pending", "Active", "Closed", "Deleted", "Passed"]
const deploymentStatusOptions = [
  "Deployed to QA",
  "Deployed to Pre-Prod",
  "Deployed to Production",
  "Deployed to Post-Prod",
  "Rolled Back",
  "Not Deployed",
  "Deployment Failed",
  "Scheduled for Deployment"
]
const releaseTypeOptions = ["Major", "Minor", "Patch", "Hotfix"]
const monthOptions = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]
const financialYearOptions = ["FY2023", "FY2024", "FY2025", "FY2026"]

const TruncatedText = ({ text, maxLength = 30 }: { text: string; maxLength?: number }) => {
  const shouldTruncate = text.length > maxLength
  const displayText = shouldTruncate ? `${text.substring(0, maxLength)}...` : text

  if (!shouldTruncate) {
    return <span className="text-gray-600">{displayText}</span>
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-gray-600 cursor-default">
            {displayText}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-white text-gray-600 border border-gray-200 shadow-lg max-w-md p-3"
        >
          <p className="text-sm break-words whitespace-normal overflow-wrap-anywhere">
            {text}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Helper function to parse date strings
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null

  // Handle "DD MMM YYYY" format (e.g., "12 Dec 2024")
  const months: { [key: string]: number } = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  }

  const parts = dateStr.split(' ')
  if (parts.length === 3) {
    const day = parseInt(parts[0])
    const month = months[parts[1]]
    const year = parseInt(parts[2])

    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return new Date(year, month, day)
    }
  }

  // Fallback to Date constructor
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

// Helper function to format date as "DD MMM YYYY"
const formatDate = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

// Helper function to get the latest date from all date fields
const getLatestDate = (item: any): Date | null => {
  const dateFields = [
    'deliveredDate', 'tdNoticeDate', 'testDeployDate',
    'testStartDate', 'testEndDate', 'prodDeployDate'
  ]

  const dates = dateFields
    .map(field => parseDate(item[field]))
    .filter(date => date !== null) as Date[]

  if (dates.length === 0) return null

  return new Date(Math.max(...dates.map(d => d.getTime())))
}

// Helper function to get the earliest date from all date fields
const getEarliestDate = (item: any): Date | null => {
  const dateFields = [
    'deliveredDate', 'tdNoticeDate', 'testDeployDate',
    'testStartDate', 'testEndDate', 'prodDeployDate'
  ]

  const dates = dateFields
    .map(field => parseDate(item[field]))
    .filter(date => date !== null) as Date[]

  if (dates.length === 0) return null

  return new Date(Math.min(...dates.map(d => d.getTime())))
}

// DatePickerInput component
const DatePickerInput = ({
  value,
  onChange,
  placeholder = "Select date"
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) => {
  const [showPicker, setShowPicker] = useState(false)
  const [tempDate, setTempDate] = useState("") // Always start blank
  const pickerRef = useRef<HTMLDivElement>(null)

  // Handle clicks outside the date picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false)
        setTempDate("") // Reset temp date when closing
      }
    }

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPicker])

  const handleApply = () => {
    if (tempDate) {
      // Convert from "YYYY-MM-DD" to "DD MMM YYYY" format
      const parsedDate = parseDate(tempDate)
      if (parsedDate) {
        const formattedDate = formatDate(parsedDate)
        onChange(formattedDate)
      }
    }
    setShowPicker(false)
    setTempDate("") // Reset temp date after applying
  }

  const handleClear = () => {
    onChange('') // Clear the actual form value
    setShowPicker(false)
    setTempDate("") // Reset temp date
  }

  const handleDateInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTempDate(e.target.value)
  }

  return (
    <div className="relative w-full" ref={pickerRef}>
      <div
        className="flex items-center cursor-pointer"
        onClick={() => {
          setShowPicker(!showPicker)
          setTempDate("") // Always reset to blank when opening
        }}
      >
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
        <Input
          placeholder={placeholder}
          value={value}
          readOnly
          className="w-full pl-10 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 cursor-pointer sm:pr-4 focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none"
        />
      </div>

      {/* Date Picker Dropdown */}
      {showPicker && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-64">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <div className="w-full">
                <Input
                  type="date"
                  value={tempDate}
                  onChange={handleDateInputChange}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleApply}
                disabled={!tempDate}
                className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50"
                variant="outline"
                size="sm"
              >
                Apply
              </Button>
              <Button
                onClick={handleClear}
                className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500"
                size="sm"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to generate a new release ID
const generateReleaseId = (data: any[]) => {
  const currentYear = new Date().getFullYear()
  const existingIds = data.map(item => item.releaseId)
  let counter = 1

  while (true) {
    const newId = `REL-${currentYear}-${counter.toString().padStart(3, '0')}`
    if (!existingIds.includes(newId)) {
      return newId
    }
    counter++
  }
}

// localStorage key for column visibility
const COLUMN_VISIBILITY_KEY = 'releases-dashboard-column-visibility';

// Load column visibility from localStorage
const loadColumnVisibility = (): Record<string, boolean> => {
  try {
    const saved = localStorage.getItem(COLUMN_VISIBILITY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate that all current columns have a visibility setting
      const validatedVisibility: Record<string, boolean> = {};
      allColumns.forEach(col => {
        validatedVisibility[col.key] = parsed[col.key] !== undefined ? parsed[col.key] : true;
      });
      return validatedVisibility;
    }
  } catch (error) {
    console.warn('Failed to load column visibility from localStorage:', error);
  }
  // Return default visibility if nothing saved or error
  return allColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {});
};

// Save column visibility to localStorage
const saveColumnVisibility = (visibility: Record<string, boolean>) => {
  try {
    localStorage.setItem(COLUMN_VISIBILITY_KEY, JSON.stringify(visibility));
  } catch (error) {
    console.warn('Failed to save column visibility to localStorage:', error);
  }
};

export function ReleasesDataTable() {
  const [data, setData] = useState(staticData)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [globalFilter, setGlobalFilter] = useState("")
  const [dateRange, setDateRange] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    () => loadColumnVisibility() // Initialize from localStorage
  )
  const [columnSearchQuery, setColumnSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [releaseToDelete, setReleaseToDelete] = useState<any>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [releaseToEdit, setReleaseToEdit] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<any>({})
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addFormData, setAddFormData] = useState<any>({
    releaseVersion: "",
    systemName: "",
    systemId: "",
    iteration: "",
    releaseType: "",
    testStatus: "",
    deploymentStatus: "",
    deliveredDate: "",
    tdNoticeDate: "",
    testDeployDate: "",
    testStartDate: "",
    testEndDate: "",
    prodDeployDate: "",
    month: "",
    financialYear: "",
    releaseDescription: "",
    functionalityDelivered: "",
    outstandingIssues: "",
    comments: ""
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  
  // Add this state for rows per page
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Ref for date picker to handle outside clicks
  const datePickerRef = useRef<HTMLDivElement>(null)

  // Effect to handle clicks outside the date picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDatePicker])

  // Save column visibility to localStorage whenever it changes
  useEffect(() => {
    saveColumnVisibility(columnVisibility);
  }, [columnVisibility]);

  // Initialize edit form when releaseToEdit changes
  useEffect(() => {
    if (releaseToEdit) {
      setEditFormData({ ...releaseToEdit })
    }
  }, [releaseToEdit])

  // Reset add form when dialog opens/closes
  useEffect(() => {
    if (addDialogOpen) {
      setAddFormData({
        releaseVersion: "",
        systemName: "",
        systemId: "",
        iteration: "",
        releaseType: "",
        testStatus: "",
        deploymentStatus: "",
        deliveredDate: "",
        tdNoticeDate: "",
        testDeployDate: "",
        testStartDate: "",
        testEndDate: "",
        prodDeployDate: "",
        month: "",
        financialYear: "",
        releaseDescription: "",
        functionalityDelivered: "",
        outstandingIssues: "",
        comments: ""
      })
      setValidationErrors({})
    }
  }, [addDialogOpen])

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  // Get visible columns
  const visibleColumns = allColumns.filter(col => columnVisibility[col.key])

  // Apply date range when both dates are selected
  const applyDateRange = () => {
    if (startDate && endDate) {
      const start = parseDate(startDate)
      const end = parseDate(endDate)

      if (start && end) {
        const formattedStart = formatDate(start)
        const formattedEnd = formatDate(end)
        setDateRange(`${formattedStart} - ${formattedEnd}`)
      }
    }
    setShowDatePicker(false)
  }

  // Clear date range
  const clearDateRange = () => {
    setDateRange("")
    setStartDate("")
    setEndDate("")
    setShowDatePicker(false)
    setCurrentPage(1)
  }

  // Filter data based on global search and date range
  const filteredData = data.filter(item => {
    // Global text search
    const matchesGlobalSearch = !globalFilter ||
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(globalFilter.toLowerCase())
      )

    // Date range filter
    const matchesDateRange = !dateRange || (() => {
      const rangeParts = dateRange.split(' - ')
      if (rangeParts.length !== 2) return true

      const [startStr, endStr] = rangeParts
      const startDate = parseDate(startStr.trim())
      const endDate = parseDate(endStr.trim())

      if (!startDate || !endDate) return true

      // Check if any of the date fields fall within the range
      const dateFields = [
        'deliveredDate', 'tdNoticeDate', 'testDeployDate',
        'testStartDate', 'testEndDate', 'prodDeployDate'
      ]

      return dateFields.some(field => {
        const itemDate = parseDate(item[field as keyof typeof item] as string)
        return itemDate && itemDate >= startDate && itemDate <= endDate
      })
    })()

    return matchesGlobalSearch && matchesDateRange
  })

  // Apply sorting to filteredData - search across all dates
  const sortedAndFilteredData = [...filteredData].sort((a, b) => {
    if (!sortOrder) return 0

    let dateA: Date | null = null
    let dateB: Date | null = null

    if (sortOrder === "newest") {
      // For newest first, use the latest date from each item
      dateA = getLatestDate(a)
      dateB = getLatestDate(b)
    } else {
      // For oldest first, use the earliest date from each item
      dateA = getEarliestDate(a)
      dateB = getEarliestDate(b)
    }

    if (!dateA && !dateB) return 0
    if (!dateA) return 1
    if (!dateB) return -1

    if (sortOrder === "newest") {
      return dateB.getTime() - dateA.getTime()
    } else {
      return dateA.getTime() - dateB.getTime()
    }
  })

  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedAndFilteredData.slice(startIndex, startIndex + itemsPerPage)

  // Get IDs of all items on the current page
  const currentPageIds = new Set(paginatedData.map(item => item.id))

  // Check if all items on current page are selected
  const allCurrentPageSelected = paginatedData.length > 0 && 
    paginatedData.every(item => selectedRows.has(item.id))

  // Check if some items on current page are selected (for indeterminate state)
  const someCurrentPageSelected = paginatedData.length > 0 && 
    paginatedData.some(item => selectedRows.has(item.id)) && 
    !allCurrentPageSelected

  const toggleRowSelection = (id: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  // Fixed: Select/deselect only current page rows
  const toggleSelectAll = () => {
    const newSelected = new Set(selectedRows)
    
    if (allCurrentPageSelected) {
      // Deselect all items on current page
      currentPageIds.forEach(id => newSelected.delete(id))
    } else {
      // Select all items on current page
      currentPageIds.forEach(id => newSelected.add(id))
    }
    
    setSelectedRows(newSelected)
  }

  const toggleColumnVisibility = (columnKey: string) => {
    const newVisibility = {
      ...columnVisibility,
      [columnKey]: !columnVisibility[columnKey]
    }
    setColumnVisibility(newVisibility)
  }

  const resetColumnVisibility = () => {
    const defaultVisibility = allColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
    setColumnVisibility(defaultVisibility)
    setColumnSearchQuery("")
    toast.success("Column visibility reset to default")
  }

  // Edit release functions
  const openEditDialog = (release: any) => {
    setReleaseToEdit(release)
    setEditDialogOpen(true)
  }

  const handleEditFormChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    handleEditFormChange(id, value)
  }

  const saveEdit = () => {
    if (releaseToEdit) {
      const updatedData = data.map(item =>
        item.id === releaseToEdit.id ? { ...editFormData } : item
      )
      setData(updatedData)
      setEditDialogOpen(false)
      setReleaseToEdit(null)
      toast.success(`Successfully updated release ${editFormData.releaseVersion}`)
    }
  }

  const cancelEdit = () => {
    setEditDialogOpen(false)
    setReleaseToEdit(null)
    setEditFormData({})
  }

  // Add new release functions
  const openAddDialog = () => {
    setAddDialogOpen(true)
  }

  const handleAddFormChange = (field: string, value: any) => {
    setAddFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const handleAddInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    handleAddFormChange(id, value)
  }

  // Validation function
  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Required fields validation
    if (!addFormData.releaseVersion?.trim()) {
      errors.releaseVersion = "Release Version is required"
    }
    if (!addFormData.systemName?.trim()) {
      errors.systemName = "System Name is required"
    }
    if (!addFormData.systemId?.trim()) {
      errors.systemId = "System ID is required"
    }
    if (!addFormData.iteration?.trim()) {
      errors.iteration = "Iteration is required"
    }
    if (!addFormData.releaseType?.trim()) {
      errors.releaseType = "Release Type is required"
    }
    if (!addFormData.financialYear?.trim()) {
      errors.financialYear = "Financial Year is required"
    }
    if (!addFormData.testStatus?.trim()) {
      errors.testStatus = "Test Status is required"
    }
    if (!addFormData.deploymentStatus?.trim()) {
      errors.deploymentStatus = "Deployment Status is required"
    }
    if (!addFormData.deliveredDate?.trim()) {
      errors.deliveredDate = "Date Delivered is required"
    }
    if (!addFormData.releaseDescription?.trim()) {
      errors.releaseDescription = "Release Description is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const saveNewRelease = () => {
    // Validate form before saving
    if (!validateForm()) {
      toast.error("Please fill in all required fields")
      return
    }

    // Generate new release ID
    const newReleaseId = generateReleaseId(data)

    // Create new release object
    const newRelease = {
      id: Math.max(...data.map(item => item.id)) + 1,
      releaseId: newReleaseId,
      ...addFormData
    }

    // Add to data
    const updatedData = [...data, newRelease]
    setData(updatedData)

    // Close dialog and show success message
    setAddDialogOpen(false)
    toast.success(`Successfully created new release ${newReleaseId}`)

    // Reset to first page to show the new release
    setCurrentPage(1)
  }

  const cancelAdd = () => {
    setAddDialogOpen(false)
    setAddFormData({
      releaseVersion: "",
      systemName: "",
      systemId: "",
      iteration: "",
      releaseType: "",
      testStatus: "",
      deploymentStatus: "",
      deliveredDate: "",
      tdNoticeDate: "",
      testDeployDate: "",
      testStartDate: "",
      testEndDate: "",
      prodDeployDate: "",
      month: "",
      financialYear: "",
      releaseDescription: "",
      functionalityDelivered: "",
      outstandingIssues: "",
      comments: ""
    })
    setValidationErrors({})
  }

  // Bulk delete functions
  const openBulkDeleteDialog = () => {
    if (selectedRows.size === 0) {
      toast.error("Please select at least one release to delete")
      return
    }
    setBulkDeleteDialogOpen(true)
  }

  const cancelBulkDelete = () => {
    setBulkDeleteDialogOpen(false)
  }

  const confirmBulkDelete = () => {
    // Remove selected releases from data
    const updatedData = data.filter(item => !selectedRows.has(item.id))
    setData(updatedData)

    // Clear selection
    setSelectedRows(new Set())

    // Show success toast
    toast.success(`Successfully deleted ${selectedRows.size} release(s)`)

    // Close dialog
    setBulkDeleteDialogOpen(false)

    // Reset to first page
    setCurrentPage(1)
  }

  // Export functions
  const exportToCSV = () => {
    const dataToExport = selectedRows.size > 0
      ? sortedAndFilteredData.filter(item => selectedRows.has(item.id))
      : sortedAndFilteredData

    // Filter data to only include visible columns
    const filteredDataForExport = dataToExport.map(item => {
      const filteredItem: any = {}
      visibleColumns.forEach(col => {
        filteredItem[col.label] = item[col.key as keyof typeof item]
      })
      return filteredItem
    })

    const csv = Papa.unparse(filteredDataForExport, {
      header: true
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `releases-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("CSV exported successfully!")
  }

  const exportToExcel = () => {
    const dataToExport = selectedRows.size > 0
      ? sortedAndFilteredData.filter(item => selectedRows.has(item.id))
      : sortedAndFilteredData

    // Filter data to only include visible columns
    const filteredDataForExport = dataToExport.map(item => {
      const filteredItem: any = {}
      visibleColumns.forEach(col => {
        filteredItem[col.label] = item[col.key as keyof typeof item]
      })
      return filteredItem
    })

    const worksheet = XLSX.utils.json_to_sheet(filteredDataForExport)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Releases')

    // Set column widths
    const cols = visibleColumns.map((col) => ({ wch: Math.max(col.label.length, 15) }))
    worksheet['!cols'] = cols

    XLSX.writeFile(workbook, `releases-export-${new Date().toISOString().split('T')[0]}.xlsx`)

    toast.success("Excel file exported successfully!")
  }

  const exportToJSON = () => {
    const dataToExport = selectedRows.size > 0
      ? sortedAndFilteredData.filter(item => selectedRows.has(item.id))
      : sortedAndFilteredData

    // Filter data to only include visible columns
    const filteredDataForExport = dataToExport.map(item => {
      const filteredItem: any = {}
      visibleColumns.forEach(col => {
        filteredItem[col.label] = item[col.key as keyof typeof item]
      })
      return filteredItem
    })

    const json = JSON.stringify(filteredDataForExport, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `releases-export-${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("JSON exported successfully!")
  }

  // Export single release to Excel
  const exportSingleRelease = (release: any) => {
    // Filter data to only include visible columns
    const filteredRelease = {
      'Release ID': release.releaseId,
      'System Name': release.systemName,
      'System ID': release.systemId,
      'Release Version': release.releaseVersion,
      'Iteration': release.iteration,
      'Release Description': release.releaseDescription,
      'Functionality Delivered': release.functionalityDelivered,
      'Date Delivered': release.deliveredDate,
      'TD Notice Date': release.tdNoticeDate,
      'Test Deploy Date': release.testDeployDate,
      'Test Start Date': release.testStartDate,
      'Test End Date': release.testEndDate,
      'Prod Deploy Date': release.prodDeployDate,
      'Test Status': release.testStatus,
      'Deployment Status': release.deploymentStatus,
      'Outstanding Issues': release.outstandingIssues,
      'Comments': release.comments,
      'Release Type': release.releaseType,
      'Month': release.month,
      'Financial Year': release.financialYear,
    }

    const worksheet = XLSX.utils.json_to_sheet([filteredRelease])
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Release Details')

    // Set column widths
    const cols = [
      { wch: 15 }, // Release ID
      { wch: 20 }, // System Name
      { wch: 12 }, // System ID
      { wch: 15 }, // Release Version
      { wch: 12 }, // Iteration
      { wch: 30 }, // Release Description
      { wch: 30 }, // Functionality Delivered
      { wch: 15 }, // Date Delivered
      { wch: 15 }, // TD Notice Date
      { wch: 15 }, // Test Deploy Date
      { wch: 15 }, // Test Start Date
      { wch: 15 }, // Test End Date
      { wch: 15 }, // Prod Deploy Date
      { wch: 15 }, // Test Status
      { wch: 20 }, // Deployment Status
      { wch: 18 }, // Outstanding Issues
      { wch: 25 }, // Comments
      { wch: 12 }, // Release Type
      { wch: 12 }, // Month
      { wch: 15 }, // Financial Year
    ]
    worksheet['!cols'] = cols
    XLSX.writeFile(workbook, `release-${release.releaseId}-${new Date().toISOString().split('T')[0]}.xlsx`)

    toast.success(`Release ${release.releaseId} exported successfully!`)
  }

  // Delete release functions
  const openDeleteDialog = (release: any) => {
    setReleaseToDelete(release)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (releaseToDelete) {
      // Remove the release from data
      const updatedData = data.filter(item => item.id !== releaseToDelete.id)
      setData(updatedData)

      // Show success toast
      toast.success(`Successfully deleted release ${releaseToDelete.releaseVersion}`)

      // Close dialog
      setDeleteDialogOpen(false)
      setReleaseToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setReleaseToDelete(null)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header - Light Gray Background */}
      <div className="bg-gray-50 border-b border-gray-200 p-6">
        <div className="items-start mb-7">
          <h1 className="text-2xl font-semibold text-gray-900">All Releases</h1>
        </div>

        {/* Enhanced Responsive Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          {/* Left Section - Export, Show/Hide, Search */}
          <div className="flex flex-col md:flex-row gap-3 xl:flex-1 xl:max-w-2xl">
            {/* Export and Show/Hide - Always visible */}
            <div className="flex gap-2 flex-1 md:flex-none">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-red-400 text-red-600 bg-white hover:bg-red-50 flex-1 md:flex-none md:w-auto min-w-[100px]">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[140px]">
                  <DropdownMenuItem onClick={exportToCSV}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToExcel}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportToJSON}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex-1 md:flex-none md:w-auto min-w-[140px]">
                    <Columns3 className="w-4 h-4" />
                    <span>Columns</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-60 max-h-[350px] overflow-hidden flex flex-col"
                >
                  <div className="relative p-2 border-b">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <div className="w-full">
                      <Input
                        placeholder="Search columns..."
                        value={columnSearchQuery}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setColumnSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-4 focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                      />
                    </div>
                  </div>

                  {/* Scrollable column list */}
                  <div className="overflow-y-auto flex-1 max-h-[300px]">
                    <div className="p-1">
                      {allColumns
                        .filter(col =>
                          !columnSearchQuery ||
                          col.label.toLowerCase().includes(columnSearchQuery.toLowerCase())
                        )
                        .map((col) => (
                          <DropdownMenuCheckboxItem
                            key={col.key}
                            checked={columnVisibility[col.key]}
                            onCheckedChange={() => toggleColumnVisibility(col.key)}
                            onSelect={(e: Event) => e.preventDefault()}
                            className="px-7 py-2.5 text-sm flex items-center gap-3 min-h-6"
                          >
                            <div className="flex-1 ml-1">{col.label}</div>
                          </DropdownMenuCheckboxItem>
                        ))}

                      {/* Show message when no columns match search */}
                      {allColumns.filter(col =>
                        !columnSearchQuery ||
                        col.label.toLowerCase().includes(columnSearchQuery.toLowerCase())
                      ).length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">
                            No columns found
                          </div>
                        )}
                    </div>
                  </div>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={resetColumnVisibility}
                    className="px-3 py-2.5 text-sm"
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Reset Columns
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Search Input */}
            <div className="flex-1 min-w-0">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                <Input
                  placeholder="Search releases..."
                  value={globalFilter}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setGlobalFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-9 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 focus:ring-2 focus:ring-offset-0 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right Section - Date Range, Ordering, Add/Delete */}
          <div className="flex flex-col md:flex-row gap-3 xl:flex-1 xl:justify-end">
            {/* Date Range and Ordering - Always visible */}
            <div className="flex gap-2 flex-1 md:flex-none">
              {/* Date Range */}
              <div className="relative flex-1 md:flex-none md:w-48 lg:w-56" ref={datePickerRef}>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                >
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  <Input
                    placeholder="Date range"
                    value={dateRange}
                    readOnly
                    className="w-full pl-10 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 cursor-pointer focus:ring-2 focus:ring-offset-0 focus:outline-none"
                  />
                </div>

                {showDatePicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-64">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                          className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                          className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={applyDateRange}
                          disabled={!startDate || !endDate}
                          className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50"
                          variant="outline"
                          size="sm"
                        >
                          Apply
                        </Button>
                        <Button
                          onClick={clearDateRange}
                          className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500"
                          size="sm"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ordering - Always visible */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="flex items-center gap-2 bg-white border-gray-300 hover:bg-gray-50 flex-1 md:flex-none md:w-36 justify-center">
                    <span>Order by</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[130px]">
                  <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                    Date (Newest)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                    Date (Oldest)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Add and Delete Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-red-400 bg-white text-red-600 hover:bg-red-50 flex-1 md:flex-none md:w-32"
                onClick={openAddDialog}
              >
                + Add New
              </Button>
              <Button
                size="sm"
                className="bg-red-500 text-white hover:bg-red-600 flex-1 md:flex-none md:w-32"
                onClick={openBulkDeleteDialog}
              >
                - Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Selected rows info */}
        {selectedRows.size > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            {selectedRows.size} of {sortedAndFilteredData.length} row(s) selected
          </div>
        )}

        {/* Filter status */}
        {(globalFilter || dateRange) && (
          <div className="mt-2 text-sm text-gray-500">
            Showing {sortedAndFilteredData.length} releases
            {globalFilter && ` matching "${globalFilter}"`}
            {dateRange && ` within date range: ${dateRange}`}
          </div>
        )}
      </div>

      {/* Rows Per Page Selector */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="flex items-center gap-2 bg-white border-gray-300 hover:bg-gray-50 w-24 justify-between">
                <span>{itemsPerPage}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[100px]">
              <DropdownMenuItem onClick={() => setItemsPerPage(10)}>
                10
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setItemsPerPage(20)}>
                20
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setItemsPerPage(50)}>
                50
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setItemsPerPage(100)}>
                100
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="text-sm text-gray-600">
          {sortedAndFilteredData.length} record(s) found
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-whit">
        <Table className="text-sm">
          <TableHeader className="bg-white hover:bg-gray-50 transition-colors duration-150 sticky top-0">
            <TableRow className="border-b border-gray-200 h-12">
              <TableHead className="w-12 px-4 text-sm font-semibold text-gray-900 h-12">
                {/* Fixed: Select/deselect only current page rows */}
                <input
                  type="checkbox"
                  checked={allCurrentPageSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = someCurrentPageSelected;
                    }
                  }}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-red-400 focus:ring-red-400"
                />
              </TableHead>
              {visibleColumns.map((col) => (
                <TableHead
                  key={col.key}
                  className={`px-4 text-sm font-semibold text-gray-900 h-12 ${col.width}`}
                >
                  {col.label}
                </TableHead>
              ))}
              <TableHead className="w-12 px-4 text-sm font-semibold text-gray-900 h-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <TableRow
                  key={row.id}
                  className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 h-12"
                >
                  <TableCell className="px-4 h-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => toggleRowSelection(row.id)}
                      className="rounded border-gray-300 text-red-400 focus:ring-red-400"
                    />
                  </TableCell>
                  {visibleColumns.map((col) => {
                    const value = row[col.key as keyof typeof row]

                    // Special rendering for certain columns
                    if (col.key === 'testStatus') {
                      return (
                        <TableCell key={col.key} className="px-4 h-12">
                          <div className={`flex items-center gap-2 ${statusConfig[String(value)]?.color}`}>
                            <span className={`inline-block w-2 h-2 rounded-full ${statusConfig[String(value)]?.dot}`}></span>
                            {String(value)}
                          </div>
                        </TableCell>
                      )
                    }

                    if (col.key === 'deploymentStatus') {
                      return (
                        <TableCell key={col.key} className="px-4 h-12">
                          <div className={`flex items-center gap-2 ${deploymentStatusConfig[String(value)]?.color}`}>
                            <span className={`inline-block w-2 h-2 rounded-full ${deploymentStatusConfig[String(value)]?.dot}`}></span>
                            {String(value)}
                          </div>
                        </TableCell>
                      )
                    }

                    if (col.key === 'releaseDescription' || col.key === 'functionalityDelivered' || col.key === 'comments' || col.key === 'outstandingIssues') {
                      return (
                        <TableCell key={col.key} className="px-4 h-12">
                          <TruncatedText text={String(value)} maxLength={col.key === 'comments' || col.key === 'outstandingIssues' ? 25 : 30} />
                        </TableCell>
                      )
                    }

                    return (
                      <TableCell key={col.key} className="px-4 text-gray-600 h-12">
                        {String(value)}
                      </TableCell>
                    )
                  })}
                  <TableCell className="px-4 h-12">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-4 h-8 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => openEditDialog(row)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => exportSingleRelease(row)}
                        >
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-red-600"
                          onClick={() => openDeleteDialog(row)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 2} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-600 text-center sm:text-left">
          Viewing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedAndFilteredData.length)} of {sortedAndFilteredData.length}
          {globalFilter && (
            <span className="ml-2">(filtered from {data.length} total records)</span>
          )}
          <span className="ml-2">• {visibleColumns.length} columns visible</span>
        </div>
        
        {/* Enhanced Pagination */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="border-gray-300 hover:bg-gray-50 min-w-9 h-9 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          {/* Smart page number rendering */}
          {(() => {
            const pages: (number | string)[] = [];
            const maxVisiblePages = 5;
            const ellipsis = "...";
            
            if (totalPages <= maxVisiblePages) {
              // Show all pages if total pages is small
              for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
              }
            } else {
              // Always show first page
              pages.push(1);
              
              if (currentPage <= 3) {
                // Near the beginning: 1, 2, 3, 4, ..., last
                for (let i = 2; i <= 4; i++) {
                  pages.push(i);
                }
                pages.push(ellipsis);
                pages.push(totalPages);
              } else if (currentPage >= totalPages - 2) {
                // Near the end: 1, ..., n-3, n-2, n-1, n
                pages.push(ellipsis);
                for (let i = totalPages - 3; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                // In the middle: 1, ..., current-1, current, current+1, ..., last
                pages.push(ellipsis);
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                  pages.push(i);
                }
                pages.push(ellipsis);
                pages.push(totalPages);
              }
            }
            
            return pages.map((page, index) => {
              if (page === ellipsis) {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="min-w-9 h-9 flex items-center justify-center text-gray-500 px-2"
                  >
                    {ellipsis}
                  </span>
                );
              }
              
              return (
                <Button
                  key={page}
                  size="sm"
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page as number)}
                  className={`min-w-9 h-9 p-0 ${
                    currentPage === page 
                      ? "bg-red-500 text-white hover:bg-red-600 border-red-500" 
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </Button>
              );
            });
          })()}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="border-gray-300 hover:bg-gray-50 min-w-9 h-9 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Add New Release Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-clip mx-auto p-4 sm:p-6">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Add New Release
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Create a new release with the details below. Fields marked with <span className="text-red-500">*</span> are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 w-full">
            {/* Release Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="releaseVersion" className="text-sm font-medium text-gray-700">
                    Release Version <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Input
                      id="releaseVersion"
                      value={addFormData.releaseVersion || ''}
                      onChange={handleAddInputChange}
                      className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.releaseVersion ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter release version"
                    />
                    {validationErrors.releaseVersion && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.releaseVersion}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="systemName" className="text-sm font-medium text-gray-700">
                    System Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Input
                      id="systemName"
                      value={addFormData.systemName || ''}
                      onChange={handleAddInputChange}
                      className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.systemName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter system name"
                    />
                    {validationErrors.systemName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.systemName}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="systemId" className="text-sm font-medium text-gray-700">
                    System ID <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Input
                      id="systemId"
                      value={addFormData.systemId || ''}
                      onChange={handleAddInputChange}
                      className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.systemId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter system ID"
                    />
                    {validationErrors.systemId && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.systemId}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="iteration" className="text-sm font-medium text-gray-700">
                    Iteration <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Input
                      id="iteration"
                      value={addFormData.iteration || ''}
                      onChange={handleAddInputChange}
                      className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.iteration ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter iteration"
                    />
                    {validationErrors.iteration && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.iteration}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="releaseType" className="text-sm font-medium text-gray-700">
                    Release Type <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Select
                      value={addFormData.releaseType || ''}
                      onValueChange={(value) => handleAddFormChange('releaseType', value)}
                    >
                      <SelectTrigger className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.releaseType ? 'border-red-500' : 'border-gray-300'
                      }`}>
                        <SelectValue placeholder="Select release type" />
                      </SelectTrigger>
                      <SelectContent>
                        {releaseTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.releaseType && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.releaseType}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="financialYear" className="text-sm font-medium text-gray-700">
                    Financial Year <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Input
                      id="financialYear"
                      value={addFormData.financialYear || ''}
                      onChange={handleAddInputChange}
                      className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.financialYear ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter financial year (e.g., FY2024)"
                    />
                    {validationErrors.financialYear && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.financialYear}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="testStatus" className="text-sm font-medium text-gray-700">
                    Test Status <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Select
                      value={addFormData.testStatus || ''}
                      onValueChange={(value) => handleAddFormChange('testStatus', value)}
                    >
                      <SelectTrigger className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.testStatus ? 'border-red-500' : 'border-gray-300'
                      }`}>
                        <SelectValue placeholder="Select test status" />
                      </SelectTrigger>
                      <SelectContent>
                        {testStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.testStatus && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.testStatus}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="deploymentStatus" className="text-sm font-medium text-gray-700">
                    Deployment Status <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Select
                      value={addFormData.deploymentStatus || ''}
                      onValueChange={(value) => handleAddFormChange('deploymentStatus', value)}
                    >
                      <SelectTrigger className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.deploymentStatus ? 'border-red-500' : 'border-gray-300'
                      }`}>
                        <SelectValue placeholder="Select deployment status" />
                      </SelectTrigger>
                      <SelectContent>
                        {deploymentStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.deploymentStatus && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.deploymentStatus}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Date Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Date Delivered <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={addFormData.deliveredDate || ''}
                      onChange={(value) => handleAddFormChange('deliveredDate', value)}
                      placeholder="Select delivery date"
                    />
                    {validationErrors.deliveredDate && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.deliveredDate}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    TD Notice Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={addFormData.tdNoticeDate || ''}
                      onChange={(value) => handleAddFormChange('tdNoticeDate', value)}
                      placeholder="Select TD notice date"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Test Deploy Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={addFormData.testDeployDate || ''}
                      onChange={(value) => handleAddFormChange('testDeployDate', value)}
                      placeholder="Select test deploy date"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Test Start Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={addFormData.testStartDate || ''}
                      onChange={(value) => handleAddFormChange('testStartDate', value)}
                      placeholder="Select test start date"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Test End Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={addFormData.testEndDate || ''}
                      onChange={(value) => handleAddFormChange('testEndDate', value)}
                      placeholder="Select test end date"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Prod Deploy Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={addFormData.prodDeployDate || ''}
                      onChange={(value) => handleAddFormChange('prodDeployDate', value)}
                      placeholder="Select production deploy date"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="month" className="text-sm font-medium text-gray-700">
                  Month
                </Label>
                <div className="w-full">
                  <Select
                    value={addFormData.month || ''}
                    onValueChange={(value) => handleAddFormChange('month', value)}
                  >
                    <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Full Width Text Areas */}
              <div className="space-y-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="releaseDescription" className="text-sm font-medium text-gray-700">
                    Release Description <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Textarea
                      id="releaseDescription"
                      value={addFormData.releaseDescription || ''}
                      onChange={handleAddInputChange}
                      rows={3}
                      className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none break-words break-all ${
                        validationErrors.releaseDescription ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter release description"
                    />
                    {validationErrors.releaseDescription && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.releaseDescription}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="functionalityDelivered" className="text-sm font-medium text-gray-700">
                    Functionality Delivered
                  </Label>
                  <div className="w-full">
                    <Textarea
                      id="functionalityDelivered"
                      value={addFormData.functionalityDelivered || ''}
                      onChange={handleAddInputChange}
                      rows={3}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none"
                      placeholder="Enter functionality delivered"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="outstandingIssues" className="text-sm font-medium text-gray-700">
                    Outstanding Issues
                  </Label>
                  <div className="w-full">
                    <Textarea
                      id="outstandingIssues"
                      value={addFormData.outstandingIssues || ''}
                      onChange={handleAddInputChange}
                      rows={4}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none"
                      placeholder="Describe outstanding issues, bugs, or pending tasks..."
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="comments" className="text-sm font-medium text-gray-700">
                    Comments
                  </Label>
                  <div className="w-full">
                    <Textarea
                      id="comments"
                      value={addFormData.comments || ''}
                      onChange={handleAddInputChange}
                      rows={3}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none"
                      placeholder="Enter comments"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t w-full">
            <Button
              variant="outline"
              onClick={saveNewRelease}
              className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 lg:mr-2"
            >
              Create Release
            </Button>
            <Button
              onClick={cancelAdd}
              className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 lg:ml-2"
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Release Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-clip mx-auto p-4 sm:p-6">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Edit Release
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Update release {releaseToEdit?.releaseVersion} details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 w-full">
            {/* Release Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="releaseId" className="text-sm font-medium text-gray-700">
                    Release ID
                  </Label>
                  <div className="w-full">
                    <Input
                      id="releaseId"
                      value={editFormData.releaseId || ''}
                      disabled
                      className="w-full bg-gray-100 text-gray-600"
                      placeholder="Release ID"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="releaseVersion" className="text-sm font-medium text-gray-700">
                    Release Version
                  </Label>
                  <div className="w-full">
                    <Input
                      id="releaseVersion"
                      value={editFormData.releaseVersion || ''}
                      onChange={handleInputChange}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                      placeholder="Enter release version"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="systemName" className="text-sm font-medium text-gray-700">
                    System Name
                  </Label>
                  <div className="w-full">
                    <Input
                      id="systemName"
                      value={editFormData.systemName || ''}
                      onChange={handleInputChange}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                      placeholder="Enter system name"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="systemId" className="text-sm font-medium text-gray-700">
                    System ID
                  </Label>
                  <div className="w-full">
                    <Input
                      id="systemId"
                      value={editFormData.systemId || ''}
                      onChange={handleInputChange}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                      placeholder="Enter system ID"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="iteration" className="text-sm font-medium text-gray-700">
                    Iteration
                  </Label>
                  <div className="w-full">
                    <Input
                      id="iteration"
                      value={editFormData.iteration || ''}
                      onChange={handleInputChange}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                      placeholder="Enter iteration"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="releaseType" className="text-sm font-medium text-gray-700">
                    Release Type
                  </Label>
                  <div className="w-full">
                    <Select
                      value={editFormData.releaseType || ''}
                      onValueChange={(value) => handleEditFormChange('releaseType', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select release type" />
                      </SelectTrigger>
                      <SelectContent>
                        {releaseTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="testStatus" className="text-sm font-medium text-gray-700">
                    Test Status
                  </Label>
                  <div className="w-full">
                    <Select
                      value={editFormData.testStatus || ''}
                      onValueChange={(value) => handleEditFormChange('testStatus', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select test status" />
                      </SelectTrigger>
                      <SelectContent>
                        {testStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="deploymentStatus" className="text-sm font-medium text-gray-700">
                    Deployment Status
                  </Label>
                  <div className="w-full">
                    <Select
                      value={editFormData.deploymentStatus || ''}
                      onValueChange={(value) => handleEditFormChange('deploymentStatus', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select deployment status" />
                      </SelectTrigger>
                      <SelectContent>
                        {deploymentStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Date Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Date Delivered
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={editFormData.deliveredDate || ''}
                      onChange={(value) => handleEditFormChange('deliveredDate', value)}
                      placeholder="Select delivery date"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    TD Notice Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={editFormData.tdNoticeDate || ''}
                      onChange={(value) => handleEditFormChange('tdNoticeDate', value)}
                      placeholder="Select TD notice date"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Test Deploy Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={editFormData.testDeployDate || ''}
                      onChange={(value) => handleEditFormChange('testDeployDate', value)}
                      placeholder="Select test deploy date"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Test Start Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={editFormData.testStartDate || ''}
                      onChange={(value) => handleEditFormChange('testStartDate', value)}
                      placeholder="Select test start date"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Test End Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={editFormData.testEndDate || ''}
                      onChange={(value) => handleEditFormChange('testEndDate', value)}
                      placeholder="Select test end date"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Prod Deploy Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={editFormData.prodDeployDate || ''}
                      onChange={(value) => handleEditFormChange('prodDeployDate', value)}
                      placeholder="Select production deploy date"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="month" className="text-sm font-medium text-gray-700">
                    Month
                  </Label>
                  <div className="w-full">
                    <Select
                      value={editFormData.month || ''}
                      onValueChange={(value) => handleEditFormChange('month', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="financialYear" className="text-sm font-medium text-gray-700">
                    Financial Year
                  </Label>
                  <div className="w-full">
                    <Select
                      value={editFormData.financialYear || ''}
                      onValueChange={(value) => handleEditFormChange('financialYear', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select financial year" />
                      </SelectTrigger>
                      <SelectContent>
                        {financialYearOptions.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Full Width Text Areas */}
              <div className="space-y-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="releaseDescription" className="text-sm font-medium text-gray-700">
                    Release Description
                  </Label>
                  <div className="w-full">
                    <Textarea
                      id="releaseDescription"
                      value={editFormData.releaseDescription || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none break-words break-all"
                      placeholder="Enter release description"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="functionalityDelivered" className="text-sm font-medium text-gray-700">
                    Functionality Delivered
                  </Label>
                  <div className="w-full">
                    <Textarea
                      id="functionalityDelivered"
                      value={editFormData.functionalityDelivered || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none"
                      placeholder="Enter functionality delivered"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="outstandingIssues" className="text-sm font-medium text-gray-700">
                    Outstanding Issues
                  </Label>
                  <div className="w-full">
                    <Textarea
                      id="outstandingIssues"
                      value={editFormData.outstandingIssues || ''}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none"
                      placeholder="Describe outstanding issues, bugs, or pending tasks..."
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="comments" className="text-sm font-medium text-gray-700">
                    Comments
                  </Label>
                  <div className="w-full">
                    <Textarea
                      id="comments"
                      value={editFormData.comments || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none"
                      placeholder="Enter comments"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t w-full">
            <Button
              variant="outline"
              onClick={saveEdit}
              className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 w-full"
            >
              Save Changes
            </Button>
            <Button
              onClick={cancelEdit}
              className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 w-full"
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Bulk Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedRows.size} selected release(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={cancelBulkDelete}
              className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 lg:mr-2"
            >
              No, Cancel
            </Button>
            <Button
              onClick={confirmBulkDelete}
              className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 lg:ml-2"
            >
              Yes, Delete {selectedRows.size} Release(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete release {releaseToDelete?.releaseVersion}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={cancelDelete}
              className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 lg:mr-2"
            >
              No, Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 lg:ml-2"
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}