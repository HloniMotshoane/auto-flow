export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          case_id: string
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          segment_id: string
          start_time: string
          stop_time: string | null
          task_id: string | null
          technician_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          segment_id: string
          start_time?: string
          stop_time?: string | null
          task_id?: string | null
          technician_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          segment_id?: string
          start_time?: string
          stop_time?: string | null
          task_id?: string | null
          technician_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "workshop_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "segment_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      assessors: {
        Row: {
          cell_number: string | null
          company: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          insurance_company_id: string | null
          is_active: boolean | null
          last_name: string
          notes: string | null
          phone: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cell_number?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          insurance_company_id?: string | null
          is_active?: boolean | null
          last_name: string
          notes?: string | null
          phone?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cell_number?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          insurance_company_id?: string | null
          is_active?: boolean | null
          last_name?: string
          notes?: string | null
          phone?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessors_insurance_company_id_fkey"
            columns: ["insurance_company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      bay_assignments: {
        Row: {
          assigned_at: string
          assigned_technician_id: string | null
          bay_id: string
          case_id: string | null
          created_at: string
          id: string
          notes: string | null
          released_at: string | null
          status: string
          tenant_id: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_technician_id?: string | null
          bay_id: string
          case_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          released_at?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_technician_id?: string | null
          bay_id?: string
          case_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          released_at?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bay_assignments_bay_id_fkey"
            columns: ["bay_id"]
            isOneToOne: false
            referencedRelation: "workshop_bays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bay_assignments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bay_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bay_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          code: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      car_makes: {
        Row: {
          country: string | null
          created_at: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      car_models: {
        Row: {
          body_type: string | null
          created_at: string
          engine_size: string | null
          fuel_type: string | null
          id: string
          is_active: boolean | null
          make_id: string
          name: string
          organization_id: string
          transmission: string | null
          updated_at: string
          year_from: number | null
          year_to: number | null
        }
        Insert: {
          body_type?: string | null
          created_at?: string
          engine_size?: string | null
          fuel_type?: string | null
          id?: string
          is_active?: boolean | null
          make_id: string
          name: string
          organization_id: string
          transmission?: string | null
          updated_at?: string
          year_from?: number | null
          year_to?: number | null
        }
        Update: {
          body_type?: string | null
          created_at?: string
          engine_size?: string | null
          fuel_type?: string | null
          id?: string
          is_active?: boolean | null
          make_id?: string
          name?: string
          organization_id?: string
          transmission?: string | null
          updated_at?: string
          year_from?: number | null
          year_to?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "car_models_make_id_fkey"
            columns: ["make_id"]
            isOneToOne: false
            referencedRelation: "car_makes"
            referencedColumns: ["id"]
          },
        ]
      }
      case_communications: {
        Row: {
          attachments: Json | null
          body: string | null
          case_id: string
          channel: string
          created_at: string
          direction: string
          from_address: string | null
          id: string
          sent_by_user_id: string | null
          subject: string | null
          to_address: string | null
        }
        Insert: {
          attachments?: Json | null
          body?: string | null
          case_id: string
          channel: string
          created_at?: string
          direction: string
          from_address?: string | null
          id?: string
          sent_by_user_id?: string | null
          subject?: string | null
          to_address?: string | null
        }
        Update: {
          attachments?: Json | null
          body?: string | null
          case_id?: string
          channel?: string
          created_at?: string
          direction?: string
          from_address?: string | null
          id?: string
          sent_by_user_id?: string | null
          subject?: string | null
          to_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_communications_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_consumables: {
        Row: {
          case_id: string
          consumable_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          quantity: number
          segment_id: string | null
          technician_id: string | null
          tenant_id: string
          total_cost: number | null
          unit_cost: number
          updated_at: string
        }
        Insert: {
          case_id: string
          consumable_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          segment_id?: string | null
          technician_id?: string | null
          tenant_id: string
          total_cost?: number | null
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          case_id?: string
          consumable_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          segment_id?: string | null
          technician_id?: string | null
          tenant_id?: string
          total_cost?: number | null
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_consumables_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_consumables_consumable_id_fkey"
            columns: ["consumable_id"]
            isOneToOne: false
            referencedRelation: "consumables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_consumables_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "workshop_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_consumables_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      case_documents: {
        Row: {
          case_id: string
          created_at: string
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          uploaded_by: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_parts_required: {
        Row: {
          case_id: string
          created_at: string
          id: string
          images: Json | null
          notes: string | null
          part_description: string
          reason: string | null
          requested_by: string
          segment_id: string | null
          status: string | null
          tenant_id: string
          updated_at: string
          urgency: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          images?: Json | null
          notes?: string | null
          part_description: string
          reason?: string | null
          requested_by: string
          segment_id?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          images?: Json | null
          notes?: string | null
          part_description?: string
          reason?: string | null
          requested_by?: string
          segment_id?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_parts_required_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_parts_required_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "workshop_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      case_parts_used: {
        Row: {
          case_id: string
          cost_paid: number | null
          costing_request_id: string | null
          created_at: string
          fitted_at: string | null
          fitted_by: string | null
          id: string
          notes: string | null
          part_description: string | null
          part_required_id: string | null
          quantity: number | null
          segment_id: string | null
          supplier_id: string | null
          supplier_part_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          case_id: string
          cost_paid?: number | null
          costing_request_id?: string | null
          created_at?: string
          fitted_at?: string | null
          fitted_by?: string | null
          id?: string
          notes?: string | null
          part_description?: string | null
          part_required_id?: string | null
          quantity?: number | null
          segment_id?: string | null
          supplier_id?: string | null
          supplier_part_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          cost_paid?: number | null
          costing_request_id?: string | null
          created_at?: string
          fitted_at?: string | null
          fitted_by?: string | null
          id?: string
          notes?: string | null
          part_description?: string | null
          part_required_id?: string | null
          quantity?: number | null
          segment_id?: string | null
          supplier_id?: string | null
          supplier_part_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_parts_used_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_parts_used_costing_request_id_fkey"
            columns: ["costing_request_id"]
            isOneToOne: false
            referencedRelation: "parts_costing_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_parts_used_part_required_id_fkey"
            columns: ["part_required_id"]
            isOneToOne: false
            referencedRelation: "case_parts_required"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_parts_used_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "workshop_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_parts_used_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_parts_used_supplier_part_id_fkey"
            columns: ["supplier_part_id"]
            isOneToOne: false
            referencedRelation: "supplier_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          activated_at: string | null
          assessor_company: string | null
          assessor_email: string | null
          assessor_id: string | null
          assessor_phone: string | null
          authorization_number: string | null
          case_number: string
          claim_reference: string | null
          clerk_reference: string | null
          condition_status: string | null
          created_at: string
          current_stage_id: string | null
          customer_id: string | null
          excess_amount: number | null
          id: string
          insurance_company_id: string | null
          insurance_email: string | null
          insurance_number: string | null
          insurance_type: string | null
          intake_id: string | null
          job_number: string | null
          notes: string | null
          policy_number: string | null
          status: string
          storage_days: number | null
          tenant_id: string
          tow_company: string | null
          tow_contact_number: string | null
          tow_email: string | null
          tow_fee: number | null
          tow_in_date: string | null
          updated_at: string
          vehicle_id: string | null
          warranty_status: string | null
          was_towed: boolean | null
        }
        Insert: {
          activated_at?: string | null
          assessor_company?: string | null
          assessor_email?: string | null
          assessor_id?: string | null
          assessor_phone?: string | null
          authorization_number?: string | null
          case_number: string
          claim_reference?: string | null
          clerk_reference?: string | null
          condition_status?: string | null
          created_at?: string
          current_stage_id?: string | null
          customer_id?: string | null
          excess_amount?: number | null
          id?: string
          insurance_company_id?: string | null
          insurance_email?: string | null
          insurance_number?: string | null
          insurance_type?: string | null
          intake_id?: string | null
          job_number?: string | null
          notes?: string | null
          policy_number?: string | null
          status?: string
          storage_days?: number | null
          tenant_id: string
          tow_company?: string | null
          tow_contact_number?: string | null
          tow_email?: string | null
          tow_fee?: number | null
          tow_in_date?: string | null
          updated_at?: string
          vehicle_id?: string | null
          warranty_status?: string | null
          was_towed?: boolean | null
        }
        Update: {
          activated_at?: string | null
          assessor_company?: string | null
          assessor_email?: string | null
          assessor_id?: string | null
          assessor_phone?: string | null
          authorization_number?: string | null
          case_number?: string
          claim_reference?: string | null
          clerk_reference?: string | null
          condition_status?: string | null
          created_at?: string
          current_stage_id?: string | null
          customer_id?: string | null
          excess_amount?: number | null
          id?: string
          insurance_company_id?: string | null
          insurance_email?: string | null
          insurance_number?: string | null
          insurance_type?: string | null
          intake_id?: string | null
          job_number?: string | null
          notes?: string | null
          policy_number?: string | null
          status?: string
          storage_days?: number | null
          tenant_id?: string
          tow_company?: string | null
          tow_contact_number?: string | null
          tow_email?: string | null
          tow_fee?: number | null
          tow_in_date?: string | null
          updated_at?: string
          vehicle_id?: string | null
          warranty_status?: string | null
          was_towed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_current_stage_id_fkey"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "workflow_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "vehicle_intakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          approved_at: string | null
          authorization_number: string | null
          claim_amount: number | null
          claim_number: string
          created_at: string
          customer_id: string | null
          excess_amount: number | null
          id: string
          insurance_company_id: string | null
          job_id: string | null
          notes: string | null
          organization_id: string
          status: string | null
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          authorization_number?: string | null
          claim_amount?: number | null
          claim_number: string
          created_at?: string
          customer_id?: string | null
          excess_amount?: number | null
          id?: string
          insurance_company_id?: string | null
          job_id?: string | null
          notes?: string | null
          organization_id: string
          status?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          authorization_number?: string | null
          claim_amount?: number | null
          claim_number?: string
          created_at?: string
          customer_id?: string | null
          excess_amount?: number | null
          id?: string
          insurance_company_id?: string | null
          job_id?: string | null
          notes?: string | null
          organization_id?: string
          status?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_insurance_company_id_fkey"
            columns: ["insurance_company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_schedules: {
        Row: {
          case_id: string
          completed_at: string | null
          confirmed_at: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          scheduled_date: string
          scheduled_time: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          case_id: string
          completed_at?: string | null
          confirmed_at?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          completed_at?: string | null
          confirmed_at?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_schedules_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_schedules_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_schedules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      consumable_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consumable_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      consumable_movements: {
        Row: {
          case_id: string | null
          consumable_id: string
          created_at: string
          created_by: string | null
          id: string
          movement_type: string
          notes: string | null
          quantity: number
          reason: string | null
          tenant_id: string
          unit_cost: number | null
        }
        Insert: {
          case_id?: string | null
          consumable_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: string
          notes?: string | null
          quantity: number
          reason?: string | null
          tenant_id: string
          unit_cost?: number | null
        }
        Update: {
          case_id?: string | null
          consumable_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: string
          notes?: string | null
          quantity?: number
          reason?: string | null
          tenant_id?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "consumable_movements_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumable_movements_consumable_id_fkey"
            columns: ["consumable_id"]
            isOneToOne: false
            referencedRelation: "consumables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumable_movements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      consumables: {
        Row: {
          category_id: string | null
          created_at: string
          current_stock: number
          description: string | null
          id: string
          is_active: boolean | null
          minimum_stock_level: number
          name: string
          sku: string | null
          tenant_id: string
          unit_cost: number
          unit_of_measure: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          current_stock?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          minimum_stock_level?: number
          name: string
          sku?: string | null
          tenant_id: string
          unit_cost?: number
          unit_of_measure?: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          current_stock?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          minimum_stock_level?: number
          name?: string
          sku?: string | null
          tenant_id?: string
          unit_cost?: number
          unit_of_measure?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consumables_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "consumable_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumables_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_overruns: {
        Row: {
          actual_amount: number
          approved_at: string | null
          approved_by: string | null
          case_id: string
          created_at: string
          id: string
          job_cost_id: string | null
          overrun_amount: number
          overrun_percentage: number | null
          overrun_type: string
          quoted_amount: number
          reason: string | null
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          actual_amount: number
          approved_at?: string | null
          approved_by?: string | null
          case_id: string
          created_at?: string
          id?: string
          job_cost_id?: string | null
          overrun_amount: number
          overrun_percentage?: number | null
          overrun_type: string
          quoted_amount: number
          reason?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          actual_amount?: number
          approved_at?: string | null
          approved_by?: string | null
          case_id?: string
          created_at?: string
          id?: string
          job_cost_id?: string | null
          overrun_amount?: number
          overrun_percentage?: number | null
          overrun_type?: string
          quoted_amount?: number
          reason?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_overruns_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_overruns_job_cost_id_fkey"
            columns: ["job_cost_id"]
            isOneToOne: false
            referencedRelation: "job_costs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_overruns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notifications: {
        Row: {
          case_id: string | null
          channel: string
          created_at: string
          customer_id: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          sent_at: string | null
          status: string
          subject: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          channel?: string
          created_at?: string
          customer_id?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          channel?: string
          created_at?: string
          customer_id?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notifications_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_portal_tokens: {
        Row: {
          case_id: string
          created_at: string
          customer_id: string
          expires_at: string
          id: string
          is_active: boolean | null
          last_accessed_at: string | null
          tenant_id: string
          token: string
        }
        Insert: {
          case_id: string
          created_at?: string
          customer_id: string
          expires_at: string
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          tenant_id: string
          token: string
        }
        Update: {
          case_id?: string
          created_at?: string
          customer_id?: string
          expires_at?: string
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          tenant_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_portal_tokens_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_portal_tokens_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_portal_tokens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          branch_id: string | null
          city: string | null
          created_at: string
          customer_type: string | null
          date_of_birth: string | null
          email: string | null
          estimator_id: string | null
          first_name: string | null
          id: string
          id_number: string | null
          last_name: string | null
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
          postal_code: string | null
          suburb: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          branch_id?: string | null
          city?: string | null
          created_at?: string
          customer_type?: string | null
          date_of_birth?: string | null
          email?: string | null
          estimator_id?: string | null
          first_name?: string | null
          id?: string
          id_number?: string | null
          last_name?: string | null
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          postal_code?: string | null
          suburb?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          branch_id?: string | null
          city?: string | null
          created_at?: string
          customer_type?: string | null
          date_of_birth?: string | null
          email?: string | null
          estimator_id?: string | null
          first_name?: string | null
          id?: string
          id_number?: string | null
          last_name?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          postal_code?: string | null
          suburb?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          body: string | null
          created_at: string
          direction: string
          from_address: string
          id: string
          is_read: boolean | null
          job_id: string | null
          organization_id: string
          received_at: string | null
          subject: string | null
          to_address: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          direction?: string
          from_address: string
          id?: string
          is_read?: boolean | null
          job_id?: string | null
          organization_id: string
          received_at?: string | null
          subject?: string | null
          to_address: string
        }
        Update: {
          body?: string | null
          created_at?: string
          direction?: string
          from_address?: string
          id?: string
          is_read?: boolean | null
          job_id?: string | null
          organization_id?: string
          received_at?: string | null
          subject?: string | null
          to_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_companies: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      intake_images: {
        Row: {
          created_at: string
          id: string
          image_type: string | null
          image_url: string
          intake_id: string
          is_plate_image: boolean | null
          sequence_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_type?: string | null
          image_url: string
          intake_id: string
          is_plate_image?: boolean | null
          sequence_number: number
        }
        Update: {
          created_at?: string
          id?: string
          image_type?: string | null
          image_url?: string
          intake_id?: string
          is_plate_image?: boolean | null
          sequence_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "intake_images_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "vehicle_intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_bookings: {
        Row: {
          actual_completion_date: string | null
          bay_id: string | null
          booking_date: string
          booking_type: string | null
          case_id: string | null
          created_at: string
          created_by: string | null
          end_time: string | null
          estimated_completion_date: string | null
          estimated_days: number | null
          id: string
          job_id: string | null
          notes: string | null
          priority: string | null
          start_time: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          actual_completion_date?: string | null
          bay_id?: string | null
          booking_date: string
          booking_type?: string | null
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          end_time?: string | null
          estimated_completion_date?: string | null
          estimated_days?: number | null
          id?: string
          job_id?: string | null
          notes?: string | null
          priority?: string | null
          start_time?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          actual_completion_date?: string | null
          bay_id?: string | null
          booking_date?: string
          booking_type?: string | null
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          end_time?: string | null
          estimated_completion_date?: string | null
          estimated_days?: number | null
          id?: string
          job_id?: string | null
          notes?: string | null
          priority?: string | null
          start_time?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_bookings_bay_id_fkey"
            columns: ["bay_id"]
            isOneToOne: false
            referencedRelation: "workshop_bays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_bookings_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_bookings_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_bookings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      job_costs: {
        Row: {
          actual_consumables: number | null
          actual_labor: number | null
          actual_parts: number | null
          actual_sublet: number | null
          actual_total: number | null
          case_id: string
          created_at: string
          id: string
          is_overbudget: boolean | null
          job_id: string | null
          labor_hours_actual: number | null
          labor_hours_quoted: number | null
          last_calculated_at: string | null
          overbudget_amount: number | null
          profit_amount: number | null
          profit_margin: number | null
          quoted_consumables: number | null
          quoted_labor: number | null
          quoted_parts: number | null
          quoted_sublet: number | null
          quoted_total: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          actual_consumables?: number | null
          actual_labor?: number | null
          actual_parts?: number | null
          actual_sublet?: number | null
          actual_total?: number | null
          case_id: string
          created_at?: string
          id?: string
          is_overbudget?: boolean | null
          job_id?: string | null
          labor_hours_actual?: number | null
          labor_hours_quoted?: number | null
          last_calculated_at?: string | null
          overbudget_amount?: number | null
          profit_amount?: number | null
          profit_margin?: number | null
          quoted_consumables?: number | null
          quoted_labor?: number | null
          quoted_parts?: number | null
          quoted_sublet?: number | null
          quoted_total?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          actual_consumables?: number | null
          actual_labor?: number | null
          actual_parts?: number | null
          actual_sublet?: number | null
          actual_total?: number | null
          case_id?: string
          created_at?: string
          id?: string
          is_overbudget?: boolean | null
          job_id?: string | null
          labor_hours_actual?: number | null
          labor_hours_quoted?: number | null
          last_calculated_at?: string | null
          overbudget_amount?: number | null
          profit_amount?: number | null
          profit_margin?: number | null
          quoted_consumables?: number | null
          quoted_labor?: number | null
          quoted_parts?: number | null
          quoted_sublet?: number | null
          quoted_total?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_costs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_costs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_costs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          actual_completion: string | null
          assigned_to: string | null
          authorization_date: string | null
          authorization_status: string | null
          bay_number: string | null
          claim_number: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          estimated_completion: string | null
          id: string
          insurance_company: string | null
          job_number: string
          lifecycle_status: string | null
          notes: string | null
          organization_id: string
          priority: string | null
          quotation_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string
          vehicle_arrived_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          actual_completion?: string | null
          assigned_to?: string | null
          authorization_date?: string | null
          authorization_status?: string | null
          bay_number?: string | null
          claim_number?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          estimated_completion?: string | null
          id?: string
          insurance_company?: string | null
          job_number: string
          lifecycle_status?: string | null
          notes?: string | null
          organization_id: string
          priority?: string | null
          quotation_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          vehicle_arrived_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          actual_completion?: string | null
          assigned_to?: string | null
          authorization_date?: string | null
          authorization_status?: string | null
          bay_number?: string | null
          claim_number?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          estimated_completion?: string | null
          id?: string
          insurance_company?: string | null
          job_number?: string
          lifecycle_status?: string | null
          notes?: string | null
          organization_id?: string
          priority?: string | null
          quotation_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          vehicle_arrived_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      labor_rates: {
        Row: {
          cost_rate: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          rate_amount: number
          rate_type: string | null
          segment_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cost_rate?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          rate_amount?: number
          rate_type?: string | null
          segment_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cost_rate?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          rate_amount?: number
          rate_type?: string | null
          segment_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "labor_rates_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "workshop_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labor_rates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          assigned_to: string | null
          company_name: string | null
          contact_name: string
          converted_to_customer_id: string | null
          created_at: string
          email: string | null
          id: string
          lead_type: string
          notes: string | null
          phone: string | null
          source: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          company_name?: string | null
          contact_name: string
          converted_to_customer_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_type: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          company_name?: string | null
          contact_name?: string
          converted_to_customer_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_type?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_converted_to_customer_id_fkey"
            columns: ["converted_to_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          body_template: string
          channel: string
          created_at: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          notification_type: string
          subject_template: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          body_template: string
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          notification_type: string
          subject_template?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          body_template?: string
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          notification_type?: string
          subject_template?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      oem_approvals: {
        Row: {
          brand_name: string
          certificate_number: string | null
          created_at: string
          expiry_date: string
          id: string
          issue_date: string
          make_id: string | null
          notes: string | null
          organization_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          brand_name: string
          certificate_number?: string | null
          created_at?: string
          expiry_date: string
          id?: string
          issue_date: string
          make_id?: string | null
          notes?: string | null
          organization_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          brand_name?: string
          certificate_number?: string | null
          created_at?: string
          expiry_date?: string
          id?: string
          issue_date?: string
          make_id?: string | null
          notes?: string | null
          organization_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oem_approvals_make_id_fkey"
            columns: ["make_id"]
            isOneToOne: false
            referencedRelation: "car_makes"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      part_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      parts_costing_requests: {
        Row: {
          case_id: string
          created_at: string
          expires_at: string | null
          id: string
          notes: string | null
          part_description: string | null
          part_required_id: string | null
          quantity: number | null
          requested_by: string
          sent_at: string | null
          status: string | null
          supplier_id: string
          supplier_part_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          part_description?: string | null
          part_required_id?: string | null
          quantity?: number | null
          requested_by: string
          sent_at?: string | null
          status?: string | null
          supplier_id: string
          supplier_part_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          part_description?: string | null
          part_required_id?: string | null
          quantity?: number | null
          requested_by?: string
          sent_at?: string | null
          status?: string | null
          supplier_id?: string
          supplier_part_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parts_costing_requests_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_costing_requests_part_required_id_fkey"
            columns: ["part_required_id"]
            isOneToOne: false
            referencedRelation: "case_parts_required"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_costing_requests_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_costing_requests_supplier_part_id_fkey"
            columns: ["supplier_part_id"]
            isOneToOne: false
            referencedRelation: "supplier_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      parts_orders: {
        Row: {
          case_id: string
          cost_actual: number | null
          cost_quoted: number | null
          costing_request_id: string | null
          created_at: string
          delivered_date: string | null
          expected_delivery_date: string | null
          fitted_by: string | null
          fitted_date: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          order_reference: string | null
          ordered_date: string
          part_description: string
          part_required_id: string | null
          quantity: number
          status: string
          supplier_id: string
          supplier_part_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          case_id: string
          cost_actual?: number | null
          cost_quoted?: number | null
          costing_request_id?: string | null
          created_at?: string
          delivered_date?: string | null
          expected_delivery_date?: string | null
          fitted_by?: string | null
          fitted_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          order_reference?: string | null
          ordered_date?: string
          part_description: string
          part_required_id?: string | null
          quantity?: number
          status?: string
          supplier_id: string
          supplier_part_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          cost_actual?: number | null
          cost_quoted?: number | null
          costing_request_id?: string | null
          created_at?: string
          delivered_date?: string | null
          expected_delivery_date?: string | null
          fitted_by?: string | null
          fitted_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          order_reference?: string | null
          ordered_date?: string
          part_description?: string
          part_required_id?: string | null
          quantity?: number
          status?: string
          supplier_id?: string
          supplier_part_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parts_orders_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_orders_costing_request_id_fkey"
            columns: ["costing_request_id"]
            isOneToOne: false
            referencedRelation: "parts_costing_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_orders_part_required_id_fkey"
            columns: ["part_required_id"]
            isOneToOne: false
            referencedRelation: "case_parts_required"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_orders_supplier_part_id_fkey"
            columns: ["supplier_part_id"]
            isOneToOne: false
            referencedRelation: "supplier_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          case_id: string | null
          created_at: string
          customer_id: string | null
          id: string
          job_id: string | null
          notes: string | null
          payment_date: string
          payment_method: string
          receipt_number: string | null
          received_by: string | null
          reference_number: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          case_id?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method: string
          receipt_number?: string | null
          received_by?: string | null
          reference_number?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          case_id?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string
          receipt_number?: string | null
          received_by?: string | null
          reference_number?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string
          id: string
          module: string
          organization_id: string | null
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string
          id?: string
          module: string
          organization_id?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string
          id?: string
          module?: string
          organization_id?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          branch_id: string | null
          cell_number: string | null
          company_code: string | null
          created_at: string
          department: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          job_role: string | null
          last_name: string | null
          organization_id: string | null
          phone: string | null
          pin: string | null
          tenant_id: string | null
          two_factor_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          branch_id?: string | null
          cell_number?: string | null
          company_code?: string | null
          created_at?: string
          department?: string | null
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          job_role?: string | null
          last_name?: string | null
          organization_id?: string | null
          phone?: string | null
          pin?: string | null
          tenant_id?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          branch_id?: string | null
          cell_number?: string | null
          company_code?: string | null
          created_at?: string
          department?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          job_role?: string | null
          last_name?: string | null
          organization_id?: string | null
          phone?: string | null
          pin?: string | null
          tenant_id?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      qc_checklist_items: {
        Row: {
          checklist_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          item_text: string
          requires_notes: boolean | null
          requires_photo: boolean | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          checklist_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          item_text: string
          requires_notes?: boolean | null
          requires_photo?: boolean | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          checklist_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          item_text?: string
          requires_notes?: boolean | null
          requires_photo?: boolean | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qc_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "qc_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      qc_checklists: {
        Row: {
          checklist_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          name: string
          segment_id: string | null
          sort_order: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          checklist_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name: string
          segment_id?: string | null
          sort_order?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          checklist_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name?: string
          segment_id?: string | null
          sort_order?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qc_checklists_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "workshop_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_checklists_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      qc_inspection_results: {
        Row: {
          checklist_item_id: string
          created_at: string
          id: string
          inspection_id: string
          notes: string | null
          photos: Json | null
          result: string
          updated_at: string
        }
        Insert: {
          checklist_item_id: string
          created_at?: string
          id?: string
          inspection_id: string
          notes?: string | null
          photos?: Json | null
          result?: string
          updated_at?: string
        }
        Update: {
          checklist_item_id?: string
          created_at?: string
          id?: string
          inspection_id?: string
          notes?: string | null
          photos?: Json | null
          result?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qc_inspection_results_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "qc_checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_inspection_results_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "qc_inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      qc_inspections: {
        Row: {
          case_id: string
          checklist_id: string
          completed_at: string | null
          created_at: string
          failed_items: number | null
          id: string
          inspection_type: string
          inspector_id: string
          na_items: number | null
          notes: string | null
          overall_score: number | null
          passed_items: number | null
          status: string
          tenant_id: string
          total_items: number | null
          updated_at: string
        }
        Insert: {
          case_id: string
          checklist_id: string
          completed_at?: string | null
          created_at?: string
          failed_items?: number | null
          id?: string
          inspection_type?: string
          inspector_id: string
          na_items?: number | null
          notes?: string | null
          overall_score?: number | null
          passed_items?: number | null
          status?: string
          tenant_id: string
          total_items?: number | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          checklist_id?: string
          completed_at?: string | null
          created_at?: string
          failed_items?: number | null
          id?: string
          inspection_type?: string
          inspector_id?: string
          na_items?: number | null
          notes?: string | null
          overall_score?: number | null
          passed_items?: number | null
          status?: string
          tenant_id?: string
          total_items?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qc_inspections_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_inspections_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "qc_checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_inspections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      qc_rework_logs: {
        Row: {
          actual_cost: number | null
          actual_hours: number | null
          assigned_to: string | null
          case_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          estimated_cost: number | null
          estimated_hours: number | null
          id: string
          inspection_id: string | null
          reported_by: string
          rework_reason: string
          severity: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          actual_hours?: number | null
          assigned_to?: string | null
          case_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          inspection_id?: string | null
          reported_by: string
          rework_reason: string
          severity?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          actual_hours?: number | null
          assigned_to?: string | null
          case_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          inspection_id?: string | null
          reported_by?: string
          rework_reason?: string
          severity?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qc_rework_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_rework_logs_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "qc_inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_rework_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          agreed_only: boolean | null
          assessment_type: string | null
          authorized: boolean | null
          case_id: string | null
          claim_number: string | null
          covid_19: boolean | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          discount_percent: number | null
          estimator_id: string | null
          id: string
          labour_cost: number | null
          notes: string | null
          onsite: boolean | null
          organization_id: string
          other_cost: number | null
          paint_cost: number | null
          parent_version_id: string | null
          parts_cost: number | null
          polish: boolean | null
          quote_number: string
          quote_type: string | null
          status: string | null
          subtotal_frame: number | null
          subtotal_labour: number | null
          subtotal_outwork: number | null
          subtotal_paint: number | null
          subtotal_parts: number | null
          subtotal_strip: number | null
          total_amount: number | null
          updated_at: string
          valid_until: string | null
          vat_percent: number | null
          vehicle_id: string | null
          version_number: number | null
          waste_disposal: boolean | null
          write_off: boolean | null
        }
        Insert: {
          agreed_only?: boolean | null
          assessment_type?: string | null
          authorized?: boolean | null
          case_id?: string | null
          claim_number?: string | null
          covid_19?: boolean | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          discount_percent?: number | null
          estimator_id?: string | null
          id?: string
          labour_cost?: number | null
          notes?: string | null
          onsite?: boolean | null
          organization_id: string
          other_cost?: number | null
          paint_cost?: number | null
          parent_version_id?: string | null
          parts_cost?: number | null
          polish?: boolean | null
          quote_number: string
          quote_type?: string | null
          status?: string | null
          subtotal_frame?: number | null
          subtotal_labour?: number | null
          subtotal_outwork?: number | null
          subtotal_paint?: number | null
          subtotal_parts?: number | null
          subtotal_strip?: number | null
          total_amount?: number | null
          updated_at?: string
          valid_until?: string | null
          vat_percent?: number | null
          vehicle_id?: string | null
          version_number?: number | null
          waste_disposal?: boolean | null
          write_off?: boolean | null
        }
        Update: {
          agreed_only?: boolean | null
          assessment_type?: string | null
          authorized?: boolean | null
          case_id?: string | null
          claim_number?: string | null
          covid_19?: boolean | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          discount_percent?: number | null
          estimator_id?: string | null
          id?: string
          labour_cost?: number | null
          notes?: string | null
          onsite?: boolean | null
          organization_id?: string
          other_cost?: number | null
          paint_cost?: number | null
          parent_version_id?: string | null
          parts_cost?: number | null
          polish?: boolean | null
          quote_number?: string
          quote_type?: string | null
          status?: string | null
          subtotal_frame?: number | null
          subtotal_labour?: number | null
          subtotal_outwork?: number | null
          subtotal_paint?: number | null
          subtotal_parts?: number | null
          subtotal_strip?: number | null
          total_amount?: number | null
          updated_at?: string
          valid_until?: string | null
          vat_percent?: number | null
          vehicle_id?: string | null
          version_number?: number | null
          waste_disposal?: boolean | null
          write_off?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          organization_id: string
          quotation_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          organization_id: string
          quotation_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          organization_id?: string
          quotation_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_documents_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          betterment_percent: number | null
          created_at: string
          description: string
          frame_cost: number | null
          id: string
          inhouse_outwork_cost: number | null
          labour_cost: number | null
          line_total: number | null
          markup_percent: number | null
          notes: string | null
          operation: string
          organization_id: string
          paint_cost: number | null
          part_cost: number | null
          quantity: number | null
          quotation_id: string
          sequence_number: number
          strip_cost: number | null
          updated_at: string
        }
        Insert: {
          betterment_percent?: number | null
          created_at?: string
          description: string
          frame_cost?: number | null
          id?: string
          inhouse_outwork_cost?: number | null
          labour_cost?: number | null
          line_total?: number | null
          markup_percent?: number | null
          notes?: string | null
          operation?: string
          organization_id: string
          paint_cost?: number | null
          part_cost?: number | null
          quantity?: number | null
          quotation_id: string
          sequence_number?: number
          strip_cost?: number | null
          updated_at?: string
        }
        Update: {
          betterment_percent?: number | null
          created_at?: string
          description?: string
          frame_cost?: number | null
          id?: string
          inhouse_outwork_cost?: number | null
          labour_cost?: number | null
          line_total?: number | null
          markup_percent?: number | null
          notes?: string | null
          operation?: string
          organization_id?: string
          paint_cost?: number | null
          part_cost?: number | null
          quantity?: number | null
          quotation_id?: string
          sequence_number?: number
          strip_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_notes: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          note_type: string
          organization_id: string
          quotation_id: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          note_type?: string
          organization_id: string
          quotation_id: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note_type?: string
          organization_id?: string
          quotation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_notes_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          organization_id: string
          quotation_id: string
          quote_item_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          organization_id: string
          quotation_id: string
          quote_item_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          organization_id?: string
          quotation_id?: string
          quote_item_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_photos_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_photos_quote_item_id_fkey"
            columns: ["quote_item_id"]
            isOneToOne: false
            referencedRelation: "quote_items"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          organization_id: string
          quotation_id: string
          snapshot_data: Json
          version_number: number
          version_type: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          quotation_id: string
          snapshot_data: Json
          version_number: number
          version_type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          quotation_id?: string
          snapshot_data?: Json
          version_number?: number
          version_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_versions_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_work_instructions: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          instruction_type: string | null
          organization_id: string
          part_number: string | null
          quotation_id: string
          supplier: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          instruction_type?: string | null
          organization_id: string
          part_number?: string | null
          quotation_id: string
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          instruction_type?: string | null
          organization_id?: string
          part_number?: string | null
          quotation_id?: string
          supplier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_work_instructions_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      release_reports: {
        Row: {
          amount_paid: number | null
          case_id: string | null
          consumables_summary: Json | null
          created_at: string
          customer_signature: string | null
          generated_at: string
          generated_by: string | null
          id: string
          job_id: string | null
          notes: string | null
          outstanding_balance: number | null
          parts_summary: Json | null
          payment_id: string | null
          payment_verified: boolean
          released_at: string | null
          released_by: string | null
          report_number: string
          status: string
          tenant_id: string
          total_amount: number | null
          total_labour_cost: number | null
          total_parts_cost: number | null
          updated_at: string
          work_summary: Json | null
        }
        Insert: {
          amount_paid?: number | null
          case_id?: string | null
          consumables_summary?: Json | null
          created_at?: string
          customer_signature?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          outstanding_balance?: number | null
          parts_summary?: Json | null
          payment_id?: string | null
          payment_verified?: boolean
          released_at?: string | null
          released_by?: string | null
          report_number: string
          status?: string
          tenant_id: string
          total_amount?: number | null
          total_labour_cost?: number | null
          total_parts_cost?: number | null
          updated_at?: string
          work_summary?: Json | null
        }
        Update: {
          amount_paid?: number | null
          case_id?: string | null
          consumables_summary?: Json | null
          created_at?: string
          customer_signature?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          outstanding_balance?: number | null
          parts_summary?: Json | null
          payment_id?: string | null
          payment_verified?: boolean
          released_at?: string | null
          released_by?: string | null
          report_number?: string
          status?: string
          tenant_id?: string
          total_amount?: number | null
          total_labour_cost?: number | null
          total_parts_cost?: number | null
          updated_at?: string
          work_summary?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "release_reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_reports_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_reports_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      segment_tasks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          segment_id: string
          task_name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          segment_id: string
          task_name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          segment_id?: string
          task_name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "segment_tasks_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "workshop_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "segment_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_companies: {
        Row: {
          cellphone: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          street: string | null
          suburb: string | null
          telephone: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cellphone?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          street?: string | null
          suburb?: string | null
          telephone?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cellphone?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          street?: string | null
          suburb?: string | null
          telephone?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_companies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_headers: {
        Row: {
          city: string | null
          company_id: string
          created_at: string
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          province: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          company_id: string
          created_at?: string
          effective_from: string
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          province?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          company_id?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          province?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_headers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "sla_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_headers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_labour: {
        Row: {
          created_at: string
          id: string
          kind_tags: string[] | null
          non_warranty_rate: number | null
          sla_header_id: string
          tenant_id: string
          updated_at: string
          warranty_rate: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind_tags?: string[] | null
          non_warranty_rate?: number | null
          sla_header_id: string
          tenant_id: string
          updated_at?: string
          warranty_rate?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          kind_tags?: string[] | null
          non_warranty_rate?: number | null
          sla_header_id?: string
          tenant_id?: string
          updated_at?: string
          warranty_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sla_labour_sla_header_id_fkey"
            columns: ["sla_header_id"]
            isOneToOne: false
            referencedRelation: "sla_headers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_labour_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_outwork: {
        Row: {
          air_con_percent: number | null
          cooling_systems_percent: number | null
          courier_fees_percent: number | null
          created_at: string
          diagnostics_percent: number | null
          electrical_percent: number | null
          floor_anchorage_minutes: number | null
          id: string
          jig_hire_percent: number | null
          mechanical_percent: number | null
          mechanical_reports_percent: number | null
          on_off_bench_setup_minutes: number | null
          on_off_jig_setup_minutes: number | null
          outwork_type: string | null
          railvan_repair_percent: number | null
          sla_header_id: string
          tenant_id: string
          updated_at: string
          upholstery_percent: number | null
          warranty_checks_percent: number | null
          wheel_alignment_percent: number | null
          windscreen_replacement_percent: number | null
        }
        Insert: {
          air_con_percent?: number | null
          cooling_systems_percent?: number | null
          courier_fees_percent?: number | null
          created_at?: string
          diagnostics_percent?: number | null
          electrical_percent?: number | null
          floor_anchorage_minutes?: number | null
          id?: string
          jig_hire_percent?: number | null
          mechanical_percent?: number | null
          mechanical_reports_percent?: number | null
          on_off_bench_setup_minutes?: number | null
          on_off_jig_setup_minutes?: number | null
          outwork_type?: string | null
          railvan_repair_percent?: number | null
          sla_header_id: string
          tenant_id: string
          updated_at?: string
          upholstery_percent?: number | null
          warranty_checks_percent?: number | null
          wheel_alignment_percent?: number | null
          windscreen_replacement_percent?: number | null
        }
        Update: {
          air_con_percent?: number | null
          cooling_systems_percent?: number | null
          courier_fees_percent?: number | null
          created_at?: string
          diagnostics_percent?: number | null
          electrical_percent?: number | null
          floor_anchorage_minutes?: number | null
          id?: string
          jig_hire_percent?: number | null
          mechanical_percent?: number | null
          mechanical_reports_percent?: number | null
          on_off_bench_setup_minutes?: number | null
          on_off_jig_setup_minutes?: number | null
          outwork_type?: string | null
          railvan_repair_percent?: number | null
          sla_header_id?: string
          tenant_id?: string
          updated_at?: string
          upholstery_percent?: number | null
          warranty_checks_percent?: number | null
          wheel_alignment_percent?: number | null
          windscreen_replacement_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sla_outwork_sla_header_id_fkey"
            columns: ["sla_header_id"]
            isOneToOne: false
            referencedRelation: "sla_headers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_outwork_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_paint: {
        Row: {
          blending: number | null
          created_at: string
          id: string
          kind_tags: string[] | null
          non_warranty_per_panel: number | null
          pearlescent_3_stage: number | null
          pearlescent_normal: number | null
          sla_header_id: string
          small_panel_paint: number | null
          small_repair_paint: number | null
          tenant_id: string
          updated_at: string
          warranty_per_panel: number | null
          water_based: number | null
        }
        Insert: {
          blending?: number | null
          created_at?: string
          id?: string
          kind_tags?: string[] | null
          non_warranty_per_panel?: number | null
          pearlescent_3_stage?: number | null
          pearlescent_normal?: number | null
          sla_header_id: string
          small_panel_paint?: number | null
          small_repair_paint?: number | null
          tenant_id: string
          updated_at?: string
          warranty_per_panel?: number | null
          water_based?: number | null
        }
        Update: {
          blending?: number | null
          created_at?: string
          id?: string
          kind_tags?: string[] | null
          non_warranty_per_panel?: number | null
          pearlescent_3_stage?: number | null
          pearlescent_normal?: number | null
          sla_header_id?: string
          small_panel_paint?: number | null
          small_repair_paint?: number | null
          tenant_id?: string
          updated_at?: string
          warranty_per_panel?: number | null
          water_based?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sla_paint_sla_header_id_fkey"
            columns: ["sla_header_id"]
            isOneToOne: false
            referencedRelation: "sla_headers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_paint_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_parts: {
        Row: {
          aftermarket_percent: number | null
          alt_from_manufacturer_percent: number | null
          alt_non_manufacturer_percent: number | null
          alternative_in_stock_factor: number | null
          created_at: string
          id: string
          new_oem_in_stock_factor: number | null
          new_oem_percent: number | null
          parts_type: string | null
          sla_header_id: string
          tenant_id: string
          updated_at: string
          used_oem_in_stock_factor: number | null
          used_percent: number | null
        }
        Insert: {
          aftermarket_percent?: number | null
          alt_from_manufacturer_percent?: number | null
          alt_non_manufacturer_percent?: number | null
          alternative_in_stock_factor?: number | null
          created_at?: string
          id?: string
          new_oem_in_stock_factor?: number | null
          new_oem_percent?: number | null
          parts_type?: string | null
          sla_header_id: string
          tenant_id: string
          updated_at?: string
          used_oem_in_stock_factor?: number | null
          used_percent?: number | null
        }
        Update: {
          aftermarket_percent?: number | null
          alt_from_manufacturer_percent?: number | null
          alt_non_manufacturer_percent?: number | null
          alternative_in_stock_factor?: number | null
          created_at?: string
          id?: string
          new_oem_in_stock_factor?: number | null
          new_oem_percent?: number | null
          parts_type?: string | null
          sla_header_id?: string
          tenant_id?: string
          updated_at?: string
          used_oem_in_stock_factor?: number | null
          used_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sla_parts_sla_header_id_fkey"
            columns: ["sla_header_id"]
            isOneToOne: false
            referencedRelation: "sla_headers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_parts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_sundries: {
        Row: {
          cap_amount: number | null
          created_at: string
          id: string
          parts_percent: number | null
          sla_header_id: string
          sundries_type: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cap_amount?: number | null
          created_at?: string
          id?: string
          parts_percent?: number | null
          sla_header_id: string
          sundries_type?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cap_amount?: number | null
          created_at?: string
          id?: string
          parts_percent?: number | null
          sla_header_id?: string
          sundries_type?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_sundries_sla_header_id_fkey"
            columns: ["sla_header_id"]
            isOneToOne: false
            referencedRelation: "sla_headers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_sundries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_towing: {
        Row: {
          created_at: string
          first_km_free: number | null
          id: string
          per_km_thereafter: number | null
          sla_header_id: string
          storage_per_day: number | null
          tenant_id: string
          towing_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_km_free?: number | null
          id?: string
          per_km_thereafter?: number | null
          sla_header_id: string
          storage_per_day?: number | null
          tenant_id: string
          towing_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_km_free?: number | null
          id?: string
          per_km_thereafter?: number | null
          sla_header_id?: string
          storage_per_day?: number | null
          tenant_id?: string
          towing_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_towing_sla_header_id_fkey"
            columns: ["sla_header_id"]
            isOneToOne: false
            referencedRelation: "sla_headers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_towing_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      special_action_permissions: {
        Row: {
          action_name: string
          created_at: string
          id: string
          is_enabled: boolean | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_name: string
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_name?: string
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "special_action_permissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_history: {
        Row: {
          case_id: string
          created_at: string
          id: string
          notes: string | null
          notification_sent_at: string | null
          notification_type: string | null
          notified_customer: boolean | null
          previous_stage_id: string | null
          stage_id: string
          tenant_id: string
          updated_by: string
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          notes?: string | null
          notification_sent_at?: string | null
          notification_type?: string | null
          notified_customer?: boolean | null
          previous_stage_id?: string | null
          stage_id: string
          tenant_id: string
          updated_by: string
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          notification_sent_at?: string | null
          notification_type?: string | null
          notified_customer?: boolean | null
          previous_stage_id?: string | null
          stage_id?: string
          tenant_id?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_history_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_history_previous_stage_id_fkey"
            columns: ["previous_stage_id"]
            isOneToOne: false
            referencedRelation: "workflow_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_history_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "workflow_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_invoices: {
        Row: {
          amount_paid: number | null
          case_id: string | null
          created_at: string
          document_url: string | null
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          parts_order_id: string | null
          payment_date: string | null
          payment_reference: string | null
          status: string | null
          subtotal: number
          supplier_id: string | null
          tenant_id: string
          total_amount: number
          updated_at: string
          vat_amount: number | null
        }
        Insert: {
          amount_paid?: number | null
          case_id?: string | null
          created_at?: string
          document_url?: string | null
          due_date?: string | null
          id?: string
          invoice_date: string
          invoice_number: string
          notes?: string | null
          parts_order_id?: string | null
          payment_date?: string | null
          payment_reference?: string | null
          status?: string | null
          subtotal?: number
          supplier_id?: string | null
          tenant_id: string
          total_amount?: number
          updated_at?: string
          vat_amount?: number | null
        }
        Update: {
          amount_paid?: number | null
          case_id?: string | null
          created_at?: string
          document_url?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          parts_order_id?: string | null
          payment_date?: string | null
          payment_reference?: string | null
          status?: string | null
          subtotal?: number
          supplier_id?: string | null
          tenant_id?: string
          total_amount?: number
          updated_at?: string
          vat_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_invoices_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_invoices_parts_order_id_fkey"
            columns: ["parts_order_id"]
            isOneToOne: false
            referencedRelation: "parts_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_parts: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          list_price: number | null
          model_compatibility: string | null
          part_name: string
          part_number: string | null
          stock_available: number | null
          supplier_id: string
          tenant_id: string
          updated_at: string
          vin_number: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          list_price?: number | null
          model_compatibility?: string | null
          part_name: string
          part_number?: string | null
          stock_available?: number | null
          supplier_id: string
          tenant_id: string
          updated_at?: string
          vin_number?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          list_price?: number | null
          model_compatibility?: string | null
          part_name?: string
          part_number?: string | null
          stock_available?: number | null
          supplier_id?: string
          tenant_id?: string
          updated_at?: string
          vin_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_parts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "part_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_parts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_responses: {
        Row: {
          attachments: Json | null
          availability: string | null
          costing_request_id: string
          created_at: string
          delivery_eta_days: number | null
          id: string
          notes: string | null
          quoted_price: number
          responded_at: string | null
        }
        Insert: {
          attachments?: Json | null
          availability?: string | null
          costing_request_id: string
          created_at?: string
          delivery_eta_days?: number | null
          id?: string
          notes?: string | null
          quoted_price: number
          responded_at?: string | null
        }
        Update: {
          attachments?: Json | null
          availability?: string | null
          costing_request_id?: string
          created_at?: string
          delivery_eta_days?: number | null
          id?: string
          notes?: string | null
          quoted_price?: number
          responded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_responses_costing_request_id_fkey"
            columns: ["costing_request_id"]
            isOneToOne: false
            referencedRelation: "parts_costing_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          delivery_time_estimate: number | null
          email: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          phone: string | null
          service_categories: string[] | null
          supplier_name: string
          supplier_type: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          delivery_time_estimate?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          phone?: string | null
          service_categories?: string[] | null
          supplier_name: string
          supplier_type?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          delivery_time_estimate?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          phone?: string | null
          service_categories?: string[] | null
          supplier_name?: string
          supplier_type?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tablet_assignments: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          location_description: string | null
          segment_id: string
          tablet_identifier: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          location_description?: string | null
          segment_id: string
          tablet_identifier: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          location_description?: string | null
          segment_id?: string
          tablet_identifier?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tablet_assignments_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "workshop_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tablet_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tablet_capabilities: {
        Row: {
          capability_type: string
          configuration: Json | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          tablet_id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          capability_type: string
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          tablet_id: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          capability_type?: string
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          tablet_id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tablet_capabilities_tablet_id_fkey"
            columns: ["tablet_id"]
            isOneToOne: false
            referencedRelation: "tablet_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tablet_capabilities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tablet_installed_apps: {
        Row: {
          app_description: string | null
          app_name: string
          app_version: string | null
          id: string
          installed_at: string | null
          is_active: boolean | null
          tablet_id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          app_description?: string | null
          app_name: string
          app_version?: string | null
          id?: string
          installed_at?: string | null
          is_active?: boolean | null
          tablet_id: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          app_description?: string | null
          app_name?: string
          app_version?: string | null
          id?: string
          installed_at?: string | null
          is_active?: boolean | null
          tablet_id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tablet_installed_apps_tablet_id_fkey"
            columns: ["tablet_id"]
            isOneToOne: false
            referencedRelation: "tablet_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tablet_installed_apps_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tablet_users: {
        Row: {
          created_at: string
          id: string
          tablet_assignment_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tablet_assignment_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tablet_assignment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tablet_users_tablet_assignment_id_fkey"
            columns: ["tablet_assignment_id"]
            isOneToOne: false
            referencedRelation: "tablet_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_schedules: {
        Row: {
          created_at: string
          end_time: string | null
          id: string
          notes: string | null
          schedule_date: string
          schedule_type: string | null
          start_time: string | null
          technician_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          schedule_date: string
          schedule_type?: string | null
          start_time?: string | null
          technician_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          schedule_date?: string
          schedule_type?: string | null
          start_time?: string | null
          technician_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_schedules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          branch_name: string
          city: string | null
          company_name: string
          contact_person: string | null
          country: string | null
          created_at: string
          credits: number
          email: string | null
          id: string
          notes: string | null
          phone: string | null
          province: string | null
          registration_number: string | null
          status: Database["public"]["Enums"]["tenant_status"]
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          branch_name: string
          city?: string | null
          company_name: string
          contact_person?: string | null
          country?: string | null
          created_at?: string
          credits?: number
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          province?: string | null
          registration_number?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          branch_name?: string
          city?: string | null
          company_name?: string
          contact_person?: string | null
          country?: string | null
          created_at?: string
          credits?: number
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          province?: string | null
          registration_number?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      towing_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          tenant_id: string
          towing_record_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          tenant_id: string
          towing_record_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          tenant_id?: string
          towing_record_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "towing_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "towing_documents_towing_record_id_fkey"
            columns: ["towing_record_id"]
            isOneToOne: false
            referencedRelation: "towing_records"
            referencedColumns: ["id"]
          },
        ]
      }
      towing_images: {
        Row: {
          created_at: string
          file_name: string
          id: string
          image_type: string
          image_url: string
          tenant_id: string
          towing_record_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          image_type: string
          image_url: string
          tenant_id: string
          towing_record_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          image_type?: string
          image_url?: string
          tenant_id?: string
          towing_record_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "towing_images_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "towing_images_towing_record_id_fkey"
            columns: ["towing_record_id"]
            isOneToOne: false
            referencedRelation: "towing_records"
            referencedColumns: ["id"]
          },
        ]
      }
      towing_invoices: {
        Row: {
          amount: number | null
          branch_id: string | null
          created_at: string
          description: string | null
          destination: string | null
          id: string
          invoice_date: string | null
          invoice_file_url: string | null
          invoice_number: string | null
          sub_total: number | null
          supplier_id: string | null
          tenant_id: string
          towing_record_id: string
          updated_at: string
          vat_percentage: number | null
          vat_type: string | null
        }
        Insert: {
          amount?: number | null
          branch_id?: string | null
          created_at?: string
          description?: string | null
          destination?: string | null
          id?: string
          invoice_date?: string | null
          invoice_file_url?: string | null
          invoice_number?: string | null
          sub_total?: number | null
          supplier_id?: string | null
          tenant_id: string
          towing_record_id: string
          updated_at?: string
          vat_percentage?: number | null
          vat_type?: string | null
        }
        Update: {
          amount?: number | null
          branch_id?: string | null
          created_at?: string
          description?: string | null
          destination?: string | null
          id?: string
          invoice_date?: string | null
          invoice_file_url?: string | null
          invoice_number?: string | null
          sub_total?: number | null
          supplier_id?: string | null
          tenant_id?: string
          towing_record_id?: string
          updated_at?: string
          vat_percentage?: number | null
          vat_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "towing_invoices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "towing_invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "towing_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "towing_invoices_towing_record_id_fkey"
            columns: ["towing_record_id"]
            isOneToOne: false
            referencedRelation: "towing_records"
            referencedColumns: ["id"]
          },
        ]
      }
      towing_records: {
        Row: {
          admin_days: number | null
          admin_rate: number | null
          car_rate: number | null
          client_email: string | null
          client_first_name: string | null
          client_id_number: string | null
          client_last_name: string | null
          client_phone: string | null
          client_type: string | null
          created_at: string
          discount_percentage: number | null
          engine_size: string | null
          id: string
          insurance_company_id: string | null
          internal_notes: string | null
          invoice_comments: string | null
          make: string | null
          model: string | null
          odometer: string | null
          payment_method: string | null
          payment_status: string | null
          reference_number: string
          registration_number: string | null
          release_fee: number | null
          security_days: number | null
          security_rate: number | null
          status: string
          storage_days: number | null
          tenant_id: string
          tow_company_id: string | null
          tow_type: string
          towing_fee: number | null
          truck_rate: number | null
          updated_at: string
          vin: string | null
        }
        Insert: {
          admin_days?: number | null
          admin_rate?: number | null
          car_rate?: number | null
          client_email?: string | null
          client_first_name?: string | null
          client_id_number?: string | null
          client_last_name?: string | null
          client_phone?: string | null
          client_type?: string | null
          created_at?: string
          discount_percentage?: number | null
          engine_size?: string | null
          id?: string
          insurance_company_id?: string | null
          internal_notes?: string | null
          invoice_comments?: string | null
          make?: string | null
          model?: string | null
          odometer?: string | null
          payment_method?: string | null
          payment_status?: string | null
          reference_number: string
          registration_number?: string | null
          release_fee?: number | null
          security_days?: number | null
          security_rate?: number | null
          status?: string
          storage_days?: number | null
          tenant_id: string
          tow_company_id?: string | null
          tow_type: string
          towing_fee?: number | null
          truck_rate?: number | null
          updated_at?: string
          vin?: string | null
        }
        Update: {
          admin_days?: number | null
          admin_rate?: number | null
          car_rate?: number | null
          client_email?: string | null
          client_first_name?: string | null
          client_id_number?: string | null
          client_last_name?: string | null
          client_phone?: string | null
          client_type?: string | null
          created_at?: string
          discount_percentage?: number | null
          engine_size?: string | null
          id?: string
          insurance_company_id?: string | null
          internal_notes?: string | null
          invoice_comments?: string | null
          make?: string | null
          model?: string | null
          odometer?: string | null
          payment_method?: string | null
          payment_status?: string | null
          reference_number?: string
          registration_number?: string | null
          release_fee?: number | null
          security_days?: number | null
          security_rate?: number | null
          status?: string
          storage_days?: number | null
          tenant_id?: string
          tow_company_id?: string | null
          tow_type?: string
          towing_fee?: number | null
          truck_rate?: number | null
          updated_at?: string
          vin?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "towing_records_insurance_company_id_fkey"
            columns: ["insurance_company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "towing_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "towing_records_tow_company_id_fkey"
            columns: ["tow_company_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stage_assignments: {
        Row: {
          created_at: string
          id: string
          stage_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          stage_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          stage_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stage_assignments_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "workflow_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_stage_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_intakes: {
        Row: {
          created_at: string
          id: string
          intake_number: string
          intake_officer_id: string
          notes: string | null
          plate_image_url: string | null
          plate_number: string | null
          status: string
          tenant_id: string
          updated_at: string
          vehicle_make_detected: string | null
          vehicle_model_detected: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          intake_number: string
          intake_officer_id: string
          notes?: string | null
          plate_image_url?: string | null
          plate_number?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          vehicle_make_detected?: string | null
          vehicle_model_detected?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          intake_number?: string
          intake_officer_id?: string
          notes?: string | null
          plate_image_url?: string | null
          plate_number?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          vehicle_make_detected?: string | null
          vehicle_model_detected?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_intakes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          booking_date: string | null
          color: string | null
          created_at: string
          customer_id: string | null
          engine_number: string | null
          id: string
          make: string
          model: string
          odometer: number | null
          organization_id: string
          quote_date: string | null
          registration: string | null
          tenant_id: string | null
          updated_at: string
          vin: string | null
          year: number | null
        }
        Insert: {
          booking_date?: string | null
          color?: string | null
          created_at?: string
          customer_id?: string | null
          engine_number?: string | null
          id?: string
          make: string
          model: string
          odometer?: number | null
          organization_id: string
          quote_date?: string | null
          registration?: string | null
          tenant_id?: string | null
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Update: {
          booking_date?: string | null
          color?: string | null
          created_at?: string
          customer_id?: string | null
          engine_number?: string | null
          id?: string
          make?: string
          model?: string
          odometer?: number | null
          organization_id?: string
          quote_date?: string | null
          registration?: string | null
          tenant_id?: string | null
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          dynamic_fields: Json | null
          id: string
          is_active: boolean | null
          name: string
          requires_company: boolean | null
          requires_host: boolean | null
          requires_vehicle: boolean | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          dynamic_fields?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          requires_company?: boolean | null
          requires_host?: boolean | null
          requires_vehicle?: boolean | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          dynamic_fields?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          requires_company?: boolean | null
          requires_host?: boolean | null
          requires_vehicle?: boolean | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          damage_description: string | null
          email: string | null
          first_name: string
          handled_by: string | null
          id: string
          id_number: string | null
          last_name: string
          message: string | null
          phone: string | null
          preferred_date: string | null
          preferred_time_slot: string | null
          request_number: string
          request_type: string
          status: string | null
          tenant_id: string
          updated_at: string | null
          vehicle_color: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_registration: string | null
          vehicle_year: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          damage_description?: string | null
          email?: string | null
          first_name: string
          handled_by?: string | null
          id?: string
          id_number?: string | null
          last_name: string
          message?: string | null
          phone?: string | null
          preferred_date?: string | null
          preferred_time_slot?: string | null
          request_number: string
          request_type?: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
          vehicle_color?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_registration?: string | null
          vehicle_year?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          damage_description?: string | null
          email?: string | null
          first_name?: string
          handled_by?: string | null
          id?: string
          id_number?: string | null
          last_name?: string
          message?: string | null
          phone?: string | null
          preferred_date?: string | null
          preferred_time_slot?: string | null
          request_number?: string
          request_type?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
          vehicle_color?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_registration?: string | null
          vehicle_year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      visitors: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          first_name: string
          host_department: string | null
          host_staff_id: string | null
          host_staff_name: string | null
          id: string
          id_passport: string | null
          last_name: string
          linked_case_id: string | null
          linked_quotation_id: string | null
          notes: string | null
          phone: string | null
          purpose_details: string | null
          signature_data: string | null
          tablet_id: string | null
          tenant_id: string
          timestamp_in: string
          timestamp_out: string | null
          updated_at: string
          vehicle_color: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_reason: string | null
          vehicle_registration: string | null
          visit_category_id: string | null
          visit_type: string
          visitor_number: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          host_department?: string | null
          host_staff_id?: string | null
          host_staff_name?: string | null
          id?: string
          id_passport?: string | null
          last_name: string
          linked_case_id?: string | null
          linked_quotation_id?: string | null
          notes?: string | null
          phone?: string | null
          purpose_details?: string | null
          signature_data?: string | null
          tablet_id?: string | null
          tenant_id: string
          timestamp_in?: string
          timestamp_out?: string | null
          updated_at?: string
          vehicle_color?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_reason?: string | null
          vehicle_registration?: string | null
          visit_category_id?: string | null
          visit_type: string
          visitor_number: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          host_department?: string | null
          host_staff_id?: string | null
          host_staff_name?: string | null
          id?: string
          id_passport?: string | null
          last_name?: string
          linked_case_id?: string | null
          linked_quotation_id?: string | null
          notes?: string | null
          phone?: string | null
          purpose_details?: string | null
          signature_data?: string | null
          tablet_id?: string | null
          tenant_id?: string
          timestamp_in?: string
          timestamp_out?: string | null
          updated_at?: string
          vehicle_color?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_reason?: string | null
          vehicle_registration?: string | null
          visit_category_id?: string | null
          visit_type?: string
          visitor_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitors_linked_case_id_fkey"
            columns: ["linked_case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitors_linked_quotation_id_fkey"
            columns: ["linked_quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitors_visit_category_id_fkey"
            columns: ["visit_category_id"]
            isOneToOne: false
            referencedRelation: "visit_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_stages: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          notification_template: string | null
          notify_customer: boolean | null
          order_index: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notification_template?: string | null
          notify_customer?: boolean | null
          order_index?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notification_template?: string | null
          notify_customer?: boolean | null
          order_index?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_stages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_bays: {
        Row: {
          bay_type: string | null
          capacity: number | null
          code: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          segment_id: string | null
          sort_order: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          bay_type?: string | null
          capacity?: number | null
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          segment_id?: string | null
          sort_order?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          bay_type?: string | null
          capacity?: number | null
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          segment_id?: string | null
          sort_order?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_bays_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "workshop_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_bays_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_reports: {
        Row: {
          case_id: string
          closed_at: string
          closed_by: string
          created_at: string
          final_status: string
          id: string
          manager_notes: string | null
          report_data: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          case_id: string
          closed_at?: string
          closed_by: string
          created_at?: string
          final_status?: string
          id?: string
          manager_notes?: string | null
          report_data?: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          closed_at?: string
          closed_by?: string
          created_at?: string
          final_status?: string
          id?: string
          manager_notes?: string | null
          report_data?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_segments: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          segment_name: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          segment_name: string
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          segment_name?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_segments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_case_number: { Args: { p_tenant_id: string }; Returns: string }
      generate_intake_number: { Args: { p_tenant_id: string }; Returns: string }
      generate_receipt_number: {
        Args: { p_tenant_id: string }
        Returns: string
      }
      generate_release_report_number: {
        Args: { p_tenant_id: string }
        Returns: string
      }
      generate_towing_reference: {
        Args: { p_tenant_id: string }
        Returns: string
      }
      generate_visit_request_number: {
        Args: { p_tenant_id: string }
        Returns: string
      }
      generate_visitor_number: {
        Args: { p_tenant_id: string }
        Returns: string
      }
      get_user_organization: { Args: { _user_id: string }; Returns: string }
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_technician: { Args: { _user_id: string }; Returns: boolean }
      is_tenant_admin: { Args: { _user_id: string }; Returns: boolean }
      is_user_admin: { Args: { check_user_id: string }; Returns: boolean }
      is_workshop_manager: { Args: { _user_id: string }; Returns: boolean }
      user_in_organization: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "manager"
        | "user"
        | "readonly"
        | "super_admin"
        | "workshop_manager"
        | "technician"
      tenant_status: "active" | "suspended" | "archived" | "pending"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "manager",
        "user",
        "readonly",
        "super_admin",
        "workshop_manager",
        "technician",
      ],
      tenant_status: ["active", "suspended", "archived", "pending"],
    },
  },
} as const
