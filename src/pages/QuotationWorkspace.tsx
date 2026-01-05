import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, Save } from "lucide-react";
import { QuoteHeader } from "@/components/quotation/QuoteHeader";
import { QuoteTypeSelector } from "@/components/quotation/QuoteTypeSelector";
import { QuoteItemsTable } from "@/components/quotation/QuoteItemsTable";
import { QuoteNotesTab } from "@/components/quotation/QuoteNotesTab";
import { QuotePhotosTab } from "@/components/quotation/QuotePhotosTab";
import { QuoteDocumentsTab } from "@/components/quotation/QuoteDocumentsTab";
import { QuoteRatesTab } from "@/components/quotation/QuoteRatesTab";
import { QuoteWorkInstructionsTab } from "@/components/quotation/QuoteWorkInstructionsTab";
import { QuoteItem } from "@/components/quotation/QuoteLineItem";
import { format } from "date-fns";

export default function QuotationWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { organizationId, isLoading: orgLoading, error: orgError } = useOrganization();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("items");
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [quoteOptions, setQuoteOptions] = useState({
    wasteDisposal: false,
    covid19: false,
    writeOff: false,
    onsite: false,
    polish: false,
    agreedOnly: false,
    authorized: false,
  });
  const [quoteType, setQuoteType] = useState("money");
  const [quotationId, setQuotationId] = useState<string | null>(id && id !== "new" ? id : null);
  const [createAttempted, setCreateAttempted] = useState(false);

  const isNewQuote = !id || id === "new";

  // Create new quotation on mount if this is a new quote
  const createQuotationMutation = useMutation({
    mutationFn: async () => {
      // Try to get organization from profile if hook didn't return it
      const orgId = organizationId || profile?.organization_id;
      if (!orgId) {
        throw new Error("No organization found. Please ensure your profile is set up correctly.");
      }
      
      const quoteNumber = `QT-${Date.now().toString(36).toUpperCase()}`;
      const { data, error } = await supabase
        .from("quotations")
        .insert({
          organization_id: orgId,
          quote_number: quoteNumber,
          status: "draft",
          created_by: user?.id,
          quote_type: quoteType,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setQuotationId(data.id);
      navigate(`/quotations/${data.id}`, { replace: true });
      toast({ title: "Quotation created", description: `Quote ${data.quote_number} created` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to create quotation", variant: "destructive" });
      console.error(error);
    },
  });

  useEffect(() => {
    const orgId = organizationId || profile?.organization_id;
    if (isNewQuote && orgId && !createQuotationMutation.isPending && !quotationId && !createAttempted) {
      setCreateAttempted(true);
      createQuotationMutation.mutate();
    }
  }, [isNewQuote, organizationId, profile?.organization_id, quotationId, createAttempted]);

  const { data: quotation, isLoading } = useQuery({
    queryKey: ["quotation", quotationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotations")
        .select(`*, customers(*), vehicles(*)`)
        .eq("id", quotationId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!quotationId,
  });

  const { data: quoteItems } = useQuery({
    queryKey: ["quote-items", quotationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_items")
        .select("*")
        .eq("quotation_id", quotationId)
        .order("sequence_number");
      if (error) throw error;
      const mapped = data.map((item) => ({
        id: item.id,
        sequenceNumber: item.sequence_number,
        operation: item.operation,
        description: item.description,
        markupPercent: Number(item.markup_percent) || 0,
        bettermentPercent: Number(item.betterment_percent) || 0,
        quantity: item.quantity || 1,
        partCost: Number(item.part_cost) || 0,
        labourCost: Number(item.labour_cost) || 0,
        paintCost: Number(item.paint_cost) || 0,
        stripCost: Number(item.strip_cost) || 0,
        frameCost: Number(item.frame_cost) || 0,
        inhouseOutworkCost: Number(item.inhouse_outwork_cost) || 0,
        lineTotal: Number(item.line_total) || 0,
      }));
      setItems(mapped);
      return mapped;
    },
    enabled: !!quotationId,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["quote-notes", quotationId],
    queryFn: async () => {
      const { data, error } = await supabase.from("quote_notes").select("*").eq("quotation_id", quotationId).order("created_at", { ascending: false });
      if (error) throw error;
      return data.map((n) => ({ id: n.id, noteType: n.note_type as "internal" | "insurer", content: n.content, createdBy: "User", createdAt: n.created_at }));
    },
    enabled: !!quotationId,
  });

  const { data: photos = [] } = useQuery({
    queryKey: ["quote-photos", quotationId],
    queryFn: async () => {
      const { data, error } = await supabase.from("quote_photos").select("*").eq("quotation_id", quotationId).order("created_at");
      if (error) throw error;
      return data.map((p) => ({ id: p.id, imageUrl: p.image_url, caption: p.caption || undefined, createdAt: p.created_at }));
    },
    enabled: !!quotationId,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["quote-documents", quotationId],
    queryFn: async () => {
      const { data, error } = await supabase.from("quote_documents").select("*").eq("quotation_id", quotationId).order("created_at");
      if (error) throw error;
      return data.map((d) => ({ id: d.id, documentType: d.document_type, fileName: d.file_name, fileUrl: d.file_url, fileSize: d.file_size || undefined, createdAt: d.created_at }));
    },
    enabled: !!quotationId,
  });

  const { data: workInstructions = [] } = useQuery({
    queryKey: ["quote-work-instructions", quotationId],
    queryFn: async () => {
      const { data, error } = await supabase.from("quote_work_instructions").select("*").eq("quotation_id", quotationId).order("created_at");
      if (error) throw error;
      return data.map((w) => ({ id: w.id, instructionType: w.instruction_type || "work_instruction", content: w.content, partNumber: w.part_number || undefined, supplier: w.supplier || undefined, createdAt: w.created_at }));
    },
    enabled: !!quotationId,
  });

  // Mutations for tabs
  const addNoteMutation = useMutation({
    mutationFn: async (note: { noteType: string; content: string }) => {
      const { error } = await supabase.from("quote_notes").insert({
        quotation_id: quotationId,
        organization_id: profile?.organization_id,
        note_type: note.noteType,
        content: note.content,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-notes", quotationId] });
      toast({ title: "Note added" });
    },
    onError: () => toast({ title: "Error adding note", variant: "destructive" }),
  });

  const addWorkInstructionMutation = useMutation({
    mutationFn: async (instruction: { instructionType: string; content: string; partNumber?: string; supplier?: string }) => {
      const { error } = await supabase.from("quote_work_instructions").insert({
        quotation_id: quotationId,
        organization_id: profile?.organization_id,
        instruction_type: instruction.instructionType,
        content: instruction.content,
        part_number: instruction.partNumber,
        supplier: instruction.supplier,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-work-instructions", quotationId] });
      toast({ title: "Instruction added" });
    },
    onError: () => toast({ title: "Error adding instruction", variant: "destructive" }),
  });

  const deleteWorkInstructionMutation = useMutation({
    mutationFn: async (instructionId: string) => {
      const { error } = await supabase.from("quote_work_instructions").delete().eq("id", instructionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-work-instructions", quotationId] });
      toast({ title: "Instruction deleted" });
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (files: FileList) => {
      for (const file of Array.from(files)) {
        const fileName = `${quotationId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("quote-photos").upload(fileName, file);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from("quote-photos").getPublicUrl(fileName);
        
        const { error: insertError } = await supabase.from("quote_photos").insert({
          quotation_id: quotationId,
          organization_id: profile?.organization_id,
          image_url: publicUrl,
          uploaded_by: user?.id,
        });
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-photos", quotationId] });
      toast({ title: "Photos uploaded" });
    },
    onError: () => toast({ title: "Error uploading photos", variant: "destructive" }),
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase.from("quote_photos").delete().eq("id", photoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-photos", quotationId] });
      toast({ title: "Photo deleted" });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      const fileName = `${quotationId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("quote-documents").upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from("quote-documents").getPublicUrl(fileName);
      
      const { error: insertError } = await supabase.from("quote_documents").insert({
        quotation_id: quotationId,
        organization_id: profile?.organization_id,
        document_type: type,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        uploaded_by: user?.id,
      });
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-documents", quotationId] });
      toast({ title: "Document uploaded" });
    },
    onError: () => toast({ title: "Error uploading document", variant: "destructive" }),
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (docId: string) => {
      const { error } = await supabase.from("quote_documents").delete().eq("id", docId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-documents", quotationId] });
      toast({ title: "Document deleted" });
    },
  });

  const saveItemsMutation = useMutation({
    mutationFn: async () => {
      await supabase.from("quote_items").delete().eq("quotation_id", quotationId);
      if (items.length > 0) {
        const records = items.map((item, idx) => ({
          quotation_id: quotationId,
          organization_id: profile?.organization_id,
          sequence_number: idx + 1,
          operation: item.operation,
          description: item.description,
          markup_percent: item.markupPercent,
          betterment_percent: item.bettermentPercent,
          quantity: item.quantity,
          part_cost: item.partCost,
          labour_cost: item.labourCost,
          paint_cost: item.paintCost,
          strip_cost: item.stripCost,
          frame_cost: item.frameCost,
          inhouse_outwork_cost: item.inhouseOutworkCost,
          line_total: (item.partCost + item.labourCost + item.paintCost + item.stripCost + item.frameCost + item.inhouseOutworkCost) * item.quantity,
        }));
        const { error } = await supabase.from("quote_items").insert(records);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Quote items saved successfully" });
      queryClient.invalidateQueries({ queryKey: ["quote-items", quotationId] });
    },
    onError: () => toast({ title: "Error", description: "Failed to save items", variant: "destructive" }),
  });

  const handleUpdateItem = useCallback((itemId: string, field: keyof QuoteItem, value: string | number) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)));
  }, []);

  const handleAddItem = useCallback((afterIndex: number) => {
    const newItem: QuoteItem = { id: crypto.randomUUID(), sequenceNumber: afterIndex + 2, operation: "labour", description: "", markupPercent: 0, bettermentPercent: 0, quantity: 1, partCost: 0, labourCost: 0, paintCost: 0, stripCost: 0, frameCost: 0, inhouseOutworkCost: 0, lineTotal: 0 };
    setItems((prev) => { const updated = [...prev]; updated.splice(afterIndex + 1, 0, newItem); return updated; });
  }, []);

  const handleQuickAdd = useCallback((newItemData: Omit<QuoteItem, "id" | "sequenceNumber" | "lineTotal">) => {
    const newItem: QuoteItem = {
      id: crypto.randomUUID(),
      sequenceNumber: items.length + 1,
      lineTotal: (newItemData.partCost + newItemData.labourCost + newItemData.paintCost + newItemData.stripCost + newItemData.frameCost + newItemData.inhouseOutworkCost) * newItemData.quantity,
      ...newItemData,
    };
    setItems((prev) => [...prev, newItem]);
    toast({ title: "Item added", description: `Added ${newItemData.description}` });
  }, [items.length]);

  const handleDeleteItem = useCallback((itemId: string) => setItems((prev) => prev.filter((item) => item.id !== itemId)), []);
  const handleDuplicateItem = useCallback((itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) { const idx = items.indexOf(item); const dup = { ...item, id: crypto.randomUUID() }; setItems((prev) => { const u = [...prev]; u.splice(idx + 1, 0, dup); return u; }); }
  }, [items]);

  // Show loading while organization is being fetched
  if (orgLoading) return <div className="p-8 text-center">Loading...</div>;
  
  // Show error if organization couldn't be determined
  if (isNewQuote && !organizationId && !profile?.organization_id && !orgLoading) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-destructive">Unable to create quotation: No organization found for your profile.</p>
        <Button variant="outline" onClick={() => navigate("/quotations")}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back to Quotations
        </Button>
      </div>
    );
  }
  
  if (isLoading || createQuotationMutation.isPending) return <div className="p-8 text-center">Loading quotation...</div>;
  if (!quotation && !isNewQuote) return <div className="p-8 text-center">Quotation not found</div>;
  if (!quotation) return <div className="p-8 text-center">Creating quotation...</div>;

  return (
    <div className="space-y-4">
      <QuoteHeader
        quoteNumber={quotation.quote_number}
        date={format(new Date(quotation.created_at), "yyyy-MM-dd")}
        clientName={quotation.customers?.name || ""}
        registration={quotation.vehicles?.registration || ""}
        vehicleMake={quotation.vehicles?.make || ""}
        vehicleModel={quotation.vehicles?.model || ""}
        claimNumber={quotation.claim_number || undefined}
        assessmentType={quotation.assessment_type || "full_report"}
        version={quotation.version_number || 1}
        onBackStage={() => navigate("/quotations")}
        onNextStage={() => toast({ title: "Moving to final stage..." })}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="items">Additionals</TabsTrigger>
            <TabsTrigger value="notes">Notes [{notes.length}]</TabsTrigger>
            <TabsTrigger value="photos">Photos [{photos.length}]</TabsTrigger>
            <TabsTrigger value="documents">Documents [{documents.length}]</TabsTrigger>
            <TabsTrigger value="wipsms">W.I./PSMS [{workInstructions.length}]</TabsTrigger>
            <TabsTrigger value="rates">Rates</TabsTrigger>
          </TabsList>
          <Button variant="outline" className="bg-orange-500 hover:bg-orange-600 text-white border-0">
            <Eye className="h-4 w-4 mr-2" />Preview Quote
          </Button>
        </div>

        <QuoteTypeSelector quoteType={quotation.quote_type || "money"} onQuoteTypeChange={() => {}} options={quoteOptions} onOptionChange={(k, v) => setQuoteOptions((p) => ({ ...p, [k]: v }))} />

        <TabsContent value="items" className="mt-4">
          <QuoteItemsTable 
            items={items} 
            onUpdateItem={handleUpdateItem} 
            onAddItem={handleAddItem} 
            onQuickAdd={handleQuickAdd}
            onEditItem={() => {}} 
            onDuplicateItem={handleDuplicateItem} 
            onDeleteItem={handleDeleteItem} 
          />
        </TabsContent>
        <TabsContent value="notes">
          <QuoteNotesTab notes={notes} onAddNote={(note) => addNoteMutation.mutate(note)} />
        </TabsContent>
        <TabsContent value="photos">
          <QuotePhotosTab 
            photos={photos} 
            onUpload={(files) => uploadPhotoMutation.mutate(files)} 
            onDelete={(photoId) => deletePhotoMutation.mutate(photoId)} 
            onUpdateCaption={() => {}} 
            isUploading={uploadPhotoMutation.isPending}
          />
        </TabsContent>
        <TabsContent value="documents">
          <QuoteDocumentsTab 
            documents={documents} 
            onUpload={(file, type) => uploadDocumentMutation.mutate({ file, type })} 
            onDelete={(docId) => deleteDocumentMutation.mutate(docId)} 
            isUploading={uploadDocumentMutation.isPending}
          />
        </TabsContent>
        <TabsContent value="wipsms">
          <QuoteWorkInstructionsTab 
            instructions={workInstructions} 
            onAdd={(instruction) => addWorkInstructionMutation.mutate(instruction)} 
            onDelete={(instructionId) => deleteWorkInstructionMutation.mutate(instructionId)} 
          />
        </TabsContent>
        <TabsContent value="rates">
          <QuoteRatesTab rates={null} />
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => navigate("/quotations")}><ArrowLeft className="h-4 w-4 mr-2" />Back to Quotations</Button>
        <div className="flex gap-2">
          <Button onClick={() => saveItemsMutation.mutate()} disabled={saveItemsMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />{saveItemsMutation.isPending ? "Saving..." : "Save Quote"}
          </Button>
        </div>
      </div>
    </div>
  );
}
