import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Customers from "./pages/Customers";
import CustomerForm from "./pages/CustomerForm";
import Vehicles from "./pages/Vehicles";
import Quotations from "./pages/Quotations";
import QuotationWorkspace from "./pages/QuotationWorkspace";
import CreateQuotation from "./pages/CreateQuotation";
import Jobs from "./pages/Jobs";

import CarMakes from "./pages/CarMakes";
import InsuranceCompanies from "./pages/InsuranceCompanies";
import Claims from "./pages/Claims";
import OemApprovals from "./pages/OemApprovals";
import EmailPage from "./pages/Email";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Tenants from "./pages/Tenants";
import TenantForm from "./pages/TenantForm";
import Users from "./pages/Users";
import UserForm from "./pages/UserForm";
import SLACompanies from "./pages/SLACompanies";
import SLACompanyForm from "./pages/SLACompanyForm";
import VehicleIntake from "./pages/VehicleIntake";
import Intakes from "./pages/Intakes";
import Assessors from "./pages/Assessors";
import AssessorForm from "./pages/AssessorForm";
import Workshop from "./pages/Workshop";
import WorkflowStagesSettings from "./pages/WorkflowStagesSettings";
import Consumables from "./pages/Consumables";
import ShopTeam from "./pages/ShopTeam";
import WorkshopSegmentsSettings from "./pages/WorkshopSegmentsSettings";
import TabletManagement from "./pages/TabletManagement";
import Suppliers from "./pages/Suppliers";
import PartsCatalogue from "./pages/PartsCatalogue";
import PartsCosting from "./pages/PartsCosting";
import CaseDetail from "./pages/CaseDetail";
import VisitorSignIn from "./pages/VisitorSignIn";
import VisitorManagement from "./pages/VisitorManagement";
import VisitCategoriesSettings from "./pages/VisitCategoriesSettings";
import TechnicianTablet from "./pages/TechnicianTablet";
import TowingList from "./pages/TowingList";
import TowingUpliftmentForm from "./pages/TowingUpliftmentForm";
import TowingTowInForm from "./pages/TowingTowInForm";
import TowingAccidentForm from "./pages/TowingAccidentForm";
import TowingDetail from "./pages/TowingDetail";
import CustomerVisitForm from "./pages/CustomerVisitForm";
import VisitRequests from "./pages/VisitRequests";
import Payments from "./pages/Payments";
import ReleaseReports from "./pages/ReleaseReports";
import Marketing from "./pages/Marketing";
import Estimators from "./pages/Estimators";
import QCChecklists from "./pages/QCChecklists";
import QCChecklistDetail from "./pages/QCChecklistDetail";
import Scheduling from "./pages/Scheduling";
import Profitability from "./pages/Profitability";
import CustomerPortal from "./pages/CustomerPortal";
import CollectionScheduling from "./pages/CollectionScheduling";
import NotificationTemplates from "./pages/NotificationTemplates";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/quotations" element={<ProtectedRoute><AppLayout><Quotations /></AppLayout></ProtectedRoute>} />
            <Route path="/quotations/new" element={<ProtectedRoute><AppLayout><CreateQuotation /></AppLayout></ProtectedRoute>} />
            <Route path="/quotations/create" element={<ProtectedRoute><AppLayout><CreateQuotation /></AppLayout></ProtectedRoute>} />
            <Route path="/quotations/:id" element={<ProtectedRoute><AppLayout><QuotationWorkspace /></AppLayout></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><AppLayout><Jobs /></AppLayout></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute><AppLayout><Customers /></AppLayout></ProtectedRoute>} />
            <Route path="/customers/new" element={<ProtectedRoute><AppLayout><CustomerForm /></AppLayout></ProtectedRoute>} />
            <Route path="/customers/:id" element={<ProtectedRoute><AppLayout><CustomerForm /></AppLayout></ProtectedRoute>} />
            <Route path="/vehicles" element={<ProtectedRoute><AppLayout><Vehicles /></AppLayout></ProtectedRoute>} />
            <Route path="/car-makes" element={<ProtectedRoute><AppLayout><CarMakes /></AppLayout></ProtectedRoute>} />
            <Route path="/car-makes" element={<ProtectedRoute><AppLayout><CarMakes /></AppLayout></ProtectedRoute>} />
            <Route path="/insurance" element={<ProtectedRoute><AppLayout><InsuranceCompanies /></AppLayout></ProtectedRoute>} />
            <Route path="/claims" element={<ProtectedRoute><AppLayout><Claims /></AppLayout></ProtectedRoute>} />
            <Route path="/oem-approvals" element={<ProtectedRoute><AppLayout><OemApprovals /></AppLayout></ProtectedRoute>} />
            <Route path="/email" element={<ProtectedRoute><AppLayout><EmailPage /></AppLayout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
            <Route path="/tenants" element={<ProtectedRoute><AppLayout><Tenants /></AppLayout></ProtectedRoute>} />
            <Route path="/tenants/new" element={<ProtectedRoute><AppLayout><TenantForm /></AppLayout></ProtectedRoute>} />
            <Route path="/tenants/:id" element={<ProtectedRoute><AppLayout><TenantForm /></AppLayout></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><AppLayout><Users /></AppLayout></ProtectedRoute>} />
            <Route path="/users/new" element={<ProtectedRoute><AppLayout><UserForm /></AppLayout></ProtectedRoute>} />
            <Route path="/users/:id" element={<ProtectedRoute><AppLayout><UserForm /></AppLayout></ProtectedRoute>} />
            <Route path="/sla-companies" element={<ProtectedRoute><AppLayout><SLACompanies /></AppLayout></ProtectedRoute>} />
            <Route path="/sla-companies/new" element={<ProtectedRoute><AppLayout><SLACompanyForm /></AppLayout></ProtectedRoute>} />
            <Route path="/sla-companies/:id" element={<ProtectedRoute><AppLayout><SLACompanyForm /></AppLayout></ProtectedRoute>} />
            <Route path="/intake" element={<ProtectedRoute><VehicleIntake /></ProtectedRoute>} />
            <Route path="/intakes" element={<ProtectedRoute><AppLayout><Intakes /></AppLayout></ProtectedRoute>} />
            <Route path="/assessors" element={<ProtectedRoute><AppLayout><Assessors /></AppLayout></ProtectedRoute>} />
            <Route path="/assessors/new" element={<ProtectedRoute><AppLayout><AssessorForm /></AppLayout></ProtectedRoute>} />
            <Route path="/assessors/:id" element={<ProtectedRoute><AppLayout><AssessorForm /></AppLayout></ProtectedRoute>} />
            <Route path="/workshop" element={<ProtectedRoute><AppLayout><Workshop /></AppLayout></ProtectedRoute>} />
            <Route path="/workshop/case/:caseId" element={<ProtectedRoute><AppLayout><CaseDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/settings/workflow-stages" element={<ProtectedRoute><AppLayout><WorkflowStagesSettings /></AppLayout></ProtectedRoute>} />
            <Route path="/settings/workshop-segments" element={<ProtectedRoute><AppLayout><WorkshopSegmentsSettings /></AppLayout></ProtectedRoute>} />
            <Route path="/settings/tablets" element={<ProtectedRoute><AppLayout><TabletManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/settings/team" element={<ProtectedRoute><AppLayout><ShopTeam /></AppLayout></ProtectedRoute>} />
            <Route path="/consumables" element={<ProtectedRoute><AppLayout><Consumables /></AppLayout></ProtectedRoute>} />
            <Route path="/settings/suppliers" element={<ProtectedRoute><AppLayout><Suppliers /></AppLayout></ProtectedRoute>} />
            <Route path="/settings/parts-catalogue" element={<ProtectedRoute><AppLayout><PartsCatalogue /></AppLayout></ProtectedRoute>} />
            <Route path="/parts/costing" element={<ProtectedRoute><AppLayout><PartsCosting /></AppLayout></ProtectedRoute>} />
            <Route path="/visitors" element={<ProtectedRoute><AppLayout><VisitorManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/settings/visit-categories" element={<ProtectedRoute><AppLayout><VisitCategoriesSettings /></AppLayout></ProtectedRoute>} />
            <Route path="/visitor-signin" element={<VisitorSignIn />} />
            <Route path="/visit-request" element={<CustomerVisitForm />} />
            <Route path="/visit-requests" element={<ProtectedRoute><AppLayout><VisitRequests /></AppLayout></ProtectedRoute>} />
            <Route path="/workshop/tablet" element={<ProtectedRoute><TechnicianTablet /></ProtectedRoute>} />
            <Route path="/towing" element={<ProtectedRoute><AppLayout><TowingList /></AppLayout></ProtectedRoute>} />
            <Route path="/towing/new/upliftment" element={<ProtectedRoute><AppLayout><TowingUpliftmentForm /></AppLayout></ProtectedRoute>} />
            <Route path="/towing/new/tow-in" element={<ProtectedRoute><AppLayout><TowingTowInForm /></AppLayout></ProtectedRoute>} />
            <Route path="/towing/new/accident" element={<ProtectedRoute><AppLayout><TowingAccidentForm /></AppLayout></ProtectedRoute>} />
            <Route path="/towing/:id" element={<ProtectedRoute><AppLayout><TowingDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><AppLayout><Payments /></AppLayout></ProtectedRoute>} />
            <Route path="/release-reports" element={<ProtectedRoute><AppLayout><ReleaseReports /></AppLayout></ProtectedRoute>} />
            <Route path="/marketing" element={<ProtectedRoute><AppLayout><Marketing /></AppLayout></ProtectedRoute>} />
            <Route path="/insurance-companies" element={<ProtectedRoute><AppLayout><InsuranceCompanies /></AppLayout></ProtectedRoute>} />
            <Route path="/shop-team" element={<ProtectedRoute><AppLayout><ShopTeam /></AppLayout></ProtectedRoute>} />
            <Route path="/suppliers" element={<ProtectedRoute><AppLayout><Suppliers /></AppLayout></ProtectedRoute>} />
            <Route path="/parts/catalogue" element={<ProtectedRoute><AppLayout><PartsCatalogue /></AppLayout></ProtectedRoute>} />
            <Route path="/estimators" element={<ProtectedRoute><AppLayout><Estimators /></AppLayout></ProtectedRoute>} />
            <Route path="/settings/qc-checklists" element={<ProtectedRoute><AppLayout><QCChecklists /></AppLayout></ProtectedRoute>} />
            <Route path="/settings/qc-checklists/:id" element={<ProtectedRoute><AppLayout><QCChecklistDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/scheduling" element={<ProtectedRoute><AppLayout><Scheduling /></AppLayout></ProtectedRoute>} />
            <Route path="/reports/profitability" element={<ProtectedRoute><AppLayout><Profitability /></AppLayout></ProtectedRoute>} />
            <Route path="/portal/:token" element={<CustomerPortal />} />
            <Route path="/collections" element={<ProtectedRoute><AppLayout><CollectionScheduling /></AppLayout></ProtectedRoute>} />
            <Route path="/settings/notification-templates" element={<ProtectedRoute><AppLayout><NotificationTemplates /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
