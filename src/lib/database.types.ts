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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      access_control_policies: {
        Row: {
          access_principle: Database["public"]["Enums"]["access_principle"]
          applies_during_hours: string | null
          applies_to_sensitivity:
            | Database["public"]["Enums"]["pii_sensitivity"][]
            | null
          approved_at: string | null
          approved_by: string | null
          audit_log_table: string | null
          consent_scope_required: string | null
          created_at: string | null
          effective_from: string
          effective_until: string | null
          geographic_restrictions: string[] | null
          governs_columns: string[] | null
          governs_table: string
          id: string
          is_active: boolean | null
          min_aggregation_size: number | null
          notes: string | null
          permits_aggregation: boolean | null
          permits_cross_join_with: string[] | null
          permits_export: boolean | null
          permitted_actions: Database["public"]["Enums"]["access_action"][]
          permitted_purposes: string[] | null
          permitted_roles: string[] | null
          permitted_user_ids: string[] | null
          policy_code: string
          policy_name: string
          policy_owner: string
          prohibits_cross_join_with: string[] | null
          rationale: string
          related_community_agreement_id: string | null
          related_legal_basis: string | null
          requires_audit_log: boolean | null
          requires_consent_check: boolean | null
          requires_purpose_specification: boolean | null
          updated_at: string | null
        }
        Insert: {
          access_principle: Database["public"]["Enums"]["access_principle"]
          applies_during_hours?: string | null
          applies_to_sensitivity?:
            | Database["public"]["Enums"]["pii_sensitivity"][]
            | null
          approved_at?: string | null
          approved_by?: string | null
          audit_log_table?: string | null
          consent_scope_required?: string | null
          created_at?: string | null
          effective_from?: string
          effective_until?: string | null
          geographic_restrictions?: string[] | null
          governs_columns?: string[] | null
          governs_table: string
          id?: string
          is_active?: boolean | null
          min_aggregation_size?: number | null
          notes?: string | null
          permits_aggregation?: boolean | null
          permits_cross_join_with?: string[] | null
          permits_export?: boolean | null
          permitted_actions: Database["public"]["Enums"]["access_action"][]
          permitted_purposes?: string[] | null
          permitted_roles?: string[] | null
          permitted_user_ids?: string[] | null
          policy_code: string
          policy_name: string
          policy_owner: string
          prohibits_cross_join_with?: string[] | null
          rationale: string
          related_community_agreement_id?: string | null
          related_legal_basis?: string | null
          requires_audit_log?: boolean | null
          requires_consent_check?: boolean | null
          requires_purpose_specification?: boolean | null
          updated_at?: string | null
        }
        Update: {
          access_principle?: Database["public"]["Enums"]["access_principle"]
          applies_during_hours?: string | null
          applies_to_sensitivity?:
            | Database["public"]["Enums"]["pii_sensitivity"][]
            | null
          approved_at?: string | null
          approved_by?: string | null
          audit_log_table?: string | null
          consent_scope_required?: string | null
          created_at?: string | null
          effective_from?: string
          effective_until?: string | null
          geographic_restrictions?: string[] | null
          governs_columns?: string[] | null
          governs_table?: string
          id?: string
          is_active?: boolean | null
          min_aggregation_size?: number | null
          notes?: string | null
          permits_aggregation?: boolean | null
          permits_cross_join_with?: string[] | null
          permits_export?: boolean | null
          permitted_actions?: Database["public"]["Enums"]["access_action"][]
          permitted_purposes?: string[] | null
          permitted_roles?: string[] | null
          permitted_user_ids?: string[] | null
          policy_code?: string
          policy_name?: string
          policy_owner?: string
          prohibits_cross_join_with?: string[] | null
          rationale?: string
          related_community_agreement_id?: string | null
          related_legal_basis?: string | null
          requires_audit_log?: boolean | null
          requires_consent_check?: boolean | null
          requires_purpose_specification?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_control_policies_related_community_agreement_id_fkey"
            columns: ["related_community_agreement_id"]
            isOneToOne: false
            referencedRelation: "benefit_sharing_agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      access_log: {
        Row: {
          access_was_granted: boolean
          accessed_at: string
          accessor_ip_address: string | null
          accessor_role: string | null
          accessor_team_member_id: string | null
          accessor_user_id: string | null
          action_performed: Database["public"]["Enums"]["access_action"]
          aggregation_size: number | null
          columns_accessed: string[] | null
          denial_reason: string | null
          export_destination: string | null
          export_record_count: number | null
          id: number
          policy_id_applied: string | null
          related_program_id: string | null
          related_protocol_id: string | null
          row_id_accessed: string | null
          stated_purpose: string | null
          table_accessed: string
          was_aggregation_query: boolean | null
          was_export: boolean | null
        }
        Insert: {
          access_was_granted: boolean
          accessed_at?: string
          accessor_ip_address?: string | null
          accessor_role?: string | null
          accessor_team_member_id?: string | null
          accessor_user_id?: string | null
          action_performed: Database["public"]["Enums"]["access_action"]
          aggregation_size?: number | null
          columns_accessed?: string[] | null
          denial_reason?: string | null
          export_destination?: string | null
          export_record_count?: number | null
          id?: number
          policy_id_applied?: string | null
          related_program_id?: string | null
          related_protocol_id?: string | null
          row_id_accessed?: string | null
          stated_purpose?: string | null
          table_accessed: string
          was_aggregation_query?: boolean | null
          was_export?: boolean | null
        }
        Update: {
          access_was_granted?: boolean
          accessed_at?: string
          accessor_ip_address?: string | null
          accessor_role?: string | null
          accessor_team_member_id?: string | null
          accessor_user_id?: string | null
          action_performed?: Database["public"]["Enums"]["access_action"]
          aggregation_size?: number | null
          columns_accessed?: string[] | null
          denial_reason?: string | null
          export_destination?: string | null
          export_record_count?: number | null
          id?: number
          policy_id_applied?: string | null
          related_program_id?: string | null
          related_protocol_id?: string | null
          row_id_accessed?: string | null
          stated_purpose?: string | null
          table_accessed?: string
          was_aggregation_query?: boolean | null
          was_export?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "access_log_accessor_team_member_id_fkey"
            columns: ["accessor_team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_log_accessor_user_id_fkey"
            columns: ["accessor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_log_policy_id_applied_fkey"
            columns: ["policy_id_applied"]
            isOneToOne: false
            referencedRelation: "access_control_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_log_related_program_id_fkey"
            columns: ["related_program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_log_related_protocol_id_fkey"
            columns: ["related_protocol_id"]
            isOneToOne: false
            referencedRelation: "decision_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_synthesis_runs: {
        Row: {
          action_taken: string | null
          concerns_raised: string | null
          created_at: string | null
          data_input_references: string[] | null
          data_inputs_summary: string
          flags_for_protocol_revision: string | null
          id: string
          invoked_at: string | null
          invoked_by: string
          model_name: string | null
          model_provider: string | null
          notes: string | null
          prompt_used: string
          protocol_id: string | null
          question_asked: string
          review_assessment: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          synthesis_output: string
          was_acted_upon: boolean | null
        }
        Insert: {
          action_taken?: string | null
          concerns_raised?: string | null
          created_at?: string | null
          data_input_references?: string[] | null
          data_inputs_summary: string
          flags_for_protocol_revision?: string | null
          id?: string
          invoked_at?: string | null
          invoked_by: string
          model_name?: string | null
          model_provider?: string | null
          notes?: string | null
          prompt_used: string
          protocol_id?: string | null
          question_asked: string
          review_assessment?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          synthesis_output: string
          was_acted_upon?: boolean | null
        }
        Update: {
          action_taken?: string | null
          concerns_raised?: string | null
          created_at?: string | null
          data_input_references?: string[] | null
          data_inputs_summary?: string
          flags_for_protocol_revision?: string | null
          id?: string
          invoked_at?: string | null
          invoked_by?: string
          model_name?: string | null
          model_provider?: string | null
          notes?: string | null
          prompt_used?: string
          protocol_id?: string | null
          question_asked?: string
          review_assessment?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          synthesis_output?: string
          was_acted_upon?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_synthesis_runs_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "decision_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_corpora: {
        Row: {
          audio_quality: string | null
          benefit_sharing_terms: string | null
          community_consent_documented: boolean | null
          contact: string | null
          corpus_name: string
          domain_coverage: string[] | null
          id: string
          language_id: string
          last_updated: string | null
          license: string | null
          notes: string | null
          release_date: string | null
          source: Database["public"]["Enums"]["corpus_source"]
          source_id: string | null
          speaker_count: number | null
          speech_type: string | null
          total_hours: number | null
          transcription_quality: string | null
          url: string | null
          validated_hours: number | null
        }
        Insert: {
          audio_quality?: string | null
          benefit_sharing_terms?: string | null
          community_consent_documented?: boolean | null
          contact?: string | null
          corpus_name: string
          domain_coverage?: string[] | null
          id?: string
          language_id: string
          last_updated?: string | null
          license?: string | null
          notes?: string | null
          release_date?: string | null
          source: Database["public"]["Enums"]["corpus_source"]
          source_id?: string | null
          speaker_count?: number | null
          speech_type?: string | null
          total_hours?: number | null
          transcription_quality?: string | null
          url?: string | null
          validated_hours?: number | null
        }
        Update: {
          audio_quality?: string | null
          benefit_sharing_terms?: string | null
          community_consent_documented?: boolean | null
          contact?: string | null
          corpus_name?: string
          domain_coverage?: string[] | null
          id?: string
          language_id?: string
          last_updated?: string | null
          license?: string | null
          notes?: string | null
          release_date?: string | null
          source?: Database["public"]["Enums"]["corpus_source"]
          source_id?: string | null
          speaker_count?: number | null
          speech_type?: string | null
          total_hours?: number | null
          transcription_quality?: string | null
          url?: string | null
          validated_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_corpora_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_corpora_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_sharing_agreements: {
        Row: {
          agreement_signed_date: string | null
          agreement_url: string | null
          applies_to_languages: string[] | null
          applies_to_places: string[] | null
          applies_to_products: string[] | null
          audit_findings: string | null
          audited_annually: boolean | null
          benefit_formula: string
          benefit_types: string[] | null
          community_id: string | null
          community_signatories: string[] | null
          created_at: string | null
          distribution_frequency: string | null
          expires_at: string | null
          fixed_amount_annual_usd: number | null
          id: string
          is_active: boolean | null
          last_audit_date: string | null
          notes: string | null
          partner_organization_id: string | null
          percentage_of_attributable_revenue: number | null
          percentage_or_fixed: string | null
          tomorrowlabs_signatories: string[] | null
          updated_at: string | null
        }
        Insert: {
          agreement_signed_date?: string | null
          agreement_url?: string | null
          applies_to_languages?: string[] | null
          applies_to_places?: string[] | null
          applies_to_products?: string[] | null
          audit_findings?: string | null
          audited_annually?: boolean | null
          benefit_formula: string
          benefit_types?: string[] | null
          community_id?: string | null
          community_signatories?: string[] | null
          created_at?: string | null
          distribution_frequency?: string | null
          expires_at?: string | null
          fixed_amount_annual_usd?: number | null
          id?: string
          is_active?: boolean | null
          last_audit_date?: string | null
          notes?: string | null
          partner_organization_id?: string | null
          percentage_of_attributable_revenue?: number | null
          percentage_or_fixed?: string | null
          tomorrowlabs_signatories?: string[] | null
          updated_at?: string | null
        }
        Update: {
          agreement_signed_date?: string | null
          agreement_url?: string | null
          applies_to_languages?: string[] | null
          applies_to_places?: string[] | null
          applies_to_products?: string[] | null
          audit_findings?: string | null
          audited_annually?: boolean | null
          benefit_formula?: string
          benefit_types?: string[] | null
          community_id?: string | null
          community_signatories?: string[] | null
          created_at?: string | null
          distribution_frequency?: string | null
          expires_at?: string | null
          fixed_amount_annual_usd?: number | null
          id?: string
          is_active?: boolean | null
          last_audit_date?: string | null
          notes?: string | null
          partner_organization_id?: string | null
          percentage_of_attributable_revenue?: number | null
          percentage_or_fixed?: string | null
          tomorrowlabs_signatories?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "benefit_sharing_agreements_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_sharing_agreements_partner_organization_id_fkey"
            columns: ["partner_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          access_restrictions: string | null
          artifact_urls: string[] | null
          channel: Database["public"]["Enums"]["communication_channel"]
          communication_date: string
          concerns_raised: string | null
          created_at: string | null
          decisions_made: string | null
          direction: string
          external_participants: string[] | null
          follow_up_completed: boolean | null
          follow_up_due_date: string | null
          follow_up_owner: string | null
          follow_up_required: string | null
          id: string
          is_confidential: boolean | null
          key_topics: string[] | null
          notes: string | null
          related_community_id: string | null
          related_deployment_id: string | null
          related_organization_id: string | null
          related_program_id: string | null
          subject: string | null
          summary: string
          tomorrowlabs_participants: string[]
          went_well: string | null
        }
        Insert: {
          access_restrictions?: string | null
          artifact_urls?: string[] | null
          channel: Database["public"]["Enums"]["communication_channel"]
          communication_date: string
          concerns_raised?: string | null
          created_at?: string | null
          decisions_made?: string | null
          direction: string
          external_participants?: string[] | null
          follow_up_completed?: boolean | null
          follow_up_due_date?: string | null
          follow_up_owner?: string | null
          follow_up_required?: string | null
          id?: string
          is_confidential?: boolean | null
          key_topics?: string[] | null
          notes?: string | null
          related_community_id?: string | null
          related_deployment_id?: string | null
          related_organization_id?: string | null
          related_program_id?: string | null
          subject?: string | null
          summary: string
          tomorrowlabs_participants: string[]
          went_well?: string | null
        }
        Update: {
          access_restrictions?: string | null
          artifact_urls?: string[] | null
          channel?: Database["public"]["Enums"]["communication_channel"]
          communication_date?: string
          concerns_raised?: string | null
          created_at?: string | null
          decisions_made?: string | null
          direction?: string
          external_participants?: string[] | null
          follow_up_completed?: boolean | null
          follow_up_due_date?: string | null
          follow_up_owner?: string | null
          follow_up_required?: string | null
          id?: string
          is_confidential?: boolean | null
          key_topics?: string[] | null
          notes?: string | null
          related_community_id?: string | null
          related_deployment_id?: string | null
          related_organization_id?: string | null
          related_program_id?: string | null
          subject?: string | null
          summary?: string
          tomorrowlabs_participants?: string[]
          went_well?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_related_community_id_fkey"
            columns: ["related_community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_related_deployment_id_fkey"
            columns: ["related_deployment_id"]
            isOneToOne: false
            referencedRelation: "deployments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_related_organization_id_fkey"
            columns: ["related_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_related_program_id_fkey"
            columns: ["related_program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          alternate_names: string[] | null
          community_type: string | null
          created_at: string | null
          endonym: string | null
          endonym_language_id: string | null
          english_name: string
          estimated_global_population: number | null
          estimated_population_confidence:
            | Database["public"]["Enums"]["confidence_level"]
            | null
          id: string
          is_self_identified_community: boolean | null
          notes: string | null
          origin_place_id: string | null
          primary_language_ids: string[] | null
          primary_place_ids: string[] | null
          self_identification_basis: string | null
          updated_at: string | null
        }
        Insert: {
          alternate_names?: string[] | null
          community_type?: string | null
          created_at?: string | null
          endonym?: string | null
          endonym_language_id?: string | null
          english_name: string
          estimated_global_population?: number | null
          estimated_population_confidence?:
            | Database["public"]["Enums"]["confidence_level"]
            | null
          id?: string
          is_self_identified_community?: boolean | null
          notes?: string | null
          origin_place_id?: string | null
          primary_language_ids?: string[] | null
          primary_place_ids?: string[] | null
          self_identification_basis?: string | null
          updated_at?: string | null
        }
        Update: {
          alternate_names?: string[] | null
          community_type?: string | null
          created_at?: string | null
          endonym?: string | null
          endonym_language_id?: string | null
          english_name?: string
          estimated_global_population?: number | null
          estimated_population_confidence?:
            | Database["public"]["Enums"]["confidence_level"]
            | null
          id?: string
          is_self_identified_community?: boolean | null
          notes?: string | null
          origin_place_id?: string | null
          primary_language_ids?: string[] | null
          primary_place_ids?: string[] | null
          self_identification_basis?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communities_endonym_language_id_fkey"
            columns: ["endonym_language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communities_origin_place_id_fkey"
            columns: ["origin_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      community_positions: {
        Row: {
          academic_position_summary: string | null
          community_name: string
          created_at: string | null
          documented_by: string | null
          documented_date: string | null
          id: string
          language_id: string
          notes: string | null
          position_documented_via: string | null
          position_summary: string
          position_type: string
          tomorrowlabs_response: string | null
        }
        Insert: {
          academic_position_summary?: string | null
          community_name: string
          created_at?: string | null
          documented_by?: string | null
          documented_date?: string | null
          id?: string
          language_id: string
          notes?: string | null
          position_documented_via?: string | null
          position_summary: string
          position_type: string
          tomorrowlabs_response?: string | null
        }
        Update: {
          academic_position_summary?: string | null
          community_name?: string
          created_at?: string | null
          documented_by?: string | null
          documented_date?: string | null
          id?: string
          language_id?: string
          notes?: string | null
          position_documented_via?: string | null
          position_summary?: string
          position_type?: string
          tomorrowlabs_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_positions_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      community_state: {
        Row: {
          community_cohesion_assessment: string | null
          community_id: string
          community_media_outlets_count: number | null
          confidence: Database["public"]["Enums"]["confidence_level"]
          created_at: string | null
          cultural_organizations_count: number | null
          estimated_total_population: number | null
          generation_at_which_loss_typically_begins: number | null
          generational_tension_notes: string | null
          heritage_schools_count: number | null
          id: string
          median_household_income_usd: number | null
          methodology: Database["public"]["Enums"]["methodology_type"] | null
          notes: string | null
          observation_year: number
          pct_below_poverty_line: number | null
          pct_first_generation: number | null
          pct_fluent_in_heritage_language: number | null
          pct_homeownership: number | null
          pct_second_generation: number | null
          pct_speak_heritage_at_home: number | null
          pct_third_plus_generation: number | null
          pct_with_tertiary_education: number | null
          primary_place_ids: string[] | null
          religious_institutions_count: number | null
          source_id: string | null
        }
        Insert: {
          community_cohesion_assessment?: string | null
          community_id: string
          community_media_outlets_count?: number | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string | null
          cultural_organizations_count?: number | null
          estimated_total_population?: number | null
          generation_at_which_loss_typically_begins?: number | null
          generational_tension_notes?: string | null
          heritage_schools_count?: number | null
          id?: string
          median_household_income_usd?: number | null
          methodology?: Database["public"]["Enums"]["methodology_type"] | null
          notes?: string | null
          observation_year: number
          pct_below_poverty_line?: number | null
          pct_first_generation?: number | null
          pct_fluent_in_heritage_language?: number | null
          pct_homeownership?: number | null
          pct_second_generation?: number | null
          pct_speak_heritage_at_home?: number | null
          pct_third_plus_generation?: number | null
          pct_with_tertiary_education?: number | null
          primary_place_ids?: string[] | null
          religious_institutions_count?: number | null
          source_id?: string | null
        }
        Update: {
          community_cohesion_assessment?: string | null
          community_id?: string
          community_media_outlets_count?: number | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string | null
          cultural_organizations_count?: number | null
          estimated_total_population?: number | null
          generation_at_which_loss_typically_begins?: number | null
          generational_tension_notes?: string | null
          heritage_schools_count?: number | null
          id?: string
          median_household_income_usd?: number | null
          methodology?: Database["public"]["Enums"]["methodology_type"] | null
          notes?: string | null
          observation_year?: number
          pct_below_poverty_line?: number | null
          pct_first_generation?: number | null
          pct_fluent_in_heritage_language?: number | null
          pct_homeownership?: number | null
          pct_second_generation?: number | null
          pct_speak_heritage_at_home?: number | null
          pct_third_plus_generation?: number | null
          pct_with_tertiary_education?: number | null
          primary_place_ids?: string[] | null
          religious_institutions_count?: number | null
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_state_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_state_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      community_trust_signals: {
        Row: {
          basis_for_assessment: string | null
          community_id: string
          confidence: Database["public"]["Enums"]["confidence_level"]
          created_at: string | null
          id: string
          methodology: Database["public"]["Enums"]["methodology_type"] | null
          notes: string | null
          observation_date: string
          prior_negative_experiences: string | null
          prior_positive_experiences: string | null
          recent_negative_signals: string | null
          recent_positive_signals: string | null
          recognized_community_authorities: string[] | null
          source_id: string | null
          subject_organization_id: string | null
          trust_assessment: string | null
        }
        Insert: {
          basis_for_assessment?: string | null
          community_id: string
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string | null
          id?: string
          methodology?: Database["public"]["Enums"]["methodology_type"] | null
          notes?: string | null
          observation_date: string
          prior_negative_experiences?: string | null
          prior_positive_experiences?: string | null
          recent_negative_signals?: string | null
          recent_positive_signals?: string | null
          recognized_community_authorities?: string[] | null
          source_id?: string | null
          subject_organization_id?: string | null
          trust_assessment?: string | null
        }
        Update: {
          basis_for_assessment?: string | null
          community_id?: string
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string | null
          id?: string
          methodology?: Database["public"]["Enums"]["methodology_type"] | null
          notes?: string | null
          observation_date?: string
          prior_negative_experiences?: string | null
          prior_positive_experiences?: string | null
          recent_negative_signals?: string | null
          recent_positive_signals?: string | null
          recognized_community_authorities?: string[] | null
          source_id?: string | null
          subject_organization_id?: string | null
          trust_assessment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_trust_signals_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_trust_signals_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_trust_signals_subject_organization_id_fkey"
            columns: ["subject_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_audit_chain: {
        Row: {
          attempted_operation: string
          bypass_authorized_by: string | null
          bypass_justification: string | null
          bypass_review_outcome: string | null
          bypass_reviewed_after: boolean | null
          chain_sequence: number
          check_performed_at: string
          check_result: Database["public"]["Enums"]["consent_check_result"]
          check_result_details: string | null
          consent_record_id: string | null
          initiated_by_system: string | null
          initiated_by_user_id: string | null
          initiated_in_program_id: string | null
          operation_modified: string | null
          operation_proceeded: boolean
          previous_chain_hash: string | null
          required_data_types: string[] | null
          required_scope: Database["public"]["Enums"]["consent_scope"]
          subject_community_id: string | null
          subject_organization_id: string | null
          subject_person_id: string | null
          subject_type: string
          subject_user_id: string | null
          this_entry_hash: string | null
          was_emergency_bypass: boolean | null
        }
        Insert: {
          attempted_operation: string
          bypass_authorized_by?: string | null
          bypass_justification?: string | null
          bypass_review_outcome?: string | null
          bypass_reviewed_after?: boolean | null
          chain_sequence?: number
          check_performed_at?: string
          check_result: Database["public"]["Enums"]["consent_check_result"]
          check_result_details?: string | null
          consent_record_id?: string | null
          initiated_by_system?: string | null
          initiated_by_user_id?: string | null
          initiated_in_program_id?: string | null
          operation_modified?: string | null
          operation_proceeded: boolean
          previous_chain_hash?: string | null
          required_data_types?: string[] | null
          required_scope: Database["public"]["Enums"]["consent_scope"]
          subject_community_id?: string | null
          subject_organization_id?: string | null
          subject_person_id?: string | null
          subject_type: string
          subject_user_id?: string | null
          this_entry_hash?: string | null
          was_emergency_bypass?: boolean | null
        }
        Update: {
          attempted_operation?: string
          bypass_authorized_by?: string | null
          bypass_justification?: string | null
          bypass_review_outcome?: string | null
          bypass_reviewed_after?: boolean | null
          chain_sequence?: number
          check_performed_at?: string
          check_result?: Database["public"]["Enums"]["consent_check_result"]
          check_result_details?: string | null
          consent_record_id?: string | null
          initiated_by_system?: string | null
          initiated_by_user_id?: string | null
          initiated_in_program_id?: string | null
          operation_modified?: string | null
          operation_proceeded?: boolean
          previous_chain_hash?: string | null
          required_data_types?: string[] | null
          required_scope?: Database["public"]["Enums"]["consent_scope"]
          subject_community_id?: string | null
          subject_organization_id?: string | null
          subject_person_id?: string | null
          subject_type?: string
          subject_user_id?: string | null
          this_entry_hash?: string | null
          was_emergency_bypass?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_audit_chain_consent_record_id_fkey"
            columns: ["consent_record_id"]
            isOneToOne: false
            referencedRelation: "consent_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_audit_chain_initiated_by_user_id_fkey"
            columns: ["initiated_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_audit_chain_initiated_in_program_id_fkey"
            columns: ["initiated_in_program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_audit_chain_subject_community_id_fkey"
            columns: ["subject_community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_audit_chain_subject_organization_id_fkey"
            columns: ["subject_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_audit_chain_subject_person_id_fkey"
            columns: ["subject_person_id"]
            isOneToOne: false
            referencedRelation: "pending_person_deletions"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "consent_audit_chain_subject_person_id_fkey"
            columns: ["subject_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_audit_chain_subject_user_id_fkey"
            columns: ["subject_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_records: {
        Row: {
          conditions: string | null
          consent_artifact_url: string | null
          consent_method: string | null
          consent_obtained_at: string
          consent_obtained_by: string
          consent_recorded_in_language: string | null
          consent_translated: boolean | null
          consent_witness: string | null
          created_at: string | null
          expires_at: string | null
          geographic_limits: string[] | null
          id: string
          next_review_due: string | null
          notes: string | null
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          scope: Database["public"]["Enums"]["consent_scope"]
          specific_data_types: string[] | null
          status: Database["public"]["Enums"]["consent_status"]
          status_changed_at: string | null
          subject_community_id: string | null
          subject_name: string | null
          subject_organization_id: string | null
          subject_person_id: string | null
          subject_type: string
          subject_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          conditions?: string | null
          consent_artifact_url?: string | null
          consent_method?: string | null
          consent_obtained_at: string
          consent_obtained_by: string
          consent_recorded_in_language?: string | null
          consent_translated?: boolean | null
          consent_witness?: string | null
          created_at?: string | null
          expires_at?: string | null
          geographic_limits?: string[] | null
          id?: string
          next_review_due?: string | null
          notes?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          scope: Database["public"]["Enums"]["consent_scope"]
          specific_data_types?: string[] | null
          status: Database["public"]["Enums"]["consent_status"]
          status_changed_at?: string | null
          subject_community_id?: string | null
          subject_name?: string | null
          subject_organization_id?: string | null
          subject_person_id?: string | null
          subject_type: string
          subject_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          conditions?: string | null
          consent_artifact_url?: string | null
          consent_method?: string | null
          consent_obtained_at?: string
          consent_obtained_by?: string
          consent_recorded_in_language?: string | null
          consent_translated?: boolean | null
          consent_witness?: string | null
          created_at?: string | null
          expires_at?: string | null
          geographic_limits?: string[] | null
          id?: string
          next_review_due?: string | null
          notes?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          scope?: Database["public"]["Enums"]["consent_scope"]
          specific_data_types?: string[] | null
          status?: Database["public"]["Enums"]["consent_status"]
          status_changed_at?: string | null
          subject_community_id?: string | null
          subject_name?: string | null
          subject_organization_id?: string | null
          subject_person_id?: string | null
          subject_type?: string
          subject_user_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_consent_recorded_in_language_fkey"
            columns: ["consent_recorded_in_language"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_subject_community_id_fkey"
            columns: ["subject_community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_subject_organization_id_fkey"
            columns: ["subject_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_subject_person_id_fkey"
            columns: ["subject_person_id"]
            isOneToOne: false
            referencedRelation: "pending_person_deletions"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "consent_records_subject_person_id_fkey"
            columns: ["subject_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_consent_user"
            columns: ["subject_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          additional_language_ids: string[] | null
          archive_partner_organization_id: string | null
          attribution_required: string | null
          benefit_sharing_terms: string | null
          community_contributors_anonymized: boolean | null
          content_type: string
          contributing_community_id: string | null
          contributors: string[] | null
          created_at: string | null
          cultural_origin_community_id: string | null
          cultural_origin_place_id: string | null
          derivation_notes: string | null
          file_url: string | null
          format: string | null
          id: string
          internal_id: string | null
          license: string | null
          license_url: string | null
          notes: string | null
          primary_creator: string | null
          primary_language_id: string | null
          product_id: string | null
          public_url: string | null
          rights_holder: string | null
          source_recording_id: string | null
          status: Database["public"]["Enums"]["content_status"]
          status_entered_at: string | null
          storage_location: string | null
          title: string
          total_distribution_count: number | null
          updated_at: string | null
          used_in_deployment_ids: string[] | null
          was_contributed_by_community: boolean | null
        }
        Insert: {
          additional_language_ids?: string[] | null
          archive_partner_organization_id?: string | null
          attribution_required?: string | null
          benefit_sharing_terms?: string | null
          community_contributors_anonymized?: boolean | null
          content_type: string
          contributing_community_id?: string | null
          contributors?: string[] | null
          created_at?: string | null
          cultural_origin_community_id?: string | null
          cultural_origin_place_id?: string | null
          derivation_notes?: string | null
          file_url?: string | null
          format?: string | null
          id?: string
          internal_id?: string | null
          license?: string | null
          license_url?: string | null
          notes?: string | null
          primary_creator?: string | null
          primary_language_id?: string | null
          product_id?: string | null
          public_url?: string | null
          rights_holder?: string | null
          source_recording_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          status_entered_at?: string | null
          storage_location?: string | null
          title: string
          total_distribution_count?: number | null
          updated_at?: string | null
          used_in_deployment_ids?: string[] | null
          was_contributed_by_community?: boolean | null
        }
        Update: {
          additional_language_ids?: string[] | null
          archive_partner_organization_id?: string | null
          attribution_required?: string | null
          benefit_sharing_terms?: string | null
          community_contributors_anonymized?: boolean | null
          content_type?: string
          contributing_community_id?: string | null
          contributors?: string[] | null
          created_at?: string | null
          cultural_origin_community_id?: string | null
          cultural_origin_place_id?: string | null
          derivation_notes?: string | null
          file_url?: string | null
          format?: string | null
          id?: string
          internal_id?: string | null
          license?: string | null
          license_url?: string | null
          notes?: string | null
          primary_creator?: string | null
          primary_language_id?: string | null
          product_id?: string | null
          public_url?: string | null
          rights_holder?: string | null
          source_recording_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          status_entered_at?: string | null
          storage_location?: string | null
          title?: string
          total_distribution_count?: number | null
          updated_at?: string | null
          used_in_deployment_ids?: string[] | null
          was_contributed_by_community?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "content_items_archive_partner_organization_id_fkey"
            columns: ["archive_partner_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_items_contributing_community_id_fkey"
            columns: ["contributing_community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_items_cultural_origin_community_id_fkey"
            columns: ["cultural_origin_community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_items_cultural_origin_place_id_fkey"
            columns: ["cultural_origin_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_items_primary_language_id_fkey"
            columns: ["primary_language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      cultural_dimensions: {
        Row: {
          community_consent_complexity: string | null
          community_tech_comfort: string | null
          confidence: Database["public"]["Enums"]["confidence_level"]
          country_code: string | null
          created_at: string | null
          data_sharing_norms: string | null
          diaspora_cohesion: string | null
          id: string
          intergenerational_gap: string | null
          language_id: string
          notes: string | null
          oral_tradition_strength: string | null
          source_id: string | null
          storytelling_centrality: string | null
          transmission_risk: string | null
          updated_at: string | null
        }
        Insert: {
          community_consent_complexity?: string | null
          community_tech_comfort?: string | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          country_code?: string | null
          created_at?: string | null
          data_sharing_norms?: string | null
          diaspora_cohesion?: string | null
          id?: string
          intergenerational_gap?: string | null
          language_id: string
          notes?: string | null
          oral_tradition_strength?: string | null
          source_id?: string | null
          storytelling_centrality?: string | null
          transmission_risk?: string | null
          updated_at?: string | null
        }
        Update: {
          community_consent_complexity?: string | null
          community_tech_comfort?: string | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          country_code?: string | null
          created_at?: string | null
          data_sharing_norms?: string | null
          diaspora_cohesion?: string | null
          id?: string
          intergenerational_gap?: string | null
          language_id?: string
          notes?: string | null
          oral_tradition_strength?: string | null
          source_id?: string | null
          storytelling_centrality?: string | null
          transmission_risk?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cultural_dimensions_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_dimensions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboards: {
        Row: {
          created_at: string | null
          dashboard_name: string
          dashboard_owner: string | null
          dashboard_slug: string
          description: string
          id: string
          implementation_type: string | null
          implementation_url: string | null
          is_active: boolean | null
          last_reviewed: string | null
          notes: string | null
          primary_audience: Database["public"]["Enums"]["decision_audience"]
          primary_views_used: string[] | null
          refresh_cadence: string | null
          supports_protocol_ids: string[] | null
        }
        Insert: {
          created_at?: string | null
          dashboard_name: string
          dashboard_owner?: string | null
          dashboard_slug: string
          description: string
          id?: string
          implementation_type?: string | null
          implementation_url?: string | null
          is_active?: boolean | null
          last_reviewed?: string | null
          notes?: string | null
          primary_audience: Database["public"]["Enums"]["decision_audience"]
          primary_views_used?: string[] | null
          refresh_cadence?: string | null
          supports_protocol_ids?: string[] | null
        }
        Update: {
          created_at?: string | null
          dashboard_name?: string
          dashboard_owner?: string | null
          dashboard_slug?: string
          description?: string
          id?: string
          implementation_type?: string | null
          implementation_url?: string | null
          is_active?: boolean | null
          last_reviewed?: string | null
          notes?: string | null
          primary_audience?: Database["public"]["Enums"]["decision_audience"]
          primary_views_used?: string[] | null
          refresh_cadence?: string | null
          supports_protocol_ids?: string[] | null
        }
        Relationships: []
      }
      decision_log: {
        Row: {
          alternatives_considered: string | null
          created_at: string | null
          decided_by: string | null
          decision_date: string
          decision_type: string
          id: string
          outcome: string | null
          rationale: string | null
          reversibility: string | null
          revisit_date: string | null
          summary: string
          title: string
        }
        Insert: {
          alternatives_considered?: string | null
          created_at?: string | null
          decided_by?: string | null
          decision_date?: string
          decision_type: string
          id?: string
          outcome?: string | null
          rationale?: string | null
          reversibility?: string | null
          revisit_date?: string | null
          summary: string
          title: string
        }
        Update: {
          alternatives_considered?: string | null
          created_at?: string | null
          decided_by?: string | null
          decision_date?: string
          decision_type?: string
          id?: string
          outcome?: string | null
          rationale?: string | null
          reversibility?: string | null
          revisit_date?: string | null
          summary?: string
          title?: string
        }
        Relationships: []
      }
      decision_outcomes: {
        Row: {
          assessed_at: string
          assessed_by: string
          community_assessment: string | null
          created_at: string | null
          data_gaps_revealed: string | null
          decided_at: string
          decision_log_id: string | null
          decision_summary: string
          decision_used_data_well: boolean | null
          id: string
          next_assessment_due: string | null
          notes: string | null
          outcome_status: Database["public"]["Enums"]["decision_outcome_status"]
          partner_assessment: string | null
          protocol_id: string | null
          surprising_observations: string | null
          what_happened: string
          what_should_be_protocol_updated: string | null
          what_would_we_do_differently: string | null
        }
        Insert: {
          assessed_at: string
          assessed_by: string
          community_assessment?: string | null
          created_at?: string | null
          data_gaps_revealed?: string | null
          decided_at: string
          decision_log_id?: string | null
          decision_summary: string
          decision_used_data_well?: boolean | null
          id?: string
          next_assessment_due?: string | null
          notes?: string | null
          outcome_status: Database["public"]["Enums"]["decision_outcome_status"]
          partner_assessment?: string | null
          protocol_id?: string | null
          surprising_observations?: string | null
          what_happened: string
          what_should_be_protocol_updated?: string | null
          what_would_we_do_differently?: string | null
        }
        Update: {
          assessed_at?: string
          assessed_by?: string
          community_assessment?: string | null
          created_at?: string | null
          data_gaps_revealed?: string | null
          decided_at?: string
          decision_log_id?: string | null
          decision_summary?: string
          decision_used_data_well?: boolean | null
          id?: string
          next_assessment_due?: string | null
          notes?: string | null
          outcome_status?: Database["public"]["Enums"]["decision_outcome_status"]
          partner_assessment?: string | null
          protocol_id?: string | null
          surprising_observations?: string | null
          what_happened?: string
          what_should_be_protocol_updated?: string | null
          what_would_we_do_differently?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decision_outcomes_decision_log_id_fkey"
            columns: ["decision_log_id"]
            isOneToOne: false
            referencedRelation: "decision_log"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decision_outcomes_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "decision_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_protocols: {
        Row: {
          ai_synthesis_prompt: string | null
          ai_synthesis_review_pattern: string | null
          context_and_purpose: string
          created_at: string | null
          deliberation_process: string | null
          execution_count: number | null
          id: string
          last_executed: string | null
          last_revised: string | null
          next_review_due: string | null
          notes: string | null
          participants_required: string[] | null
          primary_audience: Database["public"]["Enums"]["decision_audience"]
          primary_data_sources: string[] | null
          primary_question: string
          primary_synthesis_method: Database["public"]["Enums"]["synthesis_method"]
          protocol_code: string | null
          protocol_name: string
          protocol_owner: string
          protocol_type: Database["public"]["Enums"]["decision_protocol_type"]
          protocol_version: number | null
          required_layer_1_entities: string[] | null
          required_layer_2_observations: string[] | null
          required_layer_3_operational: string[] | null
          review_cadence: Database["public"]["Enums"]["decision_cadence"]
          revision_notes: string | null
          secondary_audiences:
            | Database["public"]["Enums"]["decision_audience"][]
            | null
          sub_questions: string[] | null
          updated_at: string | null
        }
        Insert: {
          ai_synthesis_prompt?: string | null
          ai_synthesis_review_pattern?: string | null
          context_and_purpose: string
          created_at?: string | null
          deliberation_process?: string | null
          execution_count?: number | null
          id?: string
          last_executed?: string | null
          last_revised?: string | null
          next_review_due?: string | null
          notes?: string | null
          participants_required?: string[] | null
          primary_audience: Database["public"]["Enums"]["decision_audience"]
          primary_data_sources?: string[] | null
          primary_question: string
          primary_synthesis_method: Database["public"]["Enums"]["synthesis_method"]
          protocol_code?: string | null
          protocol_name: string
          protocol_owner: string
          protocol_type: Database["public"]["Enums"]["decision_protocol_type"]
          protocol_version?: number | null
          required_layer_1_entities?: string[] | null
          required_layer_2_observations?: string[] | null
          required_layer_3_operational?: string[] | null
          review_cadence: Database["public"]["Enums"]["decision_cadence"]
          revision_notes?: string | null
          secondary_audiences?:
            | Database["public"]["Enums"]["decision_audience"][]
            | null
          sub_questions?: string[] | null
          updated_at?: string | null
        }
        Update: {
          ai_synthesis_prompt?: string | null
          ai_synthesis_review_pattern?: string | null
          context_and_purpose?: string
          created_at?: string | null
          deliberation_process?: string | null
          execution_count?: number | null
          id?: string
          last_executed?: string | null
          last_revised?: string | null
          next_review_due?: string | null
          notes?: string | null
          participants_required?: string[] | null
          primary_audience?: Database["public"]["Enums"]["decision_audience"]
          primary_data_sources?: string[] | null
          primary_question?: string
          primary_synthesis_method?: Database["public"]["Enums"]["synthesis_method"]
          protocol_code?: string | null
          protocol_name?: string
          protocol_owner?: string
          protocol_type?: Database["public"]["Enums"]["decision_protocol_type"]
          protocol_version?: number | null
          required_layer_1_entities?: string[] | null
          required_layer_2_observations?: string[] | null
          required_layer_3_operational?: string[] | null
          review_cadence?: Database["public"]["Enums"]["decision_cadence"]
          revision_notes?: string | null
          secondary_audiences?:
            | Database["public"]["Enums"]["decision_audience"][]
            | null
          sub_questions?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      deployments: {
        Row: {
          active_risks: string[] | null
          actual_completion_date: string | null
          actual_household_count: number | null
          actual_participant_count: number | null
          actual_spend_usd: number | null
          actual_start_date: string | null
          additional_place_ids: string[] | null
          approved_budget_usd: number | null
          baseline_measurements_recorded: boolean | null
          completion_assessment_completed: boolean | null
          created_at: string | null
          current_blockers: string | null
          deployment_code: string | null
          deployment_health: string | null
          deployment_name: string
          field_visit_dates: string[] | null
          id: string
          midpoint_assessment_completed: boolean | null
          next_field_visit_planned: string | null
          notes: string | null
          on_ground_coordinator: string | null
          partner_organization_id: string | null
          planned_completion_date: string | null
          planned_start_date: string | null
          pre_deployment_assessment_url: string | null
          primary_community_id: string | null
          primary_language_ids: string[] | null
          primary_place_id: string
          program_id: string
          stage: Database["public"]["Enums"]["deployment_stage"]
          stage_entered_at: string | null
          target_household_count: number | null
          target_participant_count: number | null
          updated_at: string | null
        }
        Insert: {
          active_risks?: string[] | null
          actual_completion_date?: string | null
          actual_household_count?: number | null
          actual_participant_count?: number | null
          actual_spend_usd?: number | null
          actual_start_date?: string | null
          additional_place_ids?: string[] | null
          approved_budget_usd?: number | null
          baseline_measurements_recorded?: boolean | null
          completion_assessment_completed?: boolean | null
          created_at?: string | null
          current_blockers?: string | null
          deployment_code?: string | null
          deployment_health?: string | null
          deployment_name: string
          field_visit_dates?: string[] | null
          id?: string
          midpoint_assessment_completed?: boolean | null
          next_field_visit_planned?: string | null
          notes?: string | null
          on_ground_coordinator?: string | null
          partner_organization_id?: string | null
          planned_completion_date?: string | null
          planned_start_date?: string | null
          pre_deployment_assessment_url?: string | null
          primary_community_id?: string | null
          primary_language_ids?: string[] | null
          primary_place_id: string
          program_id: string
          stage?: Database["public"]["Enums"]["deployment_stage"]
          stage_entered_at?: string | null
          target_household_count?: number | null
          target_participant_count?: number | null
          updated_at?: string | null
        }
        Update: {
          active_risks?: string[] | null
          actual_completion_date?: string | null
          actual_household_count?: number | null
          actual_participant_count?: number | null
          actual_spend_usd?: number | null
          actual_start_date?: string | null
          additional_place_ids?: string[] | null
          approved_budget_usd?: number | null
          baseline_measurements_recorded?: boolean | null
          completion_assessment_completed?: boolean | null
          created_at?: string | null
          current_blockers?: string | null
          deployment_code?: string | null
          deployment_health?: string | null
          deployment_name?: string
          field_visit_dates?: string[] | null
          id?: string
          midpoint_assessment_completed?: boolean | null
          next_field_visit_planned?: string | null
          notes?: string | null
          on_ground_coordinator?: string | null
          partner_organization_id?: string | null
          planned_completion_date?: string | null
          planned_start_date?: string | null
          pre_deployment_assessment_url?: string | null
          primary_community_id?: string | null
          primary_language_ids?: string[] | null
          primary_place_id?: string
          program_id?: string
          stage?: Database["public"]["Enums"]["deployment_stage"]
          stage_entered_at?: string | null
          target_household_count?: number | null
          target_participant_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deployments_partner_organization_id_fkey"
            columns: ["partner_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployments_primary_community_id_fkey"
            columns: ["primary_community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployments_primary_place_id_fkey"
            columns: ["primary_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      documentation_status: {
        Row: {
          assessment_date: string
          confidence: Database["public"]["Enums"]["confidence_level"]
          has_audio_corpus: boolean | null
          has_dictionary: boolean | null
          has_literary_tradition: boolean | null
          has_pedagogical_materials: boolean | null
          has_published_grammar: boolean | null
          has_text_corpus: boolean | null
          has_translated_religious_texts: boolean | null
          has_video_corpus: boolean | null
          id: string
          language_id: string
          major_documentation_gaps: string | null
          notes: string | null
          overall_level: Database["public"]["Enums"]["documentation_level"]
          primary_archives: string[] | null
          source_id: string | null
        }
        Insert: {
          assessment_date: string
          confidence?: Database["public"]["Enums"]["confidence_level"]
          has_audio_corpus?: boolean | null
          has_dictionary?: boolean | null
          has_literary_tradition?: boolean | null
          has_pedagogical_materials?: boolean | null
          has_published_grammar?: boolean | null
          has_text_corpus?: boolean | null
          has_translated_religious_texts?: boolean | null
          has_video_corpus?: boolean | null
          id?: string
          language_id: string
          major_documentation_gaps?: string | null
          notes?: string | null
          overall_level: Database["public"]["Enums"]["documentation_level"]
          primary_archives?: string[] | null
          source_id?: string | null
        }
        Update: {
          assessment_date?: string
          confidence?: Database["public"]["Enums"]["confidence_level"]
          has_audio_corpus?: boolean | null
          has_dictionary?: boolean | null
          has_literary_tradition?: boolean | null
          has_pedagogical_materials?: boolean | null
          has_published_grammar?: boolean | null
          has_text_corpus?: boolean | null
          has_translated_religious_texts?: boolean | null
          has_video_corpus?: boolean | null
          id?: string
          language_id?: string
          major_documentation_gaps?: string | null
          notes?: string | null
          overall_level?: Database["public"]["Enums"]["documentation_level"]
          primary_archives?: string[] | null
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentation_status_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentation_status_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_usage: {
        Row: {
          assessment_date: string
          confidence: Database["public"]["Enums"]["confidence_level"]
          country_code: string | null
          created_at: string | null
          domain: Database["public"]["Enums"]["language_domain"]
          id: string
          is_contracting: boolean | null
          is_expanding: boolean | null
          language_id: string
          notes: string | null
          region: string | null
          source_id: string | null
          strength: Database["public"]["Enums"]["domain_strength"]
        }
        Insert: {
          assessment_date: string
          confidence?: Database["public"]["Enums"]["confidence_level"]
          country_code?: string | null
          created_at?: string | null
          domain: Database["public"]["Enums"]["language_domain"]
          id?: string
          is_contracting?: boolean | null
          is_expanding?: boolean | null
          language_id: string
          notes?: string | null
          region?: string | null
          source_id?: string | null
          strength: Database["public"]["Enums"]["domain_strength"]
        }
        Update: {
          assessment_date?: string
          confidence?: Database["public"]["Enums"]["confidence_level"]
          country_code?: string | null
          created_at?: string | null
          domain?: Database["public"]["Enums"]["language_domain"]
          id?: string
          is_contracting?: boolean | null
          is_expanding?: boolean | null
          language_id?: string
          notes?: string | null
          region?: string | null
          source_id?: string | null
          strength?: Database["public"]["Enums"]["domain_strength"]
        }
        Relationships: [
          {
            foreignKeyName: "domain_usage_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domain_usage_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      field_partnerships: {
        Row: {
          benefit_sharing_agreed: boolean | null
          consent_framework_agreed: boolean | null
          contact_method: string | null
          created_at: string | null
          id: string
          language_id: string
          last_contact_date: string | null
          notes: string | null
          partner_country: string | null
          partner_organization: string
          partner_region: string | null
          partner_status: string
          partnership_type: string | null
          primary_contact: string | null
          source_id: string | null
          started_date: string | null
          updated_at: string | null
        }
        Insert: {
          benefit_sharing_agreed?: boolean | null
          consent_framework_agreed?: boolean | null
          contact_method?: string | null
          created_at?: string | null
          id?: string
          language_id: string
          last_contact_date?: string | null
          notes?: string | null
          partner_country?: string | null
          partner_organization: string
          partner_region?: string | null
          partner_status?: string
          partnership_type?: string | null
          primary_contact?: string | null
          source_id?: string | null
          started_date?: string | null
          updated_at?: string | null
        }
        Update: {
          benefit_sharing_agreed?: boolean | null
          consent_framework_agreed?: boolean | null
          contact_method?: string | null
          created_at?: string | null
          id?: string
          language_id?: string
          last_contact_date?: string | null
          notes?: string | null
          partner_country?: string | null
          partner_organization?: string
          partner_region?: string | null
          partner_status?: string
          partnership_type?: string | null
          primary_contact?: string | null
          source_id?: string | null
          started_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_partnerships_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_partnerships_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_flows: {
        Row: {
          accounting_category: string | null
          amount_original_currency: number | null
          amount_usd: number
          counterparty_name_if_individual: string | null
          counterparty_organization_id: string | null
          created_at: string | null
          external_reference: string | null
          fiscal_year: number
          flow_date: string
          flow_type: Database["public"]["Enums"]["financial_flow_type"]
          fx_rate_used: number | null
          id: string
          is_committed: boolean | null
          is_executed: boolean | null
          is_restricted: boolean | null
          notes: string | null
          original_currency_code: string | null
          purpose: string
          related_community_id: string | null
          related_deployment_id: string | null
          related_product_id: string | null
          related_program_id: string | null
          restriction_terms: string | null
          source_system: string | null
        }
        Insert: {
          accounting_category?: string | null
          amount_original_currency?: number | null
          amount_usd: number
          counterparty_name_if_individual?: string | null
          counterparty_organization_id?: string | null
          created_at?: string | null
          external_reference?: string | null
          fiscal_year: number
          flow_date: string
          flow_type: Database["public"]["Enums"]["financial_flow_type"]
          fx_rate_used?: number | null
          id?: string
          is_committed?: boolean | null
          is_executed?: boolean | null
          is_restricted?: boolean | null
          notes?: string | null
          original_currency_code?: string | null
          purpose: string
          related_community_id?: string | null
          related_deployment_id?: string | null
          related_product_id?: string | null
          related_program_id?: string | null
          restriction_terms?: string | null
          source_system?: string | null
        }
        Update: {
          accounting_category?: string | null
          amount_original_currency?: number | null
          amount_usd?: number
          counterparty_name_if_individual?: string | null
          counterparty_organization_id?: string | null
          created_at?: string | null
          external_reference?: string | null
          fiscal_year?: number
          flow_date?: string
          flow_type?: Database["public"]["Enums"]["financial_flow_type"]
          fx_rate_used?: number | null
          id?: string
          is_committed?: boolean | null
          is_executed?: boolean | null
          is_restricted?: boolean | null
          notes?: string | null
          original_currency_code?: string | null
          purpose?: string
          related_community_id?: string | null
          related_deployment_id?: string | null
          related_product_id?: string | null
          related_program_id?: string | null
          restriction_terms?: string | null
          source_system?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_flows_counterparty_organization_id_fkey"
            columns: ["counterparty_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_flows_related_community_id_fkey"
            columns: ["related_community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_flows_related_deployment_id_fkey"
            columns: ["related_deployment_id"]
            isOneToOne: false
            referencedRelation: "deployments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_flows_related_product_id_fkey"
            columns: ["related_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_flows_related_program_id_fkey"
            columns: ["related_program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_flows: {
        Row: {
          created_at: string | null
          focus_areas: string[] | null
          funder_organization_id: string | null
          grant_amount_usd: number | null
          grant_announced_date: string
          grant_end_date: string | null
          grant_name: string | null
          grant_start_date: string | null
          id: string
          is_strategic_signal: boolean | null
          notes: string | null
          purpose: string
          recipient_name_if_not_in_db: string | null
          recipient_organization_id: string | null
          source_id: string | null
          source_url: string | null
          strategic_significance: string | null
          target_language_ids: string[] | null
          target_place_ids: string[] | null
        }
        Insert: {
          created_at?: string | null
          focus_areas?: string[] | null
          funder_organization_id?: string | null
          grant_amount_usd?: number | null
          grant_announced_date: string
          grant_end_date?: string | null
          grant_name?: string | null
          grant_start_date?: string | null
          id?: string
          is_strategic_signal?: boolean | null
          notes?: string | null
          purpose: string
          recipient_name_if_not_in_db?: string | null
          recipient_organization_id?: string | null
          source_id?: string | null
          source_url?: string | null
          strategic_significance?: string | null
          target_language_ids?: string[] | null
          target_place_ids?: string[] | null
        }
        Update: {
          created_at?: string | null
          focus_areas?: string[] | null
          funder_organization_id?: string | null
          grant_amount_usd?: number | null
          grant_announced_date?: string
          grant_end_date?: string | null
          grant_name?: string | null
          grant_start_date?: string | null
          id?: string
          is_strategic_signal?: boolean | null
          notes?: string | null
          purpose?: string
          recipient_name_if_not_in_db?: string | null
          recipient_organization_id?: string | null
          source_id?: string | null
          source_url?: string | null
          strategic_significance?: string | null
          target_language_ids?: string[] | null
          target_place_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "funding_flows_funder_organization_id_fkey"
            columns: ["funder_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_flows_recipient_organization_id_fkey"
            columns: ["recipient_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_flows_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_landscape: {
        Row: {
          application_cycle: string | null
          contact: string | null
          created_at: string | null
          fit_assessment: string | null
          focus_area: string | null
          funder_name: string
          funder_type: string | null
          geographic_focus: string | null
          id: string
          is_potential_funder: boolean | null
          language_id: string | null
          last_contacted: string | null
          notes: string | null
          program_name: string | null
          typical_grant_size_usd: number | null
          url: string | null
        }
        Insert: {
          application_cycle?: string | null
          contact?: string | null
          created_at?: string | null
          fit_assessment?: string | null
          focus_area?: string | null
          funder_name: string
          funder_type?: string | null
          geographic_focus?: string | null
          id?: string
          is_potential_funder?: boolean | null
          language_id?: string | null
          last_contacted?: string | null
          notes?: string | null
          program_name?: string | null
          typical_grant_size_usd?: number | null
          url?: string | null
        }
        Update: {
          application_cycle?: string | null
          contact?: string | null
          created_at?: string | null
          fit_assessment?: string | null
          focus_area?: string | null
          funder_name?: string
          funder_type?: string | null
          geographic_focus?: string | null
          id?: string
          is_potential_funder?: boolean | null
          language_id?: string | null
          last_contacted?: string | null
          notes?: string | null
          program_name?: string | null
          typical_grant_size_usd?: number | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funding_landscape_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      geographic_concentrations: {
        Row: {
          community_organizations: string[] | null
          confidence: Database["public"]["Enums"]["confidence_level"]
          country_code: string
          data_year: number | null
          estimated_speakers: number | null
          id: string
          is_diaspora_concentration: boolean | null
          is_indigenous_language: boolean | null
          is_official_language: boolean | null
          language_id: string
          notes: string | null
          region: string
          region_type: string | null
          source_id: string | null
        }
        Insert: {
          community_organizations?: string[] | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          country_code: string
          data_year?: number | null
          estimated_speakers?: number | null
          id?: string
          is_diaspora_concentration?: boolean | null
          is_indigenous_language?: boolean | null
          is_official_language?: boolean | null
          language_id: string
          notes?: string | null
          region: string
          region_type?: string | null
          source_id?: string | null
        }
        Update: {
          community_organizations?: string[] | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          country_code?: string
          data_year?: number | null
          estimated_speakers?: number | null
          id?: string
          is_diaspora_concentration?: boolean | null
          is_indigenous_language?: boolean | null
          is_official_language?: boolean | null
          language_id?: string
          notes?: string | null
          region?: string
          region_type?: string | null
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geographic_concentrations_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geographic_concentrations_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      grants_active: {
        Row: {
          application_status: string | null
          application_url: string | null
          award_date: string | null
          contract_url: string | null
          created_at: string | null
          disbursement_schedule: Json | null
          end_date: string
          funded_program_ids: string[] | null
          funder_organization_id: string
          grant_code: string | null
          grant_name: string
          grant_owner: string
          id: string
          next_report_due: string | null
          notes: string | null
          purpose: string
          reporting_owner: string | null
          reporting_requirements: string | null
          restricted_to_focus_areas: string[] | null
          start_date: string
          total_amount_usd: number
          updated_at: string | null
        }
        Insert: {
          application_status?: string | null
          application_url?: string | null
          award_date?: string | null
          contract_url?: string | null
          created_at?: string | null
          disbursement_schedule?: Json | null
          end_date: string
          funded_program_ids?: string[] | null
          funder_organization_id: string
          grant_code?: string | null
          grant_name: string
          grant_owner: string
          id?: string
          next_report_due?: string | null
          notes?: string | null
          purpose: string
          reporting_owner?: string | null
          reporting_requirements?: string | null
          restricted_to_focus_areas?: string[] | null
          start_date: string
          total_amount_usd: number
          updated_at?: string | null
        }
        Update: {
          application_status?: string | null
          application_url?: string | null
          award_date?: string | null
          contract_url?: string | null
          created_at?: string | null
          disbursement_schedule?: Json | null
          end_date?: string
          funded_program_ids?: string[] | null
          funder_organization_id?: string
          grant_code?: string | null
          grant_name?: string
          grant_owner?: string
          id?: string
          next_report_due?: string | null
          notes?: string | null
          purpose?: string
          reporting_owner?: string | null
          reporting_requirements?: string | null
          restricted_to_focus_areas?: string[] | null
          start_date?: string
          total_amount_usd?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grants_active_funder_organization_id_fkey"
            columns: ["funder_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      infrastructure_dependencies: {
        Row: {
          alternative_providers: string[] | null
          contract_renews_at: string | null
          contract_url: string | null
          cost_growth_trajectory: string | null
          created_at: string | null
          criticality: Database["public"]["Enums"]["risk_level"] | null
          data_residency_implications: string | null
          dependency_name: string
          dependency_type: string | null
          has_baa: boolean | null
          has_dpa: boolean | null
          id: string
          monthly_cost_usd: number | null
          notes: string | null
          pricing_model: string | null
          purpose: string | null
          switching_difficulty: string | null
          updated_at: string | null
          used_by_products: string[] | null
          used_by_programs: string[] | null
          vendor_lock_in_concerns: string | null
          vendor_organization_id: string | null
        }
        Insert: {
          alternative_providers?: string[] | null
          contract_renews_at?: string | null
          contract_url?: string | null
          cost_growth_trajectory?: string | null
          created_at?: string | null
          criticality?: Database["public"]["Enums"]["risk_level"] | null
          data_residency_implications?: string | null
          dependency_name: string
          dependency_type?: string | null
          has_baa?: boolean | null
          has_dpa?: boolean | null
          id?: string
          monthly_cost_usd?: number | null
          notes?: string | null
          pricing_model?: string | null
          purpose?: string | null
          switching_difficulty?: string | null
          updated_at?: string | null
          used_by_products?: string[] | null
          used_by_programs?: string[] | null
          vendor_lock_in_concerns?: string | null
          vendor_organization_id?: string | null
        }
        Update: {
          alternative_providers?: string[] | null
          contract_renews_at?: string | null
          contract_url?: string | null
          cost_growth_trajectory?: string | null
          created_at?: string | null
          criticality?: Database["public"]["Enums"]["risk_level"] | null
          data_residency_implications?: string | null
          dependency_name?: string
          dependency_type?: string | null
          has_baa?: boolean | null
          has_dpa?: boolean | null
          id?: string
          monthly_cost_usd?: number | null
          notes?: string | null
          pricing_model?: string | null
          purpose?: string | null
          switching_difficulty?: string | null
          updated_at?: string | null
          used_by_products?: string[] | null
          used_by_programs?: string[] | null
          vendor_lock_in_concerns?: string | null
          vendor_organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "infrastructure_dependencies_vendor_organization_id_fkey"
            columns: ["vendor_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      institutional_support: {
        Row: {
          appears_in_national_census: boolean | null
          census_methodology_notes: string | null
          country_code: string
          has_court_interpretation_rights: boolean | null
          has_government_translation_services: boolean | null
          has_higher_education: boolean | null
          has_official_orthography: boolean | null
          has_public_education: boolean | null
          has_state_media: boolean | null
          id: string
          language_id: string
          last_reviewed: string | null
          notes: string | null
          recognition_basis: string | null
          recognition_date: string | null
          recognition_level: Database["public"]["Enums"]["recognition_level"]
          source_id: string | null
        }
        Insert: {
          appears_in_national_census?: boolean | null
          census_methodology_notes?: string | null
          country_code: string
          has_court_interpretation_rights?: boolean | null
          has_government_translation_services?: boolean | null
          has_higher_education?: boolean | null
          has_official_orthography?: boolean | null
          has_public_education?: boolean | null
          has_state_media?: boolean | null
          id?: string
          language_id: string
          last_reviewed?: string | null
          notes?: string | null
          recognition_basis?: string | null
          recognition_date?: string | null
          recognition_level: Database["public"]["Enums"]["recognition_level"]
          source_id?: string | null
        }
        Update: {
          appears_in_national_census?: boolean | null
          census_methodology_notes?: string | null
          country_code?: string
          has_court_interpretation_rights?: boolean | null
          has_government_translation_services?: boolean | null
          has_higher_education?: boolean | null
          has_official_orthography?: boolean | null
          has_public_education?: boolean | null
          has_state_media?: boolean | null
          id?: string
          language_id?: string
          last_reviewed?: string | null
          notes?: string | null
          recognition_basis?: string | null
          recognition_date?: string | null
          recognition_level?: Database["public"]["Enums"]["recognition_level"]
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institutional_support_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institutional_support_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      language_models: {
        Row: {
          bleu_score: number | null
          cer: number | null
          created_at: string | null
          eval_dataset: string | null
          eval_notes: string | null
          id: string
          is_open_source: boolean | null
          language_id: string
          last_verified_at: string | null
          license: string | null
          model_name: string
          model_type: string
          notes: string | null
          parameter_count: number | null
          provider: string
          quality_tier: Database["public"]["Enums"]["tech_quality_tier"] | null
          source_id: string | null
          source_url: string | null
          updated_at: string | null
          wer: number | null
        }
        Insert: {
          bleu_score?: number | null
          cer?: number | null
          created_at?: string | null
          eval_dataset?: string | null
          eval_notes?: string | null
          id?: string
          is_open_source?: boolean | null
          language_id: string
          last_verified_at?: string | null
          license?: string | null
          model_name: string
          model_type: string
          notes?: string | null
          parameter_count?: number | null
          provider: string
          quality_tier?: Database["public"]["Enums"]["tech_quality_tier"] | null
          source_id?: string | null
          source_url?: string | null
          updated_at?: string | null
          wer?: number | null
        }
        Update: {
          bleu_score?: number | null
          cer?: number | null
          created_at?: string | null
          eval_dataset?: string | null
          eval_notes?: string | null
          id?: string
          is_open_source?: boolean | null
          language_id?: string
          last_verified_at?: string | null
          license?: string | null
          model_name?: string
          model_type?: string
          notes?: string | null
          parameter_count?: number | null
          provider?: string
          quality_tier?: Database["public"]["Enums"]["tech_quality_tier"] | null
          source_id?: string | null
          source_url?: string | null
          updated_at?: string | null
          wer?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "language_models_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "language_models_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      language_place_presence: {
        Row: {
          arrived_via_migration: boolean | null
          confidence: Database["public"]["Enums"]["confidence_level"]
          created_at: string | null
          earliest_attestation_year: number | null
          has_digital_presence: boolean | null
          has_local_media: boolean | null
          has_official_recognition: boolean | null
          heritage_speakers_count: number | null
          id: string
          intergenerational_transmission_status: string | null
          is_diaspora_presence: boolean | null
          is_native_to_place: boolean | null
          l1_speakers_count: number | null
          l2_speakers_count: number | null
          language_id: string
          language_of_instruction_for_subjects: string[] | null
          methodology: Database["public"]["Enums"]["methodology_type"] | null
          notes: string | null
          observation_year: number
          pct_children_acquiring: number | null
          place_id: string
          recognition_type: string | null
          source_id: string | null
          taught_in_community_schools: boolean | null
          taught_in_public_schools: boolean | null
          total_speakers_count: number | null
        }
        Insert: {
          arrived_via_migration?: boolean | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string | null
          earliest_attestation_year?: number | null
          has_digital_presence?: boolean | null
          has_local_media?: boolean | null
          has_official_recognition?: boolean | null
          heritage_speakers_count?: number | null
          id?: string
          intergenerational_transmission_status?: string | null
          is_diaspora_presence?: boolean | null
          is_native_to_place?: boolean | null
          l1_speakers_count?: number | null
          l2_speakers_count?: number | null
          language_id: string
          language_of_instruction_for_subjects?: string[] | null
          methodology?: Database["public"]["Enums"]["methodology_type"] | null
          notes?: string | null
          observation_year: number
          pct_children_acquiring?: number | null
          place_id: string
          recognition_type?: string | null
          source_id?: string | null
          taught_in_community_schools?: boolean | null
          taught_in_public_schools?: boolean | null
          total_speakers_count?: number | null
        }
        Update: {
          arrived_via_migration?: boolean | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string | null
          earliest_attestation_year?: number | null
          has_digital_presence?: boolean | null
          has_local_media?: boolean | null
          has_official_recognition?: boolean | null
          heritage_speakers_count?: number | null
          id?: string
          intergenerational_transmission_status?: string | null
          is_diaspora_presence?: boolean | null
          is_native_to_place?: boolean | null
          l1_speakers_count?: number | null
          l2_speakers_count?: number | null
          language_id?: string
          language_of_instruction_for_subjects?: string[] | null
          methodology?: Database["public"]["Enums"]["methodology_type"] | null
          notes?: string | null
          observation_year?: number
          pct_children_acquiring?: number | null
          place_id?: string
          recognition_type?: string | null
          source_id?: string | null
          taught_in_community_schools?: boolean | null
          taught_in_public_schools?: boolean | null
          total_speakers_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "language_place_presence_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "language_place_presence_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "language_place_presence_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          created_at: string | null
          endonym: string | null
          english_name: string
          ethnologue_status: string | null
          glottocode: string | null
          glottolog_last_synced: string | null
          glottolog_parent_glottocode: string | null
          glottolog_validated: boolean | null
          granularity: Database["public"]["Enums"]["language_granularity"]
          id: string
          is_constructed: boolean | null
          is_signed_language: boolean | null
          iso_639_1: string | null
          iso_639_3: string | null
          linguasphere_code: string | null
          notes: string | null
          parent_language_id: string | null
          updated_at: string | null
          wals_code: string | null
          wikidata_qid: string | null
        }
        Insert: {
          created_at?: string | null
          endonym?: string | null
          english_name: string
          ethnologue_status?: string | null
          glottocode?: string | null
          glottolog_last_synced?: string | null
          glottolog_parent_glottocode?: string | null
          glottolog_validated?: boolean | null
          granularity?: Database["public"]["Enums"]["language_granularity"]
          id?: string
          is_constructed?: boolean | null
          is_signed_language?: boolean | null
          iso_639_1?: string | null
          iso_639_3?: string | null
          linguasphere_code?: string | null
          notes?: string | null
          parent_language_id?: string | null
          updated_at?: string | null
          wals_code?: string | null
          wikidata_qid?: string | null
        }
        Update: {
          created_at?: string | null
          endonym?: string | null
          english_name?: string
          ethnologue_status?: string | null
          glottocode?: string | null
          glottolog_last_synced?: string | null
          glottolog_parent_glottocode?: string | null
          glottolog_validated?: boolean | null
          granularity?: Database["public"]["Enums"]["language_granularity"]
          id?: string
          is_constructed?: boolean | null
          is_signed_language?: boolean | null
          iso_639_1?: string | null
          iso_639_3?: string | null
          linguasphere_code?: string | null
          notes?: string | null
          parent_language_id?: string | null
          updated_at?: string | null
          wals_code?: string | null
          wikidata_qid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "languages_parent_language_id_fkey"
            columns: ["parent_language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      linguistic_features: {
        Row: {
          confidence: Database["public"]["Enums"]["confidence_level"]
          created_at: string | null
          feature_code: string
          feature_name: string | null
          feature_value: string
          id: string
          language_id: string
          source_id: string
        }
        Insert: {
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string | null
          feature_code: string
          feature_name?: string | null
          feature_value: string
          id?: string
          language_id: string
          source_id: string
        }
        Update: {
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string | null
          feature_code?: string
          feature_name?: string | null
          feature_value?: string
          id?: string
          language_id?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "linguistic_features_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linguistic_features_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_definitions: {
        Row: {
          caveats_and_limitations: string | null
          created_at: string | null
          expected_range: string | null
          external_benchmark: string | null
          first_defined: string | null
          formula_description: string
          id: string
          internal_target: string | null
          is_active: boolean | null
          last_revised: string | null
          metric_category: string | null
          metric_name: string
          metric_owner: string | null
          metric_slug: string
          notes: string | null
          retired_date: string | null
          retired_reason: string | null
          sql_definition: string | null
          unit_of_measurement: string | null
          what_is_measured: string
          why_we_track_this: string | null
        }
        Insert: {
          caveats_and_limitations?: string | null
          created_at?: string | null
          expected_range?: string | null
          external_benchmark?: string | null
          first_defined?: string | null
          formula_description: string
          id?: string
          internal_target?: string | null
          is_active?: boolean | null
          last_revised?: string | null
          metric_category?: string | null
          metric_name: string
          metric_owner?: string | null
          metric_slug: string
          notes?: string | null
          retired_date?: string | null
          retired_reason?: string | null
          sql_definition?: string | null
          unit_of_measurement?: string | null
          what_is_measured: string
          why_we_track_this?: string | null
        }
        Update: {
          caveats_and_limitations?: string | null
          created_at?: string | null
          expected_range?: string | null
          external_benchmark?: string | null
          first_defined?: string | null
          formula_description?: string
          id?: string
          internal_target?: string | null
          is_active?: boolean | null
          last_revised?: string | null
          metric_category?: string | null
          metric_name?: string
          metric_owner?: string | null
          metric_slug?: string
          notes?: string | null
          retired_date?: string | null
          retired_reason?: string | null
          sql_definition?: string | null
          unit_of_measurement?: string | null
          what_is_measured?: string
          why_we_track_this?: string | null
        }
        Relationships: []
      }
      migration_flows: {
        Row: {
          associated_language_ids: string[] | null
          created_at: string | null
          destination_place_id: string
          driving_factors: string | null
          estimated_flow_count: number | null
          flow_count_confidence: Database["public"]["Enums"]["confidence_level"]
          flow_type: Database["public"]["Enums"]["migration_flow_type"] | null
          id: string
          is_first_generation: boolean | null
          methodology: Database["public"]["Enums"]["methodology_type"] | null
          notes: string | null
          observation_period_end: string | null
          observation_period_start: string | null
          observation_year: number
          origin_place_id: string
          pct_18_to_40: number | null
          pct_40_to_65: number | null
          pct_65_plus: number | null
          pct_female: number | null
          pct_under_18: number | null
          policy_context: string | null
          source_id: string | null
        }
        Insert: {
          associated_language_ids?: string[] | null
          created_at?: string | null
          destination_place_id: string
          driving_factors?: string | null
          estimated_flow_count?: number | null
          flow_count_confidence?: Database["public"]["Enums"]["confidence_level"]
          flow_type?: Database["public"]["Enums"]["migration_flow_type"] | null
          id?: string
          is_first_generation?: boolean | null
          methodology?: Database["public"]["Enums"]["methodology_type"] | null
          notes?: string | null
          observation_period_end?: string | null
          observation_period_start?: string | null
          observation_year: number
          origin_place_id: string
          pct_18_to_40?: number | null
          pct_40_to_65?: number | null
          pct_65_plus?: number | null
          pct_female?: number | null
          pct_under_18?: number | null
          policy_context?: string | null
          source_id?: string | null
        }
        Update: {
          associated_language_ids?: string[] | null
          created_at?: string | null
          destination_place_id?: string
          driving_factors?: string | null
          estimated_flow_count?: number | null
          flow_count_confidence?: Database["public"]["Enums"]["confidence_level"]
          flow_type?: Database["public"]["Enums"]["migration_flow_type"] | null
          id?: string
          is_first_generation?: boolean | null
          methodology?: Database["public"]["Enums"]["methodology_type"] | null
          notes?: string | null
          observation_period_end?: string | null
          observation_period_start?: string | null
          observation_year?: number
          origin_place_id?: string
          pct_18_to_40?: number | null
          pct_40_to_65?: number | null
          pct_65_plus?: number | null
          pct_female?: number | null
          pct_under_18?: number | null
          policy_context?: string | null
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "migration_flows_destination_place_id_fkey"
            columns: ["destination_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_flows_origin_place_id_fkey"
            columns: ["origin_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_flows_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      observation_registry: {
        Row: {
          created_at: string | null
          description: string | null
          expected_cadence: Database["public"]["Enums"]["observation_cadence"]
          id: string
          notes: string | null
          observation_domain: string
          observed_entity_type: string
          primary_sources: string[] | null
          table_name: string
          typical_lag_days: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          expected_cadence: Database["public"]["Enums"]["observation_cadence"]
          id?: string
          notes?: string | null
          observation_domain: string
          observed_entity_type: string
          primary_sources?: string[] | null
          table_name: string
          typical_lag_days?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          expected_cadence?: Database["public"]["Enums"]["observation_cadence"]
          id?: string
          notes?: string | null
          observation_domain?: string
          observed_entity_type?: string
          primary_sources?: string[] | null
          table_name?: string
          typical_lag_days?: number | null
        }
        Relationships: []
      }
      operational_risks: {
        Row: {
          affected_community_ids: string[] | null
          affected_deployment_ids: string[] | null
          affected_partner_organization_ids: string[] | null
          affected_program_ids: string[] | null
          category: Database["public"]["Enums"]["risk_category"]
          created_at: string | null
          description: string
          id: string
          identified_by: string | null
          identified_date: string
          last_reviewed: string | null
          level: Database["public"]["Enums"]["risk_level"]
          likelihood: string | null
          mitigation_owner: string | null
          mitigation_status: string | null
          mitigation_strategy: string | null
          next_review_due: string | null
          notes: string | null
          potential_impact: string | null
          resolution_notes: string | null
          resolved_date: string | null
          risk_title: string
          trigger_conditions: string | null
          updated_at: string | null
        }
        Insert: {
          affected_community_ids?: string[] | null
          affected_deployment_ids?: string[] | null
          affected_partner_organization_ids?: string[] | null
          affected_program_ids?: string[] | null
          category: Database["public"]["Enums"]["risk_category"]
          created_at?: string | null
          description: string
          id?: string
          identified_by?: string | null
          identified_date: string
          last_reviewed?: string | null
          level: Database["public"]["Enums"]["risk_level"]
          likelihood?: string | null
          mitigation_owner?: string | null
          mitigation_status?: string | null
          mitigation_strategy?: string | null
          next_review_due?: string | null
          notes?: string | null
          potential_impact?: string | null
          resolution_notes?: string | null
          resolved_date?: string | null
          risk_title: string
          trigger_conditions?: string | null
          updated_at?: string | null
        }
        Update: {
          affected_community_ids?: string[] | null
          affected_deployment_ids?: string[] | null
          affected_partner_organization_ids?: string[] | null
          affected_program_ids?: string[] | null
          category?: Database["public"]["Enums"]["risk_category"]
          created_at?: string | null
          description?: string
          id?: string
          identified_by?: string | null
          identified_date?: string
          last_reviewed?: string | null
          level?: Database["public"]["Enums"]["risk_level"]
          likelihood?: string | null
          mitigation_owner?: string | null
          mitigation_status?: string | null
          mitigation_strategy?: string | null
          next_review_due?: string | null
          notes?: string | null
          potential_impact?: string | null
          resolution_notes?: string | null
          resolved_date?: string | null
          risk_title?: string
          trigger_conditions?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_financial_profile: {
        Row: {
          annual_budget_usd: number | null
          annual_grantmaking_usd: number | null
          assessment_date: string
          confidence: Database["public"]["Enums"]["confidence_level"]
          created_at: string | null
          fiscal_year: number | null
          general_operating_support_available: boolean | null
          geographic_grantmaking_areas: string[] | null
          grant_focus_areas: string[] | null
          id: string
          largest_typical_grant_usd: number | null
          multi_year_grants_typical: boolean | null
          notes: string | null
          number_of_grants_made: number | null
          organization_id: string
          smallest_typical_grant_usd: number | null
          source_id: string | null
          staff_count: number | null
          total_assets_usd: number | null
          total_endowment_usd: number | null
          typical_grant_size_usd: number | null
        }
        Insert: {
          annual_budget_usd?: number | null
          annual_grantmaking_usd?: number | null
          assessment_date: string
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string | null
          fiscal_year?: number | null
          general_operating_support_available?: boolean | null
          geographic_grantmaking_areas?: string[] | null
          grant_focus_areas?: string[] | null
          id?: string
          largest_typical_grant_usd?: number | null
          multi_year_grants_typical?: boolean | null
          notes?: string | null
          number_of_grants_made?: number | null
          organization_id: string
          smallest_typical_grant_usd?: number | null
          source_id?: string | null
          staff_count?: number | null
          total_assets_usd?: number | null
          total_endowment_usd?: number | null
          typical_grant_size_usd?: number | null
        }
        Update: {
          annual_budget_usd?: number | null
          annual_grantmaking_usd?: number | null
          assessment_date?: string
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string | null
          fiscal_year?: number | null
          general_operating_support_available?: boolean | null
          geographic_grantmaking_areas?: string[] | null
          grant_focus_areas?: string[] | null
          id?: string
          largest_typical_grant_usd?: number | null
          multi_year_grants_typical?: boolean | null
          notes?: string | null
          number_of_grants_made?: number | null
          organization_id?: string
          smallest_typical_grant_usd?: number | null
          source_id?: string | null
          staff_count?: number | null
          total_assets_usd?: number | null
          total_endowment_usd?: number | null
          typical_grant_size_usd?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_financial_profile_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_financial_profile_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_interactions: {
        Row: {
          concerns_raised: string | null
          created_at: string | null
          follow_up_by_date: string | null
          follow_up_owner: string | null
          follow_up_required: string | null
          id: string
          interaction_date: string
          interaction_type: string | null
          notes: string | null
          organization_id: string
          outcomes: string | null
          partner_participants: string[] | null
          source_id: string | null
          summary: string
          tomorrowlabs_participants: string[] | null
          topics_discussed: string[] | null
          went_well: boolean | null
        }
        Insert: {
          concerns_raised?: string | null
          created_at?: string | null
          follow_up_by_date?: string | null
          follow_up_owner?: string | null
          follow_up_required?: string | null
          id?: string
          interaction_date: string
          interaction_type?: string | null
          notes?: string | null
          organization_id: string
          outcomes?: string | null
          partner_participants?: string[] | null
          source_id?: string | null
          summary: string
          tomorrowlabs_participants?: string[] | null
          topics_discussed?: string[] | null
          went_well?: boolean | null
        }
        Update: {
          concerns_raised?: string | null
          created_at?: string | null
          follow_up_by_date?: string | null
          follow_up_owner?: string | null
          follow_up_required?: string | null
          id?: string
          interaction_date?: string
          interaction_type?: string | null
          notes?: string | null
          organization_id?: string
          outcomes?: string | null
          partner_participants?: string[] | null
          source_id?: string | null
          summary?: string
          tomorrowlabs_participants?: string[] | null
          topics_discussed?: string[] | null
          went_well?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_interactions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_place_presence: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          organization_id: string
          place_id: string
          presence_end_year: number | null
          presence_start_year: number | null
          presence_type: string | null
          source_id: string | null
          staff_count_local: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          place_id: string
          presence_end_year?: number | null
          presence_start_year?: number | null
          presence_type?: string | null
          source_id?: string | null
          staff_count_local?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          place_id?: string
          presence_end_year?: number | null
          presence_start_year?: number | null
          presence_type?: string | null
          source_id?: string | null
          staff_count_local?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_place_presence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_place_presence_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_place_presence_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_programs: {
        Row: {
          annual_budget_usd: number | null
          created_at: string | null
          documented_outcomes: string | null
          end_year: number | null
          external_evaluations: string[] | null
          focus_area: string | null
          geographic_focus_place_ids: string[] | null
          id: string
          languages_served: string[] | null
          last_reviewed: string | null
          notes: string | null
          organization_id: string
          participant_count: number | null
          potential_collaboration_notes: string | null
          program_name: string
          program_url: string | null
          relevance_to_tomorrowlabs: string | null
          source_id: string | null
          start_year: number | null
        }
        Insert: {
          annual_budget_usd?: number | null
          created_at?: string | null
          documented_outcomes?: string | null
          end_year?: number | null
          external_evaluations?: string[] | null
          focus_area?: string | null
          geographic_focus_place_ids?: string[] | null
          id?: string
          languages_served?: string[] | null
          last_reviewed?: string | null
          notes?: string | null
          organization_id: string
          participant_count?: number | null
          potential_collaboration_notes?: string | null
          program_name: string
          program_url?: string | null
          relevance_to_tomorrowlabs?: string | null
          source_id?: string | null
          start_year?: number | null
        }
        Update: {
          annual_budget_usd?: number | null
          created_at?: string | null
          documented_outcomes?: string | null
          end_year?: number | null
          external_evaluations?: string[] | null
          focus_area?: string | null
          geographic_focus_place_ids?: string[] | null
          id?: string
          languages_served?: string[] | null
          last_reviewed?: string | null
          notes?: string | null
          organization_id?: string
          participant_count?: number | null
          potential_collaboration_notes?: string | null
          program_name?: string
          program_url?: string | null
          relevance_to_tomorrowlabs?: string | null
          source_id?: string | null
          start_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_programs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_programs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_relationships: {
        Row: {
          active_projects_count: number | null
          assessment_date: string
          created_at: string | null
          cultural_fit_notes: string | null
          id: string
          last_meaningful_contact: string | null
          next_planned_contact: string | null
          notes: string | null
          organization_id: string
          power_dynamic_notes: string | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_notes: string | null
          primary_contact_role: string | null
          reciprocity_assessment: string | null
          relationship_status: Database["public"]["Enums"]["relationship_status"]
          source_id: string | null
          tomorrowlabs_relationship_owner: string | null
          trust_level: Database["public"]["Enums"]["trust_level"] | null
        }
        Insert: {
          active_projects_count?: number | null
          assessment_date: string
          created_at?: string | null
          cultural_fit_notes?: string | null
          id?: string
          last_meaningful_contact?: string | null
          next_planned_contact?: string | null
          notes?: string | null
          organization_id: string
          power_dynamic_notes?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_notes?: string | null
          primary_contact_role?: string | null
          reciprocity_assessment?: string | null
          relationship_status: Database["public"]["Enums"]["relationship_status"]
          source_id?: string | null
          tomorrowlabs_relationship_owner?: string | null
          trust_level?: Database["public"]["Enums"]["trust_level"] | null
        }
        Update: {
          active_projects_count?: number | null
          assessment_date?: string
          created_at?: string | null
          cultural_fit_notes?: string | null
          id?: string
          last_meaningful_contact?: string | null
          next_planned_contact?: string | null
          notes?: string | null
          organization_id?: string
          power_dynamic_notes?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_notes?: string | null
          primary_contact_role?: string | null
          reciprocity_assessment?: string | null
          relationship_status?: Database["public"]["Enums"]["relationship_status"]
          source_id?: string | null
          tomorrowlabs_relationship_owner?: string | null
          trust_level?: Database["public"]["Enums"]["trust_level"] | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_relationships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_relationships_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          alternate_names: string[] | null
          candid_id: string | null
          ceased_operations_year: number | null
          charity_navigator_id: string | null
          created_at: string | null
          crunchbase_id: string | null
          display_name: string | null
          ein: string | null
          endonym: string | null
          endonym_language_id: string | null
          focus_areas: string[] | null
          founding_story: string | null
          founding_year: number | null
          funder_category: Database["public"]["Enums"]["funder_category"] | null
          geographic_scope: string | null
          guidestar_id: string | null
          headquarters_place_id: string | null
          id: string
          incorporation_status:
            | Database["public"]["Enums"]["incorporation_status"]
            | null
          is_active: boolean | null
          legal_name: string
          mission_statement: string | null
          notes: string | null
          organization_type: Database["public"]["Enums"]["organization_type"]
          parent_organization_id: string | null
          primary_languages_used: string[] | null
          primary_operating_places: string[] | null
          primary_url: string | null
          social_handles: Json | null
          updated_at: string | null
          wikidata_id: string | null
        }
        Insert: {
          alternate_names?: string[] | null
          candid_id?: string | null
          ceased_operations_year?: number | null
          charity_navigator_id?: string | null
          created_at?: string | null
          crunchbase_id?: string | null
          display_name?: string | null
          ein?: string | null
          endonym?: string | null
          endonym_language_id?: string | null
          focus_areas?: string[] | null
          founding_story?: string | null
          founding_year?: number | null
          funder_category?:
            | Database["public"]["Enums"]["funder_category"]
            | null
          geographic_scope?: string | null
          guidestar_id?: string | null
          headquarters_place_id?: string | null
          id?: string
          incorporation_status?:
            | Database["public"]["Enums"]["incorporation_status"]
            | null
          is_active?: boolean | null
          legal_name: string
          mission_statement?: string | null
          notes?: string | null
          organization_type: Database["public"]["Enums"]["organization_type"]
          parent_organization_id?: string | null
          primary_languages_used?: string[] | null
          primary_operating_places?: string[] | null
          primary_url?: string | null
          social_handles?: Json | null
          updated_at?: string | null
          wikidata_id?: string | null
        }
        Update: {
          alternate_names?: string[] | null
          candid_id?: string | null
          ceased_operations_year?: number | null
          charity_navigator_id?: string | null
          created_at?: string | null
          crunchbase_id?: string | null
          display_name?: string | null
          ein?: string | null
          endonym?: string | null
          endonym_language_id?: string | null
          focus_areas?: string[] | null
          founding_story?: string | null
          founding_year?: number | null
          funder_category?:
            | Database["public"]["Enums"]["funder_category"]
            | null
          geographic_scope?: string | null
          guidestar_id?: string | null
          headquarters_place_id?: string | null
          id?: string
          incorporation_status?:
            | Database["public"]["Enums"]["incorporation_status"]
            | null
          is_active?: boolean | null
          legal_name?: string
          mission_statement?: string | null
          notes?: string | null
          organization_type?: Database["public"]["Enums"]["organization_type"]
          parent_organization_id?: string | null
          primary_languages_used?: string[] | null
          primary_operating_places?: string[] | null
          primary_url?: string | null
          social_handles?: Json | null
          updated_at?: string | null
          wikidata_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_endonym_language_id_fkey"
            columns: ["endonym_language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_headquarters_place_id_fkey"
            columns: ["headquarters_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_parent_organization_id_fkey"
            columns: ["parent_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      orthographies: {
        Row: {
          community_acceptance: string | null
          developed_by: string | null
          font_availability: string | null
          id: string
          is_primary: boolean | null
          language_id: string
          name: string
          notes: string | null
          origin_year: number | null
          rendering_complexity: string | null
          script_iso15924: string | null
          source_id: string | null
          status: Database["public"]["Enums"]["orthography_status"] | null
          unicode_blocks: string[] | null
          used_in: string[] | null
        }
        Insert: {
          community_acceptance?: string | null
          developed_by?: string | null
          font_availability?: string | null
          id?: string
          is_primary?: boolean | null
          language_id: string
          name: string
          notes?: string | null
          origin_year?: number | null
          rendering_complexity?: string | null
          script_iso15924?: string | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["orthography_status"] | null
          unicode_blocks?: string[] | null
          used_in?: string[] | null
        }
        Update: {
          community_acceptance?: string | null
          developed_by?: string | null
          font_availability?: string | null
          id?: string
          is_primary?: boolean | null
          language_id?: string
          name?: string
          notes?: string | null
          origin_year?: number | null
          rendering_complexity?: string | null
          script_iso15924?: string | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["orthography_status"] | null
          unicode_blocks?: string[] | null
          used_in?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "orthographies_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orthographies_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          birth_year: number | null
          deletion_basis: Database["public"]["Enums"]["deletion_basis"] | null
          deletion_executed_at: string | null
          deletion_notes: string | null
          deletion_requested_at: string | null
          deletion_requested_by: string | null
          display_name: string | null
          endonym_language_id: string | null
          endonym_name: string | null
          id: string
          internal_notes: string | null
          is_minor: boolean | null
          legal_first_name: string | null
          legal_last_name: string | null
          personal_email_hash: string | null
          personal_phone_hash: string | null
          preferred_communication_language_id: string | null
          preferred_name: string | null
          primary_community_id: string | null
          primary_consent_id: string | null
          primary_organization_id: string | null
          primary_place_id: string | null
          professional_email: string | null
          professional_phone: string | null
          pronouns: string | null
          record_created_at: string | null
          record_created_by: string
          record_last_modified_at: string | null
          record_last_modified_by: string | null
          record_status: Database["public"]["Enums"]["person_record_status"]
          relationship_types: string[] | null
          self_described_identity: string | null
          spoken_language_ids: string[] | null
        }
        Insert: {
          birth_year?: number | null
          deletion_basis?: Database["public"]["Enums"]["deletion_basis"] | null
          deletion_executed_at?: string | null
          deletion_notes?: string | null
          deletion_requested_at?: string | null
          deletion_requested_by?: string | null
          display_name?: string | null
          endonym_language_id?: string | null
          endonym_name?: string | null
          id?: string
          internal_notes?: string | null
          is_minor?: boolean | null
          legal_first_name?: string | null
          legal_last_name?: string | null
          personal_email_hash?: string | null
          personal_phone_hash?: string | null
          preferred_communication_language_id?: string | null
          preferred_name?: string | null
          primary_community_id?: string | null
          primary_consent_id?: string | null
          primary_organization_id?: string | null
          primary_place_id?: string | null
          professional_email?: string | null
          professional_phone?: string | null
          pronouns?: string | null
          record_created_at?: string | null
          record_created_by: string
          record_last_modified_at?: string | null
          record_last_modified_by?: string | null
          record_status?: Database["public"]["Enums"]["person_record_status"]
          relationship_types?: string[] | null
          self_described_identity?: string | null
          spoken_language_ids?: string[] | null
        }
        Update: {
          birth_year?: number | null
          deletion_basis?: Database["public"]["Enums"]["deletion_basis"] | null
          deletion_executed_at?: string | null
          deletion_notes?: string | null
          deletion_requested_at?: string | null
          deletion_requested_by?: string | null
          display_name?: string | null
          endonym_language_id?: string | null
          endonym_name?: string | null
          id?: string
          internal_notes?: string | null
          is_minor?: boolean | null
          legal_first_name?: string | null
          legal_last_name?: string | null
          personal_email_hash?: string | null
          personal_phone_hash?: string | null
          preferred_communication_language_id?: string | null
          preferred_name?: string | null
          primary_community_id?: string | null
          primary_consent_id?: string | null
          primary_organization_id?: string | null
          primary_place_id?: string | null
          professional_email?: string | null
          professional_phone?: string | null
          pronouns?: string | null
          record_created_at?: string | null
          record_created_by?: string
          record_last_modified_at?: string | null
          record_last_modified_by?: string | null
          record_status?: Database["public"]["Enums"]["person_record_status"]
          relationship_types?: string[] | null
          self_described_identity?: string | null
          spoken_language_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_people_consent"
            columns: ["primary_consent_id"]
            isOneToOne: false
            referencedRelation: "consent_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_endonym_language_id_fkey"
            columns: ["endonym_language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_preferred_communication_language_id_fkey"
            columns: ["preferred_communication_language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_primary_community_id_fkey"
            columns: ["primary_community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_primary_organization_id_fkey"
            columns: ["primary_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_primary_place_id_fkey"
            columns: ["primary_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      person_roles: {
        Row: {
          community_id: string | null
          created_at: string | null
          decision_authority_notes: string | null
          id: string
          internal_relationship_owner: string | null
          is_primary: boolean | null
          notes: string | null
          organization_id: string | null
          person_id: string
          program_id: string | null
          role_ended: string | null
          role_started: string | null
          role_title: string | null
          role_type: string
          speaks_on_behalf_of: string[] | null
        }
        Insert: {
          community_id?: string | null
          created_at?: string | null
          decision_authority_notes?: string | null
          id?: string
          internal_relationship_owner?: string | null
          is_primary?: boolean | null
          notes?: string | null
          organization_id?: string | null
          person_id: string
          program_id?: string | null
          role_ended?: string | null
          role_started?: string | null
          role_title?: string | null
          role_type: string
          speaks_on_behalf_of?: string[] | null
        }
        Update: {
          community_id?: string | null
          created_at?: string | null
          decision_authority_notes?: string | null
          id?: string
          internal_relationship_owner?: string | null
          is_primary?: boolean | null
          notes?: string | null
          organization_id?: string | null
          person_id?: string
          program_id?: string | null
          role_ended?: string | null
          role_started?: string | null
          role_title?: string | null
          role_type?: string
          speaks_on_behalf_of?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "person_roles_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_roles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "pending_person_deletions"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "person_roles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_roles_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      place_cultural_calendar: {
        Row: {
          affects_school_calendar: boolean | null
          affects_shipping: boolean | null
          calendar_basis: string | null
          created_at: string | null
          duration_days: number | null
          event_name: string
          event_name_local: string | null
          event_type: string | null
          id: string
          is_business_holiday: boolean | null
          is_movable: boolean | null
          is_storytelling_associated: boolean | null
          notes: string | null
          place_id: string
          significance_to_diaspora: string | null
          source_id: string | null
          typical_day: number | null
          typical_month: number | null
        }
        Insert: {
          affects_school_calendar?: boolean | null
          affects_shipping?: boolean | null
          calendar_basis?: string | null
          created_at?: string | null
          duration_days?: number | null
          event_name: string
          event_name_local?: string | null
          event_type?: string | null
          id?: string
          is_business_holiday?: boolean | null
          is_movable?: boolean | null
          is_storytelling_associated?: boolean | null
          notes?: string | null
          place_id: string
          significance_to_diaspora?: string | null
          source_id?: string | null
          typical_day?: number | null
          typical_month?: number | null
        }
        Update: {
          affects_school_calendar?: boolean | null
          affects_shipping?: boolean | null
          calendar_basis?: string | null
          created_at?: string | null
          duration_days?: number | null
          event_name?: string
          event_name_local?: string | null
          event_type?: string | null
          id?: string
          is_business_holiday?: boolean | null
          is_movable?: boolean | null
          is_storytelling_associated?: boolean | null
          notes?: string | null
          place_id?: string
          significance_to_diaspora?: string | null
          source_id?: string | null
          typical_day?: number | null
          typical_month?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "place_cultural_calendar_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_cultural_calendar_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      place_demographics: {
        Row: {
          assessment_date: string
          confidence: Database["public"]["Enums"]["confidence_level"]
          created_at: string | null
          data_year: number | null
          gini_coefficient: number | null
          id: string
          life_expectancy_years: number | null
          median_fixed_speed_mbps: number | null
          median_household_income_usd: number | null
          median_mobile_speed_mbps: number | null
          notes: string | null
          pct_below_poverty_line: number | null
          pct_completed_secondary: number | null
          pct_completed_tertiary: number | null
          pct_literate_adults: number | null
          pct_rural: number | null
          pct_urban: number | null
          pct_with_internet_access: number | null
          pct_with_reliable_electricity: number | null
          pct_with_smartphone: number | null
          place_id: string
          population_18_to_65: number | null
          population_5_to_18: number | null
          population_65_plus: number | null
          population_total: number | null
          population_under_5: number | null
          source_id: string | null
          under_5_mortality_per_1000: number | null
        }
        Insert: {
          assessment_date: string
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string | null
          data_year?: number | null
          gini_coefficient?: number | null
          id?: string
          life_expectancy_years?: number | null
          median_fixed_speed_mbps?: number | null
          median_household_income_usd?: number | null
          median_mobile_speed_mbps?: number | null
          notes?: string | null
          pct_below_poverty_line?: number | null
          pct_completed_secondary?: number | null
          pct_completed_tertiary?: number | null
          pct_literate_adults?: number | null
          pct_rural?: number | null
          pct_urban?: number | null
          pct_with_internet_access?: number | null
          pct_with_reliable_electricity?: number | null
          pct_with_smartphone?: number | null
          place_id: string
          population_18_to_65?: number | null
          population_5_to_18?: number | null
          population_65_plus?: number | null
          population_total?: number | null
          population_under_5?: number | null
          source_id?: string | null
          under_5_mortality_per_1000?: number | null
        }
        Update: {
          assessment_date?: string
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string | null
          data_year?: number | null
          gini_coefficient?: number | null
          id?: string
          life_expectancy_years?: number | null
          median_fixed_speed_mbps?: number | null
          median_household_income_usd?: number | null
          median_mobile_speed_mbps?: number | null
          notes?: string | null
          pct_below_poverty_line?: number | null
          pct_completed_secondary?: number | null
          pct_completed_tertiary?: number | null
          pct_literate_adults?: number | null
          pct_rural?: number | null
          pct_urban?: number | null
          pct_with_internet_access?: number | null
          pct_with_reliable_electricity?: number | null
          pct_with_smartphone?: number | null
          place_id?: string
          population_18_to_65?: number | null
          population_5_to_18?: number | null
          population_65_plus?: number | null
          population_total?: number | null
          population_under_5?: number | null
          source_id?: string | null
          under_5_mortality_per_1000?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "place_demographics_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_demographics_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      place_economic_indicators: {
        Row: {
          assessment_date: string
          big_mac_index_usd: number | null
          confidence: Database["public"]["Enums"]["confidence_level"]
          created_at: string | null
          credit_card_penetration_pct: number | null
          data_year: number | null
          digital_payment_penetration_pct: number | null
          ecommerce_penetration_pct: number | null
          gdp_per_capita_usd: number | null
          gdp_ppp_per_capita_usd: number | null
          gdp_usd: number | null
          id: string
          inflation_rate_pct: number | null
          median_book_price_usd: number | null
          notes: string | null
          place_id: string
          primary_currency_code: string | null
          primary_payment_methods: string[] | null
          secondary_currency_code: string | null
          source_id: string | null
          unemployment_rate_pct: number | null
        }
        Insert: {
          assessment_date: string
          big_mac_index_usd?: number | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string | null
          credit_card_penetration_pct?: number | null
          data_year?: number | null
          digital_payment_penetration_pct?: number | null
          ecommerce_penetration_pct?: number | null
          gdp_per_capita_usd?: number | null
          gdp_ppp_per_capita_usd?: number | null
          gdp_usd?: number | null
          id?: string
          inflation_rate_pct?: number | null
          median_book_price_usd?: number | null
          notes?: string | null
          place_id: string
          primary_currency_code?: string | null
          primary_payment_methods?: string[] | null
          secondary_currency_code?: string | null
          source_id?: string | null
          unemployment_rate_pct?: number | null
        }
        Update: {
          assessment_date?: string
          big_mac_index_usd?: number | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string | null
          credit_card_penetration_pct?: number | null
          data_year?: number | null
          digital_payment_penetration_pct?: number | null
          ecommerce_penetration_pct?: number | null
          gdp_per_capita_usd?: number | null
          gdp_ppp_per_capita_usd?: number | null
          gdp_usd?: number | null
          id?: string
          inflation_rate_pct?: number | null
          median_book_price_usd?: number | null
          notes?: string | null
          place_id?: string
          primary_currency_code?: string | null
          primary_payment_methods?: string[] | null
          secondary_currency_code?: string | null
          source_id?: string | null
          unemployment_rate_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "place_economic_indicators_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_economic_indicators_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      place_health_safety: {
        Row: {
          child_protection_infrastructure: string | null
          climate_vulnerability_index: number | null
          confidence: Database["public"]["Enums"]["confidence_level"]
          conflict_status: string | null
          created_at: string | null
          gender_safety_assessment: string | null
          id: string
          infant_mortality_per_1000: number | null
          life_expectancy_years: number | null
          mental_health_resources_available: string | null
          notes: string | null
          observation_year: number
          ongoing_health_emergencies: string[] | null
          pct_population_with_healthcare_access: number | null
          place_id: string
          political_stability_index: number | null
          press_freedom_index: number | null
          recent_climate_events: string[] | null
          source_id: string | null
          travel_advisory_level: string | null
        }
        Insert: {
          child_protection_infrastructure?: string | null
          climate_vulnerability_index?: number | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          conflict_status?: string | null
          created_at?: string | null
          gender_safety_assessment?: string | null
          id?: string
          infant_mortality_per_1000?: number | null
          life_expectancy_years?: number | null
          mental_health_resources_available?: string | null
          notes?: string | null
          observation_year: number
          ongoing_health_emergencies?: string[] | null
          pct_population_with_healthcare_access?: number | null
          place_id: string
          political_stability_index?: number | null
          press_freedom_index?: number | null
          recent_climate_events?: string[] | null
          source_id?: string | null
          travel_advisory_level?: string | null
        }
        Update: {
          child_protection_infrastructure?: string | null
          climate_vulnerability_index?: number | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          conflict_status?: string | null
          created_at?: string | null
          gender_safety_assessment?: string | null
          id?: string
          infant_mortality_per_1000?: number | null
          life_expectancy_years?: number | null
          mental_health_resources_available?: string | null
          notes?: string | null
          observation_year?: number
          ongoing_health_emergencies?: string[] | null
          pct_population_with_healthcare_access?: number | null
          place_id?: string
          political_stability_index?: number | null
          press_freedom_index?: number | null
          recent_climate_events?: string[] | null
          source_id?: string | null
          travel_advisory_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_health_safety_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_health_safety_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      place_infrastructure: {
        Row: {
          assessment_date: string
          confidence: Database["public"]["Enums"]["confidence_level"]
          created_at: string | null
          customs_complexity: string | null
          customs_data_protection_concerns: boolean | null
          data_year: number | null
          electricity_reliability: string | null
          id: string
          international_shipping_days_avg: number | null
          internet_penetration_pct: number | null
          mobile_penetration_pct: number | null
          mother_tongue_education_status: string | null
          notes: string | null
          place_id: string
          postal_reliability: string | null
          primary_school_enrollment_pct: number | null
          print_on_demand_partners_available: string[] | null
          secondary_school_enrollment_pct: number | null
          shipping_carriers_available: string[] | null
          smartphone_penetration_pct: number | null
          source_id: string | null
        }
        Insert: {
          assessment_date: string
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string | null
          customs_complexity?: string | null
          customs_data_protection_concerns?: boolean | null
          data_year?: number | null
          electricity_reliability?: string | null
          id?: string
          international_shipping_days_avg?: number | null
          internet_penetration_pct?: number | null
          mobile_penetration_pct?: number | null
          mother_tongue_education_status?: string | null
          notes?: string | null
          place_id: string
          postal_reliability?: string | null
          primary_school_enrollment_pct?: number | null
          print_on_demand_partners_available?: string[] | null
          secondary_school_enrollment_pct?: number | null
          shipping_carriers_available?: string[] | null
          smartphone_penetration_pct?: number | null
          source_id?: string | null
        }
        Update: {
          assessment_date?: string
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string | null
          customs_complexity?: string | null
          customs_data_protection_concerns?: boolean | null
          data_year?: number | null
          electricity_reliability?: string | null
          id?: string
          international_shipping_days_avg?: number | null
          internet_penetration_pct?: number | null
          mobile_penetration_pct?: number | null
          mother_tongue_education_status?: string | null
          notes?: string | null
          place_id?: string
          postal_reliability?: string | null
          primary_school_enrollment_pct?: number | null
          print_on_demand_partners_available?: string[] | null
          secondary_school_enrollment_pct?: number | null
          shipping_carriers_available?: string[] | null
          smartphone_penetration_pct?: number | null
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_infrastructure_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_infrastructure_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      place_regulatory_environment: {
        Row: {
          age_of_digital_consent: number | null
          assessment_date: string
          child_data_protection_law: string | null
          confidence: Database["public"]["Enums"]["confidence_level"]
          content_restriction_level: string | null
          copyright_term_years: number | null
          created_at: string | null
          data_protection_law_url: string | null
          educational_content_approval_required: boolean | null
          foreign_funding_restrictions: string | null
          foreign_nonprofit_registration_required: boolean | null
          has_indigenous_data_sovereignty_law: boolean | null
          id: string
          indigenous_recognition_status: string | null
          language_content_restrictions: string | null
          notes: string | null
          place_id: string
          primary_data_protection_law: string | null
          source_id: string | null
          trademark_office: string | null
        }
        Insert: {
          age_of_digital_consent?: number | null
          assessment_date: string
          child_data_protection_law?: string | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          content_restriction_level?: string | null
          copyright_term_years?: number | null
          created_at?: string | null
          data_protection_law_url?: string | null
          educational_content_approval_required?: boolean | null
          foreign_funding_restrictions?: string | null
          foreign_nonprofit_registration_required?: boolean | null
          has_indigenous_data_sovereignty_law?: boolean | null
          id?: string
          indigenous_recognition_status?: string | null
          language_content_restrictions?: string | null
          notes?: string | null
          place_id: string
          primary_data_protection_law?: string | null
          source_id?: string | null
          trademark_office?: string | null
        }
        Update: {
          age_of_digital_consent?: number | null
          assessment_date?: string
          child_data_protection_law?: string | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          content_restriction_level?: string | null
          copyright_term_years?: number | null
          created_at?: string | null
          data_protection_law_url?: string | null
          educational_content_approval_required?: boolean | null
          foreign_funding_restrictions?: string | null
          foreign_nonprofit_registration_required?: boolean | null
          has_indigenous_data_sovereignty_law?: boolean | null
          id?: string
          indigenous_recognition_status?: string | null
          language_content_restrictions?: string | null
          notes?: string | null
          place_id?: string
          primary_data_protection_law?: string | null
          source_id?: string | null
          trademark_office?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_regulatory_environment_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_regulatory_environment_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          alternate_names: string[] | null
          area_sq_km: number | null
          climate_zone: Database["public"]["Enums"]["climate_zone"] | null
          community_designated_by_id: string | null
          created_at: string | null
          endonym: string | null
          endonym_language_id: string | null
          english_name: string
          fips_code: string | null
          geonames_id: string | null
          geonames_last_synced: string | null
          geonames_validated: boolean | null
          governance_type: Database["public"]["Enums"]["governance_type"] | null
          granularity: Database["public"]["Enums"]["place_granularity"]
          id: string
          iso_3166_1_alpha2: string | null
          iso_3166_1_alpha3: string | null
          iso_3166_2: string | null
          latitude: number | null
          longitude: number | null
          native_land_ca_id: string | null
          notes: string | null
          osm_relation_id: string | null
          parent_place_id: string | null
          primary_languages_used: string[] | null
          primary_timezone: string | null
          status: Database["public"]["Enums"]["place_status"] | null
          territory_recognition:
            | Database["public"]["Enums"]["territory_recognition"]
            | null
          un_m49_code: string | null
          updated_at: string | null
          wikidata_id: string | null
        }
        Insert: {
          alternate_names?: string[] | null
          area_sq_km?: number | null
          climate_zone?: Database["public"]["Enums"]["climate_zone"] | null
          community_designated_by_id?: string | null
          created_at?: string | null
          endonym?: string | null
          endonym_language_id?: string | null
          english_name: string
          fips_code?: string | null
          geonames_id?: string | null
          geonames_last_synced?: string | null
          geonames_validated?: boolean | null
          governance_type?:
            | Database["public"]["Enums"]["governance_type"]
            | null
          granularity: Database["public"]["Enums"]["place_granularity"]
          id?: string
          iso_3166_1_alpha2?: string | null
          iso_3166_1_alpha3?: string | null
          iso_3166_2?: string | null
          latitude?: number | null
          longitude?: number | null
          native_land_ca_id?: string | null
          notes?: string | null
          osm_relation_id?: string | null
          parent_place_id?: string | null
          primary_languages_used?: string[] | null
          primary_timezone?: string | null
          status?: Database["public"]["Enums"]["place_status"] | null
          territory_recognition?:
            | Database["public"]["Enums"]["territory_recognition"]
            | null
          un_m49_code?: string | null
          updated_at?: string | null
          wikidata_id?: string | null
        }
        Update: {
          alternate_names?: string[] | null
          area_sq_km?: number | null
          climate_zone?: Database["public"]["Enums"]["climate_zone"] | null
          community_designated_by_id?: string | null
          created_at?: string | null
          endonym?: string | null
          endonym_language_id?: string | null
          english_name?: string
          fips_code?: string | null
          geonames_id?: string | null
          geonames_last_synced?: string | null
          geonames_validated?: boolean | null
          governance_type?:
            | Database["public"]["Enums"]["governance_type"]
            | null
          granularity?: Database["public"]["Enums"]["place_granularity"]
          id?: string
          iso_3166_1_alpha2?: string | null
          iso_3166_1_alpha3?: string | null
          iso_3166_2?: string | null
          latitude?: number | null
          longitude?: number | null
          native_land_ca_id?: string | null
          notes?: string | null
          osm_relation_id?: string | null
          parent_place_id?: string | null
          primary_languages_used?: string[] | null
          primary_timezone?: string | null
          status?: Database["public"]["Enums"]["place_status"] | null
          territory_recognition?:
            | Database["public"]["Enums"]["territory_recognition"]
            | null
          un_m49_code?: string | null
          updated_at?: string | null
          wikidata_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_places_community_designated_by"
            columns: ["community_designated_by_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_endonym_language_id_fkey"
            columns: ["endonym_language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_parent_place_id_fkey"
            columns: ["parent_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      product_status: {
        Row: {
          actual_launch_date: string | null
          created_at: string | null
          id: string
          language_id: string
          notes: string | null
          product: string
          rationale: string | null
          status: string
          target_launch_date: string | null
          updated_at: string | null
          wave: string | null
        }
        Insert: {
          actual_launch_date?: string | null
          created_at?: string | null
          id?: string
          language_id: string
          notes?: string | null
          product: string
          rationale?: string | null
          status?: string
          target_launch_date?: string | null
          updated_at?: string | null
          wave?: string | null
        }
        Update: {
          actual_launch_date?: string | null
          created_at?: string | null
          id?: string
          language_id?: string
          notes?: string | null
          product?: string
          rationale?: string | null
          status?: string
          target_launch_date?: string | null
          updated_at?: string | null
          wave?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_status_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          app_store_urls: Json | null
          concept_date: string | null
          created_at: string | null
          current_language_ids: string[] | null
          current_place_ids: string[] | null
          current_stage: Database["public"]["Enums"]["product_lifecycle_stage"]
          description: string
          first_user_date: string | null
          id: string
          is_mission_aligned: boolean | null
          is_revenue_generating: boolean | null
          notes: string | null
          pricing_model: string | null
          pricing_notes: string | null
          primary_audiences: string[] | null
          primary_codebase_repo: string | null
          primary_hosting_provider: string | null
          product_name: string
          product_owner: string
          product_slug: string
          product_team: string[] | null
          product_type: string | null
          public_launch_date: string | null
          public_url: string | null
          stage_entered_at: string | null
          sunset_date: string | null
          updated_at: string | null
        }
        Insert: {
          app_store_urls?: Json | null
          concept_date?: string | null
          created_at?: string | null
          current_language_ids?: string[] | null
          current_place_ids?: string[] | null
          current_stage?: Database["public"]["Enums"]["product_lifecycle_stage"]
          description: string
          first_user_date?: string | null
          id?: string
          is_mission_aligned?: boolean | null
          is_revenue_generating?: boolean | null
          notes?: string | null
          pricing_model?: string | null
          pricing_notes?: string | null
          primary_audiences?: string[] | null
          primary_codebase_repo?: string | null
          primary_hosting_provider?: string | null
          product_name: string
          product_owner: string
          product_slug: string
          product_team?: string[] | null
          product_type?: string | null
          public_launch_date?: string | null
          public_url?: string | null
          stage_entered_at?: string | null
          sunset_date?: string | null
          updated_at?: string | null
        }
        Update: {
          app_store_urls?: Json | null
          concept_date?: string | null
          created_at?: string | null
          current_language_ids?: string[] | null
          current_place_ids?: string[] | null
          current_stage?: Database["public"]["Enums"]["product_lifecycle_stage"]
          description?: string
          first_user_date?: string | null
          id?: string
          is_mission_aligned?: boolean | null
          is_revenue_generating?: boolean | null
          notes?: string | null
          pricing_model?: string | null
          pricing_notes?: string | null
          primary_audiences?: string[] | null
          primary_codebase_repo?: string | null
          primary_hosting_provider?: string | null
          product_name?: string
          product_owner?: string
          product_slug?: string
          product_team?: string[] | null
          product_type?: string | null
          public_launch_date?: string | null
          public_url?: string | null
          stage_entered_at?: string | null
          sunset_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          actual_end_date: string | null
          actual_spend_to_date_usd: number | null
          actual_start_date: string | null
          approved_budget_usd: number | null
          asana_project_url: string | null
          created_at: string | null
          current_health_status: string | null
          decisions_pending: string[] | null
          description: string
          drive_folder_url: string | null
          funding_source_ids: string[] | null
          github_repo: string | null
          health_assessment_notes: string | null
          health_last_assessed: string | null
          hypotheses_being_tested: string[] | null
          id: string
          notes: string | null
          notion_workspace_url: string | null
          partner_organization_ids: string[] | null
          planned_end_date: string | null
          planned_start_date: string | null
          primary_objectives: string[] | null
          program_code: string | null
          program_name: string
          program_owner: string
          program_team: string[] | null
          program_type: string | null
          related_product_id: string | null
          status: Database["public"]["Enums"]["program_status"]
          steering_committee: string[] | null
          success_criteria: string[] | null
          target_community_ids: string[] | null
          target_language_ids: string[] | null
          target_place_ids: string[] | null
          updated_at: string | null
        }
        Insert: {
          actual_end_date?: string | null
          actual_spend_to_date_usd?: number | null
          actual_start_date?: string | null
          approved_budget_usd?: number | null
          asana_project_url?: string | null
          created_at?: string | null
          current_health_status?: string | null
          decisions_pending?: string[] | null
          description: string
          drive_folder_url?: string | null
          funding_source_ids?: string[] | null
          github_repo?: string | null
          health_assessment_notes?: string | null
          health_last_assessed?: string | null
          hypotheses_being_tested?: string[] | null
          id?: string
          notes?: string | null
          notion_workspace_url?: string | null
          partner_organization_ids?: string[] | null
          planned_end_date?: string | null
          planned_start_date?: string | null
          primary_objectives?: string[] | null
          program_code?: string | null
          program_name: string
          program_owner: string
          program_team?: string[] | null
          program_type?: string | null
          related_product_id?: string | null
          status?: Database["public"]["Enums"]["program_status"]
          steering_committee?: string[] | null
          success_criteria?: string[] | null
          target_community_ids?: string[] | null
          target_language_ids?: string[] | null
          target_place_ids?: string[] | null
          updated_at?: string | null
        }
        Update: {
          actual_end_date?: string | null
          actual_spend_to_date_usd?: number | null
          actual_start_date?: string | null
          approved_budget_usd?: number | null
          asana_project_url?: string | null
          created_at?: string | null
          current_health_status?: string | null
          decisions_pending?: string[] | null
          description?: string
          drive_folder_url?: string | null
          funding_source_ids?: string[] | null
          github_repo?: string | null
          health_assessment_notes?: string | null
          health_last_assessed?: string | null
          hypotheses_being_tested?: string[] | null
          id?: string
          notes?: string | null
          notion_workspace_url?: string | null
          partner_organization_ids?: string[] | null
          planned_end_date?: string | null
          planned_start_date?: string | null
          primary_objectives?: string[] | null
          program_code?: string | null
          program_name?: string
          program_owner?: string
          program_team?: string[] | null
          program_type?: string | null
          related_product_id?: string | null
          status?: Database["public"]["Enums"]["program_status"]
          steering_committee?: string[] | null
          success_criteria?: string[] | null
          target_community_ids?: string[] | null
          target_language_ids?: string[] | null
          target_place_ids?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_programs_product"
            columns: ["related_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          abstract: string | null
          arxiv_id: string | null
          authors: string[] | null
          citation_count: number | null
          citation_count_last_checked: string | null
          created_at: string | null
          doi: string | null
          id: string
          internal_summary_url: string | null
          is_canonical_in_field: boolean | null
          isbn: string | null
          key_findings_summary: string | null
          notes: string | null
          publication_date: string
          publication_type: string | null
          read_by_tomorrowlabs: boolean | null
          read_by_whom: string | null
          related_language_ids: string[] | null
          related_organization_ids: string[] | null
          related_place_ids: string[] | null
          relevance_to_tomorrowlabs: string | null
          source_id: string | null
          title: string
          topic_areas: string[] | null
          url: string | null
          venue: string | null
        }
        Insert: {
          abstract?: string | null
          arxiv_id?: string | null
          authors?: string[] | null
          citation_count?: number | null
          citation_count_last_checked?: string | null
          created_at?: string | null
          doi?: string | null
          id?: string
          internal_summary_url?: string | null
          is_canonical_in_field?: boolean | null
          isbn?: string | null
          key_findings_summary?: string | null
          notes?: string | null
          publication_date: string
          publication_type?: string | null
          read_by_tomorrowlabs?: boolean | null
          read_by_whom?: string | null
          related_language_ids?: string[] | null
          related_organization_ids?: string[] | null
          related_place_ids?: string[] | null
          relevance_to_tomorrowlabs?: string | null
          source_id?: string | null
          title: string
          topic_areas?: string[] | null
          url?: string | null
          venue?: string | null
        }
        Update: {
          abstract?: string | null
          arxiv_id?: string | null
          authors?: string[] | null
          citation_count?: number | null
          citation_count_last_checked?: string | null
          created_at?: string | null
          doi?: string | null
          id?: string
          internal_summary_url?: string | null
          is_canonical_in_field?: boolean | null
          isbn?: string | null
          key_findings_summary?: string | null
          notes?: string | null
          publication_date?: string
          publication_type?: string | null
          read_by_tomorrowlabs?: boolean | null
          read_by_whom?: string | null
          related_language_ids?: string[] | null
          related_organization_ids?: string[] | null
          related_place_ids?: string[] | null
          relevance_to_tomorrowlabs?: string | null
          source_id?: string | null
          title?: string
          topic_areas?: string[] | null
          url?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publications_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_identifiers: {
        Row: {
          id: string
          identifier: string
          language_id: string
          notes: string | null
          system_name: string
          url: string | null
        }
        Insert: {
          id?: string
          identifier: string
          language_id: string
          notes?: string | null
          system_name: string
          url?: string | null
        }
        Update: {
          id?: string
          identifier?: string
          language_id?: string
          notes?: string | null
          system_name?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reference_identifiers_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      regulatory_events: {
        Row: {
          affected_domain: string | null
          affects_communities: string | null
          affects_partners: boolean | null
          affects_tomorrowlabs: boolean | null
          citation: string | null
          compliance_deadline: string | null
          compliance_owner: string | null
          compliance_required: boolean | null
          compliance_status: string | null
          created_at: string | null
          event_date: string
          event_name: string
          event_type: string | null
          id: string
          notes: string | null
          partner_impact_notes: string | null
          place_id: string
          source_id: string | null
          summary: string
          url: string | null
        }
        Insert: {
          affected_domain?: string | null
          affects_communities?: string | null
          affects_partners?: boolean | null
          affects_tomorrowlabs?: boolean | null
          citation?: string | null
          compliance_deadline?: string | null
          compliance_owner?: string | null
          compliance_required?: boolean | null
          compliance_status?: string | null
          created_at?: string | null
          event_date: string
          event_name: string
          event_type?: string | null
          id?: string
          notes?: string | null
          partner_impact_notes?: string | null
          place_id: string
          source_id?: string | null
          summary: string
          url?: string | null
        }
        Update: {
          affected_domain?: string | null
          affects_communities?: string | null
          affects_partners?: boolean | null
          affects_tomorrowlabs?: boolean | null
          citation?: string | null
          compliance_deadline?: string | null
          compliance_owner?: string | null
          compliance_required?: boolean | null
          compliance_status?: string | null
          created_at?: string | null
          event_date?: string
          event_name?: string
          event_type?: string | null
          id?: string
          notes?: string | null
          partner_impact_notes?: string | null
          place_id?: string
          source_id?: string | null
          summary?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "regulatory_events_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regulatory_events_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      revitalization_programs: {
        Row: {
          contact_info: string | null
          country_code: string | null
          created_at: string | null
          end_year: number | null
          funding_sources: string[] | null
          id: string
          is_potential_partner: boolean | null
          language_id: string
          last_reviewed: string | null
          notes: string | null
          organization: string | null
          participant_count: number | null
          partnership_notes: string | null
          program_name: string | null
          program_type: string | null
          region: string | null
          source_id: string | null
          start_year: number | null
          url: string | null
        }
        Insert: {
          contact_info?: string | null
          country_code?: string | null
          created_at?: string | null
          end_year?: number | null
          funding_sources?: string[] | null
          id?: string
          is_potential_partner?: boolean | null
          language_id: string
          last_reviewed?: string | null
          notes?: string | null
          organization?: string | null
          participant_count?: number | null
          partnership_notes?: string | null
          program_name?: string | null
          program_type?: string | null
          region?: string | null
          source_id?: string | null
          start_year?: number | null
          url?: string | null
        }
        Update: {
          contact_info?: string | null
          country_code?: string | null
          created_at?: string | null
          end_year?: number | null
          funding_sources?: string[] | null
          id?: string
          is_potential_partner?: boolean | null
          language_id?: string
          last_reviewed?: string | null
          notes?: string | null
          organization?: string | null
          participant_count?: number | null
          partnership_notes?: string | null
          program_name?: string | null
          program_type?: string | null
          region?: string | null
          source_id?: string | null
          start_year?: number | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revitalization_programs_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revitalization_programs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      revitalization_summary: {
        Row: {
          assessment_date: string
          community_attitude: string | null
          confidence: Database["public"]["Enums"]["confidence_level"]
          generational_attitude_gap: string | null
          id: string
          language_id: string
          notes: string | null
          overall_level: Database["public"]["Enums"]["revitalization_level"]
          source_id: string | null
        }
        Insert: {
          assessment_date: string
          community_attitude?: string | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          generational_attitude_gap?: string | null
          id?: string
          language_id: string
          notes?: string | null
          overall_level: Database["public"]["Enums"]["revitalization_level"]
          source_id?: string | null
        }
        Update: {
          assessment_date?: string
          community_attitude?: string | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          generational_attitude_gap?: string | null
          id?: string
          language_id?: string
          notes?: string | null
          overall_level?: Database["public"]["Enums"]["revitalization_level"]
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revitalization_summary_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revitalization_summary_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sector_events: {
        Row: {
          affects_tomorrowlabs_directly: boolean | null
          created_at: string | null
          decision_log_reference: string | null
          description: string
          event_date: string
          event_name: string
          event_type: string | null
          id: string
          impact_assessment: string | null
          notes: string | null
          primary_affected_languages: string[] | null
          primary_affected_organizations: string[] | null
          primary_affected_places: string[] | null
          related_publications: string[] | null
          significance: Database["public"]["Enums"]["event_significance"]
          source_id: string | null
          source_url: string | null
          tomorrowlabs_response_owner: string | null
          tomorrowlabs_response_taken: string | null
        }
        Insert: {
          affects_tomorrowlabs_directly?: boolean | null
          created_at?: string | null
          decision_log_reference?: string | null
          description: string
          event_date: string
          event_name: string
          event_type?: string | null
          id?: string
          impact_assessment?: string | null
          notes?: string | null
          primary_affected_languages?: string[] | null
          primary_affected_organizations?: string[] | null
          primary_affected_places?: string[] | null
          related_publications?: string[] | null
          significance: Database["public"]["Enums"]["event_significance"]
          source_id?: string | null
          source_url?: string | null
          tomorrowlabs_response_owner?: string | null
          tomorrowlabs_response_taken?: string | null
        }
        Update: {
          affects_tomorrowlabs_directly?: boolean | null
          created_at?: string | null
          decision_log_reference?: string | null
          description?: string
          event_date?: string
          event_name?: string
          event_type?: string | null
          id?: string
          impact_assessment?: string | null
          notes?: string | null
          primary_affected_languages?: string[] | null
          primary_affected_organizations?: string[] | null
          primary_affected_places?: string[] | null
          related_publications?: string[] | null
          significance?: Database["public"]["Enums"]["event_significance"]
          source_id?: string | null
          source_url?: string | null
          tomorrowlabs_response_owner?: string | null
          tomorrowlabs_response_taken?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sector_events_decision_log_reference_fkey"
            columns: ["decision_log_reference"]
            isOneToOne: false
            referencedRelation: "decision_log"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sector_events_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          accessed_date: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          reliability_rating: string | null
          type: string | null
          url: string | null
        }
        Insert: {
          accessed_date?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          reliability_rating?: string | null
          type?: string | null
          url?: string | null
        }
        Update: {
          accessed_date?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          reliability_rating?: string | null
          type?: string | null
          url?: string | null
        }
        Relationships: []
      }
      speaker_populations: {
        Row: {
          age_0_to_18_pct: number | null
          age_60_plus_pct: number | null
          confidence: Database["public"]["Enums"]["confidence_level"]
          context: string | null
          country_code: string
          created_at: string | null
          data_year: number | null
          heritage_speakers: number | null
          id: string
          l1_speakers: number | null
          l2_speakers: number | null
          language_id: string
          notes: string | null
          region: string | null
          source_id: string | null
          total_population_in_area: number | null
        }
        Insert: {
          age_0_to_18_pct?: number | null
          age_60_plus_pct?: number | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          context?: string | null
          country_code: string
          created_at?: string | null
          data_year?: number | null
          heritage_speakers?: number | null
          id?: string
          l1_speakers?: number | null
          l2_speakers?: number | null
          language_id: string
          notes?: string | null
          region?: string | null
          source_id?: string | null
          total_population_in_area?: number | null
        }
        Update: {
          age_0_to_18_pct?: number | null
          age_60_plus_pct?: number | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          context?: string | null
          country_code?: string
          created_at?: string | null
          data_year?: number | null
          heritage_speakers?: number | null
          id?: string
          l1_speakers?: number | null
          l2_speakers?: number | null
          language_id?: string
          notes?: string | null
          region?: string | null
          source_id?: string | null
          total_population_in_area?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "speaker_populations_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "speaker_populations_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          capacity_hours_per_week: number | null
          created_at: string | null
          end_date: string | null
          engagement_type: string | null
          fluent_language_ids: string[] | null
          focus_areas: string[] | null
          full_name: string
          id: string
          notes: string | null
          preferred_name: string | null
          primary_email: string | null
          primary_place_id: string | null
          pronouns: string | null
          reports_to: string | null
          role: string
          start_date: string | null
          team: string | null
          updated_at: string | null
        }
        Insert: {
          capacity_hours_per_week?: number | null
          created_at?: string | null
          end_date?: string | null
          engagement_type?: string | null
          fluent_language_ids?: string[] | null
          focus_areas?: string[] | null
          full_name: string
          id?: string
          notes?: string | null
          preferred_name?: string | null
          primary_email?: string | null
          primary_place_id?: string | null
          pronouns?: string | null
          reports_to?: string | null
          role: string
          start_date?: string | null
          team?: string | null
          updated_at?: string | null
        }
        Update: {
          capacity_hours_per_week?: number | null
          created_at?: string | null
          end_date?: string | null
          engagement_type?: string | null
          fluent_language_ids?: string[] | null
          focus_areas?: string[] | null
          full_name?: string
          id?: string
          notes?: string | null
          preferred_name?: string | null
          primary_email?: string | null
          primary_place_id?: string | null
          pronouns?: string | null
          reports_to?: string | null
          role?: string
          start_date?: string | null
          team?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_primary_place_id_fkey"
            columns: ["primary_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      tech_readiness: {
        Row: {
          assessed_at: string | null
          common_voice_dataset_version: string | null
          common_voice_hours_validated: number | null
          created_at: string | null
          font_availability: string | null
          id: string
          ipa_pipeline_notes: string | null
          ipa_pipeline_viable: boolean | null
          keyboard_support: string | null
          language_id: string
          notable_gaps: string | null
          notes: string | null
          omnilingual_cer: number | null
          omnilingual_supported: boolean | null
          rendering_complexity: string | null
          stt_quality_tier: Database["public"]["Enums"]["tech_quality_tier"]
          tts_quality_tier: Database["public"]["Enums"]["tech_quality_tier"]
          updated_at: string | null
        }
        Insert: {
          assessed_at?: string | null
          common_voice_dataset_version?: string | null
          common_voice_hours_validated?: number | null
          created_at?: string | null
          font_availability?: string | null
          id?: string
          ipa_pipeline_notes?: string | null
          ipa_pipeline_viable?: boolean | null
          keyboard_support?: string | null
          language_id: string
          notable_gaps?: string | null
          notes?: string | null
          omnilingual_cer?: number | null
          omnilingual_supported?: boolean | null
          rendering_complexity?: string | null
          stt_quality_tier?: Database["public"]["Enums"]["tech_quality_tier"]
          tts_quality_tier?: Database["public"]["Enums"]["tech_quality_tier"]
          updated_at?: string | null
        }
        Update: {
          assessed_at?: string | null
          common_voice_dataset_version?: string | null
          common_voice_hours_validated?: number | null
          created_at?: string | null
          font_availability?: string | null
          id?: string
          ipa_pipeline_notes?: string | null
          ipa_pipeline_viable?: boolean | null
          keyboard_support?: string | null
          language_id?: string
          notable_gaps?: string | null
          notes?: string | null
          omnilingual_cer?: number | null
          omnilingual_supported?: boolean | null
          rendering_complexity?: string | null
          stt_quality_tier?: Database["public"]["Enums"]["tech_quality_tier"]
          tts_quality_tier?: Database["public"]["Enums"]["tech_quality_tier"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tech_readiness_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: true
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      tech_readiness_history: {
        Row: {
          best_stt_provider: string | null
          best_tts_provider: string | null
          common_voice_hours_validated: number | null
          created_at: string | null
          id: string
          language_id: string
          notable_change: string | null
          notes: string | null
          observation_date: string
          omnilingual_cer: number | null
          significance: Database["public"]["Enums"]["event_significance"] | null
          source_id: string | null
          stt_quality_tier:
            | Database["public"]["Enums"]["tech_quality_tier"]
            | null
          stt_wer_conversational: number | null
          tts_quality_tier:
            | Database["public"]["Enums"]["tech_quality_tier"]
            | null
          tts_voice_count: number | null
        }
        Insert: {
          best_stt_provider?: string | null
          best_tts_provider?: string | null
          common_voice_hours_validated?: number | null
          created_at?: string | null
          id?: string
          language_id: string
          notable_change?: string | null
          notes?: string | null
          observation_date: string
          omnilingual_cer?: number | null
          significance?:
            | Database["public"]["Enums"]["event_significance"]
            | null
          source_id?: string | null
          stt_quality_tier?:
            | Database["public"]["Enums"]["tech_quality_tier"]
            | null
          stt_wer_conversational?: number | null
          tts_quality_tier?:
            | Database["public"]["Enums"]["tech_quality_tier"]
            | null
          tts_voice_count?: number | null
        }
        Update: {
          best_stt_provider?: string | null
          best_tts_provider?: string | null
          common_voice_hours_validated?: number | null
          created_at?: string | null
          id?: string
          language_id?: string
          notable_change?: string | null
          notes?: string | null
          observation_date?: string
          omnilingual_cer?: number | null
          significance?:
            | Database["public"]["Enums"]["event_significance"]
            | null
          source_id?: string | null
          stt_quality_tier?:
            | Database["public"]["Enums"]["tech_quality_tier"]
            | null
          stt_wer_conversational?: number | null
          tts_quality_tier?:
            | Database["public"]["Enums"]["tech_quality_tier"]
            | null
          tts_voice_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tech_readiness_history_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tech_readiness_history_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      text_corpora: {
        Row: {
          confidence: Database["public"]["Enums"]["confidence_level"]
          corpus_name: string
          created_at: string | null
          hf_dataset_id: string | null
          id: string
          language_id: string
          license: string | null
          notes: string | null
          sentence_count: number | null
          source_id: string
          task_type: string
          url: string | null
        }
        Insert: {
          confidence?: Database["public"]["Enums"]["confidence_level"]
          corpus_name: string
          created_at?: string | null
          hf_dataset_id?: string | null
          id?: string
          language_id: string
          license?: string | null
          notes?: string | null
          sentence_count?: number | null
          source_id: string
          task_type: string
          url?: string | null
        }
        Update: {
          confidence?: Database["public"]["Enums"]["confidence_level"]
          corpus_name?: string
          created_at?: string | null
          hf_dataset_id?: string | null
          id?: string
          language_id?: string
          license?: string | null
          notes?: string | null
          sentence_count?: number | null
          source_id?: string
          task_type?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "text_corpora_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "text_corpora_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      transmission_assessments: {
        Row: {
          acquisition_status: string | null
          assessment_date: string
          community_identifier: string | null
          confidence: Database["public"]["Enums"]["confidence_level"]
          country_code: string | null
          created_at: string | null
          id: string
          language_id: string
          median_fluent_speaker_age: number | null
          methodology: string | null
          notes: string | null
          pct_18_to_40_fluent: number | null
          pct_40_to_60_fluent: number | null
          pct_5_to_18_fluent: number | null
          pct_60_plus_fluent: number | null
          pct_under_5_with_l1: number | null
          region: string | null
          source_id: string | null
          trajectory: string | null
          trajectory_confidence:
            | Database["public"]["Enums"]["confidence_level"]
            | null
          youngest_fluent_speaker_age: number | null
        }
        Insert: {
          acquisition_status?: string | null
          assessment_date: string
          community_identifier?: string | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          country_code?: string | null
          created_at?: string | null
          id?: string
          language_id: string
          median_fluent_speaker_age?: number | null
          methodology?: string | null
          notes?: string | null
          pct_18_to_40_fluent?: number | null
          pct_40_to_60_fluent?: number | null
          pct_5_to_18_fluent?: number | null
          pct_60_plus_fluent?: number | null
          pct_under_5_with_l1?: number | null
          region?: string | null
          source_id?: string | null
          trajectory?: string | null
          trajectory_confidence?:
            | Database["public"]["Enums"]["confidence_level"]
            | null
          youngest_fluent_speaker_age?: number | null
        }
        Update: {
          acquisition_status?: string | null
          assessment_date?: string
          community_identifier?: string | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          country_code?: string | null
          created_at?: string | null
          id?: string
          language_id?: string
          median_fluent_speaker_age?: number | null
          methodology?: string | null
          notes?: string | null
          pct_18_to_40_fluent?: number | null
          pct_40_to_60_fluent?: number | null
          pct_5_to_18_fluent?: number | null
          pct_60_plus_fluent?: number | null
          pct_under_5_with_l1?: number | null
          region?: string | null
          source_id?: string | null
          trajectory?: string | null
          trajectory_confidence?:
            | Database["public"]["Enums"]["confidence_level"]
            | null
          youngest_fluent_speaker_age?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transmission_assessments_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transmission_assessments_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      user_households: {
        Row: {
          babagigi_book_count: number | null
          created_at: string | null
          current_place_id: string | null
          diaspora_origin_place_id: string | null
          heritage_language_ids: string[] | null
          household_name: string | null
          id: string
          last_active_date: string | null
          number_of_generations: number | null
          primary_user_id: string
        }
        Insert: {
          babagigi_book_count?: number | null
          created_at?: string | null
          current_place_id?: string | null
          diaspora_origin_place_id?: string | null
          heritage_language_ids?: string[] | null
          household_name?: string | null
          id?: string
          last_active_date?: string | null
          number_of_generations?: number | null
          primary_user_id: string
        }
        Update: {
          babagigi_book_count?: number | null
          created_at?: string | null
          current_place_id?: string | null
          diaspora_origin_place_id?: string | null
          heritage_language_ids?: string[] | null
          household_name?: string | null
          id?: string
          last_active_date?: string | null
          number_of_generations?: number | null
          primary_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_households_current_place_id_fkey"
            columns: ["current_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_households_diaspora_origin_place_id_fkey"
            columns: ["diaspora_origin_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_households_primary_user_id_fkey"
            columns: ["primary_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_created_at: string | null
          account_handle: string | null
          account_role: string | null
          account_status: string | null
          account_visibility: string | null
          content_language_ids: string[] | null
          declared_country_place_id: string | null
          email_hashed: string | null
          id: string
          marketing_communications_allowed: boolean | null
          notes: string | null
          primary_consent_id: string | null
          primary_product_id: string | null
          research_participation_allowed: boolean | null
          ui_language_id: string | null
          updated_at: string | null
        }
        Insert: {
          account_created_at?: string | null
          account_handle?: string | null
          account_role?: string | null
          account_status?: string | null
          account_visibility?: string | null
          content_language_ids?: string[] | null
          declared_country_place_id?: string | null
          email_hashed?: string | null
          id?: string
          marketing_communications_allowed?: boolean | null
          notes?: string | null
          primary_consent_id?: string | null
          primary_product_id?: string | null
          research_participation_allowed?: boolean | null
          ui_language_id?: string | null
          updated_at?: string | null
        }
        Update: {
          account_created_at?: string | null
          account_handle?: string | null
          account_role?: string | null
          account_status?: string | null
          account_visibility?: string | null
          content_language_ids?: string[] | null
          declared_country_place_id?: string | null
          email_hashed?: string | null
          id?: string
          marketing_communications_allowed?: boolean | null
          notes?: string | null
          primary_consent_id?: string | null
          primary_product_id?: string | null
          research_participation_allowed?: boolean | null
          ui_language_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_declared_country_place_id_fkey"
            columns: ["declared_country_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_primary_consent_id_fkey"
            columns: ["primary_consent_id"]
            isOneToOne: false
            referencedRelation: "consent_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_primary_product_id_fkey"
            columns: ["primary_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_ui_language_id_fkey"
            columns: ["ui_language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      vitality_assessments: {
        Row: {
          assessment_date: string
          assessment_scope: string | null
          confidence: Database["public"]["Enums"]["confidence_level"]
          created_at: string | null
          egids_level: Database["public"]["Enums"]["egids_level"] | null
          elp_status: Database["public"]["Enums"]["elp_status"] | null
          id: string
          language_id: string
          notes: string | null
          rationale: string | null
          source_id: string | null
          unesco_vitality: Database["public"]["Enums"]["unesco_vitality"] | null
        }
        Insert: {
          assessment_date: string
          assessment_scope?: string | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string | null
          egids_level?: Database["public"]["Enums"]["egids_level"] | null
          elp_status?: Database["public"]["Enums"]["elp_status"] | null
          id?: string
          language_id: string
          notes?: string | null
          rationale?: string | null
          source_id?: string | null
          unesco_vitality?:
            | Database["public"]["Enums"]["unesco_vitality"]
            | null
        }
        Update: {
          assessment_date?: string
          assessment_scope?: string | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string | null
          egids_level?: Database["public"]["Enums"]["egids_level"] | null
          elp_status?: Database["public"]["Enums"]["elp_status"] | null
          id?: string
          language_id?: string
          notes?: string | null
          rationale?: string | null
          source_id?: string | null
          unesco_vitality?:
            | Database["public"]["Enums"]["unesco_vitality"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "vitality_assessments_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitality_assessments_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      access_patterns_recent: {
        Row: {
          access_count: number | null
          action_performed: Database["public"]["Enums"]["access_action"] | null
          denied_count: number | null
          export_count: number | null
          most_recent_access: string | null
          table_accessed: string | null
          unique_accessors: number | null
        }
        Relationships: []
      }
      active_partnership_geography: {
        Row: {
          last_meaningful_contact: string | null
          next_planned_contact: string | null
          organization_type:
            | Database["public"]["Enums"]["organization_type"]
            | null
          partner: string | null
          partner_country: string | null
          partner_hq: string | null
          relationship_status:
            | Database["public"]["Enums"]["relationship_status"]
            | null
          tomorrowlabs_relationship_owner: string | null
          trust_level: Database["public"]["Enums"]["trust_level"] | null
        }
        Relationships: []
      }
      active_risk_dashboard: {
        Row: {
          category: Database["public"]["Enums"]["risk_category"] | null
          days_open: number | null
          days_until_review: number | null
          identified_date: string | null
          level: Database["public"]["Enums"]["risk_level"] | null
          likelihood: string | null
          mitigation_owner: string | null
          mitigation_status: string | null
          next_review_due: string | null
          risk_title: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["risk_category"] | null
          days_open?: never
          days_until_review?: never
          identified_date?: string | null
          level?: Database["public"]["Enums"]["risk_level"] | null
          likelihood?: string | null
          mitigation_owner?: string | null
          mitigation_status?: string | null
          next_review_due?: string | null
          risk_title?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["risk_category"] | null
          days_open?: never
          days_until_review?: never
          identified_date?: string | null
          level?: Database["public"]["Enums"]["risk_level"] | null
          likelihood?: string | null
          mitigation_owner?: string | null
          mitigation_status?: string | null
          next_review_due?: string | null
          risk_title?: string | null
        }
        Relationships: []
      }
      active_work_summary: {
        Row: {
          actual_spend_to_date_usd: number | null
          approved_budget_usd: number | null
          current_health_status: string | null
          deployment_count: number | null
          planned_end_date: string | null
          planned_start_date: string | null
          program_code: string | null
          program_name: string | null
          program_owner: string | null
          program_type: string | null
          related_products: string[] | null
          status: Database["public"]["Enums"]["program_status"] | null
        }
        Relationships: []
      }
      babagigi_v1_readiness: {
        Row: {
          age_60_plus_pct: number | null
          babagigi_status: string | null
          babagigi_wave: string | null
          common_voice_hours_validated: number | null
          endonym: string | null
          english_name: string | null
          ipa_pipeline_viable: boolean | null
          omnilingual_cer: number | null
          omnilingual_supported: boolean | null
          oral_tradition_strength: string | null
          stt_quality_tier:
            | Database["public"]["Enums"]["tech_quality_tier"]
            | null
          transmission_risk: string | null
          tts_quality_tier:
            | Database["public"]["Enums"]["tech_quality_tier"]
            | null
          us_speakers: number | null
        }
        Relationships: []
      }
      benefit_sharing_accountability: {
        Row: {
          accountability_status: string | null
          agreement_signed_date: string | null
          benefit_formula: string | null
          community: string | null
          distribution_frequency: string | null
          is_active: boolean | null
          last_audit_date: string | null
          partner: string | null
          percentage_of_attributable_revenue: number | null
          percentage_or_fixed: string | null
        }
        Relationships: []
      }
      board_state_summary: {
        Row: {
          active_benefit_sharing_agreements: number | null
          active_partner_orgs: number | null
          active_programs: number | null
          assessment_date: string | null
          benefit_sharing_audits_overdue: number | null
          decisions_logged_last_12_months: number | null
          high_critical_open_risks: number | null
          languages_actively_served: number | null
          languages_in_database: number | null
          outcomes_assessed_last_12_months: number | null
          programs_red_status: number | null
          programs_yellow_status: number | null
        }
        Relationships: []
      }
      common_voice_contribution_targets: {
        Row: {
          common_voice_hours_validated: number | null
          endonym: string | null
          english_name: string | null
          partner_country: string | null
          partner_organization: string | null
          partner_status: string | null
          recommendation: string | null
          transmission_risk: string | null
        }
        Relationships: []
      }
      community_summary: {
        Row: {
          community: string | null
          community_type: string | null
          estimated_global_population: number | null
          estimated_population_confidence:
            | Database["public"]["Enums"]["confidence_level"]
            | null
          languages: string[] | null
          origin_place: string | null
          places: string[] | null
        }
        Relationships: []
      }
      consent_audit_chain_integrity: {
        Row: {
          bypasses_not_yet_reviewed: number | null
          denied_operations: number | null
          emergency_bypasses: number | null
          missing_consent_attempts: number | null
          month: string | null
          total_checks: number | null
        }
        Relationships: []
      }
      consent_state_overview: {
        Row: {
          expiring_soon: number | null
          record_count: number | null
          review_due_soon: number | null
          revoked_records: number | null
          scope: Database["public"]["Enums"]["consent_scope"] | null
          status: Database["public"]["Enums"]["consent_status"] | null
        }
        Relationships: []
      }
      current_transmission: {
        Row: {
          assessment_date: string | null
          country_code: string | null
          english_name: string | null
          glottocode: string | null
          median_fluent_speaker_age: number | null
          pct_5_to_18_fluent: number | null
          pct_under_5_with_l1: number | null
          region: string | null
          trajectory: string | null
          youngest_fluent_speaker_age: number | null
        }
        Relationships: []
      }
      current_vitality: {
        Row: {
          assessment_date: string | null
          confidence: Database["public"]["Enums"]["confidence_level"] | null
          egids_level: Database["public"]["Enums"]["egids_level"] | null
          elp_status: Database["public"]["Enums"]["elp_status"] | null
          english_name: string | null
          glottocode: string | null
          unesco_vitality: Database["public"]["Enums"]["unesco_vitality"] | null
        }
        Relationships: []
      }
      decision_learning_health: {
        Row: {
          decision_quarter: number | null
          decision_year: number | null
          decisions_assessed: number | null
          decisions_made: number | null
          going_poorly: number | null
          going_well: number | null
          pct_with_outcome_assessment: number | null
          reversed_decisions: number | null
        }
        Relationships: []
      }
      deployment_readiness_assessment: {
        Row: {
          babagigi_wave: string | null
          language: string | null
          partner: string | null
          place: string | null
          relationship_status:
            | Database["public"]["Enums"]["relationship_status"]
            | null
          trust_level: Database["public"]["Enums"]["trust_level"] | null
        }
        Relationships: []
      }
      diaspora_origin_stories: {
        Row: {
          approximate_count: number | null
          destination_country: string | null
          driving_factors: string | null
          flow_type: Database["public"]["Enums"]["migration_flow_type"] | null
          language: string | null
          migration_year: number | null
          origin_country: string | null
          policy_context: string | null
        }
        Relationships: []
      }
      documentation_gaps: {
        Row: {
          doc_level: Database["public"]["Enums"]["documentation_level"] | null
          egids_level: Database["public"]["Enums"]["egids_level"] | null
          english_name: string | null
          glottocode: string | null
          has_audio_corpus: boolean | null
          has_dictionary: boolean | null
          has_published_grammar: boolean | null
          major_documentation_gaps: string | null
          unesco_vitality: Database["public"]["Enums"]["unesco_vitality"] | null
        }
        Relationships: []
      }
      exposure_dashboard: {
        Row: {
          days_open: number | null
          exposure_type: string | null
          identified_date: string | null
          owner: string | null
          severity: Database["public"]["Enums"]["risk_level"] | null
          status: string | null
          title: string | null
        }
        Relationships: []
      }
      funder_pipeline: {
        Row: {
          annual_grantmaking_usd: number | null
          funder: string | null
          funder_category: Database["public"]["Enums"]["funder_category"] | null
          grant_focus_areas: string[] | null
          last_meaningful_contact: string | null
          pipeline_stage: string | null
          relationship_status:
            | Database["public"]["Enums"]["relationship_status"]
            | null
          typical_grant_size_usd: number | null
        }
        Relationships: []
      }
      intervention_priorities: {
        Row: {
          egids_level: Database["public"]["Enums"]["egids_level"] | null
          english_name: string | null
          glottocode: string | null
          partner_organization: string | null
          partner_status: string | null
          priority_category: string | null
          total_audio_hours: number | null
          trajectory: string | null
          unesco_vitality: Database["public"]["Enums"]["unesco_vitality"] | null
          youngest_fluent_speaker_age: number | null
        }
        Relationships: []
      }
      language_strategic_scorecard: {
        Row: {
          active_partnerships: number | null
          babagigi_status: string | null
          babagigi_wave: string | null
          current_stt_tier:
            | Database["public"]["Enums"]["tech_quality_tier"]
            | null
          current_tts_tier:
            | Database["public"]["Enums"]["tech_quality_tier"]
            | null
          glottocode: string | null
          language: string | null
          transmission_risk: string | null
          us_pct_60_plus: number | null
          us_speakers: number | null
          vitality_status: Database["public"]["Enums"]["unesco_vitality"] | null
        }
        Insert: {
          active_partnerships?: never
          babagigi_status?: never
          babagigi_wave?: never
          current_stt_tier?: never
          current_tts_tier?: never
          glottocode?: string | null
          language?: string | null
          transmission_risk?: never
          us_pct_60_plus?: never
          us_speakers?: never
          vitality_status?: never
        }
        Update: {
          active_partnerships?: never
          babagigi_status?: never
          babagigi_wave?: never
          current_stt_tier?: never
          current_tts_tier?: never
          glottocode?: string | null
          language?: string | null
          transmission_risk?: never
          us_pct_60_plus?: never
          us_speakers?: never
          vitality_status?: never
        }
        Relationships: []
      }
      market_funding_intelligence: {
        Row: {
          focus_areas: string[] | null
          funder: string | null
          grant_amount_usd: number | null
          grant_announced_date: string | null
          purpose: string | null
          recipient: string | null
          strategic_significance: string | null
          target_languages: string[] | null
          target_places: string[] | null
        }
        Relationships: []
      }
      observation_freshness: {
        Row: {
          days_since_observation: number | null
          entity_id: string | null
          expected_cadence:
            | Database["public"]["Enums"]["observation_cadence"]
            | null
          freshness_status: string | null
          latest_observation: string | null
          table_name: string | null
        }
        Relationships: []
      }
      omnilingual_impact: {
        Row: {
          babagigi_wave: string | null
          common_voice_hours_validated: number | null
          current_stt_tier:
            | Database["public"]["Enums"]["tech_quality_tier"]
            | null
          endonym: string | null
          english_name: string | null
          ipa_pipeline_viable: boolean | null
          omnilingual_cer: number | null
          strategic_read: string | null
        }
        Relationships: []
      }
      partner_facing_accountability: {
        Row: {
          active_deployments: number | null
          active_programs: number | null
          benefit_sharing_terms: string | null
          communications_last_90_days: number | null
          community: string | null
          languages_being_served: string[] | null
          last_partner_contact: string | null
          partner_organization: string | null
        }
        Relationships: []
      }
      pending_person_deletions: {
        Row: {
          days_pending: number | null
          deletion_requested_at: string | null
          deletion_requested_by: string | null
          display_name: string | null
          person_id: string | null
          related_roles: number | null
          urgency: string | null
        }
        Insert: {
          days_pending?: never
          deletion_requested_at?: string | null
          deletion_requested_by?: string | null
          display_name?: string | null
          person_id?: string | null
          related_roles?: never
          urgency?: never
        }
        Update: {
          days_pending?: never
          deletion_requested_at?: string | null
          deletion_requested_by?: string | null
          display_name?: string | null
          person_id?: string | null
          related_roles?: never
          urgency?: never
        }
        Relationships: []
      }
      program_financial_summary: {
        Row: {
          actual_spend_to_date_usd: number | null
          approved_budget_usd: number | null
          pct_spent: number | null
          program_code: string | null
          program_name: string | null
          remaining_budget: number | null
          total_inflow: number | null
          total_outflow: number | null
        }
        Relationships: []
      }
      protocols_due_for_review: {
        Row: {
          days_until_review: number | null
          execution_count: number | null
          last_executed: string | null
          next_review_due: string | null
          primary_audience:
            | Database["public"]["Enums"]["decision_audience"]
            | null
          protocol_code: string | null
          protocol_name: string | null
          protocol_owner: string | null
          protocol_type:
            | Database["public"]["Enums"]["decision_protocol_type"]
            | null
          review_cadence: Database["public"]["Enums"]["decision_cadence"] | null
          urgency: string | null
        }
        Insert: {
          days_until_review?: never
          execution_count?: number | null
          last_executed?: string | null
          next_review_due?: string | null
          primary_audience?:
            | Database["public"]["Enums"]["decision_audience"]
            | null
          protocol_code?: string | null
          protocol_name?: string | null
          protocol_owner?: string | null
          protocol_type?:
            | Database["public"]["Enums"]["decision_protocol_type"]
            | null
          review_cadence?:
            | Database["public"]["Enums"]["decision_cadence"]
            | null
          urgency?: never
        }
        Update: {
          days_until_review?: never
          execution_count?: number | null
          last_executed?: string | null
          next_review_due?: string | null
          primary_audience?:
            | Database["public"]["Enums"]["decision_audience"]
            | null
          protocol_code?: string | null
          protocol_name?: string | null
          protocol_owner?: string | null
          protocol_type?:
            | Database["public"]["Enums"]["decision_protocol_type"]
            | null
          review_cadence?:
            | Database["public"]["Enums"]["decision_cadence"]
            | null
          urgency?: never
        }
        Relationships: []
      }
      quarterly_strategic_review: {
        Row: {
          active_partners: number | null
          critical_open: number | null
          deeply_trusted: number | null
          events_affecting_us: number | null
          high_open: number | null
          partners_with_stale_contact: number | null
          programs_active: number | null
          programs_green: number | null
          programs_red: number | null
          programs_yellow: number | null
          review_date: string | null
          stale_unresolved: number | null
          total_active_budget: number | null
          total_spend_to_date: number | null
          transformative_events_last_quarter: number | null
        }
        Relationships: []
      }
      recent_sector_changes: {
        Row: {
          affected_languages: string[] | null
          affects_tomorrowlabs_directly: boolean | null
          description: string | null
          event_date: string | null
          event_name: string | null
          event_type: string | null
          significance: Database["public"]["Enums"]["event_significance"] | null
          tomorrowlabs_response_taken: string | null
        }
        Insert: {
          affected_languages?: never
          affects_tomorrowlabs_directly?: boolean | null
          description?: string | null
          event_date?: string | null
          event_name?: string | null
          event_type?: string | null
          significance?:
            | Database["public"]["Enums"]["event_significance"]
            | null
          tomorrowlabs_response_taken?: string | null
        }
        Update: {
          affected_languages?: never
          affects_tomorrowlabs_directly?: boolean | null
          description?: string | null
          event_date?: string | null
          event_name?: string | null
          event_type?: string | null
          significance?:
            | Database["public"]["Enums"]["event_significance"]
            | null
          tomorrowlabs_response_taken?: string | null
        }
        Relationships: []
      }
      remaining_honest_gaps: {
        Row: {
          architectural_layer: string | null
          gap_name: string | null
          reason_deferred: string | null
          resolution_path: string | null
        }
        Relationships: []
      }
      sensitive_data_map: {
        Row: {
          access_principle:
            | Database["public"]["Enums"]["access_principle"]
            | null
          applies_to_sensitivity:
            | Database["public"]["Enums"]["pii_sensitivity"][]
            | null
          governs_table: string | null
          permitted_roles: string[] | null
          policy_name: string | null
          requires_audit_log: boolean | null
          requires_consent_check: boolean | null
        }
        Insert: {
          access_principle?:
            | Database["public"]["Enums"]["access_principle"]
            | null
          applies_to_sensitivity?:
            | Database["public"]["Enums"]["pii_sensitivity"][]
            | null
          governs_table?: string | null
          permitted_roles?: string[] | null
          policy_name?: string | null
          requires_audit_log?: boolean | null
          requires_consent_check?: boolean | null
        }
        Update: {
          access_principle?:
            | Database["public"]["Enums"]["access_principle"]
            | null
          applies_to_sensitivity?:
            | Database["public"]["Enums"]["pii_sensitivity"][]
            | null
          governs_table?: string | null
          permitted_roles?: string[] | null
          policy_name?: string | null
          requires_audit_log?: boolean | null
          requires_consent_check?: boolean | null
        }
        Relationships: []
      }
      tech_watershed_moments: {
        Row: {
          language: string | null
          notable_change: string | null
          observation_date: string | null
          significance: Database["public"]["Enums"]["event_significance"] | null
          stt_quality_tier:
            | Database["public"]["Enums"]["tech_quality_tier"]
            | null
          tts_quality_tier:
            | Database["public"]["Enums"]["tech_quality_tier"]
            | null
        }
        Relationships: []
      }
      transmission_trajectory: {
        Row: {
          country_code: string | null
          current_trajectory: string | null
          current_youngest: number | null
          english_name: string | null
          glottocode: string | null
          latest_date: string | null
          prior_date: string | null
          prior_youngest: number | null
          region: string | null
          youngest_age_change: number | null
        }
        Relationships: []
      }
      upcoming_compliance_deadlines: {
        Row: {
          affected_domain: string | null
          compliance_deadline: string | null
          compliance_owner: string | null
          compliance_status: string | null
          days_until_deadline: number | null
          event_name: string | null
          event_type: string | null
          place: string | null
          summary: string | null
        }
        Relationships: []
      }
      upcoming_obligations: {
        Row: {
          days_remaining: number | null
          description: string | null
          due_date: string | null
          obligation_type: string | null
          owner: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      execute_person_deletion: {
        Args: {
          p_basis: Database["public"]["Enums"]["deletion_basis"]
          p_notes: string
          p_person_id: string
          p_requested_by: string
        }
        Returns: undefined
      }
    }
    Enums: {
      access_action:
        | "read"
        | "list"
        | "aggregate"
        | "export"
        | "modify"
        | "delete"
        | "share-external"
        | "use-in-research"
        | "use-in-marketing"
      access_principle:
        | "public-read"
        | "team-read"
        | "leadership-read"
        | "role-restricted"
        | "owner-only"
        | "subject-only"
        | "no-direct-access"
        | "community-controlled"
      climate_zone:
        | "tropical-wet"
        | "tropical-dry"
        | "arid"
        | "semi-arid"
        | "mediterranean"
        | "humid-subtropical"
        | "humid-continental"
        | "oceanic"
        | "subarctic"
        | "polar"
        | "highland"
      communication_channel:
        | "email"
        | "video-call"
        | "phone-call"
        | "in-person-meeting"
        | "site-visit"
        | "conference-event"
        | "slack"
        | "whatsapp"
        | "signal"
        | "sms"
        | "mail"
        | "social-media"
        | "partner-portal"
      confidence_level: "high" | "medium" | "low" | "estimated"
      consent_check_result:
        | "consent-granted"
        | "consent-conditional"
        | "consent-denied"
        | "consent-not-found"
        | "consent-expired"
        | "consent-revoked"
        | "consent-pending"
        | "consent-not-required"
        | "consent-bypassed-emergency"
      consent_scope:
        | "product-use-only"
        | "service-improvements"
        | "community-research"
        | "academic-research"
        | "public-corpus"
        | "commercial-use"
        | "marketing-communications"
        | "press-and-media"
      consent_status:
        | "not-asked"
        | "pending-decision"
        | "granted"
        | "granted-with-conditions"
        | "denied"
        | "revoked"
        | "expired"
        | "pending-renewal"
      content_status:
        | "concept"
        | "in-development"
        | "in-review"
        | "community-review"
        | "approved"
        | "published"
        | "needs-revision"
        | "deprecated"
        | "archived"
      corpus_source:
        | "mozilla-common-voice"
        | "fleurs"
        | "voxpopuli"
        | "mls"
        | "librispeech"
        | "omnilingual-corpus"
        | "paradisec"
        | "elar"
        | "archive-org"
        | "community-partner-corpus"
        | "tomorrowlabs-internal"
        | "university-archive"
        | "commercial-licensed"
        | "other-open-source"
        | "other-proprietary"
      decision_audience:
        | "founder-direct"
        | "leadership-team"
        | "full-team"
        | "board"
        | "partner-community"
        | "public"
      decision_cadence:
        | "continuous"
        | "monthly"
        | "quarterly"
        | "biannual"
        | "annual"
        | "triggered"
        | "on-demand"
      decision_outcome_status:
        | "too-early-to-assess"
        | "going-well"
        | "going-as-expected"
        | "mixed-results"
        | "going-poorly"
        | "failed"
        | "reversed"
        | "completed-successfully"
      decision_protocol_type:
        | "strategic-allocation"
        | "partnership-evaluation"
        | "product-prioritization"
        | "risk-response"
        | "community-accountability"
        | "mission-alignment"
        | "operational-health"
        | "opportunity-evaluation"
        | "sunset-decision"
        | "crisis-response"
      deletion_basis:
        | "subject-request"
        | "consent-withdrawal"
        | "retention-policy"
        | "data-minimization"
        | "legal-compliance"
        | "data-breach-response"
        | "organization-decision"
      deployment_stage:
        | "scoping"
        | "partner-alignment"
        | "resourcing"
        | "logistics"
        | "launching"
        | "operating"
        | "reviewing"
        | "transitioning"
        | "completed"
        | "failed"
      documentation_level:
        | "extensive"
        | "substantial"
        | "moderate"
        | "limited"
        | "minimal"
        | "undocumented"
      domain_strength:
        | "dominant"
        | "co-equal"
        | "limited"
        | "symbolic"
        | "absent"
      egids_level:
        | "0-international"
        | "1-national"
        | "2-provincial"
        | "3-wider-communication"
        | "4-educational"
        | "5-developing"
        | "6a-vigorous"
        | "6b-threatened"
        | "7-shifting"
        | "8a-moribund"
        | "8b-nearly-extinct"
        | "9-dormant"
        | "10-extinct"
      elp_status:
        | "at-risk"
        | "vulnerable"
        | "threatened"
        | "endangered"
        | "severely-endangered"
        | "critically-endangered"
        | "awakening"
        | "dormant"
      event_significance:
        | "transformative"
        | "significant"
        | "moderate"
        | "minor"
        | "monitoring-only"
      financial_flow_type:
        | "grant-received"
        | "grant-disbursed"
        | "revenue-product"
        | "revenue-services"
        | "revenue-licensing"
        | "expense-operating"
        | "expense-program"
        | "benefit-sharing-distribution"
        | "partnership-payment"
        | "vendor-payment"
        | "investment-received"
        | "loan-received"
        | "loan-disbursed"
      funder_category:
        | "private-foundation"
        | "family-foundation"
        | "corporate-foundation"
        | "community-foundation"
        | "public-charity"
        | "government-grant"
        | "multilateral-agency"
        | "individual-donor"
        | "crowdfunding"
        | "not-a-funder"
      governance_type:
        | "sovereign-state"
        | "autonomous-region"
        | "colonial-territory"
        | "disputed-territory"
        | "tribal-governance"
        | "municipal"
        | "unincorporated"
        | "occupied"
      incorporation_status:
        | "incorporated-nonprofit"
        | "incorporated-for-profit"
        | "incorporated-cooperative"
        | "fiscally-sponsored"
        | "community-collective"
        | "informal-unincorporated"
        | "individual"
      indicator_direction:
        | "improving"
        | "stable"
        | "declining"
        | "volatile"
        | "reversing"
        | "unknown"
      language_domain:
        | "home"
        | "extended-family"
        | "religious"
        | "education-primary"
        | "education-secondary"
        | "education-tertiary"
        | "government"
        | "commerce"
        | "mass-media"
        | "social-media"
        | "literature"
        | "arts"
        | "workplace"
        | "community-events"
        | "intergenerational-storytelling"
      language_granularity:
        | "macrolanguage"
        | "language"
        | "dialect"
        | "variety"
        | "register"
      methodology_type:
        | "census"
        | "representative-survey"
        | "partner-report"
        | "ethnographic-fieldwork"
        | "administrative-data"
        | "sensor-data"
        | "expert-estimate"
        | "community-self-report"
        | "aggregated-from-sources"
        | "predictive-model"
        | "manual-review"
      migration_flow_type:
        | "voluntary-economic"
        | "voluntary-family-reunification"
        | "voluntary-education"
        | "voluntary-retirement"
        | "forced-conflict"
        | "forced-climate"
        | "forced-economic-crisis"
        | "forced-political"
        | "circular-seasonal"
        | "mixed"
        | "unknown"
      observation_cadence:
        | "real-time"
        | "daily"
        | "weekly"
        | "monthly"
        | "quarterly"
        | "annual"
        | "biennial"
        | "multi-year"
        | "episodic"
        | "one-time"
      organization_type:
        | "community-organization"
        | "nonprofit-formal"
        | "foundation"
        | "government-agency"
        | "intergovernmental"
        | "academic-institution"
        | "religious-institution"
        | "cultural-institution"
        | "for-profit-aligned"
        | "for-profit-vendor"
        | "media-organization"
        | "professional-association"
        | "informal-collective"
        | "individual-practitioner"
        | "peer-organization"
        | "competitor"
      orthography_status:
        | "standardized"
        | "multiple-competing"
        | "emerging"
        | "contested"
        | "oral-primary"
        | "historical-only"
      person_record_status:
        | "active"
        | "inactive"
        | "consent-restricted"
        | "deletion-requested"
        | "deleted"
        | "minor-protected"
      pii_sensitivity:
        | "public"
        | "professional"
        | "personal"
        | "sensitive"
        | "highly-sensitive"
        | "minor-protected"
      place_granularity:
        | "world"
        | "continent"
        | "sub-continent"
        | "country"
        | "state-province"
        | "metro-area"
        | "county"
        | "city"
        | "neighborhood"
        | "indigenous-territory"
        | "community-designated"
      place_status: "active" | "historical" | "disputed" | "depopulated"
      product_lifecycle_stage:
        | "concept"
        | "design"
        | "prototype"
        | "alpha"
        | "beta"
        | "launched"
        | "mature"
        | "sunsetting"
        | "sunset"
        | "archived"
      program_status:
        | "proposed"
        | "planning"
        | "pre-launch"
        | "active"
        | "paused"
        | "winding-down"
        | "completed"
        | "discontinued"
        | "archived"
      recognition_level:
        | "official-international"
        | "official-national"
        | "official-regional"
        | "recognized-minority"
        | "recognized-indigenous"
        | "tolerated"
        | "unrecognized"
        | "restricted"
        | "historically-suppressed"
      relationship_status:
        | "active-partner"
        | "active-vendor"
        | "active-funder"
        | "active-grantee"
        | "exploratory-conversation"
        | "prospect-not-contacted"
        | "historical-partner"
        | "declined-mutual"
        | "declined-by-them"
        | "declined-by-us"
        | "observed-only"
        | "do-not-engage"
      revitalization_level:
        | "active-large-scale"
        | "active-community-led"
        | "emerging"
        | "documentation-only"
        | "none-documented"
        | "not-applicable"
      risk_category:
        | "financial"
        | "operational"
        | "partnership"
        | "reputational"
        | "community-trust"
        | "regulatory-compliance"
        | "data-security"
        | "technical"
        | "mission-drift"
        | "team-capacity"
        | "strategic"
      risk_level: "critical" | "high" | "moderate" | "low" | "monitoring-only"
      synthesis_method:
        | "sql-view"
        | "sql-view-with-narrative"
        | "ai-assisted-synthesis"
        | "human-judgment-required"
        | "community-deliberation"
        | "mixed-method"
      tech_quality_tier: "production" | "usable" | "experimental" | "none"
      territory_recognition:
        | "internationally-recognized"
        | "partially-recognized"
        | "unrecognized"
        | "self-declared"
        | "historical-only"
      trust_level:
        | "deeply-trusted"
        | "trusted"
        | "developing"
        | "cautious"
        | "damaged"
        | "unknown"
      unesco_vitality:
        | "safe"
        | "vulnerable"
        | "definitely-endangered"
        | "severely-endangered"
        | "critically-endangered"
        | "extinct"
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
      access_action: [
        "read",
        "list",
        "aggregate",
        "export",
        "modify",
        "delete",
        "share-external",
        "use-in-research",
        "use-in-marketing",
      ],
      access_principle: [
        "public-read",
        "team-read",
        "leadership-read",
        "role-restricted",
        "owner-only",
        "subject-only",
        "no-direct-access",
        "community-controlled",
      ],
      climate_zone: [
        "tropical-wet",
        "tropical-dry",
        "arid",
        "semi-arid",
        "mediterranean",
        "humid-subtropical",
        "humid-continental",
        "oceanic",
        "subarctic",
        "polar",
        "highland",
      ],
      communication_channel: [
        "email",
        "video-call",
        "phone-call",
        "in-person-meeting",
        "site-visit",
        "conference-event",
        "slack",
        "whatsapp",
        "signal",
        "sms",
        "mail",
        "social-media",
        "partner-portal",
      ],
      confidence_level: ["high", "medium", "low", "estimated"],
      consent_check_result: [
        "consent-granted",
        "consent-conditional",
        "consent-denied",
        "consent-not-found",
        "consent-expired",
        "consent-revoked",
        "consent-pending",
        "consent-not-required",
        "consent-bypassed-emergency",
      ],
      consent_scope: [
        "product-use-only",
        "service-improvements",
        "community-research",
        "academic-research",
        "public-corpus",
        "commercial-use",
        "marketing-communications",
        "press-and-media",
      ],
      consent_status: [
        "not-asked",
        "pending-decision",
        "granted",
        "granted-with-conditions",
        "denied",
        "revoked",
        "expired",
        "pending-renewal",
      ],
      content_status: [
        "concept",
        "in-development",
        "in-review",
        "community-review",
        "approved",
        "published",
        "needs-revision",
        "deprecated",
        "archived",
      ],
      corpus_source: [
        "mozilla-common-voice",
        "fleurs",
        "voxpopuli",
        "mls",
        "librispeech",
        "omnilingual-corpus",
        "paradisec",
        "elar",
        "archive-org",
        "community-partner-corpus",
        "tomorrowlabs-internal",
        "university-archive",
        "commercial-licensed",
        "other-open-source",
        "other-proprietary",
      ],
      decision_audience: [
        "founder-direct",
        "leadership-team",
        "full-team",
        "board",
        "partner-community",
        "public",
      ],
      decision_cadence: [
        "continuous",
        "monthly",
        "quarterly",
        "biannual",
        "annual",
        "triggered",
        "on-demand",
      ],
      decision_outcome_status: [
        "too-early-to-assess",
        "going-well",
        "going-as-expected",
        "mixed-results",
        "going-poorly",
        "failed",
        "reversed",
        "completed-successfully",
      ],
      decision_protocol_type: [
        "strategic-allocation",
        "partnership-evaluation",
        "product-prioritization",
        "risk-response",
        "community-accountability",
        "mission-alignment",
        "operational-health",
        "opportunity-evaluation",
        "sunset-decision",
        "crisis-response",
      ],
      deletion_basis: [
        "subject-request",
        "consent-withdrawal",
        "retention-policy",
        "data-minimization",
        "legal-compliance",
        "data-breach-response",
        "organization-decision",
      ],
      deployment_stage: [
        "scoping",
        "partner-alignment",
        "resourcing",
        "logistics",
        "launching",
        "operating",
        "reviewing",
        "transitioning",
        "completed",
        "failed",
      ],
      documentation_level: [
        "extensive",
        "substantial",
        "moderate",
        "limited",
        "minimal",
        "undocumented",
      ],
      domain_strength: [
        "dominant",
        "co-equal",
        "limited",
        "symbolic",
        "absent",
      ],
      egids_level: [
        "0-international",
        "1-national",
        "2-provincial",
        "3-wider-communication",
        "4-educational",
        "5-developing",
        "6a-vigorous",
        "6b-threatened",
        "7-shifting",
        "8a-moribund",
        "8b-nearly-extinct",
        "9-dormant",
        "10-extinct",
      ],
      elp_status: [
        "at-risk",
        "vulnerable",
        "threatened",
        "endangered",
        "severely-endangered",
        "critically-endangered",
        "awakening",
        "dormant",
      ],
      event_significance: [
        "transformative",
        "significant",
        "moderate",
        "minor",
        "monitoring-only",
      ],
      financial_flow_type: [
        "grant-received",
        "grant-disbursed",
        "revenue-product",
        "revenue-services",
        "revenue-licensing",
        "expense-operating",
        "expense-program",
        "benefit-sharing-distribution",
        "partnership-payment",
        "vendor-payment",
        "investment-received",
        "loan-received",
        "loan-disbursed",
      ],
      funder_category: [
        "private-foundation",
        "family-foundation",
        "corporate-foundation",
        "community-foundation",
        "public-charity",
        "government-grant",
        "multilateral-agency",
        "individual-donor",
        "crowdfunding",
        "not-a-funder",
      ],
      governance_type: [
        "sovereign-state",
        "autonomous-region",
        "colonial-territory",
        "disputed-territory",
        "tribal-governance",
        "municipal",
        "unincorporated",
        "occupied",
      ],
      incorporation_status: [
        "incorporated-nonprofit",
        "incorporated-for-profit",
        "incorporated-cooperative",
        "fiscally-sponsored",
        "community-collective",
        "informal-unincorporated",
        "individual",
      ],
      indicator_direction: [
        "improving",
        "stable",
        "declining",
        "volatile",
        "reversing",
        "unknown",
      ],
      language_domain: [
        "home",
        "extended-family",
        "religious",
        "education-primary",
        "education-secondary",
        "education-tertiary",
        "government",
        "commerce",
        "mass-media",
        "social-media",
        "literature",
        "arts",
        "workplace",
        "community-events",
        "intergenerational-storytelling",
      ],
      language_granularity: [
        "macrolanguage",
        "language",
        "dialect",
        "variety",
        "register",
      ],
      methodology_type: [
        "census",
        "representative-survey",
        "partner-report",
        "ethnographic-fieldwork",
        "administrative-data",
        "sensor-data",
        "expert-estimate",
        "community-self-report",
        "aggregated-from-sources",
        "predictive-model",
        "manual-review",
      ],
      migration_flow_type: [
        "voluntary-economic",
        "voluntary-family-reunification",
        "voluntary-education",
        "voluntary-retirement",
        "forced-conflict",
        "forced-climate",
        "forced-economic-crisis",
        "forced-political",
        "circular-seasonal",
        "mixed",
        "unknown",
      ],
      observation_cadence: [
        "real-time",
        "daily",
        "weekly",
        "monthly",
        "quarterly",
        "annual",
        "biennial",
        "multi-year",
        "episodic",
        "one-time",
      ],
      organization_type: [
        "community-organization",
        "nonprofit-formal",
        "foundation",
        "government-agency",
        "intergovernmental",
        "academic-institution",
        "religious-institution",
        "cultural-institution",
        "for-profit-aligned",
        "for-profit-vendor",
        "media-organization",
        "professional-association",
        "informal-collective",
        "individual-practitioner",
        "peer-organization",
        "competitor",
      ],
      orthography_status: [
        "standardized",
        "multiple-competing",
        "emerging",
        "contested",
        "oral-primary",
        "historical-only",
      ],
      person_record_status: [
        "active",
        "inactive",
        "consent-restricted",
        "deletion-requested",
        "deleted",
        "minor-protected",
      ],
      pii_sensitivity: [
        "public",
        "professional",
        "personal",
        "sensitive",
        "highly-sensitive",
        "minor-protected",
      ],
      place_granularity: [
        "world",
        "continent",
        "sub-continent",
        "country",
        "state-province",
        "metro-area",
        "county",
        "city",
        "neighborhood",
        "indigenous-territory",
        "community-designated",
      ],
      place_status: ["active", "historical", "disputed", "depopulated"],
      product_lifecycle_stage: [
        "concept",
        "design",
        "prototype",
        "alpha",
        "beta",
        "launched",
        "mature",
        "sunsetting",
        "sunset",
        "archived",
      ],
      program_status: [
        "proposed",
        "planning",
        "pre-launch",
        "active",
        "paused",
        "winding-down",
        "completed",
        "discontinued",
        "archived",
      ],
      recognition_level: [
        "official-international",
        "official-national",
        "official-regional",
        "recognized-minority",
        "recognized-indigenous",
        "tolerated",
        "unrecognized",
        "restricted",
        "historically-suppressed",
      ],
      relationship_status: [
        "active-partner",
        "active-vendor",
        "active-funder",
        "active-grantee",
        "exploratory-conversation",
        "prospect-not-contacted",
        "historical-partner",
        "declined-mutual",
        "declined-by-them",
        "declined-by-us",
        "observed-only",
        "do-not-engage",
      ],
      revitalization_level: [
        "active-large-scale",
        "active-community-led",
        "emerging",
        "documentation-only",
        "none-documented",
        "not-applicable",
      ],
      risk_category: [
        "financial",
        "operational",
        "partnership",
        "reputational",
        "community-trust",
        "regulatory-compliance",
        "data-security",
        "technical",
        "mission-drift",
        "team-capacity",
        "strategic",
      ],
      risk_level: ["critical", "high", "moderate", "low", "monitoring-only"],
      synthesis_method: [
        "sql-view",
        "sql-view-with-narrative",
        "ai-assisted-synthesis",
        "human-judgment-required",
        "community-deliberation",
        "mixed-method",
      ],
      tech_quality_tier: ["production", "usable", "experimental", "none"],
      territory_recognition: [
        "internationally-recognized",
        "partially-recognized",
        "unrecognized",
        "self-declared",
        "historical-only",
      ],
      trust_level: [
        "deeply-trusted",
        "trusted",
        "developing",
        "cautious",
        "damaged",
        "unknown",
      ],
      unesco_vitality: [
        "safe",
        "vulnerable",
        "definitely-endangered",
        "severely-endangered",
        "critically-endangered",
        "extinct",
      ],
    },
  },
} as const
