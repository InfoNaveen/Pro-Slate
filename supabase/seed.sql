-- ProSlate Seed Data
-- Run this in Supabase SQL Editor after running 001_initial.sql

-- Service Categories
INSERT INTO service_categories (name, slug, description, icon_name, base_rate_per_sqft, surface_types, active) VALUES
('Tile Laying', 'tile_laying', 'Professional ceramic, GVT and vitrified tile installation with precision alignment', 'grid', 55, ARRAY['Ceramic','GVT','Vitrified','Mosaic'], true),
('Marble Installation', 'marble_installation', 'Expert marble slab installation with seamless joints and polished finish', 'diamond', 180, ARRAY['Italian Marble','Indian Marble','Onyx','Travertine'], true),
('Epoxy Grouting', 'epoxy_grouting', 'Seamless epoxy floor coating and grouting for commercial and residential spaces', 'circle', 200, ARRAY['Epoxy Resin','Self-leveling','Anti-static'], true),
('Waterproofing', 'waterproofing', 'Membrane and chemical waterproofing for bathrooms, terraces and basements', 'droplets', 90, ARRAY['Membrane','Chemical','Crystalline','Bituminous'], true),
('Stone Polishing', 'stone_polishing', 'Diamond polishing and restoration of natural stone surfaces', 'sparkles', 220, ARRAY['Granite','Marble','Limestone','Sandstone'], true),
('Large Format Tile', 'large_format_tile', 'Specialized installation of 800mm+ format tiles requiring precision leveling', 'square', 120, ARRAY['800x800mm','1200x600mm','1200x1200mm'], true),
('Floor Leveling', 'floor_leveling', 'Self-leveling compound application for perfectly flat sub-floors', 'ruler', 85, ARRAY['Concrete','Screed','Self-leveling compound'], true),
('Tile Repair', 'tile_repair', 'Crack repair, re-grouting and replacement of damaged tiles', 'wrench', 55, ARRAY['Ceramic','Vitrified','Mosaic','Natural Stone'], true),
('Wall Cladding', 'wall_cladding', 'Stone and tile cladding for interior and exterior walls', 'layers', 120, ARRAY['Stone','Tile','Brick','Composite'], true)
ON CONFLICT (slug) DO NOTHING;

-- Note: Auth users must be created via Supabase Auth API or Dashboard
-- The following inserts assume UUIDs that match auth.users entries
-- For demo, use Supabase Dashboard to create users, then update these UUIDs

-- Demo notification for testing (will be created when users sign up)
-- All seed data for users requires actual auth.users entries
-- Use the demo credentials shown on the login page to test

SELECT 'Seed complete - service categories inserted' as status;
