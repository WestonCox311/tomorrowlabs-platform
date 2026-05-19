-- migration-022: Add customer/client/distributor relationship roles
-- These cover commercial relationships beyond the existing partner/vendor/funder roles.
-- - active-customer: organization purchases TomorrowLabs products/services
-- - active-client:   organization is receiving services under contract (consulting, implementation)
-- - active-distributor: organization resells or distributes TomorrowLabs products into a community

ALTER TYPE relationship_status ADD VALUE IF NOT EXISTS 'active-customer';
ALTER TYPE relationship_status ADD VALUE IF NOT EXISTS 'active-client';
ALTER TYPE relationship_status ADD VALUE IF NOT EXISTS 'active-distributor';
